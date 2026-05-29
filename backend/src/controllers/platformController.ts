import { Response } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import Razorpay from "razorpay";

import Assessment from "../models/Assessment";
import Coupon from "../models/Coupon";
import Invoice from "../models/Invoice";
import InvoiceCounter from "../models/InvoiceCounter";
import AssessmentPaymentSession from "../models/AssessmentPaymentSession";
import Organization from "../models/Organization";
import OrganizationRegistration from "../models/OrganizationRegistration";
import OrganizationCouponConfig from "../models/OrganizationCouponConfig";
import OrganizationCouponUsage from "../models/OrganizationCouponUsage";
import Question from "../models/Question";
import StudentAssessmentAttempt, { IAttemptQuestion } from "../models/StudentAssessmentAttempt";
import User from "../models/User";
import { DEFAULT_SUPERADMIN_EMAIL } from "../constants/platform";
import { evaluateAssessmentAttempt } from "../services/assessmentEvaluation";
import { getCareerDnaSourceQuestion, parseCareerDnaCategory } from "../services/sourceAssessmentData";
import { sendAssessmentReportToStudent } from "../services/email";
import { AuthRequest } from "../types/auth";

const normalizeAssessmentCode = (code: string): string => {
  const normalized = code.toUpperCase().trim();
  if (normalized === "METACOGNITION") return "METACOGNITION_TEST";
  if (normalized === "JOHARI" || normalized === "CLEAR") return "JOHARI_WINDOW";
  if (normalized === "LITMUS") return "LITMUS_TEST";
  return normalized;
};

const getAssessmentCodeAliases = (code: string): string[] => {
  const normalized = normalizeAssessmentCode(code);
  if (normalized === "METACOGNITION_TEST") return ["METACOGNITION_TEST", "METACOGNITION"];
  if (normalized === "JOHARI_WINDOW") return ["JOHARI_WINDOW", "JOHARI", "CLEAR"];
  if (normalized === "LITMUS_TEST") return ["LITMUS_TEST", "LITMUS"];
  return [normalized];
};

const CAREER_DNA_TEST_ORDER = [
  "APTITUDE",
  "BEHAVIORAL_SOCIAL",
  "CAREER_INTEREST",
  "COGNITIVE",
  "EMOTIONAL_INTELLIGENCE",
  "LEARNING_STYLE",
  "PERSONALITY",
  "STRESS_RESILIENCE",
];

const CAREER_DNA_NON_HALVED_TEST_TYPES = new Set(["PERSONALITY"]);

const shuffleArray = <T,>(items: T[]): T[] => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const buildCareerDnaQuestionSetForAttempt = <T extends {
  category: string;
  questionNumber: number;
  sourceTestType?: string;
  partNumber?: number;
}>(questions: T[]): T[] => {
  if (!questions.length) {
    return questions;
  }

  const grouped = new Map<string, {
    category: string;
    testType: string;
    partNumber: number;
    items: T[];
  }>();

  for (const question of questions) {
    const parsed = parseCareerDnaCategory(question.category);
    const testType = question.sourceTestType || parsed?.testType || "";
    const partNumber = Number.isFinite(Number(question.partNumber))
      ? Number(question.partNumber)
      : Number(parsed?.partNumber ?? 1);
    const key = String(question.category || `${testType}::${partNumber}`);

    const group = grouped.get(key);
    if (group) {
      group.items.push(question);
      continue;
    }

    grouped.set(key, {
      category: key,
      testType,
      partNumber,
      items: [question],
    });
  }

  const orderedGroups = Array.from(grouped.values()).sort((a, b) => {
    const leftOrder = CAREER_DNA_TEST_ORDER.indexOf(a.testType);
    const rightOrder = CAREER_DNA_TEST_ORDER.indexOf(b.testType);

    const normalizedLeftOrder = leftOrder === -1 ? Number.MAX_SAFE_INTEGER : leftOrder;
    const normalizedRightOrder = rightOrder === -1 ? Number.MAX_SAFE_INTEGER : rightOrder;

    if (normalizedLeftOrder !== normalizedRightOrder) {
      return normalizedLeftOrder - normalizedRightOrder;
    }

    return a.partNumber - b.partNumber;
  });

  return orderedGroups.flatMap((group) => {
    const shuffled = shuffleArray(group.items);
    let takeCount: number;
    if (group.testType === "PERSONALITY") {
      // Match Career DNA source app: 7 random from each of parts 1-4, ALL from part 5+
      takeCount = group.partNumber <= 4 ? Math.min(7, shuffled.length) : shuffled.length;
    } else {
      const isNonHalved = CAREER_DNA_NON_HALVED_TEST_TYPES.has(group.testType);
      takeCount = isNonHalved
        ? shuffled.length
        : Math.max(1, Math.floor(shuffled.length / 2));
    }

    return shuffled.slice(0, takeCount);
  });
};

const mapQuestionBankToAttemptQuestions = (
  questions: Array<{
    _id: IAttemptQuestion["questionId"];
    questionNumber: number;
    category: string;
    categoryLabel: string;
    questionText: string;
    options?: Array<{ label: string; text: string; score?: number }>;
  }>,
  canonicalCode: string
): IAttemptQuestion[] => questions.map((question) => {
  const careerDnaMeta = canonicalCode === "CAREER_DNA" ? parseCareerDnaCategory(question.category) : null;
  const sourceQuestion = careerDnaMeta
    ? getCareerDnaSourceQuestion(careerDnaMeta.testType, careerDnaMeta.partNumber, question.questionNumber)
    : undefined;

  return {
    questionId: question._id,
    questionNumber: question.questionNumber,
    category: question.category,
    categoryLabel: question.categoryLabel,
    questionText: question.questionText,
    sourceTestType: sourceQuestion?.testType,
    partNumber: sourceQuestion?.partNumber,
    passage: sourceQuestion?.passage,
    options: question.options ?? [],
    answer: undefined,
  };
});

const getCareerDnaCategoryOrder = (category: string, sourceTestType?: string, partNumber?: number) => {
  const parsed = parseCareerDnaCategory(category);
  const resolvedTestType = sourceTestType || parsed?.testType || "";
  const resolvedPartNumber = Number.isFinite(Number(partNumber))
    ? Number(partNumber)
    : Number(parsed?.partNumber ?? 1);
  const testOrder = CAREER_DNA_TEST_ORDER.indexOf(resolvedTestType);

  return {
    testOrder: testOrder === -1 ? Number.MAX_SAFE_INTEGER : testOrder,
    partOrder: Number.isFinite(resolvedPartNumber) ? resolvedPartNumber : Number.MAX_SAFE_INTEGER,
  };
};

const sortCareerDnaQuestions = <T extends { category: string; questionNumber: number; sourceTestType?: string; partNumber?: number }>(
  questions: T[]
) => [...questions].sort((a, b) => {
  const left = getCareerDnaCategoryOrder(a.category, a.sourceTestType, a.partNumber);
  const right = getCareerDnaCategoryOrder(b.category, b.sourceTestType, b.partNumber);

  if (left.testOrder !== right.testOrder) return left.testOrder - right.testOrder;
  if (left.partOrder !== right.partOrder) return left.partOrder - right.partOrder;
  return a.questionNumber - b.questionNumber;
});

const getAssessmentDisplayName = (code: string, fallbackName: string): string => {
  const normalized = normalizeAssessmentCode(code);
  if (normalized === "METACOGNITION_TEST") return "TEST - Thinking & Expression Skills Test";
  if (normalized === "JOHARI_WINDOW") return "CLEAR - Cognitive Lens for Emotional Awareness & Reflection";
  return fallbackName;
};

const dedupeAssessments = <T extends { code: string; name: string }>(assessments: T[]): T[] => {
  const byCode = new Map<string, (T & { __isExactCode: boolean })>();

  for (const assessment of assessments) {
    const originalCode = String(assessment.code || "").toUpperCase().trim();
    const canonicalCode = normalizeAssessmentCode(originalCode);
    const normalizedItem = {
      ...assessment,
      code: canonicalCode,
      name: getAssessmentDisplayName(canonicalCode, assessment.name),
      __isExactCode: originalCode === canonicalCode,
    };

    const existing = byCode.get(canonicalCode);
    if (!existing || (normalizedItem.__isExactCode && !existing.__isExactCode)) {
      byCode.set(canonicalCode, normalizedItem);
    }
  }

  return Array.from(byCode.values())
    .map(({ __isExactCode: _ignored, ...item }) => item as unknown as T)
    .sort((a, b) => a.name.localeCompare(b.name));
};

type LearnerRole = "STUDENT" | "PARENT";

const isLearnerRole = (role?: string): role is LearnerRole => role === "STUDENT" || role === "PARENT";

const isLitmusAssessmentCode = (assessmentCode: string): boolean => (
  normalizeAssessmentCode(assessmentCode) === "LITMUS_TEST"
);

const isAssessmentAccessibleForLearner = (learnerRole: LearnerRole, assessmentCode: string): boolean => {
  const isLitmus = isLitmusAssessmentCode(assessmentCode);
  if (learnerRole === "PARENT") {
    return isLitmus;
  }

  return !isLitmus;
};

const requireLearnerAssessmentAccess = (
  res: Response,
  learnerRole: LearnerRole,
  assessmentCode: string
): boolean => {
  if (!isAssessmentAccessibleForLearner(learnerRole, assessmentCode)) {
    if (learnerRole === "PARENT") {
      res.status(403).json({ message: "Parents can access only Litmus assessment." });
      return false;
    }

    res.status(403).json({ message: "Students cannot access Litmus assessment." });
    return false;
  }

  return true;
};

type AssessmentCatalogItem = {
  _id: unknown;
  code: string;
  name: string;
  slug?: string;
  summary?: string;
  category?: string;
  sourceProject?: string;
  active?: boolean;
};

