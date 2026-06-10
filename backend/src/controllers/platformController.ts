import { Response } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import Razorpay from "razorpay";

import Assessment, { IAssessment } from "../models/Assessment";
import Coupon from "../models/Coupon";
import Invoice from "../models/Invoice";
import InvoiceCounter from "../models/InvoiceCounter";
import AssessmentPaymentSession from "../models/AssessmentPaymentSession";
import ReviewerPayment from "../models/ReviewerPayment";
import Organization from "../models/Organization";
import PlatformAnalytics from "../models/PlatformAnalytics";
import OrganizationRegistration from "../models/OrganizationRegistration";
import OrganizationCouponConfig from "../models/OrganizationCouponConfig";
import OrganizationCouponUsage from "../models/OrganizationCouponUsage";
import GlobalCouponUsage from "../models/GlobalCouponUsage";
import Question from "../models/Question";
import StudentAssessmentAttempt, { IAttemptQuestion } from "../models/StudentAssessmentAttempt";
import User from "../models/User";
import { buildAssessmentAdminDashboard } from "../services/assessmentAdminDashboard.service";
import { buildAcademicCareerAdminOverview } from "../services/academicCareerAdminOverview.service";
import { buildAdversityAdminOverview } from "../services/adversityAdminOverview.service";
import { evaluateAssessmentAttempt } from "../services/assessmentEvaluation";
import { getCareerDnaSourceQuestion, parseCareerDnaCategory } from "../services/sourceAssessmentData";
import {
  buildStudyAbroadQuestionSetForAttempt,
  mapStudyAbroadAttemptQuestions,
} from "../services/studyAbroadQuestionSelection.service";
import {
  buildAssessmentReleaseMeta,
  formatAssessmentReleaseLabel,
  isAssessmentReleased,
} from "../services/assessmentRelease";
import { refreshOrganizationCorsOrigins } from "../services/corsOrigins";
import { isAllowedOrganizationWebsite } from "../services/websiteValidation";
import { sendAssessmentReportToStudent } from "../services/email";
import { buildCareerDnaReportData } from "../services/careerDnaReport/buildCareerDnaReportData";
import { buildCareerDnaExecutiveHtml } from "../services/careerDnaReport/buildCareerDnaExecutiveHtml";
import { generateCareerDnaExecutivePdf } from "../services/careerDnaReport/generateCareerDnaExecutivePdf";
import { buildMetacognitionReportHtml } from "../services/metacognitionReport/buildMetacognitionReportHtml";
import { buildClearReportHtml } from "../services/clearReport/buildClearReportHtml";
import { buildLitmusReportData } from "../services/litmusReport/buildLitmusReportData";
import { generateLitmusReportPdf } from "../services/litmusReport/generateLitmusReport";
import { buildCareerCompassReportData } from "../services/careerCompassReport/buildCareerCompassReportData";
import { generateCareerCompassReportPdf } from "../services/careerCompassReport/generateCareerCompassReport";
import { renderHtmlReportPdf } from "../services/reportPdf/renderHtmlReportPdf";
import { AuthRequest } from "../types/auth";

const RESILIENCE_ASSESSMENT_CODE = "RESILIENCE_TEST";
const LEGACY_RESILIENCE_CODES = new Set(["ADVERSITY_TEST", "RQ_TEST", "RESILIENCE"]);

const normalizeAssessmentCode = (code: string): string => {
  const normalized = code.toUpperCase().trim();
  if (normalized === "METACOGNITION") return "METACOGNITION_TEST";
  if (normalized === "JOHARI" || normalized === "CLEAR") return "JOHARI_WINDOW";
  if (normalized === "LITMUS") return "LITMUS_TEST";
  if (LEGACY_RESILIENCE_CODES.has(normalized)) return RESILIENCE_ASSESSMENT_CODE;
  return normalized;
};

const RETAKABLE_ASSESSMENT_CODES = new Set([
  "CAREER_COMPASS",
  "LITMUS_TEST",
  "CAREER_DNA",
  "METACOGNITION_TEST",
  "JOHARI_WINDOW",
  RESILIENCE_ASSESSMENT_CODE,
  "ACADEMIC_CAREER",
  "STUDY_ABROAD",
]);

const allowsMultipleAttempts = (code: string): boolean => {
  const normalized = normalizeAssessmentCode(code);
  return RETAKABLE_ASSESSMENT_CODES.has(normalized);
};

function pickAttemptHistoryEvaluation(
  evaluation: Record<string, unknown> | null | undefined,
): Record<string, unknown> | undefined {
  if (!evaluation || typeof evaluation !== "object") return undefined;
  const picked: Record<string, unknown> = {};
  if (evaluation.totalScore != null) picked.totalScore = evaluation.totalScore;
  if (evaluation.overallScore != null) picked.overallScore = evaluation.overallScore;
  if (evaluation.overallPercentage != null) picked.overallPercentage = evaluation.overallPercentage;
  if (evaluation.aqLevel != null) picked.aqLevel = evaluation.aqLevel;
  if (evaluation.band != null) picked.band = evaluation.band;
  if (evaluation.personalityType != null) picked.personalityType = evaluation.personalityType;
  if (evaluation.solicitsFeedbackScore != null) picked.solicitsFeedbackScore = evaluation.solicitsFeedbackScore;
  if (evaluation.selfDisclosureScore != null) picked.selfDisclosureScore = evaluation.selfDisclosureScore;
  if (evaluation.dominantQuadrant != null) picked.dominantQuadrant = evaluation.dominantQuadrant;
  if (evaluation.dominantStyle != null) picked.dominantStyle = evaluation.dominantStyle;
  if (evaluation.dominantCode != null) picked.dominantCode = evaluation.dominantCode;
  if (Array.isArray(evaluation.topInterests) && evaluation.topInterests.length) {
    picked.topInterests = evaluation.topInterests;
  }
  const streamAnalysis = evaluation.streamAnalysis as { recommendedStream?: unknown } | undefined;
  if (streamAnalysis?.recommendedStream != null) {
    picked.recommendedStream = streamAnalysis.recommendedStream;
  }
  if (evaluation.topicScores != null) picked.topicScores = evaluation.topicScores;
  if (evaluation.topicAnswered != null) picked.topicAnswered = evaluation.topicAnswered;
  if (evaluation.answeredCount != null) picked.answeredCount = evaluation.answeredCount;
  if (evaluation.totalQuestions != null) picked.totalQuestions = evaluation.totalQuestions;

  const sections = evaluation.sections as Record<string, { personalityType?: unknown; dominantCode?: unknown }> | undefined;
  if (sections && typeof sections === "object") {
    const personalitySection = sections.PERSONALITY;
    if (personalitySection?.personalityType != null && picked.personalityType == null) {
      picked.personalityType = personalitySection.personalityType;
    }
    if (personalitySection?.dominantCode != null && picked.dominantCode == null) {
      picked.dominantCode = personalitySection.dominantCode;
    }
  }

  return Object.keys(picked).length ? picked : undefined;
}

const getAssessmentCodeAliases = (code: string): string[] => {
  const normalized = normalizeAssessmentCode(code);
  if (normalized === "METACOGNITION_TEST") return ["METACOGNITION_TEST", "METACOGNITION"];
  if (normalized === "JOHARI_WINDOW") return ["JOHARI_WINDOW", "JOHARI", "CLEAR"];
  if (normalized === "LITMUS_TEST") return ["LITMUS_TEST", "LITMUS"];
  if (normalized === RESILIENCE_ASSESSMENT_CODE) return [RESILIENCE_ASSESSMENT_CODE, "ADVERSITY_TEST"];
  return [normalized];
};

