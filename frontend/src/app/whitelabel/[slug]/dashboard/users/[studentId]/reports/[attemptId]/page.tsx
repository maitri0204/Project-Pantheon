"use client";

import { useParams } from "next/navigation";

import AssessmentReportView from "@/components/reports/AssessmentReportView";

export default function WhitelabelDashboardStudentReportPage() {
  const params = useParams<{ slug: string; studentId: string; attemptId: string }>();
  const slug = params?.slug || "";
  const studentId = params?.studentId || "";
  const attemptId = params?.attemptId || "";

  return (
    <AssessmentReportView
      fetchPath={`/platform/students/${studentId}/attempts/${attemptId}/report`}
      loginHref={`/whitelabel/${slug}/login`}
      topBackHref={`/whitelabel/${slug}/dashboard/users/${studentId}`}
      topBackLabel="Back to Student Details"
      bottomBackHref={`/whitelabel/${slug}/dashboard/users/${studentId}`}
      bottomBackLabel="Back to Student Details"
    />
  );
}