export const getPlatformOverview = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [assessmentCount, organizationCount] = await Promise.all([
    Assessment.countDocuments({ active: true }),
    Organization.countDocuments({ isActive: true }),
  ]);

  res.json({
    platform: {
      defaultSuperadminEmail: DEFAULT_SUPERADMIN_EMAIL,
      assessmentCount,
      organizationCount,
      capabilities: [
        "Unified assessment catalog",
        "Whitelabel organization support",
        "Superadmin pricing and coupon management",
        "OTP + captcha auth",
      ],
    },
  });
};

export const listAssessments = async (_req: AuthRequest, res: Response): Promise<void> => {
  const assessments = await Assessment.find({ active: true }).sort({ name: 1 });
  const dedupedAssessments = dedupeAssessments(
    assessments.map((assessment) => assessment.toObject() as unknown as { code: string; name: string })
  );

  const assessmentsWithCounts = await Promise.all(
    dedupedAssessments.map(async (assessment) => {
      const count = await Question.countDocuments({
        assessmentCode: { $in: getAssessmentCodeAliases(assessment.code) },
        isActive: true,
      });
      return { ...assessment, questionCount: count };
    })
  );

  res.json({ assessments: assessmentsWithCounts });
};

const normalizeHostName = (value?: string): string => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "";
  }

  const candidate = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(candidate).hostname.toLowerCase().replace(/^www\./, "");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("normalizeHostName: failed to parse candidate URL", err, candidate);
    return raw.replace(/^https?:\/\//, "").split("/")[0].split(":")[0].replace(/^www\./, "");
  }
};

const buildWhitelabelPortalPayload = async (req: AuthRequest, organization: InstanceType<typeof Organization>) => {
  const userOrgId = req.user?.organization && typeof req.user.organization === "object"
    ? String((req.user.organization as { _id: { toString(): string } })._id)
    : null;

  const canAccessAssessments =
    Boolean(req.user) &&
    (req.user?.role === "ORG_ADMIN" || req.user?.role === "STUDENT" || req.user?.role === "PARENT") &&
    userOrgId === String(organization._id);

  const assessments = canAccessAssessments
    ? await Assessment.find({ active: true }).sort({ name: 1 })
    : [];

  const normalizedAssessments = dedupeAssessments(
    assessments.map((assessment) => assessment.toObject() as unknown as { code: string; name: string })
  );

  const learnerRole = isLearnerRole(req.user?.role) ? req.user.role : null;
  const visibleAssessments = learnerRole
    ? normalizedAssessments.filter((assessment) => isAssessmentAccessibleForLearner(learnerRole, assessment.code))
    : normalizedAssessments;

  return {
    organization: {
      id: organization._id,
      name: organization.name,
      slug: organization.slug,
      website: organization.website,
      branding: organization.branding,
    },
    canAccessAssessments,
    assessments: visibleAssessments,
    message: canAccessAssessments
      ? undefined
      : "Login required. Only users from this organization can view assessments.",
  };
};

export const getWhitelabelPortal = async (req: AuthRequest, res: Response): Promise<void> => {
  const slugParam = req.params.slug;
  const slug = typeof slugParam === "string" ? slugParam.toLowerCase().trim() : "";
  if (!slug) {
    res.status(400).json({ message: "Organization slug is required" });
    return;
  }

  const organization = await Organization.findOne({ slug, isActive: true, type: "WHITELABEL" });
  if (!organization) {
    res.status(404).json({ message: "Whitelabel organization not found" });
    return;
  }

  res.json(await buildWhitelabelPortalPayload(req, organization));
};

export const getWhitelabelPortalByHost = async (req: AuthRequest, res: Response): Promise<void> => {
  const hostParam = typeof req.query.host === "string" ? req.query.host : "";
  const normalizedHost = normalizeHostName(hostParam);

  if (!normalizedHost) {
    res.status(400).json({ message: "Host is required" });
    return;
  }

  const organizations = await Organization.find({
    isActive: true,
    type: "WHITELABEL",
    website: { $exists: true, $ne: null },
  });

  const organization = organizations.find((item) => normalizeHostName(item.website) === normalizedHost);

  if (!organization) {
    res.status(404).json({ message: "Whitelabel organization not found for this host" });
    return;
  }

  res.json(await buildWhitelabelPortalPayload(req, organization));
};

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const [assessments, organizations, coupons, invoices, students] = await Promise.all([
    Assessment.find({ active: true }).sort({ name: 1 }),
    req.user.role === "SUPERADMIN"
        ? Organization.find().limit(100).sort({ createdAt: -1 })
      : Organization.find({ _id: req.user.organization }).sort({ createdAt: -1 }),
    req.user.role === "SUPERADMIN"
        ? Coupon.find().limit(50).sort({ createdAt: -1 })
        : Coupon.find().sort({ createdAt: -1 }).limit(10),
    req.user.role === "SUPERADMIN"
      ? Invoice.find().sort({ createdAt: -1 }).limit(10)
      : Invoice.find({ organization: req.user.organization }).sort({ createdAt: -1 }).limit(10),
    req.user.role === "SUPERADMIN"
      ? User.countDocuments({ role: "STUDENT" })
      : User.countDocuments({ role: "STUDENT", organization: req.user.organization }),
  ]);

  res.json({
    role: req.user.role,
    stats: {
      assessments: assessments.length,
      organizations: organizations.length,
      students,
      coupons: coupons.length,
      invoices: invoices.length,
    },
    assessments,
    organizations,
    coupons,
    invoices,
  });
};

export const listStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const scope = req.user.role === "SUPERADMIN" ? {} : { organization: req.user.organization };

  const students = await User.find({ role: "STUDENT", ...scope })
    .populate("organization", "name slug")
    .sort({ createdAt: -1 });

  const studentIds = students.map((student) => student._id);
  const attemptCounts = await StudentAssessmentAttempt.aggregate<{
    _id: { user: string; status: "COMPLETED" | "IN_PROGRESS" };
    count: number;
  }>([
    { $match: { user: { $in: studentIds }, status: { $in: ["COMPLETED", "IN_PROGRESS"] } } },
    { $group: { _id: { user: "$user", status: "$status" }, count: { $sum: 1 } } },
  ]);

  const completedByStudent = new Map<string, number>();
  const pendingByStudent = new Map<string, number>();

  attemptCounts.forEach((row) => {
    const userId = String(row._id.user);
    if (row._id.status === "COMPLETED") {
      completedByStudent.set(userId, row.count);
      return;
    }
    pendingByStudent.set(userId, row.count);
  });

  const studentsWithStats = students
    .map((student) => {
      const testsCompleted = completedByStudent.get(String(student._id)) || 0;
      const testsPending = pendingByStudent.get(String(student._id)) || 0;

      return {
        ...student.toObject(),
        testsTaken: testsCompleted,
        testsCompleted,
        testsPending,
      };
    });

  const summary = studentsWithStats.reduce((acc, student) => {
    acc.studentCount += 1;
    acc.testsCompleted += Number(student.testsCompleted || 0);
    acc.testsPending += Number(student.testsPending || 0);
    return acc;
  }, { studentCount: 0, testsCompleted: 0, testsPending: 0 });

  const studentsPayload = studentsWithStats;

  res.json({
    students: studentsPayload,
    summary,
  });
};

const getScopedStudentRecord = async (req: AuthRequest, studentId: string) => {
  if (!req.user) {
    return null;
  }

  const student = await User.findById(studentId).populate("organization", "name slug");
  if (!student || student.role !== "STUDENT") {
    return null;
  }

  const studentOrgId = student.organization && typeof student.organization === "object"
    ? String((student.organization as { _id?: { toString(): string } })._id || "")
    : String(student.organization || "");

  const requesterOrgId = req.user.organization && typeof req.user.organization === "object"
    ? String((req.user.organization as { _id?: { toString(): string } })._id || "")
    : String(req.user.organization || "");

  if (req.user.role !== "SUPERADMIN" && studentOrgId !== requesterOrgId) {
    return null;
  }

  return student;
};

const buildAttemptReportPayload = async (
  attempt: InstanceType<typeof StudentAssessmentAttempt>,
  studentId: string
) => {
  const canonicalCode = normalizeAssessmentCode(attempt.assessmentCode);

  if (!attempt.evaluation) {
    attempt.evaluation = await evaluateAssessmentAttempt(attempt);
    await attempt.save();
  }

  const [student, organization, orgAdmin, organizationRegistration] = await Promise.all([
    User.findById(studentId).select({ firstName: 1, lastName: 1, grade: 1, institutionName: 1 }),
    Organization.findById(attempt.organization).select({
      name: 1,
      website: 1,
      contactEmail: 1,
      branding: 1,
    }),
    User.findOne({
      role: "ORG_ADMIN",
      organization: attempt.organization,
      isActive: true,
    })
      .sort({ createdAt: 1 })
      .select({ firstName: 1, lastName: 1, email: 1, phone: 1, phoneCode: 1 }),
    OrganizationRegistration.findOne({ organization: attempt.organization })
      .sort({ updatedAt: -1 })
      .select({ firstName: 1, lastName: 1, primaryMobile: 1, email: 1, website: 1 }),
  ]);

  const representativeName = `${orgAdmin?.firstName || organizationRegistration?.firstName || ""} ${orgAdmin?.lastName || organizationRegistration?.lastName || ""}`.trim() || undefined;

  const contactPhone = `${orgAdmin?.phoneCode || ""}${orgAdmin?.phone || organizationRegistration?.primaryMobile || ""}`.trim() || undefined;

  const contactEmail = organization?.contactEmail || orgAdmin?.email || organizationRegistration?.email || undefined;

  const website = organization?.website || organizationRegistration?.website || undefined;

  return {
    attemptId: attempt._id,
    assessmentCode: canonicalCode,
    assessmentName: getAssessmentDisplayName(canonicalCode, attempt.assessmentName),
    status: attempt.status,
    answeredCount: attempt.answeredCount,
    totalQuestions: attempt.totalQuestions,
    submittedAt: attempt.completedAt,
    evaluation: attempt.evaluation,
    student: student
      ? {
          firstName: student.firstName,
          lastName: student.lastName,
          grade: student.grade,
          institutionName: student.institutionName,
        }
      : undefined,
    organization: organization
      ? {
          name: organization.name,
          companyName: organization.branding?.companyName || organization.name,
          logoUrl: organization.branding?.logoUrl,
          website,
          contactEmail,
          contactPhone,
          representativeName,
        }
      : undefined,
  };
};

