"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { apiRequest, getStoredAuth } from "@/lib/api";
import AttemptHistoryResultSummary from "@/components/assessment/AttemptHistoryResultSummary";
import {
  formatAttemptHistoryResult,
  type AttemptHistoryEvaluation,
} from "@/lib/assessmentAccess";

export type AttemptHistoryItem = {
  attemptId: string;
  assessmentCode: string;
  assessmentName: string;
  completedAt?: string;
  evaluation?: AttemptHistoryEvaluation;
  attemptNumber: number;
};

type AttemptHistoryResponse = {
  attempts: AttemptHistoryItem[];
};

type AssessmentAttemptHistoryViewProps = {
  fetchPath: string;
  loginHref: string;
  assessmentCode: string;
  assessmentName: string;
  topBackHref: string;
  topBackLabel: string;
  bottomBackHref: string;
  bottomBackLabel: string;
  buildReportHref: (attemptId: string) => string;
};

export default function AssessmentAttemptHistoryView({
  fetchPath,
  loginHref,
  assessmentCode,
  assessmentName,
  topBackHref,
  topBackLabel,
  bottomBackHref,
  bottomBackLabel,
  buildReportHref,
}: AssessmentAttemptHistoryViewProps) {
  const router = useRouter();
  const auth = useMemo(() => getStoredAuth(), []);
  const [attempts, setAttempts] = useState<AttemptHistoryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttempts = async () => {
    if (!auth?.user) {
      router.replace(loginHref);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<AttemptHistoryResponse>(fetchPath, {});
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
  }, [auth?.user, fetchPath]);

  return (
    <div className="min-w-0 space-y-5">
      <button
        type="button"
        onClick={() => router.replace(topBackHref)}
        className="inline-flex items-center gap-2 text-sm text-black hover:text-black"
      >
        ← {topBackLabel}
      </button>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="break-words text-xl font-bold text-black sm:text-2xl">{assessmentName}</h1>
        <p className="mt-2 text-sm text-black">
          Select a past attempt to view the full report for this student.
        </p>
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
              type="button"
              onClick={fetchAttempts}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : !attempts || attempts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-black">
            No completed attempts found for this assessment.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {attempts.map((attempt) => {
              const resultDisplay = formatAttemptHistoryResult(assessmentCode, attempt.evaluation);

              return (
                <button
                  key={attempt.attemptId}
                  type="button"
                  onClick={() => router.push(buildReportHref(attempt.attemptId))}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-blue-300 hover:bg-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-black">Attempt {attempt.attemptNumber}</p>
                      <p className="mt-1 text-xs text-black">
                        {attempt.completedAt
                          ? new Date(attempt.completedAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Not submitted yet"}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-black">
                      View report
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <AttemptHistoryResultSummary result={resultDisplay} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => router.push(bottomBackHref)}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-slate-50"
        >
          {bottomBackLabel}
        </button>
      </div>
    </div>
  );
}
