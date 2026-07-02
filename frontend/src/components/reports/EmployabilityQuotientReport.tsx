"use client";

import { useMemo } from "react";

import {
  EMPLOYABILITY_QUOTIENT_MAX_SCORE,
  getTopAndBottomDimensions,
  normalizeDimensionScores,
  scoreToPercentage,
  tierFromScore,
  tierMeta,
  type EmployabilityDimension,
} from "@/lib/employabilityQuotient/assessmentData";
import { EmployabilityDimensionRadar } from "./EmployabilityDimensionRadar";

export type EmployabilityQuotientEvaluation = {
  overallScore: number;
  overallPercentage?: number;
  tier: string;
  dimensionScores: Record<EmployabilityDimension, number>;
  dimensionAnswered?: Record<EmployabilityDimension, number>;
  answeredCount?: number;
  totalQuestions?: number;
};

function dimensionBadge(score: number) {
  const pct = Math.round((score / 5) * 100);
  if (pct >= 80) return { bg: "bg-emerald-50", text: "text-emerald-700", label: "Strong" };
  if (pct >= 60) return { bg: "bg-sky-50", text: "text-sky-700", label: "Developing" };
  return { bg: "bg-amber-50", text: "text-amber-700", label: "Focus" };
}

export default function EmployabilityQuotientReport({
  evaluation,
  submittedAt,
}: {
  evaluation: EmployabilityQuotientEvaluation;
  submittedAt?: string;
}) {
  const scores = useMemo(() => normalizeDimensionScores(evaluation.dimensionScores), [evaluation.dimensionScores]);
  const overallScore = Number(evaluation.overallScore ?? 0);
  const overallPercentage = evaluation.overallPercentage ?? scoreToPercentage(overallScore);
  const tier = evaluation.tier || tierFromScore(overallScore);
  const tierStyle = tierMeta(tier);
  const { strengths, focusAreas, ranked } = useMemo(() => getTopAndBottomDimensions(scores), [scores]);

  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "-";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white shadow-xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide opacity-90 mb-2">Employability Quotient</p>
          <div className="text-6xl font-bold mb-2">{overallScore}<span className="text-3xl opacity-80"> / {EMPLOYABILITY_QUOTIENT_MAX_SCORE}</span></div>
          <div className="text-xl font-semibold mb-1">{overallPercentage}% readiness</div>
          <div className={`inline-flex mt-3 rounded-full border px-4 py-1.5 text-sm font-semibold ${tierStyle.bg} ${tierStyle.color} ${tierStyle.border}`}>
            {tier}
          </div>
          <p className="text-sm opacity-90 mt-4">Completed on {submittedLabel}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Dimension Radar</h2>
          <EmployabilityDimensionRadar scores={scores} />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Performance Tiers</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li><strong>45–50:</strong> Future-Ready Leader Tier</li>
            <li><strong>35–44:</strong> Adaptive Professional Tier</li>
            <li><strong>0–34:</strong> Emerging Contender Tier</li>
          </ul>
          <div className="mt-6 space-y-3">
            {ranked.map((item) => {
              const badge = dimensionBadge(item.score);
              return (
                <div key={item.dimension} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{item.dimension}</p>
                    <p className="text-xs text-slate-500">{item.score} / 5 correct</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Key Strengths</h3>
          {strengths.length ? (
            <ul className="space-y-2 text-sm text-slate-700">
              {strengths.map((item) => (
                <li key={item.dimension}>• {item.dimension} - {item.score}/5</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">No dimension reached 4/5 yet. Retake after focused practice.</p>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Focus Areas</h3>
          {focusAreas.length ? (
            <ul className="space-y-2 text-sm text-slate-700">
              {focusAreas.map((item) => (
                <li key={item.dimension}>• {item.dimension} - {item.score}/5</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">No major focus gaps detected. Keep building balanced employability skills.</p>
          )}
        </div>
      </div>
    </div>
  );
}
