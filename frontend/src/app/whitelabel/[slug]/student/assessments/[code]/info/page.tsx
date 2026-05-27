"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";

export default function AssessmentInfoPage() {
  const params = useParams<{ slug: string; code: string }>();
  const slug = params?.slug || "";
  const code = String(params?.code || "").toUpperCase();
  const router = useRouter();
  const auth = useMemo(() => getStoredAuth(), []);

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.token) return;
    setLoading(true);
    apiRequest<{ assessments: any[] }>("/platform/student/assessments", {}, auth.token)
      .then((res) => {
        const found = (res.assessments || []).find((a) => String(a.code || "").toUpperCase() === code);
        if (found) setAssessment(found);
        else setError("Assessment not found.");
      })
      .catch(() => setError("Failed to load assessment info."))
      .finally(() => setLoading(false));
  }, [auth?.token, code]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">{error ?? "No information available."}</p>
        <button onClick={() => router.back()} className="rounded-lg bg-slate-100 px-4 py-2 text-sm">Go back</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-slate-900">{assessment.name}</h1>
        <p className="mt-2 text-sm text-slate-600">{assessment.summary}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">What you'll get</h3>
            <ul className="mt-2 list-inside list-disc text-sm text-slate-600">
              <li>Actionable insights to help with career decisions</li>
              <li>Clear competency breakdown and strengths</li>
              <li>Printable personalized report</li>
            </ul>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">Who is this for?</h3>
            <p className="mt-2 text-sm text-slate-600">Suitable for students and early professionals seeking clarity on strengths and career fit.</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-700">Details</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Questions:</span> {assessment.questionCount || "—"}</div>
            <div className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Duration:</span> Approx. {Math.max(10, Math.round((assessment.questionCount || 0) * 0.75))} mins</div>
            <div className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Category:</span> {assessment.category}</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700">Sample question</h3>
          <div className="mt-2 rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-700">{assessment.sampleQuestion ?? "You will be presented with multiple-choice questions assessing your skills."}</div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push(`/whitelabel/${slug}/student/assessments/${assessment.code}/take`)}
            className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Take Test
          </button>

          <button onClick={() => router.back()} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
