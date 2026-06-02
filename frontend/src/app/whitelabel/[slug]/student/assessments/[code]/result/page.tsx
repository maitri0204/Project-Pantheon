"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import AssessmentReportView from "@/components/reports/AssessmentReportView";
import { apiRequest, getStoredAuth } from "@/lib/api";

type AttemptHistoryItem = {
  attemptId: string;
  assessmentCode: string;
  assessmentName: string;
  completedAt?: string;
  evaluation?: {
    totalScore?: number;
    overallPercentage?: number;
    aqLevel?: string;
    grade?: string;
  };
  attemptNumber: number;
};

type AttemptHistoryResponse = {
  attempts: AttemptHistoryItem[];
};

function AssessmentAttemptHistory(props: {
  slug: string;
  assessmentCode: string;
  assessmentName: string;
  loginHref: string;
  topBackHref: string;
  topBackLabel: string;
  bottomBackHref: string;
  bottomBackLabel: string;
}) {
  const { slug, assessmentCode, assessmentName, loginHref, topBackHref, topBackLabel, bottomBackHref, bottomBackLabel } = props;
  const router = useRouter();
  const auth = useMemo(() => getStoredAuth(), []);
  const [attempts, setAttempts] = useState<AttemptHistoryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttempts = async () => {
    if (!auth?.token) {
      router.replace(loginHref);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<AttemptHistoryResponse>(`/platform/student/assessments/${assessmentCode}/attempts`, {}, auth.token);
      setAttempts(response.attempts || []);
    } catch (err) {
      if (!getStoredAuth()) {
        router.replace(loginHref);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load attempt history");
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, assessmentCode]);

  return (
    <div className="space-y-5">
      <button onClick={() => router.replace(topBackHref)} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        ← {topBackLabel}
      </button>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{assessmentName}</h1>
        <p className="mt-2 text-sm text-slate-600">Select a past attempt to view the full report, download, or email that score.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : error ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-rose-600">{error}</p>
            <button
              onClick={fetchAttempts}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : !attempts || attempts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">No completed attempts found for this assessment.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {attempts.map((attempt) => {
              const score = attempt.evaluation?.totalScore;

              return (
                <button
                  key={attempt.attemptId}
                  onClick={() => router.push(`/whitelabel/${slug}/student/assessments/${assessmentCode}/result?attemptId=${attempt.attemptId}`)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-blue-300 hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Attempt {attempt.attemptNumber}</p>
                      <p className="text-xs text-slate-500 mt-1">{attempt.completedAt ? new Date(attempt.completedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not submitted yet"}</p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                      View report
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Score</span>
                      <span className="font-semibold text-slate-900">{score !== undefined ? score : "—"}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => router.push(bottomBackHref)}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {bottomBackLabel}
        </button>
      </div>
    </div>
  );
}

export default function StudentAssessmentResultPage() {
  const params = useParams<{ slug?: string; code?: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug || "";
  const code = String(params?.code || "").toUpperCase();
  const attemptId = searchParams?.get("attemptId") || "";

  if (!attemptId) {
    return (
      <AssessmentAttemptHistory
        slug={slug}
        assessmentCode={code}
        assessmentName={code}
        loginHref={`/whitelabel/${slug}/login`}
        topBackHref={`/whitelabel/${slug}/student/results`}
        topBackLabel="Back to Results"
        bottomBackHref={`/whitelabel/${slug}/student/assessments`}
        bottomBackLabel="Back to Assessments"
      />
    );
  }

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
