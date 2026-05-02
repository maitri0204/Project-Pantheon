import { Request, Response } from "express";

import Assessment from "../models/Assessment";
import Coupon from "../models/Coupon";
import Invoice from "../models/Invoice";
import Organization from "../models/Organization";
import Question from "../models/Question";
import User from "../models/User";
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

export const getLedger = async (_req: AuthRequest, res: Response): Promise<void> => {
  const invoices = await Invoice.find()
    .populate("user", "firstName lastName email")
    .populate("organization", "name slug")
    .sort({ createdAt: 1 });

  let runningBalance = 0;
  const rows = invoices.map((inv) => {
    runningBalance += inv.finalAmount ?? 0;
    return { ...inv.toObject(), runningBalance };
  });

  const totalGross = invoices.reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalDiscount = invoices.reduce((s, i) => s + (i.discountAmount ?? 0), 0);
  const totalNet = invoices.reduce((s, i) => s + (i.finalAmount ?? 0), 0);

  res.json({ invoices: rows, summary: { total: invoices.length, totalGross, totalDiscount, totalNet } });
};

export const updateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { discountType, value, expiresAt, isActive } = req.body as {
      discountType?: "FLAT" | "PERCENT"; value?: number; expiresAt?: string; isActive?: boolean;
    };
    const updates: Record<string, unknown> = {};
    if (discountType) updates.discountType = discountType;
    if (typeof value === "number") updates.value = value;
    if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : undefined;
    if (typeof isActive === "boolean") updates.isActive = isActive;
    const coupon = await Coupon.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!coupon) { res.status(404).json({ message: "Coupon not found" }); return; }
    res.json({ coupon });
  } catch (error) {
    res.status(500).json({ message: "Failed to update coupon" });
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ message: "Failed to delete" }); }
};

export const getSuperadminDashboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [assessments, organizations, users, coupons] = await Promise.all([
    Assessment.find().sort({ name: 1 }),
    Organization.find().sort({ createdAt: -1 }),
    User.find().sort({ createdAt: -1 }).limit(25).populate("organization"),
    Coupon.find().sort({ createdAt: -1 }),
  ]);

  const dedupedAssessments = dedupeAssessments(
    assessments.map((assessment) => assessment.toObject() as Record<string, unknown> as { code: string; name: string })
  );

  // Dynamically count questions for each assessment
  const assessmentsWithCounts = await Promise.all(
    dedupedAssessments.map(async (assessment) => {
      const count = await Question.countDocuments({
        assessmentCode: { $in: getAssessmentCodeAliases(assessment.code) },
        isActive: true,
      });
      return { ...assessment, questionCount: count };
    })
  );

  res.json({ assessments: assessmentsWithCounts, organizations, users, coupons });
};

export const createOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, slug, contactEmail } = req.body as {
      name?: string;
      slug?: string;
      contactEmail?: string;
    };

    if (!name?.trim() || !slug?.trim()) {
      res.status(400).json({ message: "Name and slug are required" });
      return;
    }

    const organization = await Organization.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      contactEmail: contactEmail?.trim().toLowerCase(),
      type: "WHITELABEL",
      isActive: true,
      branding: {
        companyName: name.trim(),
        primaryColor: "#2563eb",
        accentColor: "#06b6d4",
      },
      settings: {
        allowSelfSignup: true,
        assessmentCatalogVisible: true,
      },
    });

    res.status(201).json({ organization });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({ message: "Organization slug already exists" });
      return;
    }

    console.error("Create organization error:", error);
    res.status(500).json({ message: "Failed to create organization" });
  }
};

export const updateAssessmentPricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = String(req.params.code || "");
    const { basePrice, gstEnabled } = req.body as { basePrice?: number; gstEnabled?: boolean };

    const updates: Record<string, unknown> = {};
    if (typeof basePrice === "number" && basePrice >= 0) updates.basePrice = basePrice;
    if (typeof gstEnabled === "boolean") updates.gstEnabled = gstEnabled;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "Nothing to update" });
      return;
    }

    const assessment = await Assessment.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $set: updates },
      { new: true }
    );

    if (!assessment) {
      res.status(404).json({ message: "Assessment not found" });
      return;
    }

    res.json({ assessment });
  } catch (error) {
    console.error("Update assessment pricing error:", error);
    res.status(500).json({ message: "Failed to update assessment pricing" });
  }
};