export const getStudentDetailsForAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const studentIdParam = req.params.studentId;
  const studentId = typeof studentIdParam === "string" ? studentIdParam.trim() : "";
  if (!studentId) {
    res.status(400).json({ message: "Student ID is required" });
    return;
  }

  const student = await getScopedStudentRecord(req, studentId);
  if (!student) {
    res.status(404).json({ message: "Student not found" });
    return;
  }

  const attempts = await StudentAssessmentAttempt.find({
    user: student._id,
    organization: student.organization,
    status: "COMPLETED",
  }).sort({ completedAt: -1, updatedAt: -1 });

  res.json({
    student: {
      ...student.toObject(),
      testsTaken: attempts.length,
    },
    results: attempts.map((attempt) => {
      const canonicalCode = normalizeAssessmentCode(attempt.assessmentCode);
      return {
        id: attempt._id,
        assessmentCode: canonicalCode,
        assessmentName: getAssessmentDisplayName(canonicalCode, attempt.assessmentName),
        answeredCount: attempt.answeredCount,
        totalQuestions: attempt.totalQuestions,
        completedAt: attempt.completedAt,
        createdAt: attempt.createdAt,
      };
    }),
  });
};

export const getStudentAttemptReportForAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const studentIdParam = req.params.studentId;
  const studentId = typeof studentIdParam === "string" ? studentIdParam.trim() : "";
  const attemptIdParam = req.params.attemptId;
  const attemptId = typeof attemptIdParam === "string" ? attemptIdParam.trim() : "";

  if (!studentId || !attemptId) {
    res.status(400).json({ message: "Student ID and attempt ID are required" });
    return;
  }

  const student = await getScopedStudentRecord(req, studentId);
  if (!student) {
    res.status(404).json({ message: "Student not found" });
    return;
  }

  const attempt = await StudentAssessmentAttempt.findOne({
    _id: attemptId,
    user: student._id,
    organization: student.organization,
  });

  if (!attempt) {
    res.status(404).json({ message: "Attempt not found" });
    return;
  }

  if (attempt.status !== "COMPLETED") {
    res.status(400).json({ message: "Report is available only after test submission" });
    return;
  }

  res.json({
    report: await buildAttemptReportPayload(attempt, String(student._id)),
  });
};

const hydrateAttemptQuestionsWithOptions = async <T extends {
  questionId: IAttemptQuestion["questionId"] | string;
  options?: Array<{ label: string; text: string; score?: number }>;
}>(questions: T[]) => {
  const missingOptions = questions.filter((question) => !Array.isArray(question.options) || question.options.length === 0);
  if (!missingOptions.length) {
    return questions;
  }

  const optionSourceQuestions = await Question.find({
    _id: {
      $in: missingOptions.map((question) => question.questionId),
    },
  }).select({ _id: 1, options: 1 });

  const optionMap = new Map(
    optionSourceQuestions.map((question) => [String(question._id), question.options ?? []])
  );

  return questions.map((question) => ({
    ...question,
    options:
      Array.isArray(question.options) && question.options.length > 0
        ? question.options
        : optionMap.get(String(question.questionId)) ?? [],
  }));
};

const orderQuestionsByDatabaseInsertion = async <T extends { questionId: IAttemptQuestion["questionId"] | string }>(questions: T[]) => {
  if (!questions.length) {
    return questions;
  }

  const originalIndexMap = new Map<string, number>(
    questions.map((question, index) => [String(question.questionId), index])
  );

  const orderedQuestionIds = await Question.find({
    _id: { $in: questions.map((question) => question.questionId) },
  })
    .select({ _id: 1 })
    .sort({ createdAt: 1, _id: 1 });

  const databaseOrderMap = new Map(
    orderedQuestionIds.map((question, index) => [String(question._id), index])
  );

  return [...questions].sort((a, b) => {
    const aId = String(a.questionId);
    const bId = String(b.questionId);

    const aDbOrder = databaseOrderMap.get(aId);
    const bDbOrder = databaseOrderMap.get(bId);

    if (aDbOrder !== undefined && bDbOrder !== undefined) {
      return aDbOrder - bDbOrder;
    }

    if (aDbOrder !== undefined) return -1;
    if (bDbOrder !== undefined) return 1;

    return (originalIndexMap.get(aId) ?? 0) - (originalIndexMap.get(bId) ?? 0);
  });
};

const requireStudentUser = (req: AuthRequest, res: Response): boolean => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return false;
  }

  if (!isLearnerRole(req.user.role)) {
    res.status(403).json({ message: "Access denied" });
    return false;
  }

  if (!req.user.organization) {
    res.status(400).json({ message: "Learner organization is missing" });
    return false;
  }

  return true;
};

const getReferenceId = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === "object" && value !== null && "_id" in value) {
    const nestedId = (value as { _id?: unknown })._id;
    if (typeof nestedId === "string") {
      const trimmed = nestedId.trim();
      return trimmed || undefined;
    }
    if (nestedId instanceof mongoose.Types.ObjectId) {
      return nestedId.toString();
    }
    if (nestedId && typeof nestedId === "object" && typeof (nestedId as { toString?: () => string }).toString === "function") {
      return (nestedId as { toString: () => string }).toString();
    }
  }

  if (typeof (value as { toString?: () => string }).toString === "function") {
    const stringified = (value as { toString: () => string }).toString();
    if (stringified && stringified !== "[object Object]") {
      return stringified;
    }
  }

  return undefined;
};

type AssessmentPricing = {
  assessment: {
    code: string;
    name: string;
    basePrice: number;
    gstEnabled: boolean;
    gstPercentage: number;
    currency: string;
  };
  couponCode?: string;
  discountAmount: number;
  gstAmount: number;
  finalAmount: number;
};

