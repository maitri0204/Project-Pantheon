"use client";

import { useParams } from "next/navigation";

import AssessmentOrgDashboard from "@/components/orgTestDashboard/AssessmentOrgDashboard";
import { normalizeAssessmentCode } from "@/lib/assessmentAccess";

export default function WhitelabelTestDashboardHomePage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const assessmentCode =
    typeof params?.assessmentCode === "string"
      ? normalizeAssessmentCode(params.assessmentCode)
      : "";
  const orgDashboardBasePath = `/whitelabel/${slug}/dashboard`;
  const loginPath = `/whitelabel/${slug}/login`;

  return (
    <AssessmentOrgDashboard
      assessmentCode={assessmentCode}
      orgDashboardBasePath={orgDashboardBasePath}
      loginPath={loginPath}
      organizationSlug={slug}
    />
  );
}
