"use client";

import { useParams, useSearchParams } from "next/navigation";

import AssessmentReportView from "@/components/reports/AssessmentReportView";

export default function StudentAssessmentResultPage() {
  const params = useParams<{ slug?: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug || "";
  const attemptId = searchParams?.get("attemptId") || "";
  return (
    <AssessmentReportView
      fetchPath={`/platform/student/attempts/${attemptId}/report`}
      loginHref={`/whitelabel/${slug}/login`}
      topBackHref={`/whitelabel/${slug}/student/results`}
      topBackLabel="Back to Results"
      bottomBackHref={`/whitelabel/${slug}/student/assessments`}
      bottomBackLabel="Back to Assessments"
    />
  );
}
