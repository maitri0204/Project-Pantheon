import { Response } from "express";

import Assessment from "../models/Assessment";
import Coupon from "../models/Coupon";
import Invoice from "../models/Invoice";
import Organization from "../models/Organization";
import Question from "../models/Question";
import StudentAssessmentAttempt from "../models/StudentAssessmentAttempt";
import User from "../models/User";
import { DEFAULT_SUPERADMIN_EMAIL } from "../constants/platform";
import { evaluateAssessmentAttempt } from "../services/assessmentEvaluation";
import { getCareerDnaSourceQuestion, parseCareerDnaCategory } from "../services/sourceAssessmentData";
import { AuthRequest } from "../types/auth";

const normalizeAssessmentCode = (code: string): string => {
  const normalized = code.toUpperCase().trim();
  if (normalized === "METACOGNITION") return "METACOGNITION_TEST";
  if (normalized === "JOHARI" || normalized === "CLEAR") return "JOHARI_WINDOW";
  return normalized;
};

const getAssessmentCodeAliases = (code: string): string[] => {
  const normalized = normalizeAssessmentCode(code);
  if (normalized === "METACOGNITION_TEST") return ["METACOGNITION_TEST", "METACOGNITION"];
  if (normalized === "JOHARI_WINDOW") return ["JOHARI_WINDOW", "JOHARI", "CLEAR"];
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
  if (normalized === "JOHARI_WINDOW") return "CLEAR – Cognitive Lens for Emotional Awareness & Reflection";
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
    .map(({ __isExactCode: _ignored, ...item }) => item as T)
    .sort((a, b) => a.name.localeCompare(b.name));
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
    assessments.map((assessment) => assessment.toObject() as Record<string, unknown> as { code: string; name: string })
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

  const userOrgId = req.user?.organization && typeof req.user.organization === "object"
    ? String((req.user.organization as { _id: { toString(): string } })._id)
    : null;

  const canAccessAssessments =
    Boolean(req.user) &&
    (req.user?.role === "ORG_ADMIN" || req.user?.role === "STUDENT") &&
    userOrgId === String(organization._id);

  const assessments = canAccessAssessments
    ? await Assessment.find({ active: true }).sort({ name: 1 })
    : [];

  const normalizedAssessments = dedupeAssessments(
    assessments.map((assessment) => assessment.toObject() as Record<string, unknown> as { code: string; name: string })
  );

  res.json({
    organization: {
      id: organization._id,
      name: organization.name,
      slug: organization.slug,
      website: organization.website,
      branding: organization.branding,
    },
    canAccessAssessments,
    assessments: normalizedAssessments,
    message: canAccessAssessments
      ? undefined
      : "Login required. Only users from this organization can view assessments.",
  });
};

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const [assessments, organizations, coupons, invoices, students] = await Promise.all([
    Assessment.find({ active: true }).sort({ name: 1 }),
    req.user.role === "SUPERADMIN"
      ? Organization.find().sort({ createdAt: -1 })
      : Organization.find({ _id: req.user.organization }).sort({ createdAt: -1 }),
    req.user.role === "SUPERADMIN"
      ? Coupon.find().sort({ createdAt: -1 }).limit(10)
      : Coupon.find({}).sort({ createdAt: -1 }).limit(10),
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
  const invoiceCounts = await Invoice.aggregate<{ _id: string; count: number }>([
    { $match: { user: { $in: studentIds } } },
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);

  const invoiceCountMap = new Map(invoiceCounts.map((row) => [String(row._id), row.count]));

  const studentsWithStats = students
    .map((student) => ({
      ...student.toObject(),
      testsTaken: invoiceCountMap.get(String(student._id)) || 0,
    }));

  const studentsPayload = studentsWithStats;

  res.json({
    students: studentsPayload,
  });
};

const hydrateAttemptQuestionsWithOptions = async <T extends {
  questionId: unknown;
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

const orderQuestionsByDatabaseInsertion = async <T extends { questionId: unknown }>(questions: T[]) => {
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

  if (req.user.role !== "STUDENT") {
    res.status(403).json({ message: "Access denied" });
    return false;
  }

  if (!req.user.organization) {
    res.status(400).json({ message: "Student organization is missing" });
    return false;
  }

  return true;
};

export const getStudentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const organizationId = req.user!.organization;
  const userId = req.user!._id;

  const [assessments, attempts] = await Promise.all([
    Assessment.find({ active: true }).sort({ name: 1 }),
    StudentAssessmentAttempt.find({ user: userId, organization: organizationId }),
  ]);

  const dedupedAssessments = dedupeAssessments(
    assessments.map((assessment) => assessment.toObject() as Record<string, unknown> as { code: string; name: string })
  );

  const completedCodes = new Set(
    attempts
      .filter((attempt) => attempt.status === "COMPLETED")
      .map((attempt) => normalizeAssessmentCode(attempt.assessmentCode))
  );
  const appearedCodes = new Set(attempts.map((attempt) => normalizeAssessmentCode(attempt.assessmentCode)));

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
};

export const listStudentResults = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const attempts = await StudentAssessmentAttempt.find({
    user: req.user!._id,
    organization: req.user!.organization,
    status: "COMPLETED",
  }).sort({ completedAt: -1, updatedAt: -1 });

  res.json({
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

export const listStudentAssessments = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const organizationId = req.user!.organization;
  const userId = req.user!._id;

  const [assessments, attempts] = await Promise.all([
    Assessment.find({ active: true }).sort({ name: 1 }),
    StudentAssessmentAttempt.find({ user: userId, organization: organizationId }),
  ]);

  const dedupedAssessments = dedupeAssessments(
    assessments.map((assessment) => assessment.toObject() as Record<string, unknown> as { code: string; name: string })
  );

  const attemptsByCode = new Map<string, (typeof attempts)[number]>();
  for (const attempt of attempts) {
    const normalizedCode = normalizeAssessmentCode(attempt.assessmentCode);
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
};

export const startStudentAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

  const codeParam = req.params.code;
  const code = typeof codeParam === "string" ? codeParam.toUpperCase().trim() : "";
  const canonicalCode = normalizeAssessmentCode(code);
  const codeAliases = getAssessmentCodeAliases(code);
  if (!code) {
    res.status(400).json({ message: "Assessment code is required" });
    return;
  }

  const organizationId = req.user!.organization;
  const userId = req.user!._id;

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
    const orderedQuestions = await orderQuestionsByDatabaseInsertion(hydratedQuestions);

    const questionsReordered = orderedQuestions.some((question, index) => (
      String(question.questionId) !== String(existingAttempt.questions[index]?.questionId)
    ));

    const shouldNormalizeAttemptMetadata =
      existingAttempt.assessmentCode !== canonicalCode
      || existingAttempt.assessmentName !== getAssessmentDisplayName(canonicalCode, existingAttempt.assessmentName);

    if (
      hydratedQuestions.some((question, index) => question.options !== existingAttempt.questions[index].options)
      || questionsReordered
      || shouldNormalizeAttemptMetadata
    ) {
      existingAttempt.questions = orderedQuestions as typeof existingAttempt.questions;
      existingAttempt.assessmentCode = canonicalCode;
      existingAttempt.assessmentName = getAssessmentDisplayName(canonicalCode, assessment?.name || existingAttempt.assessmentName);
      await existingAttempt.save();
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

  const createdAttempt = await StudentAssessmentAttempt.create({
    user: userId,
    organization: organizationId,
    assessmentCode: canonicalCode,
    assessmentName: getAssessmentDisplayName(canonicalCode, assessment.name),
    status: "IN_PROGRESS",
    questions: questions.map((question) => {
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
    }),
    answeredCount: 0,
    totalQuestions: questions.length,
    startedAt: new Date(),
  });

  res.status(201).json({
    attempt: {
      id: createdAttempt._id,
      assessmentCode: createdAttempt.assessmentCode,
      assessmentName: createdAttempt.assessmentName,
      status: createdAttempt.status,
      questions: createdAttempt.questions,
      answeredCount: createdAttempt.answeredCount,
      totalQuestions: createdAttempt.totalQuestions,
    },
  });
};

export const getStudentAttempt = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

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

  const hydratedQuestions = await hydrateAttemptQuestionsWithOptions(attempt.questions);
  const canonicalCode = normalizeAssessmentCode(attempt.assessmentCode);
  const orderedQuestions = await orderQuestionsByDatabaseInsertion(hydratedQuestions);

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

  if (attempt.status === "COMPLETED") {
    res.json({ message: "Assessment already submitted", attemptId: attempt._id });
    return;
  }

  const unanswered = attempt.questions.filter((question) => !question.answer || question.answer === "");
  if (unanswered.length > 0) {
    res.status(400).json({ message: `Please answer all questions before submitting. ${unanswered.length} remaining.` });
    return;
  }

  attempt.status = "COMPLETED";
  attempt.completedAt = new Date();
  attempt.answeredCount = attempt.totalQuestions;
  attempt.evaluation = await evaluateAssessmentAttempt(attempt);
  await attempt.save();

  res.json({
    message: "Assessment submitted successfully",
    attemptId: attempt._id,
    evaluation: attempt.evaluation,
  });
};

export const getStudentAttemptReport = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!requireStudentUser(req, res)) {
    return;
  }

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

  const canonicalCode = normalizeAssessmentCode(attempt.assessmentCode);

  if (attempt.status !== "COMPLETED") {
    res.status(400).json({ message: "Report is available only after test submission" });
    return;
  }

  if (!attempt.evaluation) {
    attempt.evaluation = await evaluateAssessmentAttempt(attempt);
    await attempt.save();
  }

  const student = await User.findById(req.user!._id).select({ firstName: 1, lastName: 1, grade: 1, institutionName: 1 });

  res.json({
    report: {
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
    },
  });
};