const aggregateQuestionCounts = async (
  assessments: Array<{ code: string }>,
): Promise<Map<string, number>> => {
  const aliasToCanonical = new Map<string, string>();
  for (const assessment of assessments) {
    const canonical = normalizeAssessmentCode(assessment.code);
    for (const alias of getAssessmentCodeAliases(assessment.code)) {
      aliasToCanonical.set(alias, canonical);
    }
  }

  const grouped = await Question.aggregate<{ _id: string; count: number }>([
    {
      $match: {
        assessmentCode: { $in: [...aliasToCanonical.keys()] },
        isActive: true,
      },
    },
    { $group: { _id: "$assessmentCode", count: { $sum: 1 } } },
  ]);

  const counts = new Map<string, number>();
  for (const row of grouped) {
    const canonical = aliasToCanonical.get(row._id);
    if (!canonical) {
      continue;
    }
    counts.set(canonical, (counts.get(canonical) || 0) + row.count);
  }

  return counts;
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
  if (normalized === RESILIENCE_ASSESSMENT_CODE) return "Resilience Quotient (RQ) Assessment";
  if (/adversity quotient|\(aq\)/i.test(fallbackName)) return "Resilience Quotient (RQ) Assessment";
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

const isCareerCompassAssessmentCode = (assessmentCode: string): boolean => (
  normalizeAssessmentCode(assessmentCode) === "CAREER_COMPASS"
);

const isAdversityAssessmentCode = (assessmentCode: string): boolean => (
  normalizeAssessmentCode(assessmentCode) === RESILIENCE_ASSESSMENT_CODE
);

const isAcademicCareerAssessmentCode = (assessmentCode: string): boolean => (
  normalizeAssessmentCode(assessmentCode) === "ACADEMIC_CAREER"
);

const isStudyAbroadAssessmentCode = (assessmentCode: string): boolean => (
  normalizeAssessmentCode(assessmentCode) === "STUDY_ABROAD"
);

const getStudyAbroadUsedQuestionNumbers = async (
  userId: string,
  organizationId: string
): Promise<number[]> => {
  const attempts = await StudentAssessmentAttempt.find({
    user: userId,
    organization: organizationId,
    assessmentCode: "STUDY_ABROAD",
    status: "COMPLETED",
  }).select({ questions: 1 });

  const used = new Set<number>();
  for (const attempt of attempts) {
    for (const question of attempt.questions) {
      if (Number.isFinite(question.questionNumber)) {
        used.add(question.questionNumber);
      }
    }
  }

  return [...used];
};

const getAcademicCareerGradeCategory = (grade?: string): string => {
  const normalizedGrade = String(grade || "").toLowerCase().trim();
  const match = normalizedGrade.match(/\d+/);
  const numericGrade = match ? Number(match[0]) : Number.NaN;

  if (Number.isFinite(numericGrade)) {
    if (numericGrade <= 8) return "Grade-8";
    if (numericGrade === 9) return "Grade-9";
    return "Grade-10";
  }

  // Default when grade is missing or not parseable (e.g. custom "Other" text).
  return "Grade-8";
};

const isAcademicCareerGradeEligible = (grade?: string): boolean => {
  const normalizedGrade = String(grade || "").toLowerCase().trim();
  const match = normalizedGrade.match(/\d+/);
  const numericGrade = match ? Number(match[0]) : Number.NaN;
  return Number.isFinite(numericGrade) && numericGrade >= 8 && numericGrade <= 10;
};

const isAssessmentAccessibleForLearner = (
  learnerRole: LearnerRole,
  assessmentCode: string,
  learnerGrade?: string
): boolean => {
  const canonicalCode = normalizeAssessmentCode(assessmentCode);
  const isLitmus = isLitmusAssessmentCode(assessmentCode);
  if (learnerRole === "PARENT") {
    return isLitmus;
  }

  if (canonicalCode === "ACADEMIC_CAREER" && !isAcademicCareerGradeEligible(learnerGrade)) {
    return false;
  }

  return !isLitmus;
};

const requireLearnerAssessmentAccess = (
  res: Response,
  learnerRole: LearnerRole,
  assessmentCode: string,
  learnerGrade?: string
): boolean => {
  if (!isAssessmentAccessibleForLearner(learnerRole, assessmentCode, learnerGrade)) {
    if (learnerRole === "PARENT") {
      res.status(403).json({ message: "Parents can access only Litmus assessment." });
      return false;
    }

    if (normalizeAssessmentCode(assessmentCode) === "ACADEMIC_CAREER") {
      res.status(403).json({
        message: "Academic Career is available only for students in Grades 8, 9, and 10.",
      });
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

type AssessmentAdminListItem = AssessmentCatalogItem & {
  basePrice?: number;
  gstEnabled?: boolean;
  gstPercentage?: number;
  currency?: string;
  questionBankStatus?: IAssessment["questionBankStatus"];
  releaseDate?: Date | null;
};

export const getPlatformOverview = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [assessmentCount, organizationCount] = await Promise.all([
    Assessment.countDocuments({ active: true }),
    Organization.countDocuments({ isActive: true }),
  ]);

  res.json({
    platform: {
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
    assessments.map((assessment) => assessment.toObject() as unknown as AssessmentAdminListItem)
  );

  const questionCounts = await aggregateQuestionCounts(dedupedAssessments);
  const assessmentsWithCounts = dedupedAssessments.map((assessment) => {
    const release = buildAssessmentReleaseMeta(assessment.releaseDate);
    return {
      _id: assessment._id,
      code: assessment.code,
      name: assessment.name,
      category: assessment.category,
      basePrice: assessment.basePrice,
      gstEnabled: assessment.gstEnabled,
      gstPercentage: assessment.gstPercentage,
      currency: assessment.currency,
      questionBankStatus: assessment.questionBankStatus,
      active: assessment.active,
      questionCount: questionCounts.get(normalizeAssessmentCode(assessment.code)) || 0,
      ...release,
    };
  });

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
    ? normalizedAssessments.filter((assessment) => isAssessmentAccessibleForLearner(learnerRole, assessment.code, req.user?.grade))
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

  const escapedHost = normalizedHost.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const organization = await Organization.findOne({
    isActive: true,
    type: "WHITELABEL",
    website: {
      $regex: new RegExp(`^(https?://)?(www\\.)?${escapedHost}(/|$)`, "i"),
    },
  });

  if (!organization) {
    res.status(404).json({ message: "Whitelabel organization not found for this host" });
    return;
  }

  res.json(await buildWhitelabelPortalPayload(req, organization));
};

type SiteVisitStats = {
  homePageVisits: number;
  loginPageVisits: number;
  siteVisits: number;
};

const getSiteVisitStats = async (): Promise<SiteVisitStats> => {
  const analytics = await PlatformAnalytics.findOne({ key: "default" })
    .select({ homePageVisits: 1, loginPageVisits: 1 })
    .lean();

  const homePageVisits = analytics?.homePageVisits ?? 0;
  const loginPageVisits = analytics?.loginPageVisits ?? 0;

  return {
    homePageVisits,
    loginPageVisits,
    siteVisits: homePageVisits + loginPageVisits,
  };
};

export const recordSiteVisit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = typeof req.body?.page === "string" ? req.body.page.trim().toLowerCase() : "";
    const incrementField = page === "home"
      ? "homePageVisits"
      : page === "login"
        ? "loginPageVisits"
        : null;

    if (!incrementField) {
      res.status(400).json({ message: 'page must be "home" or "login"' });
      return;
    }

    const analytics = await PlatformAnalytics.findOneAndUpdate(
      { key: "default" },
      { $inc: { [incrementField]: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const homePageVisits = analytics.homePageVisits;
    const loginPageVisits = analytics.loginPageVisits;

    res.json({
      homePageVisits,
      loginPageVisits,
      siteVisits: homePageVisits + loginPageVisits,
    });
  } catch (error) {
    console.error("recordSiteVisit error:", error);
    res.status(500).json({ message: "Failed to record site visit" });
  }
};

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const isSuperadmin = req.user.role === "SUPERADMIN";

  const [assessments, organizations, coupons, invoices, students, siteVisitStats] = await Promise.all([
    Assessment.find({ active: true }).sort({ name: 1 }),
    isSuperadmin
        ? Organization.find().limit(100).sort({ createdAt: -1 })
      : Organization.find({ _id: req.user.organization }).sort({ createdAt: -1 }),
    isSuperadmin
        ? Coupon.find().limit(50).sort({ createdAt: -1 })
        : Coupon.find().sort({ createdAt: -1 }).limit(10),
    isSuperadmin
      ? Invoice.find().sort({ createdAt: -1 }).limit(10)
      : Invoice.find({ organization: req.user.organization }).sort({ createdAt: -1 }).limit(10),
    isSuperadmin
      ? User.countDocuments({ role: "STUDENT" })
      : User.countDocuments({ role: "STUDENT", organization: req.user.organization }),
    isSuperadmin
      ? getSiteVisitStats()
      : Promise.resolve({ homePageVisits: 0, loginPageVisits: 0, siteVisits: 0 }),
  ]);

  res.json({
    role: req.user.role,
    stats: {
      assessments: assessments.length,
      organizations: organizations.length,
      students,
      coupons: coupons.length,
      invoices: invoices.length,
      ...siteVisitStats,
    },
    assessments,
    organizations,
    coupons,
    invoices,
  });
};

const resolveAdminDashboardScope = async (
  req: AuthRequest,
  res: Response,
): Promise<{ organization?: mongoose.Types.ObjectId | string } | null> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return null;
  }

  if (req.user.role !== "SUPERADMIN") {
    return { organization: req.user.organization };
  }

  const organizationSlug = typeof req.query.organizationSlug === "string"
    ? req.query.organizationSlug.trim().toLowerCase()
    : "";
  if (!organizationSlug) {
    return {};
  }

  const scopedOrganization = await Organization.findOne({
    slug: organizationSlug,
    isActive: true,
    type: "WHITELABEL",
  }).select({ _id: 1 });

  if (!scopedOrganization) {
    res.status(404).json({ message: "Organization not found for dashboard scope" });
    return null;
  }

  return { organization: scopedOrganization._id };
};

export const getAssessmentAdminDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  const codeParam = req.params.code;
  const code = typeof codeParam === "string" ? normalizeAssessmentCode(codeParam) : "";
  if (!code) {
    res.status(400).json({ message: "Assessment code is required" });
    return;
  }

  const assessment = await Assessment.findOne({
    code: { $in: getAssessmentCodeAliases(code) },
    active: true,
  });

  if (!assessment) {
    res.status(404).json({ message: "Assessment not found" });
    return;
  }

  const canonicalCode = normalizeAssessmentCode(assessment.code);
  const scope = await resolveAdminDashboardScope(req, res);
  if (!scope) {
    return;
  }

  try {
    const attempts = await StudentAssessmentAttempt.find({
      ...scope,
      assessmentCode: { $in: getAssessmentCodeAliases(canonicalCode) },
      status: "COMPLETED",
    })
      .populate("user", "firstName lastName email grade division")
      .sort({ completedAt: -1, updatedAt: -1 })
      .limit(500);

    const attemptInputs = attempts.map((attempt) => {
      const userDoc = attempt.user as {
        _id?: { toString(): string };
        firstName?: string;
        lastName?: string;
        email?: string;
        grade?: string;
        division?: string;
      } | null;

      const studentId = userDoc?._id ? String(userDoc._id) : String(attempt.user || "");
      const studentName = userDoc
        ? `${userDoc.firstName || ""} ${userDoc.lastName || ""}`.trim() || userDoc.email || "Student"
        : "Student";

      return {
        attemptId: String(attempt._id),
        studentId,
        studentName,
        studentEmail: userDoc?.email || "",
        grade: userDoc?.grade || "",
        division: userDoc?.division || "",
        completedAt: attempt.completedAt || attempt.updatedAt,
        evaluation: attempt.evaluation as Record<string, unknown> | undefined,
      };
    });

    const dashboard = buildAssessmentAdminDashboard(canonicalCode, attemptInputs);

    res.json({
      assessment: {
        code: canonicalCode,
        name: assessment.name,
        category: assessment.category,
      },
      ...dashboard,
    });
  } catch (error) {
    console.error("getAssessmentAdminDashboard error:", error);
    res.status(500).json({ message: "Failed to load assessment dashboard" });
  }
};

export const getAcademicCareerAdminOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  const scope = await resolveAdminDashboardScope(req, res);
  if (!scope) {
    return;
  }

  try {
    const overview = await buildAcademicCareerAdminOverview(scope);
    res.json(overview);
  } catch (error) {
    console.error("getAcademicCareerAdminOverview error:", error);
    res.status(500).json({ message: "Failed to load academic career overview" });
  }
};

export const getAdversityAdminOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  const scope = await resolveAdminDashboardScope(req, res);
  if (!scope) {
    return;
  }

  try {
    const overview = await buildAdversityAdminOverview(scope);
    res.json(overview);
  } catch (error) {
    console.error("getAdversityAdminOverview error:", error);
    res.status(500).json({ message: "Failed to load RQ overview" });
  }
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
  const learner = await getScopedLearnerRecord(req, studentId);
  if (!learner || learner.role !== "STUDENT") {
    return null;
  }
  return learner;
};

