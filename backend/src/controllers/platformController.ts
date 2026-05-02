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
  res.json({ assessments });
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

  res.json({
    organization: {
      id: organization._id,
      name: organization.name,
      slug: organization.slug,
      website: organization.website,
      branding: organization.branding,
    },
    canAccessAssessments,
    assessments,
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

  const studentsPayload =
    req.user.role === "ORG_ADMIN"
      ? studentsWithStats.filter((student) => student.testsTaken > 0)
      : studentsWithStats;

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

  const completedCodes = new Set(
    attempts.filter((attempt) => attempt.status === "COMPLETED").map((attempt) => attempt.assessmentCode)
  );
  const appearedCodes = new Set(attempts.map((attempt) => attempt.assessmentCode));

  const totalAssessments = assessments.length;
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
        assessmentCode: attempt.assessmentCode,
        assessmentName: attempt.assessmentName,
        status: attempt.status,
        answeredCount: attempt.answeredCount,
        totalQuestions: attempt.totalQuestions,
        updatedAt: attempt.updatedAt,
      })),
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

  const attemptByCode = new Map(attempts.map((attempt) => [attempt.assessmentCode, attempt]));

  res.json({
    assessments: assessments.map((assessment) => {
      const attempt = attemptByCode.get(assessment.code);
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
  if (!code) {
    res.status(400).json({ message: "Assessment code is required" });
    return;
  }

  const organizationId = req.user!.organization;
  const userId = req.user!._id;

  const [assessment, existingAttempt] = await Promise.all([
    Assessment.findOne({ code, active: true }),
    StudentAssessmentAttempt.findOne({ user: userId, organization: organizationId, assessmentCode: code }),
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

    if (hydratedQuestions.some((question, index) => question.options !== existingAttempt.questions[index].options)) {
      existingAttempt.questions = hydratedQuestions as typeof existingAttempt.questions;
      await existingAttempt.save();
    }

    res.json({
      attempt: {
        id: existingAttempt._id,
        assessmentCode: existingAttempt.assessmentCode,
        assessmentName: existingAttempt.assessmentName,
        status: existingAttempt.status,
        questions: hydratedQuestions,
        answeredCount: existingAttempt.answeredCount,
        totalQuestions: existingAttempt.totalQuestions,
      },
    });
    return;
  }

  const questions = await Question.find({ assessmentCode: code, isActive: true }).sort({ questionNumber: 1 });
  if (!questions.length) {
    res.status(400).json({ message: "No active questions found for this assessment" });
    return;
  }

  const createdAttempt = await StudentAssessmentAttempt.create({
    user: userId,
    organization: organizationId,
    assessmentCode: code,
    assessmentName: assessment.name,
    status: "IN_PROGRESS",
    questions: questions.map((question) => {
      const careerDnaMeta = code === "CAREER_DNA" ? parseCareerDnaCategory(question.category) : null;
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

  if (hydratedQuestions.some((question, index) => question.options !== attempt.questions[index].options)) {
    attempt.questions = hydratedQuestions as typeof attempt.questions;
    await attempt.save();
  }

  res.json({
    attempt: {
      id: attempt._id,
      assessmentCode: attempt.assessmentCode,
      assessmentName: attempt.assessmentName,
      status: attempt.status,
      questions: hydratedQuestions,
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