const getFinancialYear = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const startYear = month >= 3 ? year : year - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYearShort}`;
};

const getCompanyPrefix = (companyName: string): string => {
  const normalized = (companyName || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (normalized.length >= 4) return normalized.slice(0, 4);
  if (normalized.length >= 1) return normalized.padEnd(4, "X");
  return "COMP";
};

const generateInvoiceNumber = async (organizationId: mongoose.Types.ObjectId | string): Promise<string> => {
  const org = await Organization.findById(organizationId).select("name branding.companyName");
  const companyName = org?.branding?.companyName || org?.name || "COMPANY";
  const prefix = getCompanyPrefix(companyName);
  const financialYear = getFinancialYear();

  const counter = await InvoiceCounter.findOneAndUpdate(
    { organization: organizationId, financialYear },
    { $inc: { counter: 1 } },
    { new: true, upsert: true }
  );

  if (!counter) {
    throw new Error("Unable to generate invoice number.");
  }

  const padded = String(counter.counter).padStart(6, "0");
  return `${prefix}/AS${padded}/${financialYear}`;
};

type InvoiceUserSummary = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  grade?: string;
  institutionName?: string;
  city?: string;
  state?: string;
  country?: string;
};

type InvoiceOrganizationSummary = {
  _id: string;
  name: string;
  slug: string;
  contactEmail?: string;
  website?: string;
  phone?: string;
  officeAddress?: string;
  state?: string;
  country?: string;
  panNumber?: string;
  gstNumber?: string;
  signatoryFirstName?: string;
  signatoryLastName?: string;
  signatureUrl?: string;
  branding?: {
    companyName?: string;
    logoUrl?: string;
  };
};

type InvoiceListItem = {
  _id: string;
  invoiceNumber: string;
  assessmentCode: string;
  assessmentName: string;
  amount: number;
  discountAmount: number;
  gstAmount: number;
  finalAmount: number;
  currency: string;
  couponCode?: string;
  paymentMethod: "RAZORPAY" | "FREE";
  paymentReference?: string;
  status: "DRAFT" | "PAID" | "VOID";
  createdAt: Date;
  updatedAt: Date;
  user: InvoiceUserSummary | null;
  organization: InvoiceOrganizationSummary | null;
};

const buildInvoiceListItems = async (query: Record<string, unknown>): Promise<InvoiceListItem[]> => {
  const invoices = await Invoice.find(query)
    .populate("user", "firstName lastName email phone grade institutionName city state country")
    .populate("organization", "name slug contactEmail website branding.companyName branding.logoUrl")
    .sort({ createdAt: -1 });

  const organizationIds = Array.from(
    new Set(
      invoices
        .map((invoice) => {
          const organization = invoice.organization as mongoose.Types.ObjectId | { _id?: mongoose.Types.ObjectId } | null;
          if (!organization) return null;
          if (organization instanceof mongoose.Types.ObjectId) return String(organization);
          return organization._id ? String(organization._id) : null;
        })
        .filter((id): id is string => Boolean(id))
    )
  );

  const organizationRegistrations = organizationIds.length
    ? await OrganizationRegistration.find({ organization: { $in: organizationIds } })
      .select("organization firstName lastName primaryMobile officeAddress state country gstNumber panCompany signatureUrl")
      .lean()
    : [];

  const registrationByOrganizationId = new Map(
    organizationRegistrations
      .filter((registration) => registration.organization)
      .map((registration) => [String(registration.organization), registration])
  );

  const invoiceIds = invoices.map((invoice) => invoice._id);
  const sessions = invoiceIds.length
    ? await AssessmentPaymentSession.find({ invoice: { $in: invoiceIds } }).select("invoice razorpayPaymentId")
    : [];

  const sessionByInvoiceId = new Map(
    sessions
      .filter((session) => session.invoice)
      .map((session) => [String(session.invoice), session])
  );

  return invoices.map((invoiceDoc) => {
    const invoice = invoiceDoc.toObject() as {
      _id: mongoose.Types.ObjectId;
      invoiceNumber: string;
      assessmentCode: string;
      amount: number;
      discountAmount?: number;
      gstAmount?: number;
      finalAmount: number;
      currency: string;
      couponCode?: string;
      paymentMethod?: "RAZORPAY" | "FREE";
      paymentReference?: string;
      status: "DRAFT" | "PAID" | "VOID";
      createdAt: Date;
      updatedAt: Date;
      user?: {
        _id: mongoose.Types.ObjectId;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        grade?: string;
        institutionName?: string;
        city?: string;
        state?: string;
        country?: string;
      };
      organization?: {
        _id: mongoose.Types.ObjectId;
        name?: string;
        slug?: string;
        contactEmail?: string;
        website?: string;
        branding?: {
          companyName?: string;
          logoUrl?: string;
        };
      };
    };

    const session = sessionByInvoiceId.get(String(invoice._id));
    const paymentReference = invoice.paymentReference || session?.razorpayPaymentId || undefined;
    const paymentMethod = invoice.paymentMethod || (paymentReference ? "RAZORPAY" : "FREE");
    const normalizedCode = normalizeAssessmentCode(invoice.assessmentCode);

    return {
      _id: String(invoice._id),
      invoiceNumber: invoice.invoiceNumber,
      assessmentCode: normalizedCode,
      assessmentName: getAssessmentDisplayName(normalizedCode, normalizedCode),
      amount: Number(invoice.amount || 0),
      discountAmount: Number(invoice.discountAmount || 0),
      gstAmount: Number(invoice.gstAmount || 0),
      finalAmount: Number(invoice.finalAmount || 0),
      currency: invoice.currency || "INR",
      couponCode: invoice.couponCode,
      paymentMethod,
      paymentReference,
      status: invoice.status,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      user: invoice.user ? {
        _id: String(invoice.user._id),
        firstName: String(invoice.user.firstName || ""),
        lastName: String(invoice.user.lastName || ""),
        email: String(invoice.user.email || ""),
        phone: invoice.user.phone,
        grade: invoice.user.grade,
        institutionName: invoice.user.institutionName,
        city: invoice.user.city,
        state: invoice.user.state,
        country: invoice.user.country,
      } : null,
      organization: invoice.organization ? {
        _id: String(invoice.organization._id),
        name: String(invoice.organization.name || ""),
        slug: String(invoice.organization.slug || ""),
        contactEmail: invoice.organization.contactEmail,
        website: invoice.organization.website,
        phone: registrationByOrganizationId.get(String(invoice.organization._id))?.primaryMobile,
        officeAddress: registrationByOrganizationId.get(String(invoice.organization._id))?.officeAddress,
        state: registrationByOrganizationId.get(String(invoice.organization._id))?.state,
        country: registrationByOrganizationId.get(String(invoice.organization._id))?.country,
        panNumber: registrationByOrganizationId.get(String(invoice.organization._id))?.panCompany,
        gstNumber: registrationByOrganizationId.get(String(invoice.organization._id))?.gstNumber,
        signatoryFirstName: registrationByOrganizationId.get(String(invoice.organization._id))?.firstName,
        signatoryLastName: registrationByOrganizationId.get(String(invoice.organization._id))?.lastName,
        signatureUrl: registrationByOrganizationId.get(String(invoice.organization._id))?.signatureUrl,
        branding: {
          companyName: invoice.organization.branding?.companyName,
          logoUrl: invoice.organization.branding?.logoUrl,
        },
      } : null,
    };
  });
};

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const computeAssessmentPricing = async (args: {
  assessmentCode: string;
  couponCode?: string;
  userId?: mongoose.Types.ObjectId | string;
  organizationId?: mongoose.Types.ObjectId | string;
}): Promise<AssessmentPricing> => {
  const canonicalCode = normalizeAssessmentCode(args.assessmentCode);
  const aliases = getAssessmentCodeAliases(canonicalCode);
  const organizationId = getReferenceId(args.organizationId);
  const userId = getReferenceId(args.userId);
  const assessment = await Assessment.findOne({ code: { $in: aliases }, active: true });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  const basePrice = Math.max(0, Number(assessment.basePrice || 0));
  const couponInput = String(args.couponCode || "").trim().toUpperCase();
  let couponCode: string | undefined;
  let discountAmount = 0;

  if (couponInput) {
    const applyGlobalCoupon = async () => {
      const coupon = await Coupon.findOne({ code: couponInput, isActive: true });
      if (!coupon) {
        throw new Error("Invalid coupon code");
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        throw new Error("Coupon has expired");
      }

      const applicableSet = new Set((coupon.applicableAssessmentCodes || []).map((code) => normalizeAssessmentCode(code)));
      const isApplicable = applicableSet.has(canonicalCode) || aliases.some((alias) => applicableSet.has(alias));
      if (!isApplicable) {
        throw new Error("Coupon is not applicable for this assessment");
      }

      discountAmount = coupon.discountType === "PERCENT"
        ? (basePrice * Number(coupon.value || 0)) / 100
        : Number(coupon.value || 0);

      discountAmount = Math.min(Math.max(discountAmount, 0), basePrice);
      couponCode = coupon.code;
    };

    // First, try to validate organization-scoped coupon for this student context.
    if (organizationId && userId) {
      const organizationScope = organizationId;
      const userScope = userId;

      const config = await OrganizationCouponConfig.findOne({
        organization: organizationScope,
        assessmentCode: canonicalCode,
        isActive: true,
      });

      if (config) {
        const normalizedPrefix = String(config.prefix || "").trim().toUpperCase();
        const suffix = couponInput.startsWith(normalizedPrefix)
          ? couponInput.slice(normalizedPrefix.length)
          : "";
        const sequence = Number(suffix);
        const isOrgSequentialCoupon =
          Boolean(normalizedPrefix) &&
          couponInput.startsWith(normalizedPrefix) &&
          /^\d+$/.test(suffix) &&
          Number.isInteger(sequence) &&
          sequence >= 1 &&
          sequence <= Number(config.totalCoupons || 0);

        if (isOrgSequentialCoupon) {
          const existingUsage = await OrganizationCouponUsage.findOne({
            organization: organizationScope,
            assessmentCode: canonicalCode,
            couponCode: couponInput,
          });

          if (existingUsage && String(existingUsage.user) !== userScope) {
            throw new Error("This coupon has already been used.");
          }

          const configDiscount = Number(config.discountAmount || 0);
          discountAmount = configDiscount > 0 ? Math.min(configDiscount, basePrice) : basePrice;
          couponCode = couponInput;
        } else {
          await applyGlobalCoupon();
        }
      } else {
        await applyGlobalCoupon();
      }
    } else {
      await applyGlobalCoupon();
    }
  }

  const gstPercentage = Math.max(0, Math.min(100, Number(assessment.gstPercentage ?? 18)));
  const gstAmount = assessment.gstEnabled ? basePrice * (gstPercentage / 100) : 0;
  const priceWithGst = basePrice + gstAmount;
  const rawFinalAmount = Math.max(priceWithGst - discountAmount, 0);
  const finalAmount = Math.round(rawFinalAmount);

  return {
    assessment: {
      code: canonicalCode,
      name: getAssessmentDisplayName(canonicalCode, assessment.name),
      basePrice,
      gstEnabled: Boolean(assessment.gstEnabled),
      gstPercentage,
      currency: assessment.currency || "INR",
    },
    couponCode,
    discountAmount: Number(discountAmount.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    finalAmount: finalAmount,
  };
};

const buildSequentialCouponCode = (prefix: string, sequence: number): string => {
  const safePrefix = String(prefix || "").trim().toUpperCase();
  return `${safePrefix}${Math.max(1, Number(sequence) || 1)}`;
};

const allocateOrganizationCouponForStudent = async (args: {
  organizationId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  assessmentCode: string;
}): Promise<{ couponCode?: string; configId?: string }> => {
  const { organizationId, userId, assessmentCode } = args;
  const organizationScope = getReferenceId(organizationId);
  const userScope = getReferenceId(userId);

  if (!organizationScope || !userScope) {
    throw new Error("Student organization details are invalid.");
  }

  const config = await OrganizationCouponConfig.findOne({
    organization: organizationScope,
    assessmentCode,
    isActive: true,
  });

  if (!config) {
    return {};
  }

  const existingUsage = await OrganizationCouponUsage.findOne({
    organization: organizationScope,
    user: userScope,
    assessmentCode,
  });

  if (existingUsage) {
    return {
      couponCode: existingUsage.couponCode,
      configId: String(config._id),
    };
  }

  const allocatedConfig = await OrganizationCouponConfig.findOneAndUpdate(
    {
      _id: config._id,
      isActive: true,
      $expr: { $lte: ["$nextSequence", "$totalCoupons"] },
    },
    { $inc: { nextSequence: 1 } },
    { new: false }
  );

  if (!allocatedConfig) {
    throw new Error("No coupons remaining for this assessment in your organization.");
  }

  const sequence = Number(allocatedConfig.nextSequence || 1);
  const couponCode = buildSequentialCouponCode(allocatedConfig.prefix, sequence);

  try {
    await OrganizationCouponUsage.create({
      config: allocatedConfig._id,
      organization: organizationScope,
      user: userScope,
      assessmentCode,
      couponCode,
      sequence,
      usedAt: new Date(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("allocate coupon: failed to create OrganizationCouponUsage", err);
    const fallback = await OrganizationCouponUsage.findOne({
      organization: organizationScope,
      user: userScope,
      assessmentCode,
    });
    if (fallback) {
      return {
        couponCode: fallback.couponCode,
        configId: String(allocatedConfig._id),
      };
    }
    throw new Error("Unable to allocate coupon for this assessment.");
  }

  return {
    couponCode,
    configId: String(allocatedConfig._id),
  };
};

export const getOrganizationCouponSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.organization) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const orgId = req.user.organization;
  const [assessments, configs, usageRows, usageDetails] = await Promise.all([
    Assessment.find({ active: true }).sort({ name: 1 }),
    OrganizationCouponConfig.find({ organization: orgId }).sort({ assessmentCode: 1 }),
    OrganizationCouponUsage.aggregate<{ _id: string; used: number }>([
      { $match: { organization: orgId } },
      { $group: { _id: "$assessmentCode", used: { $sum: 1 } } },
    ]),
    OrganizationCouponUsage.find({ organization: orgId })
      .populate("user", "firstName middleName lastName email")
      .sort({ usedAt: -1 })
      .lean(),
  ]);

  const dedupedAssessments = dedupeAssessments(
    assessments.map((assessment) => assessment.toObject() as unknown as { code: string; name: string })
  );

  const configByCode = new Map(configs.map((config) => [normalizeAssessmentCode(config.assessmentCode), config]));
  const usedByCode = new Map(usageRows.map((row) => [normalizeAssessmentCode(row._id), row.used]));
  const usageByCode = new Map<string, Array<{ couponCode: string; studentName: string; studentEmail: string; usedAt?: Date }>>();

  usageDetails.forEach((usage) => {
    const code = normalizeAssessmentCode(String(usage.assessmentCode || ""));
    const user = usage.user as unknown as {
      firstName?: string;
      middleName?: string;
      lastName?: string;
      email?: string;
    };

    const studentName = [user?.firstName, user?.middleName, user?.lastName]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(" ") || user?.email || "Unknown Student";

    const items = usageByCode.get(code) || [];
    items.push({
      couponCode: String(usage.couponCode || ""),
      studentName,
      studentEmail: String(user?.email || ""),
      usedAt: usage.usedAt ? new Date(usage.usedAt) : undefined,
    });
    usageByCode.set(code, items);
  });

  const summary = dedupedAssessments.map((assessment) => {
    const config = configByCode.get(assessment.code);
    const totalCoupons = config?.totalCoupons || 0;
    const usedCoupons = usedByCode.get(assessment.code) || 0;

    return {
      assessmentCode: assessment.code,
      assessmentName: assessment.name,
      prefix: config?.prefix || "—",
      totalCoupons,
      usedCoupons,
      remainingCoupons: Math.max(totalCoupons - usedCoupons, 0),
      isConfigured: Boolean(config),
      isActive: config?.isActive ?? false,
      configId: config ? String(config._id) : undefined,
      usedByStudents: (usageByCode.get(assessment.code) || []).slice(0, 50),
    };
  });

  res.json({ summary });
};

export const getStudentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  try {
    const learnerRole = req.user!.role as LearnerRole;

    const organizationId = req.user!.organization as mongoose.Types.ObjectId | string;
    const userId = req.user!._id as mongoose.Types.ObjectId | string;

    const [assessments, attempts] = await Promise.all([
      Assessment.find({ active: true }).sort({ name: 1 }),
      StudentAssessmentAttempt.find({ user: userId, organization: organizationId }),
    ]);

    const dedupedAssessments = dedupeAssessments(
      assessments.map((assessment) => assessment.toObject() as unknown as { code: string; name: string })
    ).filter((assessment) => isAssessmentAccessibleForLearner(learnerRole, assessment.code));

    const visibleAttempts = attempts.filter((attempt) => isAssessmentAccessibleForLearner(learnerRole, attempt.assessmentCode));

    const completedCodes = new Set(
      visibleAttempts
        .filter((attempt) => attempt.status === "COMPLETED")
        .map((attempt) => normalizeAssessmentCode(attempt.assessmentCode))
    );
    const appearedCodes = new Set(visibleAttempts.map((attempt) => normalizeAssessmentCode(attempt.assessmentCode)));

    const totalAssessments = dedupedAssessments.length;
    const appeared = appearedCodes.size;
    const completed = completedCodes.size;
    const pending = Math.max(totalAssessments - completed, 0);

    res.json({
      stats: {
        appeared,
        completed,
        pending,
        totalAssessments,
      },
      latestAttempts: attempts
        .filter((attempt) => isAssessmentAccessibleForLearner(learnerRole, attempt.assessmentCode))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
        .map((attempt) => ({
          id: attempt._id,
          assessmentCode: normalizeAssessmentCode(attempt.assessmentCode),
          assessmentName: getAssessmentDisplayName(attempt.assessmentCode, attempt.assessmentName),
          status: attempt.status,
          answeredCount: attempt.answeredCount,
          totalQuestions: attempt.totalQuestions,
          updatedAt: attempt.updatedAt,
        })),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("getStudentDashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};

export const listStudentResults = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  try {
    const learnerRole = req.user!.role as LearnerRole;

    const attempts = await StudentAssessmentAttempt.find({
      user: req.user!._id,
      organization: req.user!.organization,
      status: "COMPLETED",
    }).sort({ completedAt: -1, updatedAt: -1 });

    res.json({
      results: attempts
        .filter((attempt) => isAssessmentAccessibleForLearner(learnerRole, attempt.assessmentCode))
        .map((attempt) => {
        const canonicalCode = normalizeAssessmentCode(attempt.assessmentCode);
        return {
          id: attempt._id,
          assessmentCode: canonicalCode,
          assessmentName: getAssessmentDisplayName(canonicalCode, attempt.assessmentName),
          answeredCount: attempt.answeredCount,
          totalQuestions: attempt.totalQuestions,
          completedAt: attempt.completedAt,
          createdAt: attempt.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error("listStudentResults error:", error);
    res.status(500).json({ message: "Failed to load results" });
  }
};

export const listStudentAssessments = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  try {
    const learnerRole = req.user!.role as LearnerRole;

    const organizationId = req.user!.organization as mongoose.Types.ObjectId | string;
    const userId = req.user!._id as mongoose.Types.ObjectId | string;

    const [assessments, attempts] = await Promise.all([
      Assessment.find({ active: true }).sort({ name: 1 }),
      StudentAssessmentAttempt.find({ user: userId, organization: organizationId }),
    ]);

    const dedupedAssessments = dedupeAssessments(
      assessments.map((assessment) => assessment.toObject() as unknown as AssessmentCatalogItem)
    ).filter((assessment) => isAssessmentAccessibleForLearner(learnerRole, assessment.code));

    const attemptsByCode = new Map<string, (typeof attempts)[number]>();
    for (const attempt of attempts) {
      const normalizedCode = normalizeAssessmentCode(attempt.assessmentCode);
      if (!isAssessmentAccessibleForLearner(learnerRole, normalizedCode)) {
        continue;
      }
      const existing = attemptsByCode.get(normalizedCode);
      if (!existing || new Date(attempt.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
        attemptsByCode.set(normalizedCode, attempt);
      }
    }

    const assessmentsWithCounts = await Promise.all(
      dedupedAssessments.map(async (assessment) => {
        const questionCount = await Question.countDocuments({
          assessmentCode: { $in: getAssessmentCodeAliases(assessment.code) },
          isActive: true,
        });
        return {
          ...assessment,
          questionCount,
        };
      })
    );

    res.json({
      assessments: assessmentsWithCounts.map((assessment) => {
        const attempt = attemptsByCode.get(assessment.code);
        return {
          _id: assessment._id,
          code: assessment.code,
          name: assessment.name,
          slug: assessment.slug,
          summary: assessment.summary,
          category: assessment.category,
          questionCount: assessment.questionCount,
          sourceProject: assessment.sourceProject,
          active: assessment.active,
          attempt: attempt
            ? {
              id: attempt._id,
              status: attempt.status,
              answeredCount: attempt.answeredCount,
              totalQuestions: attempt.totalQuestions,
              completedAt: attempt.completedAt,
            }
            : null,
        };
      }),
    });
  } catch (error) {
    console.error("listStudentAssessments error:", error);
    res.status(500).json({ message: "Failed to load assessments" });
  }
};

export const getStudentAssessmentPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const learnerRole = req.user!.role as LearnerRole;

  const codeParam = req.params.code;
  const code = typeof codeParam === "string" ? codeParam.toUpperCase().trim() : "";
  if (!code) {
    res.status(400).json({ message: "Assessment code is required" });
    return;
  }

  if (!requireLearnerAssessmentAccess(res, learnerRole, code)) {
    return;
  }

  const couponCode = typeof req.query.couponCode === "string" ? req.query.couponCode : undefined;
  const organizationId = getReferenceId(req.user?.organization);
  const userId = getReferenceId(req.user?._id);

  if (!organizationId || !userId) {
    res.status(400).json({ message: "Student organization details are invalid" });
    return;
  }

  try {
    const pricing = await computeAssessmentPricing({ 
      assessmentCode: code, 
      couponCode,
      userId,
      organizationId,
    });
    res.json(pricing);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to calculate pricing" });
  }
};

export const listStudentInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const learnerRole = req.user!.role as LearnerRole;

  const invoices = await buildInvoiceListItems({
    user: req.user!._id,
    organization: req.user!.organization,
    status: "PAID",
  });

  res.json({
    invoices: invoices.filter((invoice) => isAssessmentAccessibleForLearner(learnerRole, invoice.assessmentCode)),
  });
};

export const listOrganizationInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (req.user.role !== "ORG_ADMIN") {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  if (!req.user.organization) {
    res.status(400).json({ message: "Organization is missing" });
    return;
  }

  const invoices = await buildInvoiceListItems({
    organization: req.user.organization,
    status: "PAID",
  });

  res.json({ invoices });
};

export const createStudentAssessmentPaymentOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const learnerRole = req.user!.role as LearnerRole;

  const codeParam = req.params.code;
  const code = typeof codeParam === "string" ? codeParam.toUpperCase().trim() : "";
  if (!code) {
    res.status(400).json({ message: "Assessment code is required" });
    return;
  }

  if (!requireLearnerAssessmentAccess(res, learnerRole, code)) {
    return;
  }

  const { couponCode } = req.body as { couponCode?: string };
  const organizationId = getReferenceId(req.user?.organization);
  const userId = getReferenceId(req.user?._id);

  if (!organizationId || !userId) {
    res.status(400).json({ message: "Student organization details are invalid" });
    return;
  }

  try {
    const pricing = await computeAssessmentPricing({ 
      assessmentCode: code, 
      couponCode,
      userId,
      organizationId,
    });

    const paymentSession = await AssessmentPaymentSession.create({
      user: userId,
      organization: organizationId,
      assessmentCode: pricing.assessment.code,
      couponCode: pricing.couponCode,
      amount: pricing.assessment.basePrice,
      discountAmount: pricing.discountAmount,
      finalAmount: pricing.finalAmount,
      gstAmount: pricing.gstAmount,
      currency: pricing.assessment.currency || "INR",
      status: pricing.finalAmount <= 0 ? "PAID" : "CREATED",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    if (pricing.finalAmount <= 0) {
      const invoice = await Invoice.create({
        invoiceNumber: await generateInvoiceNumber(organizationId),
        user: userId,
        organization: organizationId,
        assessmentCode: pricing.assessment.code,
        amount: pricing.assessment.basePrice,
        discountAmount: pricing.discountAmount,
        gstAmount: pricing.gstAmount,
        finalAmount: pricing.finalAmount,
        currency: pricing.assessment.currency || "INR",
        couponCode: pricing.couponCode,
        paymentMethod: "FREE",
        paymentReference: `FREE-${paymentSession._id}`,
        status: "PAID",
      });

      paymentSession.invoice = invoice._id;
      await paymentSession.save();

      res.json({
        paymentRequired: false,
        paymentSessionId: String(paymentSession._id),
        pricing,
      });
      return;
    }

    const razorpay = getRazorpayClient();
    if (!razorpay || !process.env.RAZORPAY_KEY_ID) {
      res.status(500).json({ message: "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend env." });
      return;
    }

    const order = await razorpay.orders.create({
      amount: Math.round(pricing.finalAmount * 100),
      currency: pricing.assessment.currency || "INR",
      receipt: `assess_${paymentSession._id}`,
      notes: {
        assessmentCode: pricing.assessment.code,
        studentEmail: req.user!.email,
      },
    });

    paymentSession.razorpayOrderId = order.id;
    await paymentSession.save();

    res.json({
      paymentRequired: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentSessionId: String(paymentSession._id),
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      pricing,
    });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to create payment order" });
  }
};

export const verifyStudentAssessmentPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const learnerRole = req.user!.role as LearnerRole;

  const codeParam = req.params.code;
  const code = typeof codeParam === "string" ? normalizeAssessmentCode(codeParam) : "";

  if (!requireLearnerAssessmentAccess(res, learnerRole, code)) {
    return;
  }

  const {
    paymentSessionId,
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  } = req.body as {
    paymentSessionId?: string;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  };

  if (!paymentSessionId) {
    res.status(400).json({ message: "paymentSessionId is required" });
    return;
  }

  const session = await AssessmentPaymentSession.findOne({
    _id: paymentSessionId,
    user: req.user!._id,
    organization: req.user!.organization,
    assessmentCode: code,
  });

  if (!session) {
    res.status(404).json({ message: "Payment session not found" });
    return;
  }

  if (!requireLearnerAssessmentAccess(res, learnerRole, session.assessmentCode)) {
    return;
  }

  if (session.status === "PAID" || session.status === "CONSUMED") {
    res.json({ message: "Payment already verified", paymentSessionId: String(session._id) });
    return;
  }

  if (!session.razorpayOrderId) {
    res.status(400).json({ message: "Razorpay order is missing for this session" });
    return;
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    res.status(500).json({ message: "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend env." });
    return;
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (!razorpay_signature || expected !== razorpay_signature || razorpay_order_id !== session.razorpayOrderId) {
    session.status = "FAILED";
    await session.save();
    res.status(400).json({ message: "Payment verification failed" });
    return;
  }

  const invoice = await Invoice.create({
    invoiceNumber: await generateInvoiceNumber(req.user!.organization as mongoose.Types.ObjectId | string),
    user: req.user!._id,
    organization: req.user!.organization,
    assessmentCode: session.assessmentCode,
    amount: session.amount,
    discountAmount: session.discountAmount,
    gstAmount: session.gstAmount,
    finalAmount: session.finalAmount,
    currency: session.currency,
    couponCode: session.couponCode,
    paymentMethod: "RAZORPAY",
    paymentReference: razorpay_payment_id,
    status: "PAID",
  });

  session.status = "PAID";
  session.razorpayPaymentId = razorpay_payment_id;
  session.razorpaySignature = razorpay_signature;
  session.invoice = invoice._id;
  await session.save();

  res.json({ message: "Payment verified", paymentSessionId: String(session._id) });
};

export const startStudentAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const learnerRole = req.user!.role as LearnerRole;

  const codeParam = req.params.code;
  const code = typeof codeParam === "string" ? codeParam.toUpperCase().trim() : "";
  const canonicalCode = normalizeAssessmentCode(code);
  const codeAliases = getAssessmentCodeAliases(code);
  if (!code) {
    res.status(400).json({ message: "Assessment code is required" });
    return;
  }

  if (!requireLearnerAssessmentAccess(res, learnerRole, canonicalCode)) {
    return;
  }

  const organizationId = getReferenceId(req.user?.organization);
  const userId = getReferenceId(req.user?._id);
  const { paymentSessionId } = req.body as { paymentSessionId?: string };

  if (!organizationId || !userId) {
    res.status(400).json({ message: "Student organization details are invalid" });
    return;
  }

  const [assessment, existingAttempt] = await Promise.all([
    Assessment.findOne({ code: { $in: codeAliases }, active: true }),
    StudentAssessmentAttempt.findOne({ user: userId, organization: organizationId, assessmentCode: { $in: codeAliases } }),
  ]);

  if (!assessment) {
    res.status(404).json({ message: "Assessment not found" });
    return;
  }

  if (existingAttempt?.status === "COMPLETED") {
    res.status(409).json({ message: "You have already completed this assessment." });
    return;
  }

  if (existingAttempt?.status === "IN_PROGRESS") {
    const hydratedQuestions = await hydrateAttemptQuestionsWithOptions(existingAttempt.questions);
    let orderedQuestions = canonicalCode === "CAREER_DNA"
      ? [...hydratedQuestions]
      : await orderQuestionsByDatabaseInsertion(hydratedQuestions);

    if (canonicalCode === "CAREER_DNA" && existingAttempt.answeredCount === 0) {
      const sourceQuestions = await Question.find({ assessmentCode: { $in: codeAliases }, isActive: true })
        .sort({ createdAt: 1, _id: 1 });

      if (sourceQuestions.length) {
        const sourceAttemptQuestions = mapQuestionBankToAttemptQuestions(sourceQuestions, canonicalCode);
        const sampledCareerDnaQuestions = buildCareerDnaQuestionSetForAttempt(sourceAttemptQuestions);
        const expectedCareerDnaQuestionCount = sampledCareerDnaQuestions.length;

        const expectedCategoryCounts = sampledCareerDnaQuestions.reduce((acc, question) => {
          const key = String(question.category || "");
          acc.set(key, (acc.get(key) || 0) + 1);
          return acc;
        }, new Map<string, number>());

        const currentCategoryCounts = orderedQuestions.reduce((acc, question) => {
          const key = String(question.category || "");
          acc.set(key, (acc.get(key) || 0) + 1);
          return acc;
        }, new Map<string, number>());

        const hasDistributionMismatch =
          expectedCategoryCounts.size !== currentCategoryCounts.size
          || Array.from(expectedCategoryCounts.entries()).some(([category, count]) => (
            (currentCategoryCounts.get(category) || 0) !== count
          ));

        if (existingAttempt.totalQuestions !== expectedCareerDnaQuestionCount || hasDistributionMismatch) {
          orderedQuestions = sampledCareerDnaQuestions;
        }
      }
    }

    const questionsReordered = orderedQuestions.some((question, index) => (
      String(question.questionId) !== String(existingAttempt.questions[index]?.questionId)
    )) || orderedQuestions.length !== existingAttempt.questions.length;

    const shouldNormalizeAttemptMetadata =
      existingAttempt.assessmentCode !== canonicalCode
      || existingAttempt.assessmentName !== getAssessmentDisplayName(canonicalCode, existingAttempt.assessmentName);

    if (
      hydratedQuestions.some((question, index) => question.options !== existingAttempt.questions[index].options)
      || questionsReordered
      || shouldNormalizeAttemptMetadata
    ) {
      const nextAssessmentName = getAssessmentDisplayName(canonicalCode, assessment?.name || existingAttempt.assessmentName);

      await StudentAssessmentAttempt.updateOne(
        { _id: existingAttempt._id },
        {
          $set: {
            questions: orderedQuestions,
            totalQuestions: orderedQuestions.length,
            assessmentCode: canonicalCode,
            assessmentName: nextAssessmentName,
          },
        }
      );

      existingAttempt.questions = orderedQuestions as typeof existingAttempt.questions;
      existingAttempt.totalQuestions = orderedQuestions.length;
      existingAttempt.assessmentCode = canonicalCode;
      existingAttempt.assessmentName = nextAssessmentName;
    }

    res.json({
      attempt: {
        id: existingAttempt._id,
        assessmentCode: canonicalCode,
        assessmentName: getAssessmentDisplayName(canonicalCode, assessment?.name || existingAttempt.assessmentName),
        status: existingAttempt.status,
        questions: orderedQuestions,
        answeredCount: existingAttempt.answeredCount,
        totalQuestions: existingAttempt.totalQuestions,
      },
    });
    return;
  }

  const questions = await Question.find({ assessmentCode: { $in: codeAliases }, isActive: true })
    .sort({ createdAt: 1, _id: 1 });
  if (!questions.length) {
    res.status(400).json({ message: "No active questions found for this assessment" });
    return;
  }

  const attemptQuestions = mapQuestionBankToAttemptQuestions(questions, canonicalCode);

  const selectedAttemptQuestions = canonicalCode === "CAREER_DNA"
    ? buildCareerDnaQuestionSetForAttempt(attemptQuestions)
    : attemptQuestions;

  const paidSession = await AssessmentPaymentSession.findOne({
    _id: paymentSessionId,
    user: userId,
    organization: organizationId,
    assessmentCode: canonicalCode,
    status: "PAID",
    expiresAt: { $gte: new Date() },
  });

  if (!paidSession) {
    res.status(402).json({
      message: "Payment is required before starting this test. Please complete checkout.",
    });
    return;
  }

  let allocatedCouponCode: string | undefined;
  let allocatedConfigId: string | undefined;
  try {
    const allocation = await allocateOrganizationCouponForStudent({
      organizationId,
      userId,
      assessmentCode: canonicalCode,
    });
    allocatedCouponCode = allocation.couponCode;
    allocatedConfigId = allocation.configId;
  } catch (error) {
    res.status(409).json({
      message: error instanceof Error ? error.message : "Unable to allocate coupon",
    });
    return;
  }

  const createdAttempt = await StudentAssessmentAttempt.create({
    user: userId,
    organization: organizationId,
    assessmentCode: canonicalCode,
    assessmentName: getAssessmentDisplayName(canonicalCode, assessment.name),
    status: "IN_PROGRESS",
    questions: selectedAttemptQuestions,
    answeredCount: 0,
    totalQuestions: selectedAttemptQuestions.length,
    startedAt: new Date(),
  });

  if (allocatedCouponCode && allocatedConfigId) {
    await OrganizationCouponUsage.updateOne(
      {
        organization: organizationId,
        user: userId,
        assessmentCode: canonicalCode,
        couponCode: allocatedCouponCode,
      },
      { $set: { attempt: createdAttempt._id } }
    );
  }

  paidSession.status = "CONSUMED";
  paidSession.attempt = createdAttempt._id;
  await paidSession.save();

  res.status(201).json({
    attempt: {
      id: createdAttempt._id,
      assessmentCode: createdAttempt.assessmentCode,
      assessmentName: createdAttempt.assessmentName,
      status: createdAttempt.status,
      questions: createdAttempt.questions,
      answeredCount: createdAttempt.answeredCount,
      totalQuestions: createdAttempt.totalQuestions,
      couponCode: allocatedCouponCode,
    },
  });
};

export const getStudentAttempt = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const learnerRole = req.user!.role as LearnerRole;

  const attemptIdParam = req.params.attemptId;
  const attemptId = typeof attemptIdParam === "string" ? attemptIdParam.trim() : "";
  if (!attemptId) {
    res.status(400).json({ message: "Attempt ID is required" });
    return;
  }

  const attempt = await StudentAssessmentAttempt.findOne({
    _id: attemptId,
    user: req.user!._id,
    organization: req.user!.organization,
  });

  if (!attempt) {
    res.status(404).json({ message: "Attempt not found" });
    return;
  }

  if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode)) {
    return;
  }

  const hydratedQuestions = await hydrateAttemptQuestionsWithOptions(attempt.questions);
  const canonicalCode = normalizeAssessmentCode(attempt.assessmentCode);
  const orderedQuestions = canonicalCode === "CAREER_DNA"
    ? hydratedQuestions
    : await orderQuestionsByDatabaseInsertion(hydratedQuestions);

  const questionsReordered = orderedQuestions.some((question, index) => (
    String(question.questionId) !== String(attempt.questions[index]?.questionId)
  ));

  const shouldNormalizeAttemptMetadata =
    attempt.assessmentCode !== canonicalCode
    || attempt.assessmentName !== getAssessmentDisplayName(canonicalCode, attempt.assessmentName);

  if (
    hydratedQuestions.some((question, index) => question.options !== attempt.questions[index].options)
    || questionsReordered
    || shouldNormalizeAttemptMetadata
  ) {
    attempt.questions = orderedQuestions as typeof attempt.questions;
    attempt.assessmentCode = canonicalCode;
    attempt.assessmentName = getAssessmentDisplayName(canonicalCode, attempt.assessmentName);
    await attempt.save();
  }

  res.json({
    attempt: {
      id: attempt._id,
      assessmentCode: canonicalCode,
      assessmentName: getAssessmentDisplayName(canonicalCode, attempt.assessmentName),
      status: attempt.status,
      questions: orderedQuestions,
      answeredCount: attempt.answeredCount,
      totalQuestions: attempt.totalQuestions,
      completedAt: attempt.completedAt,
    },
  });
};

export const saveStudentAttemptAnswers = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const learnerRole = req.user!.role as LearnerRole;

  const attemptIdParam = req.params.attemptId;
  const attemptId = typeof attemptIdParam === "string" ? attemptIdParam.trim() : "";
  const { answers } = req.body as {
    answers?: Array<{ questionId?: string; answer?: string | number }>;
  };

  if (!attemptId) {
    res.status(400).json({ message: "Attempt ID is required" });
    return;
  }

  if (!Array.isArray(answers) || !answers.length) {
    res.status(400).json({ message: "Answers payload is required" });
    return;
  }

  const attempt = await StudentAssessmentAttempt.findOne({
    _id: attemptId,
    user: req.user!._id,
    organization: req.user!.organization,
    status: "IN_PROGRESS",
  });

  if (!attempt) {
    res.status(404).json({ message: "Active attempt not found" });
    return;
  }

  if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode)) {
    return;
  }

  const answerMap = new Map<string, string>();
  for (const item of answers) {
    const questionId = item.questionId?.trim();
    const answerValue = item.answer !== undefined && item.answer !== null ? String(item.answer).trim() : "";
    if (!questionId || !answerValue) {
      continue;
    }
    answerMap.set(questionId, answerValue);
  }

  attempt.questions = attempt.questions.map((question) => {
    const nextAnswer = answerMap.get(String(question.questionId));
    return nextAnswer ? { ...question, answer: nextAnswer } : question;
  });

  attempt.answeredCount = attempt.questions.filter((question) => question.answer !== undefined && question.answer !== "").length;
  await attempt.save();

  res.json({
    message: "Answers saved",
    answeredCount: attempt.answeredCount,
    totalQuestions: attempt.totalQuestions,
  });
};

export const submitStudentAttempt = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const learnerRole = req.user!.role as LearnerRole;

  const attemptIdParam = req.params.attemptId;
  const attemptId = typeof attemptIdParam === "string" ? attemptIdParam.trim() : "";
  if (!attemptId) {
    res.status(400).json({ message: "Attempt ID is required" });
    return;
  }

  const attempt = await StudentAssessmentAttempt.findOne({
    _id: attemptId,
    user: req.user!._id,
    organization: req.user!.organization,
  });

  if (!attempt) {
    res.status(404).json({ message: "Attempt not found" });
    return;
  }

  if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode)) {
    return;
  }

  if (attempt.status === "COMPLETED") {
    res.json({ message: "Assessment already submitted", attemptId: attempt._id });
    return;
  }

  const unanswered = attempt.questions.filter((question) => !question.answer || question.answer === "");
  if (unanswered.length > 0) {
    res.status(400).json({ message: `Please answer all questions before submitting. ${unanswered.length} remaining.` });
    return;
  }

  // Use atomic findOneAndUpdate to prevent race condition: only submit if status is still IN_PROGRESS
  const evaluationData = await evaluateAssessmentAttempt(attempt);
  const updatedAttempt = await StudentAssessmentAttempt.findOneAndUpdate(
    {
      _id: attemptId,
      status: "IN_PROGRESS", // Only update if still in progress
      user: req.user!._id,
      organization: req.user!.organization,
    },
    {
      status: "COMPLETED",
      completedAt: new Date(),
      answeredCount: attempt.totalQuestions,
      evaluation: evaluationData,
    },
    { new: true } // Return updated document
  );

  if (!updatedAttempt) {
    // Another request already submitted this attempt
    res.status(409).json({ message: "Assessment already submitted by another request" });
    return;
  }

  res.json({
    message: "Assessment submitted successfully",
    attemptId: updatedAttempt._id,
    evaluation: updatedAttempt.evaluation,
  });
};

export const getStudentAttemptReport = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const learnerRole = req.user!.role as LearnerRole;

  const attemptIdParam = req.params.attemptId;
  const attemptId = typeof attemptIdParam === "string" ? attemptIdParam.trim() : "";
  if (!attemptId) {
    res.status(400).json({ message: "Attempt ID is required" });
    return;
  }

  const attempt = await StudentAssessmentAttempt.findOne({
    _id: attemptId,
    user: req.user!._id,
    organization: req.user!.organization,
  });

  if (!attempt) {
    res.status(404).json({ message: "Attempt not found" });
    return;
  }

  if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode)) {
    return;
  }

  if (attempt.status !== "COMPLETED") {
    res.status(400).json({ message: "Report is available only after test submission" });
    return;
  }

  res.json({
    report: await buildAttemptReportPayload(attempt, String(req.user!._id)),
  });
};

export const emailStudentAttemptReport = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const learnerRole = req.user!.role as LearnerRole;

  const attemptIdParam = req.params.attemptId;
  const attemptId = typeof attemptIdParam === "string" ? attemptIdParam.trim() : "";
  if (!attemptId) {
    res.status(400).json({ message: "Attempt ID is required" });
    return;
  }

  const { pdfBase64, fileName } = req.body as { pdfBase64?: string; fileName?: string };
  if (!pdfBase64) {
    res.status(400).json({ message: "pdfBase64 is required" });
    return;
  }

  const attempt = await StudentAssessmentAttempt.findOne({
    _id: attemptId,
    user: req.user!._id,
  });

  if (!attempt || attempt.status !== "COMPLETED") {
    res.status(404).json({ message: "Completed attempt not found" });
    return;
  }

  if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode)) {
    return;
  }

  const student = await User.findById(req.user!._id).lean();
  if (!student?.email) {
    res.status(400).json({ message: "Student email not found" });
    return;
  }

  const pdfBuffer = Buffer.from(pdfBase64, "base64");
  const safeName = `${attempt.assessmentCode}_Report_${String(student.firstName || "Student").replace(/\s+/g, "_")}.pdf`;

  await sendAssessmentReportToStudent({
    email: student.email,
    firstName: student.firstName || "Student",
    assessmentName: attempt.assessmentName || attempt.assessmentCode,
    pdfBuffer,
    fileName: fileName || safeName,
  });

  res.json({ message: "Report sent to your email successfully" });
};

export const getOrganizationProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== "ORG_ADMIN") {
    res.status(403).json({ message: "Only organization admins can access this endpoint" });
    return;
  }

  try {
    const organizationId = req.user.organization && typeof req.user.organization === "object"
      ? String((req.user.organization as { _id?: { toString(): string } })._id || "")
      : String(req.user.organization || "");

    if (!organizationId) {
      res.status(400).json({ message: "Organization is not linked to this user" });
      return;
    }

    const organization = await Organization.findById(organizationId);

    if (!organization) {
      res.status(404).json({ message: "Organization not found" });
      return;
    }

    const [orgAdmin, orgRegistration] = await Promise.all([
      User.findOne({ organization: organization._id, role: "ORG_ADMIN" }).lean(),
      OrganizationRegistration.findOne({ organization: organization._id }).lean(),
    ]);

    const derivedRepresentativeName = orgAdmin
      ? `${orgAdmin.firstName || ""} ${orgAdmin.lastName || ""}`.trim()
      : "";
    const registrationRepresentativeName = orgRegistration
      ? `${orgRegistration.firstName || ""} ${orgRegistration.lastName || ""}`.trim()
      : "";
    const registrationContactPhone = orgRegistration?.primaryMobile || orgRegistration?.alternateMobile || "";

    const responseOrganization = {
      ...organization.toObject(),
      contactPhone: organization.settings?.contactPhone || registrationContactPhone || orgAdmin?.phone || "",
      representativeName: organization.settings?.representativeName || registrationRepresentativeName || derivedRepresentativeName || "",
    };

    res.json({ organization: responseOrganization });
  } catch (error) {
    console.error("Get organization profile error:", error);
    res.status(500).json({ message: "Failed to fetch organization profile" });
  }
};

export const updateOrganizationProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== "ORG_ADMIN") {
    res.status(403).json({ message: "Only organization admins can update profile" });
    return;
  }

  try {
    const payload = req.body as {
      companyName?: string;
      website?: string;
      contactEmail?: string;
      contactPhone?: string;
      representativeName?: string;
      branding?: {
        companyName?: string;
        website?: string;
        contactEmail?: string;
        contactPhone?: string;
        representativeName?: string;
      };
    };

    const profile = payload.branding || payload;

    if (!profile) {
      res.status(400).json({ message: "Branding data is required" });
      return;
    }

    const updateData: Record<string, string | undefined> = {};

    if (profile.companyName?.trim()) {
      updateData["branding.companyName"] = profile.companyName.trim();
    }

    if (profile.website !== undefined) {
      updateData.website = profile.website?.trim() || undefined;
    }

    if (profile.contactEmail !== undefined) {
      updateData.contactEmail = profile.contactEmail?.trim() || undefined;
    }

    if (profile.contactPhone !== undefined) {
      updateData["settings.contactPhone"] = profile.contactPhone?.trim() || "";
    }

    if (profile.representativeName !== undefined) {
      updateData["settings.representativeName"] = profile.representativeName?.trim() || "";
    }

    const organizationId = req.user.organization && typeof req.user.organization === "object"
      ? String((req.user.organization as { _id?: { toString(): string } })._id || "")
      : String(req.user.organization || "");

    if (!organizationId) {
      res.status(400).json({ message: "Organization is not linked to this user" });
      return;
    }

    const organization = await Organization.findOneAndUpdate(
      { _id: organizationId },
      updateData,
      { new: true }
    );

    if (!organization) {
      res.status(404).json({ message: "Organization not found" });
      return;
    }

    res.json({ organization });
  } catch (error: unknown) {
    console.error("Update organization profile error:", error);
    res.status(500).json({ message: "Failed to update organization profile" });
  }
};

export const updateOrganizationLogo = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || req.user.role !== "ORG_ADMIN") {
    res.status(403).json({ message: "Only organization admins can update logo" });
    return;
  }

  try {
    const { logoUrl } = req.body as { logoUrl?: string };

    if (!logoUrl || typeof logoUrl !== "string") {
      res.status(400).json({ message: "Logo URL is required" });
      return;
    }

    // Validate base64 or URL format
    if (!logoUrl.startsWith("data:image/") && !logoUrl.startsWith("http")) {
      res.status(400).json({ message: "Invalid logo format" });
      return;
    }

    const organizationId = req.user.organization && typeof req.user.organization === "object"
      ? String((req.user.organization as { _id?: { toString(): string } })._id || "")
      : String(req.user.organization || "");

    if (!organizationId) {
      res.status(400).json({ message: "Organization is not linked to this user" });
      return;
    }

    const organization = await Organization.findOneAndUpdate(
      { _id: organizationId },
      { "branding.logoUrl": logoUrl },
      { new: true }
    );

    if (!organization) {
      res.status(404).json({ message: "Organization not found" });
      return;
    }

    res.json({ organization });
  } catch (error) {
    console.error("Update organization logo error:", error);
    res.status(500).json({ message: "Failed to update logo" });
  }
};

export const logAntiCheatEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const attemptIdParam = req.params.attemptId;
  const attemptId = typeof attemptIdParam === "string" ? attemptIdParam.trim() : "";
  if (!attemptId) {
    res.status(400).json({ message: "Attempt ID is required" });
    return;
  }

  const eventType = typeof req.body?.eventType === "string" ? req.body.eventType.trim() : "";
  if (!eventType) {
    res.status(400).json({ message: "Event type is required" });
    return;
  }

  // Validate event type is one of known anti-cheat events
  const validEvents = ["fullscreen_exit", "tab_switch", "window_blur", "other"];
  if (!validEvents.includes(eventType)) {
    res.status(400).json({ message: `Invalid event type. Allowed: ${validEvents.join(", ")}` });
    return;
  }

  const attempt = await StudentAssessmentAttempt.findOne({
    _id: attemptId,
    user: req.user!._id,
    organization: req.user!.organization,
  });

  if (!attempt) {
    res.status(404).json({ message: "Attempt not found" });
    return;
  }

  // Log the anti-cheat event with timestamp
  const eventEntry = `${eventType}:${new Date().toISOString()}`;
  if (!Array.isArray(attempt.antiCheatEvents)) {
    attempt.antiCheatEvents = [];
  }
  attempt.antiCheatEvents.push(eventEntry);
  
  // Keep only last 100 events to prevent unbounded growth
  if (attempt.antiCheatEvents.length > 100) {
    attempt.antiCheatEvents = attempt.antiCheatEvents.slice(-100);
  }

  await attempt.save();

  console.warn("logAntiCheatEvent: recorded", {
    attemptId: String(attempt._id),
    eventType,
    userId: String(req.user!._id),
    totalEvents: attempt.antiCheatEvents.length,
  });

  res.json({ message: "Event logged", totalEvents: attempt.antiCheatEvents.length });
};

export const listParents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const scope = req.user.role === "SUPERADMIN" ? {} : { organization: req.user.organization };

    const parents = await User.find({ role: "PARENT", ...scope })
      .populate("organization", "name slug")
      .sort({ createdAt: -1 });

    const parentIds = parents.map((parent) => parent._id);
    
    // Only query attempts if there are parents
    let attemptCounts: Array<{
      _id: { user: string; status: "COMPLETED" | "IN_PROGRESS" };
      count: number;
    }> = [];
    
    if (parentIds.length > 0) {
      attemptCounts = await StudentAssessmentAttempt.aggregate<{
        _id: { user: string; status: "COMPLETED" | "IN_PROGRESS" };
        count: number;
      }>([
        { $match: { user: { $in: parentIds }, status: { $in: ["COMPLETED", "IN_PROGRESS"] } } },
        { $group: { _id: { user: "$user", status: "$status" }, count: { $sum: 1 } } },
      ]);
    }

    const completedByParent = new Map<string, number>();
    const pendingByParent = new Map<string, number>();

    attemptCounts.forEach((row) => {
      const userId = String(row._id.user);
      if (row._id.status === "COMPLETED") {
        completedByParent.set(userId, row.count);
        return;
      }
      pendingByParent.set(userId, row.count);
    });

    const parentsWithStats = parents
      .map((parent) => {
        const testsCompleted = completedByParent.get(String(parent._id)) || 0;
        const testsPending = pendingByParent.get(String(parent._id)) || 0;

        return {
          ...parent.toObject(),
          testsTaken: testsCompleted,
          testsCompleted,
          testsPending,
        };
      });

    const summary = parentsWithStats.reduce((acc, parent) => {
      acc.parentCount += 1;
      acc.testsCompleted += Number(parent.testsCompleted || 0);
      acc.testsPending += Number(parent.testsPending || 0);
      return acc;
    }, { parentCount: 0, testsCompleted: 0, testsPending: 0 });

    res.json({
      parents: parentsWithStats,
      summary,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve parents" });
  }
};

export const getParentDetailsForAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const parentIdParam = req.params.parentId;
  const parentId = typeof parentIdParam === "string" ? parentIdParam.trim() : "";

  if (!parentId) {
    res.status(400).json({ message: "Parent ID is required" });
    return;
  }

  const parent = await User.findById(parentId).populate("organization", "name slug");
  if (!parent || parent.role !== "PARENT") {
    res.status(404).json({ message: "Parent not found" });
    return;
  }

  const parentOrgId = parent.organization && typeof parent.organization === "object"
    ? String((parent.organization as { _id?: { toString(): string } })._id || "")
    : String(parent.organization || "");

  const requesterOrgId = req.user.organization && typeof req.user.organization === "object"
    ? String((req.user.organization as { _id?: { toString(): string } })._id || "")
    : String(req.user.organization || "");

  if (req.user.role !== "SUPERADMIN" && parentOrgId !== requesterOrgId) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  const attempts = await StudentAssessmentAttempt.find({
    user: parentId,
  })
    .populate("organization", "name slug contactEmail website branding")
    .sort({ createdAt: -1 });

  const attemptsWithReports = await Promise.all(
    attempts.map((attempt) => buildAttemptReportPayload(attempt, String(parent._id)))
  );

  res.json({
    parent: parent.toObject(),
    attempts: attemptsWithReports,
    summary: {
      totalTests: attempts.length,
      completedTests: attempts.filter((a) => a.status === "COMPLETED").length,
      inProgressTests: attempts.filter((a) => a.status === "IN_PROGRESS").length,
    },
  });
};
