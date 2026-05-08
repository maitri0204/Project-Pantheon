import { Request, Response } from "express";

import Assessment from "../models/Assessment";
import Coupon from "../models/Coupon";
import Invoice from "../models/Invoice";
import Organization from "../models/Organization";
import OrganizationRegistration from "../models/OrganizationRegistration";
import OrganizationCouponConfig from "../models/OrganizationCouponConfig";
import OrganizationCouponUsage from "../models/OrganizationCouponUsage";
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

export const getLedger = async (_req: AuthRequest, res: Response): Promise<void> => {
  const invoices = await Invoice.find()
    .populate("user", "firstName lastName email phone grade institutionName city state country")
    .populate("organization", "name slug contactEmail website branding.companyName branding.logoUrl")
    .sort({ createdAt: 1 });

  const organizationIds = Array.from(
    new Set(
      invoices
        .map((invoice) => {
          const organization = invoice.organization as { _id?: { toString(): string } } | null;
          return organization?._id ? String(organization._id) : null;
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

  let runningBalance = 0;
  const rows = invoices.map((inv) => {
    runningBalance += inv.finalAmount ?? 0;
    const row = inv.toObject() as {
      organization?: {
        _id?: { toString(): string };
      };
    } & Record<string, unknown>;

    const organizationId = row.organization?._id ? String(row.organization._id) : null;
    const registration = organizationId ? registrationByOrganizationId.get(organizationId) : undefined;

    return {
      ...row,
      organization: row.organization
        ? {
          ...row.organization,
          phone: registration?.primaryMobile,
          officeAddress: registration?.officeAddress,
          state: registration?.state,
          country: registration?.country,
          panNumber: registration?.panCompany,
          gstNumber: registration?.gstNumber,
          signatoryFirstName: registration?.firstName,
          signatoryLastName: registration?.lastName,
          signatureUrl: registration?.signatureUrl,
        }
        : row.organization,
      runningBalance,
    };
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
    assessments.map((assessment) => assessment.toObject() as unknown as { code: string; name: string })
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

const formatSequentialCouponCode = (prefix: string, sequence: number): string => {
  const safePrefix = String(prefix || "").trim().toUpperCase();
  return `${safePrefix}${Math.max(1, Number(sequence) || 1)}`;
};

export const getOrganizationCouponDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  const organizationId = String(req.params.organizationId || "").trim();
  if (!organizationId) {
    res.status(400).json({ message: "Organization ID is required" });
    return;
  }

  const organization = await Organization.findById(organizationId);

  if (!organization) {
    res.status(404).json({ message: "Organization not found" });
    return;
  }

  const [assessments, configs, usageRows, registration] = await Promise.all([
    Assessment.find({ active: true }).sort({ name: 1 }),
    OrganizationCouponConfig.find({ organization: organization._id }).sort({ assessmentCode: 1 }),
    OrganizationCouponUsage.aggregate<{ _id: string; used: number }>([
      { $match: { organization: organization._id } },
      { $group: { _id: "$assessmentCode", used: { $sum: 1 } } },
    ]),
    OrganizationRegistration.findOne({ organization: organization._id }).sort({ updatedAt: -1 }),
  ]);

  const dedupedAssessments = dedupeAssessments(
    assessments.map((assessment) => assessment.toObject() as unknown as { code: string; name: string })
  );

  const configByCode = new Map(configs.map((config) => [normalizeAssessmentCode(config.assessmentCode), config]));
  const usedByCode = new Map(usageRows.map((row) => [normalizeAssessmentCode(row._id), row.used]));

  const couponSummary = dedupedAssessments.map((assessment) => {
    const config = configByCode.get(assessment.code);
    const usedCoupons = usedByCode.get(assessment.code) || 0;
    const totalCoupons = config?.totalCoupons || 0;
    const remainingCoupons = Math.max(totalCoupons - usedCoupons, 0);

    return {
      assessmentCode: assessment.code,
      assessmentName: assessment.name,
      configId: config ? String(config._id) : undefined,
      prefix: config?.prefix || "",
      nextCouponCode: config ? formatSequentialCouponCode(config.prefix, Math.min(config.nextSequence, config.totalCoupons)) : "",
      totalCoupons,
      usedCoupons,
      remainingCoupons,
      discountAmount: config?.discountAmount ?? 0,
      isConfigured: Boolean(config),
      isActive: config?.isActive ?? false,
    };
  });

  res.json({
    organization: {
      _id: organization._id,
      name: organization.name,
      slug: organization.slug,
      website: organization.website,
      type: organization.type,
      isActive: organization.isActive,
      contactEmail: organization.contactEmail,
      phoneNumber: registration?.primaryMobile,
      contactPersonName: [registration?.firstName, registration?.middleName, registration?.lastName]
        .filter((value) => Boolean(String(value || "").trim()))
        .join(" "),
      companyName: registration?.companyName || organization.branding?.companyName || organization.name,
      createdAt: organization.createdAt,
    },
    couponSummary,
  });
};

export const createOrganizationCouponConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const organizationId = String(req.params.organizationId || "").trim();
    const {
      assessmentCode,
      prefix,
      totalCoupons,
      isActive,
      discountAmount,
    } = req.body as {
      assessmentCode?: string;
      prefix?: string;
      totalCoupons?: number;
      isActive?: boolean;
      discountAmount?: number;
    };

    const normalizedAssessmentCode = normalizeAssessmentCode(String(assessmentCode || "").trim().toUpperCase());
    const normalizedPrefix = String(prefix || "").trim().toUpperCase();
    const parsedTotalCoupons = Number(totalCoupons);

    if (!organizationId || !normalizedAssessmentCode || !normalizedPrefix || !Number.isFinite(parsedTotalCoupons) || parsedTotalCoupons < 1) {
      res.status(400).json({ message: "organizationId, assessmentCode, prefix and totalCoupons (>=1) are required" });
      return;
    }

    const existing = await OrganizationCouponConfig.findOne({
      organization: organizationId,
      assessmentCode: normalizedAssessmentCode,
    });
    if (existing) {
      res.status(409).json({ message: "Coupon configuration already exists for this assessment" });
      return;
    }

    const config = await OrganizationCouponConfig.create({
      organization: organizationId,
      assessmentCode: normalizedAssessmentCode,
      prefix: normalizedPrefix,
      totalCoupons: parsedTotalCoupons,
      nextSequence: 1,
      discountAmount: (typeof discountAmount === "number" && discountAmount >= 0) ? discountAmount : 0,
      isActive: typeof isActive === "boolean" ? isActive : true,
      createdBy: req.user._id,
    });

    res.status(201).json({ config });
  } catch (error) {
    console.error("Create organization coupon config error:", error);
    res.status(500).json({ message: "Failed to create organization coupon configuration" });
  }
};

export const updateOrganizationCouponConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const organizationId = String(req.params.organizationId || "").trim();
    const configId = String(req.params.configId || "").trim();
    if (!organizationId || !configId) {
      res.status(400).json({ message: "Organization and config IDs are required" });
      return;
    }

    const {
      prefix,
      totalCoupons,
      isActive,
      discountAmount,
    } = req.body as {
      prefix?: string;
      totalCoupons?: number;
      isActive?: boolean;
      discountAmount?: number;
    };

    const config = await OrganizationCouponConfig.findOne({ _id: configId, organization: organizationId });
    if (!config) {
      res.status(404).json({ message: "Coupon configuration not found" });
      return;
    }

    const usedCoupons = await OrganizationCouponUsage.countDocuments({ config: config._id });

    if (prefix !== undefined) {
      const normalizedPrefix = String(prefix || "").trim().toUpperCase();
      if (!normalizedPrefix) {
        res.status(400).json({ message: "Prefix cannot be empty" });
        return;
      }
      if (usedCoupons > 0 && normalizedPrefix !== config.prefix) {
        res.status(400).json({ message: "Prefix cannot be changed after coupon usage starts" });
        return;
      }
      config.prefix = normalizedPrefix;
    }

    if (totalCoupons !== undefined) {
      const parsedTotalCoupons = Number(totalCoupons);
      if (!Number.isFinite(parsedTotalCoupons) || parsedTotalCoupons < 1) {
        res.status(400).json({ message: "totalCoupons must be a number >= 1" });
        return;
      }
      if (parsedTotalCoupons < usedCoupons) {
        res.status(400).json({ message: `totalCoupons cannot be less than used coupons (${usedCoupons})` });
        return;
      }
      config.totalCoupons = parsedTotalCoupons;
      config.nextSequence = Math.max(config.nextSequence, usedCoupons + 1);
    }

    if (typeof isActive === "boolean") {
      config.isActive = isActive;
    }

    if (typeof discountAmount === "number" && discountAmount >= 0) {
      config.discountAmount = discountAmount;
    }

    await config.save();

    res.json({ config });
  } catch (error) {
    console.error("Update organization coupon config error:", error);
    res.status(500).json({ message: "Failed to update organization coupon configuration" });
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
