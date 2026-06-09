"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, Mail, Phone, School, ShieldCheck } from "lucide-react";

import { apiRequest, getStoredAuth } from "@/lib/api";

type ParentResultItem = {
  attemptId: string;
  assessmentCode: string;
  assessmentName: string;
  answeredCount: number;
  totalQuestions: number;
  submittedAt?: string;
  createdAt?: string;
};

type ParentDetailsResponse = {
  parent: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    phoneCode?: string;
    isVerified: boolean;
    createdAt?: string;
    testsTaken?: number;
    organization?: { name: string; slug: string } | null;
  };
  attempts: ParentResultItem[];
};

type ParentDetailViewProps = {
  parentId: string;
  basePath: string;
  loginPath: string;
};

const normalizeDisplayCode = (code: string) => {
  const normalized = String(code || "").toUpperCase().trim();
  if (normalized === "JOHARI_WINDOW") return "CLEAR";
  if (normalized === "METACOGNITION_TEST" || normalized === "METACOGNITION") return "TEST";
  return normalized;
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN");
};

export default function ParentDetailView({ parentId, basePath, loginPath }: ParentDetailViewProps) {
  const router = useRouter();
  const auth = useMemo(() => getStoredAuth(), []);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ParentDetailsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.token) {
      router.replace(loginPath);
      return;
    }

    apiRequest<ParentDetailsResponse>(`/platform/parents/${parentId}`, {}, auth.token)
      .then((res) => setData(res))
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load parent details"))
      .finally(() => setLoading(false));
  }, [auth?.token, loginPath, router, parentId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.replace(basePath)} className="inline-flex items-center gap-2 text-sm text-black hover:text-black">
          <ArrowLeft className="h-4 w-4" /> Back to Parents
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Parent not found."}</div>
      </div>
    );
  }

  const { parent, attempts } = data;

  return (
    <div className="mx-auto max-w-6xl space-y-6 min-w-0">
      <button onClick={() => router.replace(basePath)} className="inline-flex items-center gap-2 text-sm text-black hover:text-black">
        <ArrowLeft className="h-4 w-4" /> Back to Parents
      </button>

      <div className="rounded-3xl border border-blue-200/70 bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-700 p-6 text-white shadow-[0_28px_70px_-30px_rgba(37,99,235,0.75)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">Parent Profile</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{parent.firstName} {parent.lastName}</h1>
            <p className="mt-2 flex flex-col gap-1 text-sm text-blue-100 sm:flex-row sm:items-center sm:gap-2">
              <span className="inline-flex min-w-0 items-center gap-2 break-all"><Mail className="h-4 w-4 shrink-0" /> {parent.email}</span>
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-blue-100"><Phone className="h-4 w-4 shrink-0" /> {`${parent.phoneCode || ""}${parent.phone || ""}`.trim() || "—"}</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:max-w-sm md:w-auto md:max-w-none">
            <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Tests Taken</p>
              <p className="mt-2 text-2xl font-black">{parent.testsTaken ?? attempts.length}</p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Status</p>
              <p className="mt-2 text-lg font-black">{parent.isVerified ? "Verified" : "Pending"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-black"><School className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Organization</span></div>
          <p className="mt-2 break-words text-base font-semibold text-black">{parent.organization?.name || "—"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-black"><ShieldCheck className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Joined</span></div>
          <p className="mt-2 text-base font-semibold text-black">{formatDateTime(parent.createdAt)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-black"><Phone className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Phone</span></div>
          <p className="mt-2 text-base font-semibold text-black">{`${parent.phoneCode || ""}${parent.phone || ""}`.trim() || "—"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-black">Completed Assessments</h2>
            <p className="text-sm text-black">All assessments completed by this parent.</p>
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-black">No completed assessments yet.</div>
        ) : (
          <div className="grid gap-4 p-4">
            {attempts.map((result) => (
              <div key={String(result.attemptId)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">{normalizeDisplayCode(result.assessmentCode)}</p>
                    <h3 className="mt-1 text-lg font-bold text-black">{result.assessmentName}</h3>
                    <p className="mt-1 text-sm text-black">{result.answeredCount}/{result.totalQuestions} answered</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-black border border-slate-200">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Completed {formatDateTime(result.submittedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`${basePath}/${parentId}/reports/${result.attemptId}`)}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-600 sm:w-auto"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
