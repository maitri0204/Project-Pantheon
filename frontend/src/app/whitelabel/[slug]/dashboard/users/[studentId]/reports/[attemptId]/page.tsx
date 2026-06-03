"use client";

import { useParams, useSearchParams } from "next/navigation";

import AssessmentReportView from "@/components/reports/AssessmentReportView";
import {
  allowsMultipleAttempts,
  buildOrgAttemptListPath,
  normalizeAssessmentCode,
} from "@/lib/assessmentAccess";

export default function WhitelabelDashboardStudentReportPage() {
  const params = useParams<{ slug: string; studentId: string; attemptId: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug || "";
  const studentId = params?.studentId || "";
  const attemptId = params?.attemptId || "";
  const usersBasePath = `/whitelabel/${slug}/dashboard/users`;
  const assessmentCode = normalizeAssessmentCode(searchParams?.get("assessmentCode") || "");
  const isMulti = assessmentCode && allowsMultipleAttempts(assessmentCode);
  const topBackHref = isMulti
    ? buildOrgAttemptListPath(usersBasePath, studentId, assessmentCode)
    : `${usersBasePath}/${studentId}`;

  return (
    <AssessmentReportView
      fetchPath={`/platform/students/${studentId}/attempts/${attemptId}/report`}
      loginHref={`/whitelabel/${slug}/login`}
      topBackHref={topBackHref}
      topBackLabel={isMulti ? "Back to Attempts" : "Back to Student Details"}
      bottomBackHref={`${usersBasePath}/${studentId}`}
      bottomBackLabel="Back to Student Details"
    />
  );
}
