"use client";

import { useParams } from "next/navigation";

import AssessmentReportView from "@/components/reports/AssessmentReportView";

export default function DashboardStudentReportPage() {
  const params = useParams<{ studentId: string; attemptId: string }>();
  const studentId = params?.studentId || "";
  const attemptId = params?.attemptId || "";

  return (
    <AssessmentReportView
      fetchPath={`/platform/students/${studentId}/attempts/${attemptId}/report`}
      loginHref="/login"
      topBackHref={`/dashboard/users/${studentId}`}
      topBackLabel="Back to Student Details"
      bottomBackHref={`/dashboard/users/${studentId}`}
      bottomBackLabel="Back to Student Details"
    />
  );
}
