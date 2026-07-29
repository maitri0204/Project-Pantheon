"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

import AttemptHistoryResultSummary from "@/components/assessment/AttemptHistoryResultSummary";
import AssessmentReportView from "@/components/reports/AssessmentReportView";
import { apiRequest, getStoredAuth } from "@/lib/api";
import {
  allowsMultipleAttempts,
  buildStudentResultPath,
  buildStudentRetakePath,
  formatAttemptHistoryResult,
  getAssessmentDisplayName,
  normalizeAssessmentCode,
  resolveRouteAssessmentCode,
  type AttemptHistoryEvaluation,
} from "@/lib/assessmentAccess";

type AttemptHistoryItem = {
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
    if (!assessmentCode) {
      setError("Assessment code is missing from this page URL.");
      setAttempts([]);
      setLoading(false);
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
              const resultDisplay = formatAttemptHistoryResult(assessmentCode, attempt.evaluation);

              return (
                <button
                  key={attempt.attemptId}
                  onClick={() => router.push(buildStudentResultPath(slug, assessmentCode, { attemptId: attempt.attemptId }))}
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
                  <div className="mt-4">
                    <AttemptHistoryResultSummary
                      result={resultDisplay}
                      labelClassName="text-slate-500"
                      valueClassName="font-semibold text-slate-900"
                    />
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
        <button
          onClick={() => router.push(buildStudentRetakePath(slug, assessmentCode))}
          className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
        >
          Retake Test
        </button>
      </div>
    </div>
  );
}

function AttemptHistoryOrRedirect(props: {
  slug: string;
  assessmentCode: string;
  loginHref: string;
  topBackHref: string;
  topBackLabel: string;
  bottomBackHref: string;
  bottomBackLabel: string;
}) {
  const router = useRouter();
  const auth = useMemo(() => getStoredAuth(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [assessmentName, setAssessmentName] = useState(props.assessmentCode);

  useEffect(() => {
    if (!auth?.token) {
      router.replace(props.loginHref);
      return;
    }

    let cancelled = false;

    const resolveDestination = async () => {
      setLoading(true);
      setError(null);

      if (!props.assessmentCode) {
        setError("Assessment code is missing from this page URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<AttemptHistoryResponse>(
          `/platform/student/assessments/${props.assessmentCode}/attempts`,
          {},
          auth.token
        );
        const attempts = response.attempts || [];

        if (cancelled) return;

        if (attempts.length === 0) {
          setShowPicker(false);
          setError("No completed attempts found for this assessment.");
          return;
        }

        const latest = attempts[attempts.length - 1];
        const resolvedName = getAssessmentDisplayName(
          normalizeAssessmentCode(latest?.assessmentCode || props.assessmentCode),
          latest?.assessmentName || props.assessmentCode,
        );
        setAssessmentName(resolvedName);

        if (allowsMultipleAttempts(props.assessmentCode)) {
          setShowPicker(true);
          return;
        }

        const latestAttempt = attempts[attempts.length - 1];
        router.replace(buildStudentResultPath(props.slug, props.assessmentCode, { attemptId: latestAttempt.attemptId }));
      } catch (err) {
        if (cancelled) return;
        if (!getStoredAuth()) {
          router.replace(props.loginHref);
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void resolveDestination();

    return () => {
      cancelled = true;
    };
  }, [auth?.token, props.assessmentCode, props.loginHref, props.slug, router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (showPicker) {
    return (
      <AssessmentAttemptHistory
        slug={props.slug}
        assessmentCode={props.assessmentCode}
        assessmentName={assessmentName}
        loginHref={props.loginHref}
        topBackHref={props.topBackHref}
        topBackLabel={props.topBackLabel}
        bottomBackHref={props.bottomBackHref}
        bottomBackLabel={props.bottomBackLabel}
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.replace(props.topBackHref)} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
          ← {props.topBackLabel}
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        <button
          onClick={() => router.push(props.bottomBackHref)}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {props.bottomBackLabel}
        </button>
      </div>
    );
  }

  return null;
}

export default function StudentAssessmentResultPage() {
  const params = useParams<{ slug?: string; code?: string; rest?: string[] }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = params?.slug || "";
  const code = resolveRouteAssessmentCode(params, pathname);
  const attemptId = searchParams?.get("attemptId") || "";

  const attemptListHref = buildStudentResultPath(slug, code);
  const isMultiAttemptAssessment = allowsMultipleAttempts(code);

  if (!code) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Assessment Report</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          Assessment code is missing from this page URL. Open the report from your results or assessments list.
        </div>
      </div>
    );
  }

  if (attemptId) {
    return (
      <AssessmentReportView
        fetchPath={`/platform/student/attempts/${attemptId}/report`}
        loginHref={`/whitelabel/${slug}/login`}
        topBackHref={isMultiAttemptAssessment ? attemptListHref : `/whitelabel/${slug}/student/results`}
        topBackLabel={isMultiAttemptAssessment ? "Back to Attempts" : "Back to Results"}
        bottomBackHref={`/whitelabel/${slug}/student/assessments`}
        bottomBackLabel="Back to Assessments"
        retakeHref={buildStudentRetakePath(slug, code)}
      />
    );
  }

  return (
    <AttemptHistoryOrRedirect
      slug={slug}
      assessmentCode={code}
      loginHref={`/whitelabel/${slug}/login`}
      topBackHref={`/whitelabel/${slug}/student/results`}
      topBackLabel="Back to Results"
      bottomBackHref={`/whitelabel/${slug}/student/assessments`}
      bottomBackLabel="Back to Assessments"
    />
  );
}
