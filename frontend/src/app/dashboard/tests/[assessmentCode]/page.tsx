"use client";

import { useParams } from "next/navigation";

import AssessmentOrgDashboard from "@/components/orgTestDashboard/AssessmentOrgDashboard";
import { normalizeAssessmentCode } from "@/lib/assessmentAccess";

export default function SuperadminTestDashboardPage() {
  const params = useParams();
  const assessmentCode =
    typeof params?.assessmentCode === "string"
      ? normalizeAssessmentCode(params.assessmentCode)
      : "";

  return (
    <AssessmentOrgDashboard
      assessmentCode={assessmentCode}
      orgDashboardBasePath="/dashboard"
      loginPath="/login"
    />
  );
}
