"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { apiRequest, getStoredAuth } from "@/lib/api";

type StudentResultItem = {
  id: string;
  assessmentCode: string;
  assessmentName: string;
  answeredCount: number;
  totalQuestions: number;
  completedAt?: string;
  createdAt?: string;
};

type StudentResultsResponse = {
  results: StudentResultItem[];
};

const normalizeDisplayCode = (code: string) => {
  const normalized = String(code || "").toUpperCase().trim();
  if (normalized === "JOHARI_WINDOW") return "CLEAR";
  if (normalized === "METACOGNITION_TEST" || normalized === "METACOGNITION") return "TEST";
  return normalized;
};

export default function StudentResultsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const auth = useMemo(() => getStoredAuth(), []);

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<StudentResultItem[]>([]);

  useEffect(() => {
    if (!auth?.token) {
      router.replace(`/whitelabel/${slug}/login`);
      return;
    }

    apiRequest<StudentResultsResponse>("/platform/student/results", {}, auth.token)
      .then((res) => setResults(res.results || []))
      .catch(() => router.replace(`/whitelabel/${slug}/login`))
      .finally(() => setLoading(false));
  }, [auth?.token, router, slug]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Results</h1>
        <p className="mt-1 text-sm text-slate-600">View all completed assessment reports.</p>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-600">
          No completed assessments yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {results.map((result) => {
            const canViewReport = result.assessmentCode !== "CAREER_DNA";
            return (
              <div key={result.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{normalizeDisplayCode(result.assessmentCode)}</p>
                    <h3 className="text-lg font-bold text-slate-900">{result.assessmentName}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {result.answeredCount}/{result.totalQuestions} answered
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Completed {result.completedAt ? new Date(result.completedAt).toLocaleString("en-IN") : "—"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (!canViewReport) return;
                      router.push(`/whitelabel/${slug}/student/assessments/${result.assessmentCode}/result?attemptId=${result.id}`);
                    }}
                    disabled={!canViewReport}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {canViewReport ? "View Report" : "Report Not Available"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
