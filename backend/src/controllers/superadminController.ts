import { Request, Response } from "express";

import Assessment from "../models/Assessment";
import {
  buildAssessmentReleaseMeta,
  formatReleaseDateInputValue,
  parseReleaseDateInput,
} from "../services/assessmentRelease";
import Coupon from "../models/Coupon";
import Invoice from "../models/Invoice";
import Organization, { IOrganization } from "../models/Organization";
import OrganizationRegistration from "../models/OrganizationRegistration";
import OrganizationCouponConfig from "../models/OrganizationCouponConfig";
import OrganizationCouponUsage from "../models/OrganizationCouponUsage";
import Question from "../models/Question";
import User, { IUser } from "../models/User";
import { aggregateStudentVisibleQuestionCounts } from "../services/assessmentStudentVisibleQuestionCount.service";
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

export const getLedger = async (_req: AuthRequest, res: Response): Promise<void> => {
    // Enforce limit to prevent performance issues with large datasets
    const invoices = await Invoice.find()
      .limit(1000) // Safe default limit for admin ledger view
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
    const row = inv.toObject() as unknown as {
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
    // eslint-disable-next-line no-console
    console.error("updateCoupon: failed to update coupon", error);
    res.status(500).json({ message: "Failed to update coupon" });
  }
};

export const deleteCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("deleteCoupon: failed to delete coupon", err, req.params.id);
    res.status(500).json({ message: "Failed to delete" });
  }
};

export const getSuperadminDashboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [assessments, organizations, users, coupons] = await Promise.all([
    Assessment.find().limit(200).sort({ name: 1 }),
    Organization.find().limit(100).sort({ createdAt: -1 }),
    User.find().sort({ createdAt: -1 }).limit(25).populate("organization"),
    Coupon.find().limit(50).sort({ createdAt: -1 }),
  ]);

  const dedupedAssessments = dedupeAssessments(
    assessments.map((assessment) => assessment.toObject() as unknown as { code: string; name: string })
  );

  const questionCountEntries = await Promise.all(
    dedupedAssessments.map(async (assessment) => {
      const count = await Question.countDocuments({
        assessmentCode: { $in: getAssessmentCodeAliases(assessment.code) },
        isActive: true,
      });
      return [normalizeAssessmentCode(assessment.code), count] as const;
    }),
  );
  const questionCounts = new Map(questionCountEntries);
  const studentVisibleQuestionCounts = await aggregateStudentVisibleQuestionCounts(
    dedupedAssessments,
    questionCounts,
  );

  const assessmentsWithCounts = dedupedAssessments.map((assessment) => {
    const canonicalCode = normalizeAssessmentCode(assessment.code);
    const questionCount = questionCounts.get(canonicalCode) || 0;
    const studentVisibleQuestionCount = studentVisibleQuestionCounts.get(canonicalCode) ?? questionCount;
    const release = buildAssessmentReleaseMeta(
      (assessment as { releaseDate?: Date | null }).releaseDate,
    );
    return { ...assessment, questionCount, studentVisibleQuestionCount, ...release };
  });

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
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000) {
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

export const updateAssessmentReleaseDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = String(req.params.code || "").trim().toUpperCase();
    const { releaseDate } = req.body as { releaseDate?: string | null };

    if (!code) {
      res.status(400).json({ message: "Assessment code is required" });
      return;
    }

    let update: Record<string, unknown>;
    if (releaseDate === null || releaseDate === "") {
      update = { $unset: { releaseDate: "" } };
    } else if (typeof releaseDate === "string") {
      update = { $set: { releaseDate: parseReleaseDateInput(releaseDate) } };
    } else {
      res.status(400).json({ message: "releaseDate must be a YYYY-MM-DD string or null" });
      return;
    }

    const assessment = await Assessment.findOneAndUpdate({ code }, update, { new: true });
    if (!assessment) {
      res.status(404).json({ message: "Assessment not found" });
      return;
    }

    res.json({
      assessment: {
        code: assessment.code,
        releaseDate: assessment.releaseDate ? formatReleaseDateInputValue(assessment.releaseDate) : null,
      },
    });
  } catch (error) {
    console.error("Update assessment release date error:", error);
    res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to update assessment release date",
    });
  }
};

