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
  REVIEWER_EMAIL,
  REVIEWER_NAME,
  PLATFORM_ORG_NAME,
  PLATFORM_ORG_SLUG,
} from "../constants/platform";
import { ADVERSITY_TEST_QUESTIONS } from "../scripts/seedAdversityQuestions";

/** Assessments that allow multiple completed attempts per student - never merge/delete during alias migration. */
const MULTI_ATTEMPT_ASSESSMENT_CODES = new Set(["RESILIENCE_TEST", "STUDY_ABROAD", "EMPLOYABILITY_QUOTIENT"]);

const LEGACY_ASSESSMENT_ALIASES: Array<{ alias: string; canonical: string; canonicalName: string }> = [
  {
    alias: "CLEAR",
    canonical: "JOHARI_WINDOW",
    canonicalName: "CLEAR - Cognitive Lens for Emotional Awareness & Reflection",
  },
  {
    alias: "JOHARI",
    canonical: "JOHARI_WINDOW",
    canonicalName: "CLEAR - Cognitive Lens for Emotional Awareness & Reflection",
  },
  {
    alias: "METACOGNITION",
    canonical: "METACOGNITION_TEST",
    canonicalName: "TEST - Thinking & Expression Skills Test",
  },
  {
    alias: "ADVERSITY_TEST",
    canonical: "RESILIENCE_TEST",
    canonicalName: "Resilience Quotient (RQ) Assessment",
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

/** Rename every legacy attempt to the canonical code (preserves all rows). */
const renameLegacyAttempts = async (alias: string, canonical: string, canonicalName: string) => {
  await StudentAssessmentAttempt.updateMany(
    { assessmentCode: alias },
    { $set: { assessmentCode: canonical, assessmentName: canonicalName } },
  );
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

    if (MULTI_ATTEMPT_ASSESSMENT_CODES.has(canonical)) {
      await renameLegacyAttempts(alias, canonical, canonicalName);
    } else {
      await mergeLegacyAttempts(alias, canonical, canonicalName);
    }

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

  await User.findOneAndUpdate(
    { email: REVIEWER_EMAIL },
    {
      $setOnInsert: {
        firstName: REVIEWER_NAME,
        lastName: "Admitra",
        email: REVIEWER_EMAIL,
        isVerified: true,
      },
      $set: {
        role: "REVIEWER",
        organization: organization._id,
        isActive: true,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  for (const assessment of DEFAULT_ASSESSMENTS) {
    const setOnInsert: Record<string, unknown> = {
      basePrice: assessment.basePrice,
      gstEnabled: false,
      gstPercentage: 18,
    };
    if (assessment.code === "CAREER_COMPASS") {
      setOnInsert.releaseDate = new Date("2026-07-02T00:00:00+05:30");
    }

    const {
      basePrice: _defaultBasePrice,
      ...assessmentMetadata
    } = assessment;

    await Assessment.findOneAndUpdate(
      { code: assessment.code },
      {
        $set: {
          ...assessmentMetadata,
          active: true,
          currency: "INR",
        },
        $setOnInsert: setOnInsert,
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  // Seed RQ assessment questions if not already present
  const resilienceQuestionCount = await Question.countDocuments({
    assessmentCode: { $in: ["RESILIENCE_TEST", "ADVERSITY_TEST"] },
  });

  if (resilienceQuestionCount === 0) {
    await Question.insertMany(ADVERSITY_TEST_QUESTIONS);
    console.log("✅ Resilience Quotient (RQ) questions seeded successfully");
  }

  await cleanupLegacyAssessmentAliases();
};
