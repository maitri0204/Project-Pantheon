"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { apiRequest, getStoredAuth } from "@/lib/api";

type StudentAssessmentsResponse = {
  assessments: Array<{
    _id: string;
    code: string;
    name: string;
    slug: string;
    summary: string;
    category: string;
    questionCount: number;
    sourceProject: string;
    active: boolean;
    attempt: null | {
      id: string;
      status: "IN_PROGRESS" | "COMPLETED";
      answeredCount: number;
      totalQuestions: number;
      completedAt?: string;
    };
  }>;
};

const normalizeAssessmentCodeForDisplay = (code: string) => {
  const normalized = String(code || "").toUpperCase().trim();
  if (normalized === "METACOGNITION" || normalized === "METACOGNITION_TEST") return "TEST";
  if (normalized === "JOHARI_WINDOW" || normalized === "JOHARI" || normalized === "CLEAR") return "CLEAR";
  return normalized;
};

const normalizeAssessmentCategoryForDisplay = (category: string, code: string) => {
  const normalizedCode = String(code || "").toUpperCase().trim();
  if (normalizedCode === "METACOGNITION" || normalizedCode === "METACOGNITION_TEST") return "TEST";
  if (normalizedCode === "JOHARI_WINDOW" || normalizedCode === "JOHARI" || normalizedCode === "CLEAR") return "CLEAR";
  return category;
};

export default function StudentAssessmentsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const auth = useMemo(() => getStoredAuth(), []);

  const [loading, setLoading] = useState(true);
  const [startingCode, setStartingCode] = useState<string | null>(null);
  const [data, setData] = useState<StudentAssessmentsResponse>({ assessments: [] });

  const load = () => {
    if (!auth?.token) {
      router.replace(`/whitelabel/${slug}/login`);
      return;
    }

    setLoading(true);
    apiRequest<StudentAssessmentsResponse>("/platform/student/assessments", {}, auth.token)
      .then(setData)
      .catch(() => router.replace(`/whitelabel/${slug}/login`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, slug]);

  const startTest = async (code: string) => {
    if (!auth?.token) return;

    setStartingCode(code);
    try {
      const response = await apiRequest<{ attempt: { id: string } }>(`/platform/student/assessments/${code}/start`, {
        method: "POST",
      }, auth.token);
      router.push(`/whitelabel/${slug}/student/assessments/${code}/take?attemptId=${response.attempt.id}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to start assessment";
      window.alert(msg);
    } finally {
      setStartingCode(null);
      load();
    }
  };

  const openReport = (assessmentCode: string, attemptId?: string) => {
    if (!attemptId) return;
    router.push(`/whitelabel/${slug}/student/assessments/${assessmentCode}/result?attemptId=${attemptId}`);
  };

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
        <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
        <p className="mt-1 text-sm text-slate-600">Choose an assessment and click Take Test to start in full-screen mode.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {data.assessments.map((assessment) => {
          const completed = assessment.attempt?.status === "COMPLETED";
          const canViewReport = completed && assessment.code !== "CAREER_DNA";

          return (
            <div key={assessment._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{normalizeAssessmentCategoryForDisplay(assessment.category, assessment.code)}</p>
                  <h3 className="text-xl font-bold text-slate-900">{assessment.name}</h3>
                  <p className="mt-1 text-xs font-mono text-slate-500">{normalizeAssessmentCodeForDisplay(assessment.code)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${completed ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                  {completed ? "Completed" : "Available"}
                </span>
              </div>

              <p className="mt-3 min-h-[42px] text-sm text-slate-600">{assessment.summary}</p>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Questions</span>
                <span className="font-bold text-slate-900">{assessment.questionCount || assessment.attempt?.totalQuestions || "—"}</span>
              </div>

              <button
                onClick={() => {
                  if (canViewReport) {
                    openReport(assessment.code, assessment.attempt?.id);
                    return;
                  }
                  void startTest(assessment.code);
                }}
                disabled={(!canViewReport && completed) || startingCode === assessment.code}
                className="mt-4 w-full rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(37,99,235,0.75)] transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {canViewReport ? "View Report" : completed ? "Already Completed" : startingCode === assessment.code ? "Starting…" : "Take Test"}
              </button>
            </div>
          );
        })}

        {data.assessments.length === 0 && (
          <p className="col-span-full rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-600">
            No assessments available at the moment.
          </p>
        )}
      </div>
    </div>
  );
}
