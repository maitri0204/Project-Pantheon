import Assessment from "../models/Assessment";
import Organization from "../models/Organization";
import User from "../models/User";
import {
  DEFAULT_ASSESSMENTS,
  DEFAULT_SUPERADMIN_EMAIL,
  DEFAULT_SUPERADMIN_NAME,
  PLATFORM_ORG_NAME,
  PLATFORM_ORG_SLUG,
} from "../constants/platform";

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
};
