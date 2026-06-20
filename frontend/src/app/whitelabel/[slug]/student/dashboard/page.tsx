"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { apiRequest, getStoredAuth } from "@/lib/api";

type StudentDashboardResponse = {
  stats: {
    appeared: number;
    completed: number;
    pending: number;
    totalAssessments: number;
  };
  latestAttempts: Array<{
    id: string;
    assessmentCode: string;
    assessmentName: string;
    status: "IN_PROGRESS" | "COMPLETED";
    answeredCount: number;
    totalQuestions: number;
    updatedAt: string;
  }>;
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const auth = useMemo(() => getStoredAuth(), []);
  const learnerLabel = auth?.user?.role === "PARENT" ? "Parent" : "Student";
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.user) {
      router.replace(`/whitelabel/${slug}/login`);
      return;
    }

    apiRequest<StudentDashboardResponse>("/platform/student/dashboard", {})
      .then((res) => { setData(res); setError(null); })
      .catch((err) => {
        // getStoredAuth returns null only when apiRequest cleared it (on 401)
        if (!getStoredAuth()) {
          router.replace(`/whitelabel/${slug}/login`);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      })
      .finally(() => setLoading(false));
  }, [auth?.user, router, slug]);

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
          onClick={() => { setLoading(true); setError(null); apiRequest<StudentDashboardResponse>("/platform/student/dashboard", {}).then((res) => { setData(res); }).catch((err) => { setError(err instanceof Error ? err.message : "Failed to load dashboard"); }).finally(() => setLoading(false)); }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = data?.stats || { appeared: 0, completed: 0, pending: 0, totalAssessments: 0 };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">{learnerLabel} Dashboard</h1>
        <p className="mt-1 text-blue-100">Track your test progress and start pending assessments.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-black">Tests Appeared</p>
          <p className="mt-1 text-3xl font-bold text-black">{stats.appeared}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-black">Tests Completed</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{stats.completed}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-black">Tests Pending</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{stats.pending}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Latest Activity</h2>
          <Link
            href={`/whitelabel/${slug}/student/assessments`}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to Assessments
          </Link>
        </div>

        {!data?.latestAttempts?.length ? (
          <p className="text-sm text-black">No test attempts yet. Start your first assessment.</p>
        ) : (
          <div className="space-y-2">
            {data.latestAttempts.map((attempt) => {
              const normalizeCode = (code: string) => {
                const normalized = String(code || "").toUpperCase().trim();
                if (normalized === "JOHARI_WINDOW") return "CLEAR";
                if (normalized === "METACOGNITION_TEST" || normalized === "METACOGNITION") return "TEST";
                return normalized;
              };
              return (
              <div key={attempt.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-black">{attempt.assessmentName}</p>
                    <p className="text-xs text-black">{normalizeCode(attempt.assessmentCode)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${attempt.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {attempt.status === "COMPLETED" ? "Completed" : "In Progress"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-black">
                  {attempt.answeredCount}/{attempt.totalQuestions} answered
                </p>
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
