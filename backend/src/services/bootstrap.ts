import Assessment from "../models/Assessment";
import Coupon from "../models/Coupon";
import Invoice from "../models/Invoice";
import Organization from "../models/Organization";
import Question from "../models/Question";
import StudentAssessmentAttempt from "../models/StudentAssessmentAttempt";
import User from "../models/User";
import {
  DEFAULT_ASSESSMENTS,
  DEFAULT_SUPERADMIN_EMAIL,
  DEFAULT_SUPERADMIN_NAME,
  PLATFORM_ORG_NAME,
  PLATFORM_ORG_SLUG,
} from "../constants/platform";

const LEGACY_ASSESSMENT_ALIASES: Array<{ alias: string; canonical: string; canonicalName: string }> = [
  {
    alias: "CLEAR",
    canonical: "JOHARI_WINDOW",
    canonicalName: "CLEAR – Cognitive Lens for Emotional Awareness & Reflection",
  },
  {
    alias: "JOHARI",
    canonical: "JOHARI_WINDOW",
    canonicalName: "CLEAR – Cognitive Lens for Emotional Awareness & Reflection",
  },
  {
    alias: "METACOGNITION",
    canonical: "METACOGNITION_TEST",
    canonicalName: "TEST - Thinking & Expression Skills Test",
  },
];

const pickAttemptWinner = (
  a: { status: string; answeredCount: number; updatedAt: Date },
  b: { status: string; answeredCount: number; updatedAt: Date }
) => {
  if (a.status === "COMPLETED" && b.status !== "COMPLETED") return a;
  if (b.status === "COMPLETED" && a.status !== "COMPLETED") return b;
  if (a.answeredCount !== b.answeredCount) return a.answeredCount > b.answeredCount ? a : b;
  return new Date(a.updatedAt).getTime() >= new Date(b.updatedAt).getTime() ? a : b;
};

const mergeLegacyAttempts = async (alias: string, canonical: string, canonicalName: string) => {
  const aliasAttempts = await StudentAssessmentAttempt.find({ assessmentCode: alias });

  for (const aliasAttempt of aliasAttempts) {
    const canonicalAttempt = await StudentAssessmentAttempt.findOne({
      user: aliasAttempt.user,
      assessmentCode: canonical,
    });

    if (!canonicalAttempt) {
      aliasAttempt.assessmentCode = canonical;
      aliasAttempt.assessmentName = canonicalName;
      await aliasAttempt.save();
      continue;
    }

    const winner = pickAttemptWinner(aliasAttempt, canonicalAttempt);
    if (winner === aliasAttempt) {
      await StudentAssessmentAttempt.deleteOne({ _id: canonicalAttempt._id });
      aliasAttempt.assessmentCode = canonical;
      aliasAttempt.assessmentName = canonicalName;
      await aliasAttempt.save();
      continue;
    }

    canonicalAttempt.assessmentName = canonicalName;
    await canonicalAttempt.save();
    await StudentAssessmentAttempt.deleteOne({ _id: aliasAttempt._id });
  }
};

const mergeLegacyQuestions = async (alias: string, canonical: string) => {
  const aliasQuestions = await Question.find({ assessmentCode: alias });

  for (const aliasQuestion of aliasQuestions) {
    const canonicalQuestion = await Question.findOne({
      assessmentCode: canonical,
      category: aliasQuestion.category,
      questionNumber: aliasQuestion.questionNumber,
    });

    if (!canonicalQuestion) {
      aliasQuestion.assessmentCode = canonical;
      await aliasQuestion.save();
      continue;
    }

    const canonicalHasOptions = Array.isArray(canonicalQuestion.options) && canonicalQuestion.options.length > 0;
    const aliasHasOptions = Array.isArray(aliasQuestion.options) && aliasQuestion.options.length > 0;

    if (!canonicalQuestion.questionText && aliasQuestion.questionText) {
      canonicalQuestion.questionText = aliasQuestion.questionText;
    }
    if (!canonicalHasOptions && aliasHasOptions) {
      canonicalQuestion.options = aliasQuestion.options;
    }

    await canonicalQuestion.save();
    await Question.deleteOne({ _id: aliasQuestion._id });
  }
};

const cleanupLegacyAssessmentAliases = async () => {
  for (const { alias, canonical, canonicalName } of LEGACY_ASSESSMENT_ALIASES) {
    await mergeLegacyQuestions(alias, canonical);
    await Invoice.updateMany({ assessmentCode: alias }, { $set: { assessmentCode: canonical } });

    await mergeLegacyAttempts(alias, canonical, canonicalName);

    const coupons = await Coupon.find({ applicableAssessmentCodes: alias });
    for (const coupon of coupons) {
      const normalizedCodes = coupon.applicableAssessmentCodes
        .map((code) => (code === alias ? canonical : code))
        .filter((code, index, all) => all.indexOf(code) === index);
      coupon.applicableAssessmentCodes = normalizedCodes;
      await coupon.save();
    }

    await Assessment.deleteMany({ code: alias });
  }
};

export const bootstrapPlatform = async (): Promise<void> => {
  const organization = await Organization.findOneAndUpdate(
    { slug: PLATFORM_ORG_SLUG },
    {
      $set: {
        name: PLATFORM_ORG_NAME,
        type: "PLATFORM",
        isActive: true,
        branding: {
          companyName: PLATFORM_ORG_NAME,
          primaryColor: "#2563eb",
          accentColor: "#06b6d4",
        },
        settings: {
          allowSelfSignup: true,
          assessmentCatalogVisible: true,
        },
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  await User.findOneAndUpdate(
    { email: DEFAULT_SUPERADMIN_EMAIL },
    {
      $setOnInsert: {
        firstName: DEFAULT_SUPERADMIN_NAME.split(" ")[0],
        lastName: DEFAULT_SUPERADMIN_NAME.split(" ").slice(1).join(" ") || "Superadmin",
        email: DEFAULT_SUPERADMIN_EMAIL,
        isVerified: true,
      },
      $set: {
        role: "SUPERADMIN",
        organization: organization._id,
        isActive: true,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  for (const assessment of DEFAULT_ASSESSMENTS) {
    await Assessment.findOneAndUpdate(
      { code: assessment.code },
      {
        $set: {
          ...assessment,
          active: true,
          currency: "INR",
        },
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  await cleanupLegacyAssessmentAliases();
};