const getScopedLearnerRecord = async (req: AuthRequest, learnerId: string) => {
  if (!req.user) {
    return null;
  }

  const learner = await User.findById(learnerId).populate("organization", "name slug");
  if (!learner || (learner.role !== "STUDENT" && learner.role !== "PARENT")) {
    return null;
  }

  const learnerOrgId = learner.organization && typeof learner.organization === "object"
    ? String((learner.organization as { _id?: { toString(): string } })._id || "")
    : String(learner.organization || "");

  const requesterOrgId = req.user.organization && typeof req.user.organization === "object"
    ? String((req.user.organization as { _id?: { toString(): string } })._id || "")
    : String(req.user.organization || "");

  if (req.user.role !== "SUPERADMIN" && learnerOrgId !== requesterOrgId) {
    return null;
  }

  return learner;
};

const parseAdminLearnerId = (req: AuthRequest): string => {
  const studentIdParam = req.params.studentId;
  const parentIdParam = req.params.parentId;
  const learnerId = typeof studentIdParam === "string"
    ? studentIdParam.trim()
    : typeof parentIdParam === "string"
      ? parentIdParam.trim()
      : "";
  return learnerId;
};

const findAdminCompletedAttempt = async (req: AuthRequest, res: Response) => {
  const learnerId = parseAdminLearnerId(req);
  const attemptIdParam = req.params.attemptId;
  const attemptId = typeof attemptIdParam === "string" ? attemptIdParam.trim() : "";
  if (!learnerId || !attemptId) {
    res.status(400).json({ message: "User ID and attempt ID are required" });
    return null;
  }

  const learner = await getScopedLearnerRecord(req, learnerId);
  if (!learner) {
    res.status(404).json({ message: "User not found" });
    return null;
  }

  const attempt = await StudentAssessmentAttempt.findOne({
    _id: attemptId,
    user: learner._id,
    organization: learner.organization,
    status: "COMPLETED",
  });

  if (!attempt) {
    res.status(404).json({ message: "Completed attempt not found" });
    return null;
  }

  return { learner, attempt };
};

const buildAttemptReportPayload = async (
  attempt: InstanceType<typeof StudentAssessmentAttempt>,
  studentId: string
) => {
  const canonicalCode = normalizeAssessmentCode(attempt.assessmentCode);

  const evaluation = attempt.evaluation ?? await evaluateAssessmentAttempt(attempt);

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
    evaluation: evaluation as Record<string, unknown> | undefined,
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
  }).sort({ completedAt: 1, updatedAt: 1 });

  const attemptNumberById = new Map<string, number>();
  const counters = new Map<string, number>();
  attempts.forEach((attempt) => {
    const canonicalCode = normalizeAssessmentCode(attempt.assessmentCode);
    const next = (counters.get(canonicalCode) ?? 0) + 1;
    counters.set(canonicalCode, next);
    attemptNumberById.set(String(attempt._id), next);
  });

  const uniqueAssessmentCodes = new Set(
    attempts.map((attempt) => normalizeAssessmentCode(attempt.assessmentCode)),
  );

  const resultsDesc = [...attempts].sort((a, b) => {
    const aTime = new Date(a.completedAt ?? a.updatedAt ?? 0).getTime();
    const bTime = new Date(b.completedAt ?? b.updatedAt ?? 0).getTime();
    return bTime - aTime;
  });

  res.json({
    student: {
      ...student.toObject(),
      testsTaken: uniqueAssessmentCodes.size,
      totalAttempts: attempts.length,
    },
    results: resultsDesc.map((attempt) => {
      const canonicalCode = normalizeAssessmentCode(attempt.assessmentCode);
      const evaluation = attempt.evaluation as Record<string, unknown> | undefined;
      return {
        id: attempt._id,
        assessmentCode: canonicalCode,
        assessmentName: getAssessmentDisplayName(canonicalCode, attempt.assessmentName),
        answeredCount: attempt.answeredCount,
        totalQuestions: attempt.totalQuestions,
        completedAt: attempt.completedAt,
        createdAt: attempt.createdAt,
        attemptNumber: attemptNumberById.get(String(attempt._id)),
        allowsMultipleAttempts: allowsMultipleAttempts(canonicalCode),
        evaluation: pickAttemptHistoryEvaluation(evaluation),
      };
    }),
  });
};

export const listStudentAssessmentAttemptsForAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const studentIdParam = req.params.studentId;
  const studentId = typeof studentIdParam === "string" ? studentIdParam.trim() : "";
  const codeParam = req.params.code;
  const code = typeof codeParam === "string" ? codeParam.toUpperCase().trim() : "";

  if (!studentId || !code) {
    res.status(400).json({ message: "Student ID and assessment code are required" });
    return;
  }

  const student = await getScopedStudentRecord(req, studentId);
  if (!student) {
    res.status(404).json({ message: "Student not found" });
    return;
  }

  const canonicalCode = normalizeAssessmentCode(code);
  if (!allowsMultipleAttempts(canonicalCode)) {
    res.status(400).json({ message: "This assessment does not support multiple attempts" });
    return;
  }

  try {
    const codeAliases = getAssessmentCodeAliases(canonicalCode);
    const attempts = await StudentAssessmentAttempt.find({
      user: student._id,
      organization: student.organization,
      assessmentCode: { $in: codeAliases },
      status: "COMPLETED",
    }).sort({ completedAt: 1, updatedAt: 1 });

    res.json({
      attempts: attempts.map((attempt, index) => ({
        attemptId: attempt._id,
        assessmentCode: normalizeAssessmentCode(attempt.assessmentCode),
        assessmentName: getAssessmentDisplayName(
          normalizeAssessmentCode(attempt.assessmentCode),
          attempt.assessmentName,
        ),
        completedAt: attempt.completedAt,
        evaluation: pickAttemptHistoryEvaluation(
          attempt.evaluation as Record<string, unknown> | undefined,
        ),
        attemptNumber: index + 1,
      })),
    });
  } catch (error) {
    console.error("listStudentAssessmentAttemptsForAdmin error:", error);
    res.status(500).json({ message: "Failed to load assessment attempts" });
  }
};

export const getStudentAttemptReportForAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const learnerId = parseAdminLearnerId(req);
  const attemptIdParam = req.params.attemptId;
  const attemptId = typeof attemptIdParam === "string" ? attemptIdParam.trim() : "";

  if (!learnerId || !attemptId) {
    res.status(400).json({ message: "User ID and attempt ID are required" });
    return;
  }

  const learner = await getScopedLearnerRecord(req, learnerId);
  if (!learner) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const attempt = await StudentAssessmentAttempt.findOne({
    _id: attemptId,
    user: learner._id,
    organization: learner.organization,
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
    report: await buildAttemptReportPayload(attempt, String(learner._id)),
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

const verifyRazorpaySignature = (expected: string, actual: string): boolean => {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
};

const reserveCouponsForPaymentOrder = async (args: {
  pricing: AssessmentPricing;
  organizationId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  paymentSessionId: mongoose.Types.ObjectId | string;
}): Promise<void> => {
  const { pricing, organizationId, userId, paymentSessionId } = args;
  const organizationScope = getReferenceId(organizationId);
  const userScope = getReferenceId(userId);
  const couponCode = String(pricing.couponCode || "").trim().toUpperCase();

  if (!couponCode || !organizationScope || !userScope) {
    return;
  }

  const canonicalCode = pricing.assessment.code;
  const config = await OrganizationCouponConfig.findOne({
    organization: organizationScope,
    assessmentCode: canonicalCode,
    isActive: true,
  });

  const orgCoupon = config ? parseOrgSequentialCoupon(couponCode, config) : null;
  if (orgCoupon && config) {
    const conflict = await OrganizationCouponUsage.findOne({
      organization: organizationScope,
      assessmentCode: canonicalCode,
      couponCode,
    });

    if (conflict && String(conflict.user) !== userScope) {
      throw new Error("This coupon has already been used.");
    }

    if (!conflict) {
      await OrganizationCouponUsage.create({
        config: config._id,
        organization: organizationScope,
        user: userScope,
        assessmentCode: canonicalCode,
        couponCode,
        sequence: orgCoupon.sequence,
        usedAt: new Date(),
      });
    }
    return;
  }

  const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
  if (!coupon) {
    return;
  }

  const existingUsage = await GlobalCouponUsage.findOne({
    couponCode,
    user: userScope,
    assessmentCode: canonicalCode,
  });

  if (existingUsage) {
    throw new Error("You have already used this coupon for this assessment.");
  }

  await GlobalCouponUsage.create({
    coupon: coupon._id,
    couponCode,
    user: userScope,
    organization: organizationScope,
    assessmentCode: canonicalCode,
    paymentSession: paymentSessionId,
  });
};

const REVIEWER_PAYMENT_AMOUNT = Math.max(1, Number(process.env.REVIEWER_PAYMENT_AMOUNT_INR || 1));
const REVIEWER_PAYMENT_CURRENCY = (process.env.REVIEWER_PAYMENT_CURRENCY || "INR").toUpperCase();

export const createReviewerPaymentOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "REVIEWER") {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const razorpay = getRazorpayClient();
    if (!razorpay || !process.env.RAZORPAY_KEY_ID) {
      res.status(500).json({ message: "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend env." });
      return;
    }

    const order = await razorpay.orders.create({
      amount: Math.round(REVIEWER_PAYMENT_AMOUNT * 100),
      currency: REVIEWER_PAYMENT_CURRENCY,
      receipt: `reviewer_${Date.now()}`,
      notes: {
        email: req.user.email,
        purpose: "reviewer_payment",
      },
    });

    await ReviewerPayment.findOneAndUpdate(
      { razorpayOrderId: order.id },
      {
        user: req.user._id,
        razorpayOrderId: order.id,
        amount: REVIEWER_PAYMENT_AMOUNT,
        currency: REVIEWER_PAYMENT_CURRENCY,
        status: "CREATED",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      amount: REVIEWER_PAYMENT_AMOUNT,
      currency: REVIEWER_PAYMENT_CURRENCY,
    });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to create reviewer payment order" });
  }
};