export const updateAssessmentPricing = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = String(req.params.code || "");
    const { basePrice, gstEnabled, gstPercentage } = req.body as { basePrice?: number; gstEnabled?: boolean; gstPercentage?: number };

    const updates: Record<string, unknown> = {};
    if (typeof basePrice === "number" && basePrice >= 0) updates.basePrice = basePrice;
    if (typeof gstEnabled === "boolean") updates.gstEnabled = gstEnabled;
    if (typeof gstPercentage === "number" && gstPercentage >= 0 && gstPercentage <= 100) {
      updates.gstPercentage = gstPercentage;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ message: "Nothing to update" });
      return;
    }

    const canonicalCode = normalizeAssessmentCode(code);
    const aliases = getAssessmentCodeAliases(canonicalCode);

    const assessment = await Assessment.findOne({ code: { $in: aliases } });
    if (!assessment) {
      res.status(404).json({ message: "Assessment not found" });
      return;
    }

    await Assessment.updateMany({ code: { $in: aliases } }, { $set: updates });
    const updated = await Assessment.findOne({ code: assessment.code });

    res.json({ assessment: updated });
  } catch (error) {
    console.error("Update assessment pricing error:", error);
    res.status(500).json({ message: "Failed to update assessment pricing" });
  }
};

export const listCoupons = async (_req: AuthRequest, res: Response): Promise<void> => {
  const coupons = await Coupon.find().limit(200).sort({ createdAt: -1 });
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
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000) {
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
  const questions = await Question.find({ assessmentCode: code, isActive: true }).sort({ questionNumber: 1, createdAt: 1, _id: 1 });
  res.json({ questions });
};

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = String(req.params.code || "").toUpperCase();
    const { category, categoryLabel, questionNumber, title, questionText, options, correctAnswer } = req.body as {
      category?: string;
      categoryLabel?: string;
      questionNumber?: number;
      title?: string;
      questionText?: string;
      options?: Array<{ label?: string; text?: string; score?: number }>;
      correctAnswer?: string;
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
      correctAnswer: correctAnswer?.trim() || undefined,
    });

    res.status(201).json({ question });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000) {
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
    const { title, questionText, category, categoryLabel, questionNumber, options, correctAnswer } = req.body as {
      title?: string;
      questionText?: string;
      category?: string;
      categoryLabel?: string;
      questionNumber?: number;
      options?: Array<{ label?: string; text?: string; score?: number }>;
      correctAnswer?: string;
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
    if (correctAnswer !== undefined) {
      update.correctAnswer = correctAnswer.trim() || undefined;
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

const KAREER_STUDIO_ORG_SLUG = "kareer-studio";

const isValidStudentEmail = (value?: string): boolean => {
  if (!value?.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

const isValidStudentPhone = (value?: string): boolean => {
  if (!value?.trim()) return false;
  return /^\d{10}$/.test(value.trim());
};

type ParentCreateInput = {
  rowNumber?: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  email?: string;
  phoneCode?: string;
  phone?: string;
  institutionName?: string;
  country?: string;
  state?: string;
  city?: string;
};

const createParentForOrganization = async (
  body: ParentCreateInput,
  organization: IOrganization,
): Promise<IUser> => {
  const normalizedEmail = body.email!.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error("Email already registered. Please use a different email.");
  }

  return User.create({
    firstName: body.firstName!.trim(),
    middleName: body.middleName?.trim() || undefined,
    lastName: body.lastName!.trim(),
    gender: body.gender?.trim() || undefined,
    email: normalizedEmail,
    phone: body.phone!.trim(),
    phoneCode: body.phoneCode?.trim() || "+91",
    country: body.country?.trim() || undefined,
    state: body.state?.trim() || undefined,
    city: body.city?.trim() || undefined,
    institutionName: body.institutionName?.trim() || organization.branding?.companyName || organization.name,
    role: "PARENT",
    organization: organization._id,
    isVerified: true,
    isActive: true,
    otpPurpose: null,
    otpAttempts: 0,
  });
};

export const createParentBySuperadmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = req.body as ParentCreateInput;
    const validationError = validateStudentCreateInput(body);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const organization = await getKareerStudioOrganization();
    const user = await createParentForOrganization(body, organization);
    await user.populate("organization");

    res.status(201).json({
      message: "Parent added successfully under Kareer Studio.",
      parent: {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organization: user.organization
          ? {
              name: (user.organization as { name?: string }).name,
              slug: (user.organization as { slug?: string }).slug,
            }
          : null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already registered")) {
      res.status(409).json({ message: error.message });
      return;
    }
    if (error instanceof Error && error.message.includes("Kareer Studio")) {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error("Create parent by superadmin error:", error);
    res.status(500).json({ message: "Failed to add parent" });
  }
};

export const bulkCreateParentsBySuperadmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { parents } = req.body as { parents?: ParentCreateInput[] };
    if (!Array.isArray(parents) || parents.length === 0) {
      res.status(400).json({ message: "At least one parent row is required" });
      return;
    }

    const organization = await getKareerStudioOrganization();
    const created: Array<{ rowNumber?: number; email: string; firstName: string; lastName: string }> = [];
    const failed: Array<{ rowNumber?: number; email?: string; message: string }> = [];

    for (let index = 0; index < parents.length; index += 1) {
      const row = parents[index];
      const rowNumber = typeof row.rowNumber === "number" ? row.rowNumber : index + 2;
      const validationError = validateStudentCreateInput(row);
      if (validationError) {
        failed.push({ rowNumber, email: row.email, message: validationError });
        continue;
      }

      try {
        const user = await createParentForOrganization(row, organization);
        created.push({
          rowNumber,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      } catch (error) {
        failed.push({
          rowNumber,
          email: row.email,
          message: error instanceof Error ? error.message : "Failed to add parent",
        });
      }
    }

    res.status(200).json({
      message: `Imported ${created.length} parent(s). ${failed.length} row(s) failed.`,
      createdCount: created.length,
      failedCount: failed.length,
      created,
      failed,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Kareer Studio")) {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error("Bulk create parents by superadmin error:", error);
    res.status(500).json({ message: "Failed to import parents" });
  }
};

type StudentCreateInput = {
  rowNumber?: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  email?: string;
  phoneCode?: string;
  phone?: string;
  institutionName?: string;
  grade?: string;
  division?: string;
  country?: string;
  state?: string;
  city?: string;
};

const validateStudentCreateInput = (body: StudentCreateInput) => {
  if (!body.firstName?.trim() || !body.lastName?.trim()) {
    return "First name and last name are required";
  }
  if (!body.email?.trim() || !isValidStudentEmail(body.email)) {
    return "Valid email is required";
  }
  if (!body.phone?.trim() || !isValidStudentPhone(body.phone)) {
    return "Valid 10-digit phone number is required";
  }
  return null;
};

const createStudentForOrganization = async (
  body: StudentCreateInput,
  organization: IOrganization,
): Promise<IUser> => {
  const normalizedEmail = body.email!.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new Error("Email already registered. Please use a different email.");
  }

  return User.create({
    firstName: body.firstName!.trim(),
    middleName: body.middleName?.trim() || undefined,
    lastName: body.lastName!.trim(),
    gender: body.gender?.trim() || undefined,
    email: normalizedEmail,
    phone: body.phone!.trim(),
    phoneCode: body.phoneCode?.trim() || "+91",
    grade: body.grade?.trim() || undefined,
    division: body.division?.trim() || undefined,
    country: body.country?.trim() || undefined,
    state: body.state?.trim() || undefined,
    city: body.city?.trim() || undefined,
    institutionName: body.institutionName?.trim() || organization.branding?.companyName || organization.name,
    role: "STUDENT",
    organization: organization._id,
    isVerified: true,
    isActive: true,
    otpPurpose: null,
    otpAttempts: 0,
  });
};

const getKareerStudioOrganization = async () => {
  const organization = await Organization.findOne({
    slug: KAREER_STUDIO_ORG_SLUG,
    isActive: true,
    type: "WHITELABEL",
  });

  if (!organization) {
    throw new Error("Kareer Studio organization not found");
  }

  return organization;
};

export const createStudentBySuperadmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = req.body as StudentCreateInput;
    const validationError = validateStudentCreateInput(body);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const organization = await getKareerStudioOrganization();
    const user = await createStudentForOrganization(body, organization);
    await user.populate("organization");

    res.status(201).json({
      message: "Student added successfully under Kareer Studio.",
      student: {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        grade: user.grade,
        division: user.division,
        organization: user.organization
          ? {
              name: (user.organization as { name?: string }).name,
              slug: (user.organization as { slug?: string }).slug,
            }
          : null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("already registered")) {
      res.status(409).json({ message: error.message });
      return;
    }
    if (error instanceof Error && error.message.includes("Kareer Studio")) {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error("Create student by superadmin error:", error);
    res.status(500).json({ message: "Failed to add student" });
  }
};

export const bulkCreateStudentsBySuperadmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { students } = req.body as { students?: StudentCreateInput[] };
    if (!Array.isArray(students) || students.length === 0) {
      res.status(400).json({ message: "At least one student row is required" });
      return;
    }

    const organization = await getKareerStudioOrganization();
    const created: Array<{ rowNumber?: number; email: string; firstName: string; lastName: string }> = [];
    const failed: Array<{ rowNumber?: number; email?: string; message: string }> = [];

    for (let index = 0; index < students.length; index += 1) {
      const row = students[index];
      const rowNumber = typeof row.rowNumber === "number" ? row.rowNumber : index + 2;
      const validationError = validateStudentCreateInput(row);
      if (validationError) {
        failed.push({ rowNumber, email: row.email, message: validationError });
        continue;
      }

      try {
        const user = await createStudentForOrganization(row, organization);
        created.push({
          rowNumber,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      } catch (error) {
        failed.push({
          rowNumber,
          email: row.email,
          message: error instanceof Error ? error.message : "Failed to add student",
        });
      }
    }

    res.status(200).json({
      message: `Imported ${created.length} student(s). ${failed.length} row(s) failed.`,
      createdCount: created.length,
      failedCount: failed.length,
      created,
      failed,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Kareer Studio")) {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error("Bulk create students by superadmin error:", error);
    res.status(500).json({ message: "Failed to import students" });
  }
};

export const archiveStudentBySuperadmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = String(req.params.studentId || "");
    const { archived } = req.body as { archived?: boolean };
    if (typeof archived !== "boolean") {
      res.status(400).json({ message: "archived boolean is required" });
      return;
    }

    const student = await User.findOneAndUpdate(
      { _id: studentId, role: "STUDENT" },
      { $set: { isActive: !archived } },
      { new: true },
    ).populate("organization", "name slug");

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    res.json({
      message: archived ? "Student archived successfully." : "Student restored successfully.",
      student: {
        _id: student._id.toString(),
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        isActive: student.isActive,
        organization: student.organization
          ? {
              name: (student.organization as { name?: string }).name,
              slug: (student.organization as { slug?: string }).slug,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Archive student by superadmin error:", error);
    res.status(500).json({ message: "Failed to update student archive status" });
  }
};

export const archiveParentBySuperadmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parentId = String(req.params.parentId || "");
    const { archived } = req.body as { archived?: boolean };
    if (typeof archived !== "boolean") {
      res.status(400).json({ message: "archived boolean is required" });
      return;
    }

    const parent = await User.findOneAndUpdate(
      { _id: parentId, role: "PARENT" },
      { $set: { isActive: !archived } },
      { new: true },
    ).populate("organization", "name slug");

    if (!parent) {
      res.status(404).json({ message: "Parent not found" });
      return;
    }

    res.json({
      message: archived ? "Parent archived successfully." : "Parent restored successfully.",
      parent: {
        _id: parent._id.toString(),
        firstName: parent.firstName,
        lastName: parent.lastName,
        email: parent.email,
        isActive: parent.isActive,
        organization: parent.organization
          ? {
              name: (parent.organization as { name?: string }).name,
              slug: (parent.organization as { slug?: string }).slug,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Archive parent by superadmin error:", error);
    res.status(500).json({ message: "Failed to update parent archive status" });
  }
};
