"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BarChart3, CalendarClock, Sparkles } from "lucide-react";

import { apiRequest, getStoredAuth } from "@/lib/api";
import {
  allowsMultipleAttempts,
  buildStudentResultPath,
  buildStudentRetakePath,
  getAssessmentDisplayName,
  normalizeAssessmentCode,
} from "@/lib/assessmentAccess";

type StudentResultItem = {
  id: string;
  assessmentCode: string;
  assessmentName: string;
  answeredCount: number;
  totalQuestions: number;
  completedAt?: string;
  createdAt?: string;
  totalAttempts: number;
  latestScore?: number;
  latestLevel?: string;
};

type StudentResultsResponse = {
  results: StudentResultItem[];
};

const normalizeDisplayCode = (code: string) => {
  const normalized = normalizeAssessmentCode(code);
  if (normalized === "JOHARI_WINDOW") return "CLEAR";
  if (normalized === "METACOGNITION_TEST") return "TEST";
  return normalized;
};

export default function StudentResultsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const auth = useMemo(() => getStoredAuth(), []);
  const learnerLabel = auth?.user?.role === "PARENT" ? "Parent" : "Student";

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<StudentResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.token) {
      router.replace(`/whitelabel/${slug}/login`);
      return;
    }

    apiRequest<StudentResultsResponse>("/platform/student/results", {}, auth.token)
      .then((res) => { setResults(res.results || []); setError(null); })
      .catch((err) => {
        if (!getStoredAuth()) {
          router.replace(`/whitelabel/${slug}/login`);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load results");
        }
      })
      .finally(() => setLoading(false));
  }, [auth?.token, router, slug]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(null); apiRequest<StudentResultsResponse>("/platform/student/results", {}, auth?.token).then((res) => setResults(res.results || [])).catch((err) => { if (!getStoredAuth()) router.replace(`/whitelabel/${slug}/login`); else setError(err instanceof Error ? err.message : "Failed to load results"); }).finally(() => setLoading(false)); }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-blue-200/70 bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-700 p-6 md:p-8 text-white shadow-[0_28px_70px_-30px_rgba(37,99,235,0.75)]">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-cyan-300/30 blur-2xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">{learnerLabel} Dashboard</p>
            <h1 className="mt-1 text-3xl md:text-4xl font-black tracking-tight">Your Results</h1>
            <p className="mt-2 text-sm md:text-base text-blue-100/95">View all completed assessment reports in one place.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-[280px]">
            <div className="rounded-2xl border border-white/25 bg-white/15 backdrop-blur-md p-3 md:p-4">
              <div className="flex items-center gap-2 text-blue-100"><BarChart3 className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Completed</span></div>
              <p className="mt-2 text-2xl font-black">{results.length}</p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/15 backdrop-blur-md p-3 md:p-4">
              <div className="flex items-center gap-2 text-blue-100"><Sparkles className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Reports</span></div>
              <p className="mt-2 text-2xl font-black">{results.length}</p>
            </div>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-slate-600 shadow-sm">
          No completed assessments yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((result) => {
            const canViewReport = true;
            return (
              <div key={result.assessmentCode} className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_14px_30px_-22px_rgba(30,64,175,0.65)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_45px_-24px_rgba(37,99,235,0.75)]">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-100/60 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">{normalizeDisplayCode(result.assessmentCode)}</p>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                      {getAssessmentDisplayName(result.assessmentCode, result.assessmentName)}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {result.answeredCount}/{result.totalQuestions} answered
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 border border-slate-100">{result.totalAttempts} attempt{result.totalAttempts > 1 ? "s" : ""}</span>
                      {result.latestScore !== undefined && (
                        <span className="rounded-full bg-slate-50 px-2.5 py-1 border border-slate-100">Latest score: {result.latestScore}</span>
                      )}
                      {result.latestLevel && (
                        <span className="rounded-full bg-slate-50 px-2.5 py-1 border border-slate-100">{result.latestLevel}</span>
                      )}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-500 border border-slate-100">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Completed {result.completedAt ? new Date(result.completedAt).toLocaleString("en-IN") : "-"}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <button
                      onClick={() => {
                        if (!canViewReport) return;
                        router.push(
                          allowsMultipleAttempts(result.assessmentCode)
                            ? buildStudentResultPath(slug, result.assessmentCode)
                            : buildStudentResultPath(slug, result.assessmentCode, { attemptId: result.id })
                        );
                      }}
                      disabled={!canViewReport}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(37,99,235,0.9)] hover:from-blue-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {canViewReport ? "View Report" : "Report Not Available"}
                    </button>
                    {allowsMultipleAttempts(result.assessmentCode) && (
                      <button
                        onClick={() => router.push(buildStudentRetakePath(slug, result.assessmentCode))}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Retake Test
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
