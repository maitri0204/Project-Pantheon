"use client";

import { useParams } from "next/navigation";

import AssessmentReportView from "@/components/reports/AssessmentReportView";

export default function WhitelabelDashboardParentReportPage() {
  const params = useParams<{ slug: string; parentId: string; attemptId: string }>();
  const slug = params?.slug || "";
  const parentId = params?.parentId || "";
  const attemptId = params?.attemptId || "";
  const parentsBasePath = `/whitelabel/${slug}/dashboard/parents`;

  return (
    <AssessmentReportView
      fetchPath={`/platform/parents/${parentId}/attempts/${attemptId}/report`}
      loginHref={`/whitelabel/${slug}/login`}
      topBackHref={`${parentsBasePath}/${parentId}`}
      topBackLabel="Back to Parent Details"
      bottomBackHref={`${parentsBasePath}/${parentId}`}
      bottomBackLabel="Back to Parent Details"
    />
  );
}
