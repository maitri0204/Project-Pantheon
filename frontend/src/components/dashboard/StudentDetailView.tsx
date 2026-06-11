"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, GraduationCap, Mail, Phone, School, ShieldCheck } from "lucide-react";

import { apiRequest, getStoredAuth } from "@/lib/api";
import {
  allowsMultipleAttempts,
  buildOrgAttemptListPath,
  normalizeAssessmentCode,
  type AttemptHistoryEvaluation,
} from "@/lib/assessmentAccess";

type StudentResultItem = {
  id: string;
  assessmentCode: string;
  assessmentName: string;
  answeredCount: number;
  totalQuestions: number;
  completedAt?: string;
  createdAt?: string;
  attemptNumber?: number;
  allowsMultipleAttempts?: boolean;
  evaluation?: AttemptHistoryEvaluation;
};

type AssessmentResultGroup = {
  assessmentCode: string;
  assessmentName: string;
  attempts: StudentResultItem[];
};

type StudentDetailsResponse = {
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    phoneCode?: string;
    grade?: string;
    division?: string;
    institutionName?: string;
    isVerified: boolean;
    createdAt?: string;
    testsTaken?: number;
    organization?: { name: string; slug: string } | null;
  };
  results: StudentResultItem[];
};

type StudentDetailViewProps = {
  studentId: string;
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
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN");
};