export const listCoupons = async (_req: AuthRequest, res: Response): Promise<void> => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ coupons });
};

export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { code, discountType, value, applicableAssessmentCodes, expiresAt } = req.body as {
      code?: string;
      discountType?: "FLAT" | "PERCENT";
      value?: number;
      applicableAssessmentCodes?: string[];
      expiresAt?: string;
    };

    if (!code?.trim() || !discountType || typeof value !== "number") {
      res.status(400).json({ message: "code, discountType, and value are required" });
      return;
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      value,
      applicableAssessmentCodes: applicableAssessmentCodes || [],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      isActive: true,
      createdBy: req.user._id,
    });

    res.status(201).json({ coupon });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({ message: "Coupon code already exists" });
      return;
    }

    console.error("Create coupon error:", error);
    res.status(500).json({ message: "Failed to create coupon" });
  }
};

// ─── Questions ────────────────────────────────────────────────────────────────

export const listQuestions = async (req: Request, res: Response): Promise<void> => {
  const code = String(req.params.code || "").toUpperCase();
  const questions = await Question.find({ assessmentCode: code, isActive: true }).sort({ createdAt: 1, _id: 1 });
  res.json({ questions });
};

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = String(req.params.code || "").toUpperCase();
    const { category, categoryLabel, questionNumber, title, questionText, options } = req.body as {
      category?: string;
      categoryLabel?: string;
      questionNumber?: number;
      title?: string;
      questionText?: string;
      options?: Array<{ label?: string; text?: string; score?: number }>;
    };

    if (!category?.trim() || !title?.trim() || !questionText?.trim() || typeof questionNumber !== "number") {
      res.status(400).json({ message: "category, questionNumber, title, and questionText are required" });
      return;
    }

    const normalizedOptions = Array.isArray(options)
      ? options
          .map((option) => ({
            label: String(option.label || "").trim(),
            text: String(option.text || "").trim(),
            score: typeof option.score === "number" ? option.score : undefined,
          }))
          .filter((option) => option.label && option.text)
      : [];

    const question = await Question.create({
      assessmentCode: code,
      category: category.trim(),
      categoryLabel: categoryLabel?.trim() || category.trim(),
      questionNumber,
      title: title.trim(),
      questionText: questionText.trim(),
      options: normalizedOptions,
    });

    res.status(201).json({ question });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({ message: "A question with this number and category already exists" });
      return;
    }
    console.error("Create question error:", error);
    res.status(500).json({ message: "Failed to create question" });
  }
};

export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || "");
    const { title, questionText, category, categoryLabel, questionNumber, options } = req.body as {
      title?: string;
      questionText?: string;
      category?: string;
      categoryLabel?: string;
      questionNumber?: number;
      options?: Array<{ label?: string; text?: string; score?: number }>;
    };

    const update: Record<string, unknown> = {};
    if (title?.trim()) update.title = title.trim();
    if (questionText?.trim()) update.questionText = questionText.trim();
    if (category?.trim()) update.category = category.trim();
    if (categoryLabel?.trim()) update.categoryLabel = categoryLabel.trim();
    if (typeof questionNumber === "number") update.questionNumber = questionNumber;
    if (Array.isArray(options)) {
      update.options = options
        .map((option) => ({
          label: String(option.label || "").trim(),
          text: String(option.text || "").trim(),
          score: typeof option.score === "number" ? option.score : undefined,
        }))
        .filter((option) => option.label && option.text);
    }

    const question = await Question.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    res.json({ question });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({ message: "Failed to update question" });
  }
};

export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || "");
    const question = await Question.findByIdAndUpdate(id, { $set: { isActive: false } }, { new: true });
    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }
    res.json({ message: "Question deleted" });
  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({ message: "Failed to delete question" });
  }
};
