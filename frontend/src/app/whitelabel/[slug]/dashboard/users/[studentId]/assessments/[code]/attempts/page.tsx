"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import AssessmentAttemptHistoryView from "@/components/dashboard/AssessmentAttemptHistoryView";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { buildOrgReportPath, getAssessmentDisplayName, normalizeAssessmentCode } from "@/lib/assessmentAccess";

type AttemptMetaResponse = {
  attempts: Array<{ assessmentName: string }>;
};

export default function WhitelabelOrgStudentAttemptListPage() {
  const params = useParams<{ slug: string; studentId: string; code: string }>();
  const slug = params?.slug || "";
  const studentId = params?.studentId || "";
  const code = normalizeAssessmentCode(String(params?.code || ""));
  const usersBasePath = `/whitelabel/${slug}/dashboard/users`;
  const [assessmentName, setAssessmentName] = useState(code);
  const auth = useMemo(() => getStoredAuth(), []);

  useEffect(() => {
    if (!auth?.token || !studentId || !code) return;
    apiRequest<AttemptMetaResponse>(
      `/platform/students/${studentId}/assessments/${code}/attempts`,
      {},
      auth.token,
    )
      .then((res) => {
        const latest = res.attempts?.[res.attempts.length - 1];
        if (latest) {
          setAssessmentName(getAssessmentDisplayName(code, latest.assessmentName));
        }
      })
      .catch(() => undefined);
  }, [auth?.token, studentId, code]);

  return (
    <AssessmentAttemptHistoryView
      fetchPath={`/platform/students/${studentId}/assessments/${code}/attempts`}
      loginHref={`/whitelabel/${slug}/login`}
      assessmentCode={code}
      assessmentName={assessmentName}
      topBackHref={`${usersBasePath}/${studentId}`}
      topBackLabel="Back to Student Details"
      bottomBackHref={`${usersBasePath}/${studentId}`}
      bottomBackLabel="Back to Student Details"
      buildReportHref={(attemptId) => buildOrgReportPath(usersBasePath, studentId, attemptId, code)}
    />
  );
}