function groupStudentResults(results: StudentResultItem[]): {
  multiAttemptGroups: AssessmentResultGroup[];
  singleResults: StudentResultItem[];
} {
  const multiMap = new Map<string, AssessmentResultGroup>();
  const singleByCode = new Map<string, StudentResultItem>();

  for (const result of results) {
    const code = normalizeAssessmentCode(result.assessmentCode);
    const isMulti = result.allowsMultipleAttempts ?? allowsMultipleAttempts(code);

    if (isMulti) {
      const existing = multiMap.get(code);
      if (existing) {
        existing.attempts.push({ ...result, assessmentCode: code });
      } else {
        multiMap.set(code, {
          assessmentCode: code,
          assessmentName: result.assessmentName,
          attempts: [{ ...result, assessmentCode: code }],
        });
      }
      continue;
    }

    const prev = singleByCode.get(code);
    if (!prev) {
      singleByCode.set(code, { ...result, assessmentCode: code });
      continue;
    }
    const prevTime = new Date(prev.completedAt ?? 0).getTime();
    const nextTime = new Date(result.completedAt ?? 0).getTime();
    if (nextTime > prevTime) {
      singleByCode.set(code, { ...result, assessmentCode: code });
    }
  }

  const multiAttemptGroups = Array.from(multiMap.values()).map((group) => ({
    ...group,
    attempts: [...group.attempts].sort((a, b) => {
      if (a.attemptNumber != null && b.attemptNumber != null) {
        return a.attemptNumber - b.attemptNumber;
      }
      return new Date(a.completedAt ?? 0).getTime() - new Date(b.completedAt ?? 0).getTime();
    }),
  }));

  multiAttemptGroups.sort((a, b) => {
    const aLatest = a.attempts[a.attempts.length - 1]?.completedAt ?? "";
    const bLatest = b.attempts[b.attempts.length - 1]?.completedAt ?? "";
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });

  const multiCodes = new Set(multiAttemptGroups.map((g) => g.assessmentCode));
  const singleResults = Array.from(singleByCode.values())
    .filter((r) => !multiCodes.has(normalizeAssessmentCode(r.assessmentCode)))
    .sort((a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime());

  return { multiAttemptGroups, singleResults };
}

export default function StudentDetailView({ studentId, basePath, loginPath }: StudentDetailViewProps) {
  const router = useRouter();
  const auth = useMemo(() => getStoredAuth(), []);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentDetailsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.token) {
      router.replace(loginPath);
      return;
    }

    apiRequest<StudentDetailsResponse>(`/platform/students/${studentId}`, {}, auth.token)
      .then((res) => setData(res))
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load student details"))
      .finally(() => setLoading(false));
  }, [auth?.token, loginPath, router, studentId]);

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
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || "Student not found."}</div>
      </div>
    );
  }

  const { student, results } = data;
  const { multiAttemptGroups, singleResults } = groupStudentResults(results);

  return (
    <div className="mx-auto max-w-6xl space-y-6 min-w-0">
      <button onClick={() => router.replace(basePath)} className="inline-flex items-center gap-2 text-sm text-black hover:text-black">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </button>

      <div className="rounded-3xl border border-blue-200/70 bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-700 p-6 text-white shadow-[0_28px_70px_-30px_rgba(37,99,235,0.75)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">Student Profile</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{student.firstName} {student.lastName}</h1>
            <p className="mt-2 flex flex-col gap-1 text-sm text-blue-100 sm:flex-row sm:items-center sm:gap-2">
              <span className="inline-flex min-w-0 items-center gap-2 break-all"><Mail className="h-4 w-4 shrink-0" /> {student.email}</span>
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-blue-100"><Phone className="h-4 w-4 shrink-0" /> {`${student.phoneCode || ""}${student.phone || ""}`.trim() || "-"}</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 sm:max-w-sm md:w-auto md:max-w-none">
            <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Tests Taken</p>
              <p className="mt-2 text-2xl font-black">{student.testsTaken ?? results.length}</p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Status</p>
              <p className="mt-2 text-lg font-black">{student.isVerified ? "Verified" : "Pending"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-black"><School className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Organization</span></div>
          <p className="mt-2 break-words text-base font-semibold text-black">{student.organization?.name || "-"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-black"><GraduationCap className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Grade</span></div>
          <p className="mt-2 text-base font-semibold text-black">{student.grade || "-"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-black"><GraduationCap className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Division</span></div>
          <p className="mt-2 text-base font-semibold text-black">{student.division || "-"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-black"><School className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Institute</span></div>
          <p className="mt-2 break-words text-base font-semibold text-black">{student.institutionName || "-"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-black"><ShieldCheck className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Joined</span></div>
          <p className="mt-2 text-base font-semibold text-black">{formatDateTime(student.createdAt)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-black">Completed Results</h2>
            <p className="text-sm text-black">All assessments completed by this student.</p>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-black">No completed assessments yet.</div>
        ) : (
          <div className="grid gap-4 p-4">
            {multiAttemptGroups.map((group) => (
              <div key={group.assessmentCode} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                      {normalizeDisplayCode(group.assessmentCode)}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-black">{group.assessmentName}</h3>
                    <p className="mt-1 text-sm text-black">
                      {group.attempts.length} attempt{group.attempts.length !== 1 ? "s" : ""} completed
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-black">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Latest {formatDateTime(group.attempts[group.attempts.length - 1]?.completedAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(buildOrgAttemptListPath(basePath, studentId, group.assessmentCode))}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-600 sm:w-auto"
                  >
                    View Reports
                  </button>
                </div>
              </div>
            ))}

            {singleResults.map((result) => (
              <div key={result.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">{normalizeDisplayCode(result.assessmentCode)}</p>
                    <h3 className="mt-1 text-lg font-bold text-black">{result.assessmentName}</h3>
                    <p className="mt-1 text-sm text-black">{result.answeredCount}/{result.totalQuestions} answered</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-black border border-slate-200">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Completed {formatDateTime(result.completedAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const code = normalizeAssessmentCode(result.assessmentCode);
                      if (allowsMultipleAttempts(code)) {
                        router.push(buildOrgAttemptListPath(basePath, studentId, code));
                        return;
                      }
                      router.push(`${basePath}/${studentId}/reports/${result.id}`);
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-600 sm:w-auto"
                  >
                    {allowsMultipleAttempts(result.assessmentCode) ? "View Reports" : "View Report"}
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
