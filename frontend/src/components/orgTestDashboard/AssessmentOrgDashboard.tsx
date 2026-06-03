"use client";

import AcademicCareerOrgDashboard from "@/components/orgTestDashboard/dashboards/AcademicCareerOrgDashboard";
import AdversityOrgDashboard from "@/components/orgTestDashboard/dashboards/AdversityOrgDashboard";
import EnhancedOrgTestDashboard from "@/components/orgTestDashboard/EnhancedOrgTestDashboard";
import { ENHANCED_ORG_DASHBOARD_CODES } from "@/components/orgTestDashboard/testDashboardUiConfig";
import { normalizeAssessmentCode } from "@/lib/assessmentAccess";

type AssessmentOrgDashboardProps = {
  assessmentCode: string;
  orgDashboardBasePath: string;
  loginPath: string;
};

export default function AssessmentOrgDashboard({
  assessmentCode,
  orgDashboardBasePath,
  loginPath,
}: AssessmentOrgDashboardProps) {
  const code = normalizeAssessmentCode(assessmentCode);
  const studentsPath = `${orgDashboardBasePath}/users`;

  if (code === "ACADEMIC_CAREER") {
    return <AcademicCareerOrgDashboard studentsPath={studentsPath} loginPath={loginPath} />;
  }

  if (code === "ADVERSITY_TEST") {
    return <AdversityOrgDashboard studentsPath={studentsPath} loginPath={loginPath} />;
  }

  if (ENHANCED_ORG_DASHBOARD_CODES.includes(code)) {
    return (
      <EnhancedOrgTestDashboard
        assessmentCode={code}
        studentsPath={studentsPath}
        loginPath={loginPath}
      />
    );
  }

  return <p className="text-sm text-rose-600">No dashboard available for this assessment.</p>;
}