export const verifyReviewerPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== "REVIEWER") {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body as {
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    };

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      res.status(400).json({ message: "Payment verification payload is incomplete" });
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

    if (!verifyRazorpaySignature(expected, razorpay_signature)) {
      await ReviewerPayment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id, user: req.user._id },
        { status: "FAILED" },
      );
      res.status(400).json({ message: "Payment verification failed" });
      return;
    }

    const paymentRecord = await ReviewerPayment.findOneAndUpdate(
      {
        razorpayOrderId: razorpay_order_id,
        user: req.user._id,
        status: { $ne: "PAID" },
      },
      {
        $set: {
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          verifiedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!paymentRecord) {
      const existing = await ReviewerPayment.findOne({
        razorpayOrderId: razorpay_order_id,
        user: req.user._id,
        status: "PAID",
      });
      if (existing) {
        res.json({ message: "Payment already verified", paymentId: String(existing._id) });
        return;
      }
      res.status(404).json({ message: "Reviewer payment order not found" });
      return;
    }

    res.json({ message: "Payment verified", paymentId: String(paymentRecord._id) });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Unable to verify reviewer payment" });
  }
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

  if (!isAssessmentReleased(assessment.releaseDate)) {
    throw new Error(
      assessment.releaseDate
        ? formatAssessmentReleaseLabel(assessment.releaseDate)
        : "This assessment is not available yet",
    );
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

      if (organizationId && userId) {
        const priorUsage = await GlobalCouponUsage.findOne({
          couponCode: couponInput,
          user: userId,
          assessmentCode: canonicalCode,
        });
        if (priorUsage) {
          throw new Error("You have already used this coupon for this assessment.");
        }
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
  const discountedBase = Math.max(basePrice - discountAmount, 0);
  const gstAmount = assessment.gstEnabled ? discountedBase * (gstPercentage / 100) : 0;
  const rawFinalAmount = discountedBase + gstAmount;
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

const parseOrgSequentialCoupon = (
  couponCode: string,
  config: { prefix?: string; totalCoupons?: number },
): { sequence: number } | null => {
  const normalizedPrefix = String(config.prefix || "").trim().toUpperCase();
  const couponInput = String(couponCode || "").trim().toUpperCase();
  if (!normalizedPrefix || !couponInput.startsWith(normalizedPrefix)) {
    return null;
  }

  const suffix = couponInput.slice(normalizedPrefix.length);
  const sequence = Number(suffix);
  if (
    !/^\d+$/.test(suffix)
    || !Number.isInteger(sequence)
    || sequence < 1
    || sequence > Number(config.totalCoupons || 0)
  ) {
    return null;
  }

  return { sequence };
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

const resolveOrganizationCouponAfterPayment = async (args: {
  organizationId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  assessmentCode: string;
  paymentCouponCode?: string;
  paidFinalAmount: number;
}): Promise<{ couponCode?: string; configId?: string }> => {
  const {
    organizationId,
    userId,
    assessmentCode,
    paymentCouponCode,
    paidFinalAmount,
  } = args;
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

  const normalizedPaymentCoupon = String(paymentCouponCode || "").trim().toUpperCase();
  const orgCoupon = normalizedPaymentCoupon
    ? parseOrgSequentialCoupon(normalizedPaymentCoupon, config)
    : null;

  // Paid in full via Razorpay without an org coupon — payment itself grants access.
  if (paidFinalAmount > 0 && !orgCoupon) {
    return {};
  }

  if (orgCoupon) {
    const conflict = await OrganizationCouponUsage.findOne({
      organization: organizationScope,
      assessmentCode,
      couponCode: normalizedPaymentCoupon,
    });

    if (conflict && String(conflict.user) !== userScope) {
      throw new Error("This coupon has already been used.");
    }

    if (conflict) {
      return {
        couponCode: conflict.couponCode,
        configId: String(config._id),
      };
    }

    try {
      await OrganizationCouponUsage.create({
        config: config._id,
        organization: organizationScope,
        user: userScope,
        assessmentCode,
        couponCode: normalizedPaymentCoupon,
        sequence: orgCoupon.sequence,
        usedAt: new Date(),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("resolveOrganizationCouponAfterPayment: failed to create usage", err);
      const fallback = await OrganizationCouponUsage.findOne({
        organization: organizationScope,
        user: userScope,
        assessmentCode,
      });
      if (fallback) {
        return {
          couponCode: fallback.couponCode,
          configId: String(config._id),
        };
      }
      throw new Error("Unable to register coupon for this assessment.");
    }

    if (orgCoupon.sequence >= Number(config.nextSequence || 1)) {
      await OrganizationCouponConfig.updateOne(
        { _id: config._id },
        { $set: { nextSequence: orgCoupon.sequence + 1 } },
      );
    }

    return {
      couponCode: normalizedPaymentCoupon,
      configId: String(config._id),
    };
  }

  return allocateOrganizationCouponForStudent({
    organizationId,
    userId,
    assessmentCode,
  });
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
    ).filter((assessment) => isAssessmentAccessibleForLearner(learnerRole, assessment.code, req.user?.grade));

    const visibleAttempts = attempts.filter((attempt) => isAssessmentAccessibleForLearner(learnerRole, attempt.assessmentCode, req.user?.grade));

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
        .filter((attempt) => isAssessmentAccessibleForLearner(learnerRole, attempt.assessmentCode, req.user?.grade))
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

    const groupedResults = new Map<string, {
      assessmentCode: string;
      assessmentName: string;
      latestAttempt: typeof attempts[number];
      totalAttempts: number;
    }>();

    attempts
      .filter((attempt) => isAssessmentAccessibleForLearner(learnerRole, attempt.assessmentCode, req.user?.grade))
      .forEach((attempt) => {
        const canonicalCode = normalizeAssessmentCode(attempt.assessmentCode);
        const existing = groupedResults.get(canonicalCode);
        if (existing) {
          existing.totalAttempts += 1;
          return;
        }

        groupedResults.set(canonicalCode, {
          assessmentCode: canonicalCode,
          assessmentName: getAssessmentDisplayName(canonicalCode, attempt.assessmentName),
          latestAttempt: attempt,
          totalAttempts: 1,
        });
      });

    res.json({
      results: Array.from(groupedResults.values()).map(({ assessmentCode, assessmentName, latestAttempt, totalAttempts }) => ({
        id: latestAttempt._id,
        assessmentCode,
        assessmentName,
        answeredCount: latestAttempt.answeredCount,
        totalQuestions: latestAttempt.totalQuestions,
        completedAt: latestAttempt.completedAt,
        createdAt: latestAttempt.createdAt,
        totalAttempts,
        latestScore: latestAttempt.evaluation?.totalScore ?? undefined,
        latestLevel: latestAttempt.evaluation?.aqLevel ?? undefined,
      })),
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
    ).filter((assessment) => isAssessmentAccessibleForLearner(learnerRole, assessment.code, req.user?.grade));

    const attemptsByCode = new Map<string, (typeof attempts)[number]>();
    for (const attempt of attempts) {
      const normalizedCode = normalizeAssessmentCode(attempt.assessmentCode);
      if (!isAssessmentAccessibleForLearner(learnerRole, normalizedCode, req.user?.grade)) {
        continue;
      }
      const existing = attemptsByCode.get(normalizedCode);
      if (!existing || new Date(attempt.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
        attemptsByCode.set(normalizedCode, attempt);
      }
    }

    const questionCounts = await aggregateQuestionCounts(dedupedAssessments);
    const assessmentsWithCounts = await Promise.all(
      dedupedAssessments.map(async (assessment) => {
        const questionCount = isAcademicCareerAssessmentCode(assessment.code)
          ? await Question.countDocuments({
            assessmentCode: { $in: getAssessmentCodeAliases(assessment.code) },
            category: getAcademicCareerGradeCategory(req.user?.grade),
            isActive: true,
          })
          : questionCounts.get(normalizeAssessmentCode(assessment.code)) || 0;
        return {
          ...assessment,
          questionCount,
        };
      }),
    );

    res.json({
      assessments: assessmentsWithCounts.map((assessment) => {
        const attempt = attemptsByCode.get(assessment.code);
        const release = buildAssessmentReleaseMeta(
          (assessment as { releaseDate?: Date | null }).releaseDate,
        );
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
          ...release,
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

export const listStudentAssessmentAttempts = async (req: AuthRequest, res: Response): Promise<void> => {
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

  const canonicalCode = normalizeAssessmentCode(code);
  if (!requireLearnerAssessmentAccess(res, learnerRole, canonicalCode, req.user?.grade)) {
    return;
  }

  try {
    const codeAliases = getAssessmentCodeAliases(canonicalCode);
    const attempts = await StudentAssessmentAttempt.find({
      user: req.user!._id,
      organization: req.user!.organization,
      assessmentCode: { $in: codeAliases },
      status: "COMPLETED",
    }).sort({ completedAt: 1, updatedAt: 1 });

    res.json({
      attempts: attempts.map((attempt, index) => ({
        attemptId: attempt._id,
        assessmentCode: normalizeAssessmentCode(attempt.assessmentCode),
        assessmentName: getAssessmentDisplayName(
          normalizeAssessmentCode(attempt.assessmentCode),
          attempt.assessmentName,
        ),
        completedAt: attempt.completedAt,
        evaluation: pickAttemptHistoryEvaluation(
          attempt.evaluation as Record<string, unknown> | undefined,
        ) ?? attempt.evaluation ?? undefined,
        attemptNumber: index + 1,
      })),
    });
  } catch (error) {
    console.error("listStudentAssessmentAttempts error:", error);
    res.status(500).json({ message: "Failed to load assessment attempts" });
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

  if (!requireLearnerAssessmentAccess(res, learnerRole, code, req.user?.grade)) {
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
    invoices: invoices.filter((invoice) => isAssessmentAccessibleForLearner(learnerRole, invoice.assessmentCode, req.user?.grade)),
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

  if (!requireLearnerAssessmentAccess(res, learnerRole, code, req.user?.grade)) {
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

    try {
      await reserveCouponsForPaymentOrder({
        pricing,
        organizationId,
        userId,
        paymentSessionId: paymentSession._id,
      });
    } catch (reserveError) {
      await AssessmentPaymentSession.deleteOne({ _id: paymentSession._id });
      throw reserveError;
    }

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

  if (!requireLearnerAssessmentAccess(res, learnerRole, code, req.user?.grade)) {
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

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    res.status(400).json({ message: "Payment verification payload is incomplete" });
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

  if (!requireLearnerAssessmentAccess(res, learnerRole, session.assessmentCode, req.user?.grade)) {
    return;
  }

  if (session.status === "PAID" || session.status === "CONSUMED" || session.invoice) {
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

  if (
    !verifyRazorpaySignature(expected, razorpay_signature)
    || razorpay_order_id !== session.razorpayOrderId
  ) {
    session.status = "FAILED";
    await session.save();
    res.status(400).json({ message: "Payment verification failed" });
    return;
  }

  const razorpay = getRazorpayClient();
  if (razorpay) {
    try {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      const expectedAmount = Math.round(Number(session.finalAmount || 0) * 100);
      const paidAmount = Number(payment.amount || 0);
      const paymentStatus = String(payment.status || "").toLowerCase();
      if (
        String(payment.order_id || "") !== session.razorpayOrderId
        || paidAmount !== expectedAmount
        || (paymentStatus !== "captured" && paymentStatus !== "authorized")
      ) {
        session.status = "FAILED";
        await session.save();
        res.status(400).json({ message: "Payment amount or status verification failed" });
        return;
      }
    } catch (paymentFetchError) {
      console.error("verifyStudentAssessmentPayment: Razorpay fetch failed", paymentFetchError);
      res.status(502).json({ message: "Unable to verify payment with Razorpay" });
      return;
    }
  }

  const claimedSession = await AssessmentPaymentSession.findOneAndUpdate(
    {
      _id: session._id,
      status: { $nin: ["PAID", "CONSUMED"] },
      $or: [{ invoice: { $exists: false } }, { invoice: null }],
    },
    {
      $set: {
        status: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    },
    { new: true },
  );

  if (!claimedSession) {
    res.json({ message: "Payment already verified", paymentSessionId: String(session._id) });
    return;
  }

  try {
    const invoice = await Invoice.create({
      invoiceNumber: await generateInvoiceNumber(req.user!.organization as mongoose.Types.ObjectId | string),
      user: req.user!._id,
      organization: req.user!.organization,
      assessmentCode: claimedSession.assessmentCode,
      amount: claimedSession.amount,
      discountAmount: claimedSession.discountAmount,
      gstAmount: claimedSession.gstAmount,
      finalAmount: claimedSession.finalAmount,
      currency: claimedSession.currency,
      couponCode: claimedSession.couponCode,
      paymentMethod: "RAZORPAY",
      paymentReference: razorpay_payment_id,
      status: "PAID",
    });

    claimedSession.invoice = invoice._id;
    await claimedSession.save();
  } catch (invoiceError) {
    await AssessmentPaymentSession.updateOne(
      { _id: claimedSession._id, status: "PAID" },
      {
        $set: { status: "CREATED" },
        $unset: { razorpayPaymentId: "", razorpaySignature: "" },
      },
    );
    console.error("verifyStudentAssessmentPayment: invoice creation failed", invoiceError);
    res.status(500).json({ message: "Payment verified but invoice creation failed. Please contact support." });
    return;
  }

  res.json({ message: "Payment verified", paymentSessionId: String(claimedSession._id) });
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

  if (!requireLearnerAssessmentAccess(res, learnerRole, canonicalCode, req.user?.grade)) {
    return;
  }

  const organizationId = getReferenceId(req.user?.organization);
  const userId = getReferenceId(req.user?._id);
  const { paymentSessionId } = req.body as { paymentSessionId?: string };

  if (!organizationId || !userId) {
    res.status(400).json({ message: "Student organization details are invalid" });
    return;
  }

  const [assessment, inProgressAttempt, latestExistingAttempt] = await Promise.all([
    Assessment.findOne({ code: { $in: codeAliases }, active: true }),
    StudentAssessmentAttempt.findOne({
      user: userId,
      organization: organizationId,
      assessmentCode: { $in: codeAliases },
      status: "IN_PROGRESS",
    }).sort({ updatedAt: -1 }),
    StudentAssessmentAttempt.findOne({
      user: userId,
      organization: organizationId,
      assessmentCode: { $in: codeAliases },
    }).sort({ updatedAt: -1 }),
  ]);

  if (!assessment) {
    res.status(404).json({ message: "Assessment not found" });
    return;
  }

  if (!inProgressAttempt && !isAssessmentReleased(assessment.releaseDate)) {
    res.status(403).json({
      message: assessment.releaseDate
        ? formatAssessmentReleaseLabel(assessment.releaseDate)
        : "This assessment is not available yet",
    });
    return;
  }

  if (inProgressAttempt) {
    const hydratedQuestions = await hydrateAttemptQuestionsWithOptions(inProgressAttempt.questions);
    let orderedQuestions = canonicalCode === "CAREER_DNA"
      ? [...hydratedQuestions]
      : await orderQuestionsByDatabaseInsertion(hydratedQuestions);

    if (canonicalCode === "CAREER_DNA" && inProgressAttempt.answeredCount === 0) {
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

        const hasSavedAnswers = inProgressAttempt.questions.some(
          (question) => question.answer !== undefined && question.answer !== "",
        );
        const hasDistributionMismatch =
          expectedCategoryCounts.size !== currentCategoryCounts.size
          || Array.from(expectedCategoryCounts.entries()).some(([category, count]) => (
            (currentCategoryCounts.get(category) || 0) !== count
          ));

        if (
          !hasSavedAnswers
          && inProgressAttempt.answeredCount === 0
          && (inProgressAttempt.totalQuestions !== expectedCareerDnaQuestionCount || hasDistributionMismatch)
        ) {
          orderedQuestions = sampledCareerDnaQuestions;
        }
      }
    }

    const questionsReordered = orderedQuestions.some((question, index) => (
      String(question.questionId) !== String(inProgressAttempt.questions[index]?.questionId)
    )) || orderedQuestions.length !== inProgressAttempt.questions.length;

    const shouldNormalizeAttemptMetadata =
      inProgressAttempt.assessmentCode !== canonicalCode
      || inProgressAttempt.assessmentName !== getAssessmentDisplayName(canonicalCode, inProgressAttempt.assessmentName);

    if (
      hydratedQuestions.some((question, index) => question.options !== inProgressAttempt.questions[index].options)
      || questionsReordered
      || shouldNormalizeAttemptMetadata
    ) {
      const nextAssessmentName = getAssessmentDisplayName(canonicalCode, assessment?.name || inProgressAttempt.assessmentName);

      await StudentAssessmentAttempt.updateOne(
        { _id: inProgressAttempt._id },
        {
          $set: {
            questions: orderedQuestions,
            totalQuestions: orderedQuestions.length,
            assessmentCode: canonicalCode,
            assessmentName: nextAssessmentName,
          },
        }
      );

      inProgressAttempt.questions = orderedQuestions as typeof inProgressAttempt.questions;
      inProgressAttempt.totalQuestions = orderedQuestions.length;
      inProgressAttempt.assessmentCode = canonicalCode;
      inProgressAttempt.assessmentName = nextAssessmentName;
    }

    res.json({
      attempt: {
        id: inProgressAttempt._id,
        assessmentCode: canonicalCode,
        assessmentName: getAssessmentDisplayName(canonicalCode, assessment?.name || inProgressAttempt.assessmentName),
        status: inProgressAttempt.status,
        questions: orderedQuestions,
        answeredCount: inProgressAttempt.answeredCount,
        totalQuestions: inProgressAttempt.totalQuestions,
      },
    });
    return;
  }

  const academicCareerCategory = getAcademicCareerGradeCategory(req.user?.grade);
  const questions = await Question.find({
    assessmentCode: { $in: codeAliases },
    ...(isAcademicCareerAssessmentCode(canonicalCode)
      ? { category: academicCareerCategory }
      : {}),
    isActive: true,
  })
    .sort({ questionNumber: 1, createdAt: 1, _id: 1 });
  if (!questions.length) {
    res.status(400).json({ message: "No active questions found for this assessment" });
    return;
  }

  let attemptQuestions = mapQuestionBankToAttemptQuestions(questions, canonicalCode);

  if (isStudyAbroadAssessmentCode(canonicalCode)) {
    const usedQuestionNumbers = await getStudyAbroadUsedQuestionNumbers(userId, organizationId);
    const selected = buildStudyAbroadQuestionSetForAttempt(attemptQuestions, usedQuestionNumbers);
    attemptQuestions = mapStudyAbroadAttemptQuestions(selected);
  }

  const selectedAttemptQuestions = canonicalCode === "CAREER_DNA"
    ? buildCareerDnaQuestionSetForAttempt(attemptQuestions)
    : attemptQuestions;

  const paidSession = await AssessmentPaymentSession.findOneAndUpdate(
    {
      _id: paymentSessionId,
      user: userId,
      organization: organizationId,
      assessmentCode: canonicalCode,
      status: "PAID",
      expiresAt: { $gte: new Date() },
      $or: [{ attempt: { $exists: false } }, { attempt: null }],
    },
    { $set: { status: "CONSUMING" } },
    { new: true },
  );

  if (!paidSession) {
    res.status(402).json({
      message: "Payment is required before starting this test. Please complete checkout.",
    });
    return;
  }

  let allocatedCouponCode: string | undefined;
  let allocatedConfigId: string | undefined;
  try {
    const allocation = await resolveOrganizationCouponAfterPayment({
      organizationId,
      userId,
      assessmentCode: canonicalCode,
      paymentCouponCode: paidSession.couponCode,
      paidFinalAmount: Number(paidSession.finalAmount || 0),
    });
    allocatedCouponCode = allocation.couponCode;
    allocatedConfigId = allocation.configId;
  } catch (error) {
    await AssessmentPaymentSession.updateOne(
      { _id: paidSession._id, status: "CONSUMING" },
      { $set: { status: "PAID" } },
    );
    res.status(409).json({
      message: error instanceof Error ? error.message : "Unable to allocate coupon",
    });
    return;
  }

  let createdAttempt: InstanceType<typeof StudentAssessmentAttempt>;
  try {
    createdAttempt = await StudentAssessmentAttempt.create({
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
  } catch (attemptError) {
    await AssessmentPaymentSession.updateOne(
      { _id: paidSession._id, status: "CONSUMING" },
      { $set: { status: "PAID" } },
    );
    throw attemptError;
  }

  if (allocatedCouponCode && allocatedConfigId) {
    await OrganizationCouponUsage.updateOne(
      {
        organization: organizationId,
        user: userId,
        assessmentCode: canonicalCode,
        couponCode: allocatedCouponCode,
      },
      { $set: { attempt: createdAttempt._id } },
    );
  }

  const consumedSession = await AssessmentPaymentSession.findOneAndUpdate(
    { _id: paidSession._id, status: "CONSUMING" },
    { $set: { status: "CONSUMED", attempt: createdAttempt._id } },
    { new: true },
  );

  if (!consumedSession) {
    await StudentAssessmentAttempt.deleteOne({ _id: createdAttempt._id });
    res.status(409).json({ message: "Payment session was already used to start this assessment." });
    return;
  }

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

  if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode, req.user?.grade)) {
    return;
  }

  const hydratedQuestions = await hydrateAttemptQuestionsWithOptions(attempt.questions);
  const canonicalCode = normalizeAssessmentCode(attempt.assessmentCode);
  const orderedQuestions = canonicalCode === "CAREER_DNA"
    ? hydratedQuestions
    : await orderQuestionsByDatabaseInsertion(hydratedQuestions);

  const displayName = getAssessmentDisplayName(canonicalCode, attempt.assessmentName);

  if (
    attempt.assessmentCode !== canonicalCode
    || attempt.assessmentName !== displayName
  ) {
    await StudentAssessmentAttempt.updateOne(
      { _id: attempt._id },
      { $set: { assessmentCode: canonicalCode, assessmentName: displayName } },
    );
  }

  res.json({
    attempt: {
      id: attempt._id,
      assessmentCode: canonicalCode,
      assessmentName: displayName,
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

  if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode, req.user?.grade)) {
    return;
  }

  const validQuestionIds = new Set(attempt.questions.map((question) => String(question.questionId)));
  const answerMap = new Map<string, string>();
  const invalidQuestionIds: string[] = [];

  for (const item of answers) {
    const questionId = item.questionId?.trim();
    const answerValue = item.answer !== undefined && item.answer !== null ? String(item.answer).trim() : "";
    if (!questionId || !answerValue) {
      continue;
    }
    if (!validQuestionIds.has(questionId)) {
      invalidQuestionIds.push(questionId);
      continue;
    }
    answerMap.set(questionId, answerValue);
  }

  if (invalidQuestionIds.length > 0) {
    res.status(400).json({
      message: "One or more answers reference invalid questions for this attempt.",
      invalidQuestionIds,
    });
    return;
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

  if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode, req.user?.grade)) {
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

  const tabSwitchThreshold = Math.max(1, Number(process.env.ANTI_CHEAT_TAB_SWITCH_LIMIT || 5));
  const tabSwitchCount = (attempt.antiCheatEvents || []).filter((entry) => entry.startsWith("tab_switch:")).length;
  if (tabSwitchCount >= tabSwitchThreshold) {
    res.status(403).json({
      message: "Submission blocked due to repeated tab switching during the assessment.",
      tabSwitchCount,
    });
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

  if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode, req.user?.grade)) {
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

const supportsServerEmailReportPdf = (assessmentCode: string): boolean => {
  const code = normalizeAssessmentCode(assessmentCode);
  return isCareerCompassAssessmentCode(code)
    || isLitmusAssessmentCode(code)
    || code === "CAREER_DNA"
    || isMetacognitionAssessmentCode(code)
    || isClearAssessmentCode(code);
};

const buildAttemptEmailReportPdf = async (
  attempt: InstanceType<typeof StudentAssessmentAttempt>,
): Promise<{ buffer: Buffer; fileName: string }> => {
  const code = normalizeAssessmentCode(attempt.assessmentCode);

  if (isCareerCompassAssessmentCode(code)) {
    const { buffer, studentName } = await buildCareerCompassPdfBufferForAttempt(attempt);
    return {
      buffer,
      fileName: `Career_Compass_Report_${studentName.replace(/\s+/g, "_")}.pdf`,
    };
  }

  if (isLitmusAssessmentCode(code)) {
    const { buffer, parentName } = await buildLitmusPdfBufferForAttempt(attempt);
    return {
      buffer,
      fileName: `Litmus_Report_${parentName.replace(/\s+/g, "_")}.pdf`,
    };
  }

  if (code === "CAREER_DNA") {
    const user = await User.findById(attempt.user).select({ firstName: 1, lastName: 1 }).lean();
    const studentName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Student";
    const buffer = await buildCareerDnaPdfBufferForAttempt(attempt);
    return {
      buffer,
      fileName: `Career_DNA_Executive_Report_${studentName.replace(/\s+/g, "_")}.pdf`,
    };
  }

  if (isMetacognitionAssessmentCode(code)) {
    const user = await User.findById(attempt.user).select({ firstName: 1, lastName: 1 }).lean();
    const studentName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Student";
    const html = await buildMetacognitionHtmlForAttempt(attempt);
    const buffer = await renderHtmlReportPdf(html);
    return {
      buffer,
      fileName: `Thinking_Expression_Intelligence_Report_${studentName.replace(/\s+/g, "_")}.pdf`,
    };
  }

  if (isClearAssessmentCode(code)) {
    const user = await User.findById(attempt.user).select({ firstName: 1, lastName: 1 }).lean();
    const studentName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Student";
    const html = await buildClearHtmlForAttempt(attempt);
    const buffer = await renderHtmlReportPdf(html);
    return {
      buffer,
      fileName: `CLEAR_Report_${studentName.replace(/\s+/g, "_")}.pdf`,
    };
  }

  throw new Error("Server-side report generation is not available for this assessment");
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

  const uploadedPdf = (req as AuthRequest & { file?: Express.Multer.File }).file;
  const body = req.body as {
    pdfBase64?: string;
    fileName?: string;
    serverGenerate?: boolean | string;
  };
  const pdfBase64 = typeof body.pdfBase64 === "string" ? body.pdfBase64.trim() : "";
  const fileName = typeof body.fileName === "string" ? body.fileName.trim() : "";
  const serverGenerate = body.serverGenerate === true || body.serverGenerate === "true";
  const uploadedPdfBuffer = uploadedPdf?.buffer?.length ? uploadedPdf.buffer : null;
  const hasClientPdf = Boolean(uploadedPdfBuffer?.length) || Boolean(pdfBase64);

  const attempt = await StudentAssessmentAttempt.findOne({
    _id: attemptId,
    user: req.user!._id,
    organization: req.user!.organization,
  });

  if (!attempt || attempt.status !== "COMPLETED") {
    res.status(404).json({ message: "Completed attempt not found" });
    return;
  }

  if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode, req.user?.grade)) {
    return;
  }

  const student = await User.findById(req.user!._id).lean();
  if (!student?.email) {
    res.status(400).json({ message: "Student email not found" });
    return;
  }

  const canGenerateOnServer = supportsServerEmailReportPdf(attempt.assessmentCode);
  const shouldGenerateOnServer = Boolean(
    canGenerateOnServer && (serverGenerate || !hasClientPdf),
  );

  if (!shouldGenerateOnServer && !hasClientPdf) {
    res.status(400).json({
      message: canGenerateOnServer
        ? "A report PDF upload is required"
        : "Failed to receive the generated report PDF. Please try again after the report finishes generating.",
    });
    return;
  }

  const maxEmailPdfBytes = 15 * 1024 * 1024;
  const safeName = `${attempt.assessmentCode}_Report_${String(student.firstName || "Student").replace(/\s+/g, "_")}.pdf`;
  let pdfBuffer: Buffer;
  let resolvedFileName = fileName || uploadedPdf?.originalname || safeName;

  try {
    if (shouldGenerateOnServer) {
      const built = await buildAttemptEmailReportPdf(attempt);
      pdfBuffer = built.buffer;
      resolvedFileName = fileName || built.fileName;
    } else if (uploadedPdfBuffer) {
      pdfBuffer = uploadedPdfBuffer;
    } else {
      pdfBuffer = Buffer.from(pdfBase64, "base64");
    }
  } catch (error) {
    console.error("emailStudentAttemptReport pdf build error:", error);
    res.status(503).json({
      message: error instanceof Error ? error.message : "Failed to generate report PDF for email",
    });
    return;
  }

  if (!pdfBuffer.length) {
    res.status(503).json({ message: "Report PDF was empty" });
    return;
  }

  if (pdfBuffer.length > maxEmailPdfBytes) {
    res.status(413).json({ message: "Report file is too large to email" });
    return;
  }

  try {
    await sendAssessmentReportToStudent({
      email: student.email,
      firstName: student.firstName || "Student",
      assessmentName: attempt.assessmentName || attempt.assessmentCode,
      pdfBuffer,
      fileName: resolvedFileName,
    });
  } catch (error) {
    console.error("emailStudentAttemptReport error:", error);
    res.status(503).json({
      message: error instanceof Error ? error.message : "Failed to send report email",
    });
    return;
  }

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
      const nextWebsite = profile.website?.trim() || "";
      if (nextWebsite && !isAllowedOrganizationWebsite(nextWebsite)) {
        res.status(400).json({
          message: "Website must be a valid subdomain of the platform domain or localhost for testing.",
        });
        return;
      }
      updateData.website = nextWebsite || undefined;
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

    if (profile.website !== undefined) {
      await refreshOrganizationCorsOrigins();
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

const buildCareerDnaReportDataForAttempt = async (
  attempt: InstanceType<typeof StudentAssessmentAttempt>,
) => {
  const code = normalizeAssessmentCode(attempt.assessmentCode);
  if (code !== "CAREER_DNA") {
    throw new Error("Career DNA executive report is only available for Career DNA attempts");
  }

  const evaluation = attempt.evaluation ?? await evaluateAssessmentAttempt(attempt);
  const student = await User.findById(attempt.user).select({ firstName: 1, lastName: 1, email: 1 }).lean();
  const studentName = `${student?.firstName || ""} ${student?.lastName || ""}`.trim() || "Student";

  return {
    studentName,
    reportData: buildCareerDnaReportData({
      studentName,
      email: student?.email,
      submittedAt: attempt.completedAt,
      answeredCount: attempt.answeredCount,
      totalQuestions: attempt.totalQuestions,
      evaluation: evaluation as Record<string, unknown>,
    }),
  };
};

const buildCareerDnaHtmlForAttempt = async (
  attempt: InstanceType<typeof StudentAssessmentAttempt>,
): Promise<string> => {
  const { reportData } = await buildCareerDnaReportDataForAttempt(attempt);
  return buildCareerDnaExecutiveHtml(reportData);
};

const buildCareerDnaPdfBufferForAttempt = async (
  attempt: InstanceType<typeof StudentAssessmentAttempt>,
): Promise<Buffer> => {
  const { reportData } = await buildCareerDnaReportDataForAttempt(attempt);
  return generateCareerDnaExecutivePdf(reportData);
};

const sendCareerDnaExecutivePdf = (res: Response, buffer: Buffer, studentName: string) => {
  const safeName = studentName.replace(/\s+/g, "_");
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="Career_DNA_Executive_Report_${safeName}.pdf"`,
    "Content-Length": buffer.length,
  });
  res.send(buffer);
};

export const getStudentCareerDnaReportHtml = async (req: AuthRequest, res: Response): Promise<void> => {
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

  try {
    const attempt = await StudentAssessmentAttempt.findOne({
      _id: attemptId,
      user: req.user!._id,
      organization: req.user!.organization,
      status: "COMPLETED",
    });

    if (!attempt) {
      res.status(404).json({ message: "Completed attempt not found" });
      return;
    }

    if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode, req.user?.grade)) {
      return;
    }

    const html = await buildCareerDnaHtmlForAttempt(attempt);
    res.json({ html });
  } catch (error) {
    console.error("getStudentCareerDnaReportHtml error:", error);
    res.status(500).json({ message: "Failed to build Career DNA report HTML" });
  }
};

export const getAdminCareerDnaReportHtml = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const resolved = await findAdminCompletedAttempt(req, res);
    if (!resolved) return;

    const html = await buildCareerDnaHtmlForAttempt(resolved.attempt);
    res.json({ html });
  } catch (error) {
    console.error("getAdminCareerDnaReportHtml error:", error);
    res.status(500).json({ message: "Failed to build Career DNA report HTML" });
  }
};

export const downloadStudentCareerDnaReport = async (req: AuthRequest, res: Response): Promise<void> => {
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

  try {
    const attempt = await StudentAssessmentAttempt.findOne({
      _id: attemptId,
      user: req.user!._id,
      organization: req.user!.organization,
      status: "COMPLETED",
    });

    if (!attempt) {
      res.status(404).json({ message: "Completed attempt not found" });
      return;
    }

    if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode, req.user?.grade)) {
      return;
    }

    const studentName = `${req.user!.firstName || ""} ${req.user!.lastName || ""}`.trim() || "Student";
    const buffer = await buildCareerDnaPdfBufferForAttempt(attempt);
    sendCareerDnaExecutivePdf(res, buffer, studentName);
  } catch (error) {
    console.error("downloadStudentCareerDnaReport error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate Career DNA report";
    res.status(503).json({
      message,
      fallback: "career-dna-report-html",
      hint: "Use the in-browser PDF download, which does not require server Chrome.",
    });
  }
};

export const downloadAdminCareerDnaReport = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const resolved = await findAdminCompletedAttempt(req, res);
    if (!resolved) return;

    const learnerName = `${resolved.learner.firstName || ""} ${resolved.learner.lastName || ""}`.trim() || "Student";
    const buffer = await buildCareerDnaPdfBufferForAttempt(resolved.attempt);
    sendCareerDnaExecutivePdf(res, buffer, learnerName);
  } catch (error) {
    console.error("downloadAdminCareerDnaReport error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate Career DNA report";
    res.status(503).json({
      message,
      fallback: "career-dna-report-html",
      hint: "Use the in-browser PDF download, which does not require server Chrome.",
    });
  }
};

const isMetacognitionAssessmentCode = (code: string) => {
  const normalized = normalizeAssessmentCode(code);
  return normalized === "METACOGNITION_TEST";
};

const buildMetacognitionHtmlForAttempt = async (
  attempt: InstanceType<typeof StudentAssessmentAttempt>,
) => {
  if (!isMetacognitionAssessmentCode(attempt.assessmentCode)) {
    throw new Error("TEST report is only available for Thinking & Expression Skills Test attempts");
  }

  const evaluation = attempt.evaluation ?? await evaluateAssessmentAttempt(attempt);
  const [student, organization, orgAdmin, organizationRegistration] = await Promise.all([
    User.findById(attempt.user).select({ firstName: 1, lastName: 1, grade: 1, institutionName: 1 }).lean(),
    Organization.findById(attempt.organization).select({ name: 1, branding: 1 }).lean(),
    User.findOne({
      role: "ORG_ADMIN",
      organization: attempt.organization,
      isActive: true,
    })
      .sort({ createdAt: 1 })
      .select({ firstName: 1, lastName: 1 })
      .lean(),
    OrganizationRegistration.findOne({ organization: attempt.organization })
      .sort({ updatedAt: -1 })
      .select({ firstName: 1, lastName: 1 })
      .lean(),
  ]);

  const studentName = `${student?.firstName || ""} ${student?.lastName || ""}`.trim() || "Student";
  const counselor = `${orgAdmin?.firstName || organizationRegistration?.firstName || ""} ${orgAdmin?.lastName || organizationRegistration?.lastName || ""}`.trim()
    || organization?.branding?.companyName
    || organization?.name
    || "Learning Counselor";

  return buildMetacognitionReportHtml({
    studentName,
    grade: student?.grade,
    school: student?.institutionName || organization?.name,
    submittedAt: attempt.completedAt || attempt.updatedAt,
    counselor,
    domainScores: (evaluation as { domainScores?: Record<string, unknown> }).domainScores,
    totalScore: (evaluation as { totalScore?: unknown }).totalScore,
  });
};

export const getStudentMetacognitionReportHtml = async (req: AuthRequest, res: Response): Promise<void> => {
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

  try {
    const attempt = await StudentAssessmentAttempt.findOne({
      _id: attemptId,
      user: req.user!._id,
      organization: req.user!.organization,
      status: "COMPLETED",
    });

    if (!attempt) {
      res.status(404).json({ message: "Completed attempt not found" });
      return;
    }

    if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode, req.user?.grade)) {
      return;
    }

    const html = await buildMetacognitionHtmlForAttempt(attempt);
    res.json({ html });
  } catch (error) {
    console.error("getStudentMetacognitionReportHtml error:", error);
    res.status(500).json({ message: "Failed to build TEST report HTML" });
  }
};

export const getAdminMetacognitionReportHtml = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const resolved = await findAdminCompletedAttempt(req, res);
    if (!resolved) return;

    const html = await buildMetacognitionHtmlForAttempt(resolved.attempt);
    res.json({ html });
  } catch (error) {
    console.error("getAdminMetacognitionReportHtml error:", error);
    res.status(500).json({ message: "Failed to build TEST report HTML" });
  }
};

const isClearAssessmentCode = (code: string) => {
  const normalized = normalizeAssessmentCode(code);
  return normalized === "JOHARI_WINDOW";
};

const buildClearHtmlForAttempt = async (
  attempt: InstanceType<typeof StudentAssessmentAttempt>,
) => {
  if (!isClearAssessmentCode(attempt.assessmentCode)) {
    throw new Error("CLEAR report is only available for CLEAR assessment attempts");
  }

  const evaluation = attempt.evaluation ?? await evaluateAssessmentAttempt(attempt);
  const [student, organization, orgAdmin, organizationRegistration] = await Promise.all([
    User.findById(attempt.user).select({ firstName: 1, lastName: 1, grade: 1, institutionName: 1, email: 1 }).lean(),
    Organization.findById(attempt.organization).select({ name: 1, branding: 1 }).lean(),
    User.findOne({
      role: "ORG_ADMIN",
      organization: attempt.organization,
      isActive: true,
    })
      .sort({ createdAt: 1 })
      .select({ firstName: 1, lastName: 1 })
      .lean(),
    OrganizationRegistration.findOne({ organization: attempt.organization })
      .sort({ updatedAt: -1 })
      .select({ firstName: 1, lastName: 1 })
      .lean(),
  ]);

  const studentName = `${student?.firstName || ""} ${student?.lastName || ""}`.trim() || "Student";
  const counselor = `${orgAdmin?.firstName || organizationRegistration?.firstName || ""} ${orgAdmin?.lastName || organizationRegistration?.lastName || ""}`.trim()
    || organization?.branding?.companyName
    || organization?.name
    || "Learning Counselor";

  return buildClearReportHtml({
    studentName,
    grade: student?.grade,
    school: student?.institutionName || organization?.name,
    email: student?.email,
    submittedAt: attempt.completedAt || attempt.updatedAt,
    counselor,
    solicitsFeedbackScore: (evaluation as { solicitsFeedbackScore?: unknown }).solicitsFeedbackScore,
    selfDisclosureScore: (evaluation as { selfDisclosureScore?: unknown }).selfDisclosureScore,
    dominantQuadrant: String((evaluation as { dominantQuadrant?: unknown }).dominantQuadrant || "Open Area"),
    totalAnswered: (evaluation as { totalAnswered?: unknown }).totalAnswered,
  });
};

export const getStudentClearReportHtml = async (req: AuthRequest, res: Response): Promise<void> => {
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

  try {
    const attempt = await StudentAssessmentAttempt.findOne({
      _id: attemptId,
      user: req.user!._id,
      organization: req.user!.organization,
      status: "COMPLETED",
    });

    if (!attempt) {
      res.status(404).json({ message: "Completed attempt not found" });
      return;
    }

    if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode, req.user?.grade)) {
      return;
    }

    const html = await buildClearHtmlForAttempt(attempt);
    res.json({ html });
  } catch (error) {
    console.error("getStudentClearReportHtml error:", error);
    res.status(500).json({ message: "Failed to build CLEAR report HTML" });
  }
};

export const getAdminClearReportHtml = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const resolved = await findAdminCompletedAttempt(req, res);
    if (!resolved) return;

    const html = await buildClearHtmlForAttempt(resolved.attempt);
    res.json({ html });
  } catch (error) {
    console.error("getAdminClearReportHtml error:", error);
    res.status(500).json({ message: "Failed to build CLEAR report HTML" });
  }
};

const buildLitmusPdfBufferForAttempt = async (
  attempt: InstanceType<typeof StudentAssessmentAttempt>,
): Promise<{ buffer: Buffer; parentName: string }> => {
  if (!isLitmusAssessmentCode(attempt.assessmentCode)) {
    throw new Error("Litmus report is only available for Litmus assessment attempts");
  }

  const evaluation = attempt.evaluation ?? await evaluateAssessmentAttempt(attempt);
  const user = await User.findById(attempt.user).select({ firstName: 1, lastName: 1 }).lean();
  const parentName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Parent";
  const styleScores = (evaluation as { styleScores?: Record<string, unknown> }).styleScores;

  const reportData = buildLitmusReportData({
    parentName,
    submittedAt: attempt.completedAt || attempt.updatedAt,
    styleScores,
    totalScore: (evaluation as { totalScore?: unknown }).totalScore,
    dominantStyle: String((evaluation as { dominantStyle?: unknown }).dominantStyle || ""),
  });

  const buffer = await generateLitmusReportPdf(reportData);
  return { buffer, parentName };
};

const sendLitmusReportPdf = (res: Response, buffer: Buffer, parentName: string) => {
  const safeName = parentName.replace(/\s+/g, "_");
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="Litmus_Report_${safeName}.pdf"`,
    "Content-Length": buffer.length,
  });
  res.send(buffer);
};

export const downloadStudentLitmusReport = async (req: AuthRequest, res: Response): Promise<void> => {
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

  try {
    const attempt = await StudentAssessmentAttempt.findOne({
      _id: attemptId,
      user: req.user!._id,
      organization: req.user!.organization,
      status: "COMPLETED",
    });

    if (!attempt) {
      res.status(404).json({ message: "Completed attempt not found" });
      return;
    }

    if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode, req.user?.grade)) {
      return;
    }

    const parentName = `${req.user!.firstName || ""} ${req.user!.lastName || ""}`.trim() || "Parent";
    const { buffer } = await buildLitmusPdfBufferForAttempt(attempt);
    sendLitmusReportPdf(res, buffer, parentName);
  } catch (error) {
    console.error("downloadStudentLitmusReport error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate Litmus report";
    res.status(500).json({ message });
  }
};

export const downloadAdminLitmusReport = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const resolved = await findAdminCompletedAttempt(req, res);
    if (!resolved) return;

    const { buffer, parentName } = await buildLitmusPdfBufferForAttempt(resolved.attempt);
    sendLitmusReportPdf(res, buffer, parentName);
  } catch (error) {
    console.error("downloadAdminLitmusReport error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate Litmus report";
    res.status(500).json({ message });
  }
};

const buildCareerCompassPdfBufferForAttempt = async (
  attempt: InstanceType<typeof StudentAssessmentAttempt>,
): Promise<{ buffer: Buffer; studentName: string }> => {
  if (!isCareerCompassAssessmentCode(attempt.assessmentCode)) {
    throw new Error("Career Compass report is only available for Career Compass attempts");
  }

  const evaluation = attempt.evaluation ?? await evaluateAssessmentAttempt(attempt);
  const [student, organization] = await Promise.all([
    User.findById(attempt.user).select({ firstName: 1, lastName: 1, grade: 1, institutionName: 1 }).lean(),
    Organization.findById(attempt.organization).select({ name: 1, branding: 1, settings: 1 }).lean(),
  ]);

  const studentName = `${student?.firstName || ""} ${student?.lastName || ""}`.trim() || "Student";
  const reportData = buildCareerCompassReportData({
    studentName,
    grade: student?.grade,
    institute: student?.institutionName || organization?.branding?.companyName || organization?.name,
    counselor: organization?.settings?.representativeName || organization?.branding?.companyName || organization?.name || "Career Counselor",
    submittedAt: attempt.completedAt || attempt.updatedAt,
    personalityCode: String((evaluation as { personalityType?: unknown }).personalityType || ""),
    description: String((evaluation as { description?: unknown }).description || ""),
    dimensions: (evaluation as { dimensions?: unknown }).dimensions as Parameters<
      typeof buildCareerCompassReportData
    >[0]["dimensions"],
  });

  const buffer = await generateCareerCompassReportPdf(reportData);
  return { buffer, studentName };
};

const sendCareerCompassReportPdf = (res: Response, buffer: Buffer, studentName: string) => {
  const safeName = studentName.replace(/\s+/g, "_");
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="Career_Compass_Report_${safeName}.pdf"`,
    "Content-Length": buffer.length,
  });
  res.send(buffer);
};

export const downloadStudentCareerCompassReport = async (req: AuthRequest, res: Response): Promise<void> => {
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

  try {
    const attempt = await StudentAssessmentAttempt.findOne({
      _id: attemptId,
      user: req.user!._id,
      organization: req.user!.organization,
      status: "COMPLETED",
    });

    if (!attempt) {
      res.status(404).json({ message: "Completed attempt not found" });
      return;
    }

    if (!requireLearnerAssessmentAccess(res, learnerRole, attempt.assessmentCode, req.user?.grade)) {
      return;
    }

    const { buffer, studentName } = await buildCareerCompassPdfBufferForAttempt(attempt);
    sendCareerCompassReportPdf(res, buffer, studentName);
  } catch (error) {
    console.error("downloadStudentCareerCompassReport error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate Career Compass report";
    res.status(503).json({ message });
  }
};

export const downloadAdminCareerCompassReport = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const resolved = await findAdminCompletedAttempt(req, res);
    if (!resolved) return;

    const { buffer, studentName } = await buildCareerCompassPdfBufferForAttempt(resolved.attempt);
    sendCareerCompassReportPdf(res, buffer, studentName);
  } catch (error) {
    console.error("downloadAdminCareerCompassReport error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate Career Compass report";
    res.status(503).json({ message });
  }
};
