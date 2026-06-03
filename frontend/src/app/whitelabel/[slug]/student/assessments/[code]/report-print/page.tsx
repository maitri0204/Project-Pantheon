"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import StudyAbroadPremiumPrintReport from "@/components/reports/StudyAbroadPremiumPrintReport";
import { getStoredAuth } from "@/lib/api";
import { fetchStudyAbroadPrintContext } from "@/lib/studyAbroad/printReportData";

export default function StudyAbroadReportPrintPage() {
  const params = useParams<{ slug?: string; code?: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = String(params?.slug ?? "");
  const code = String(params?.code ?? "").toUpperCase();
  const attemptId = searchParams?.get("attemptId")?.trim() ?? "";
  const auth = useMemo(() => getStoredAuth(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printContext, setPrintContext] = useState<Awaited<ReturnType<typeof fetchStudyAbroadPrintContext>> | null>(null);

  useEffect(() => {
    if (!auth?.token) {
      router.replace(`/whitelabel/${slug}/login`);
      return;
    }
    if (!attemptId) {
      setError("Missing attempt ID");
      setLoading(false);
      return;
    }
    if (code !== "STUDY_ABROAD") {
      setError("Print report is only available for Study Abroad assessments");
      setLoading(false);
      return;
    }

    void fetchStudyAbroadPrintContext(auth.token, attemptId)
      .then(setPrintContext)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load report");
      })
      .finally(() => setLoading(false));
  }, [attemptId, auth?.token, code, router, slug]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#64748b", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "3px solid #c4b5fd", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "sa-report-spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 14 }}>Preparing your premium report…</p>
        </div>
      </div>
    );
  }

  if (error || !printContext) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#64748b", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Unable to load report</p>
          <p style={{ fontSize: 14 }}>{error ?? "Report data is unavailable."}</p>
        </div>
      </div>
    );
  }

  const backHref = `/whitelabel/${slug}/student/assessments/${code}/result?attemptId=${attemptId}`;

  return (
    <StudyAbroadPremiumPrintReport
      result={printContext.result}
      history={printContext.history}
      studentName={printContext.studentName}
      profile={printContext.profile}
      showToolbar
      backHref={backHref}
    />
  );
}
