"use client";

import { useParams } from "next/navigation";

import AssessmentReportView from "@/components/reports/AssessmentReportView";

export default function DashboardParentReportPage() {
  const params = useParams<{ parentId: string; attemptId: string }>();
  const parentId = params?.parentId || "";
  const attemptId = params?.attemptId || "";
  const parentsBasePath = "/dashboard/parents";

  return (
    <AssessmentReportView
      fetchPath={`/platform/parents/${parentId}/attempts/${attemptId}/report`}
      loginHref="/login"
      topBackHref={`${parentsBasePath}/${parentId}`}
      topBackLabel="Back to Parent Details"
      bottomBackHref={`${parentsBasePath}/${parentId}`}
      bottomBackLabel="Back to Parent Details"
    />
  );
}
