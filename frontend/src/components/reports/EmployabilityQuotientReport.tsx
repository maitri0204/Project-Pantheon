"use client";

import { useMemo } from "react";

import {
  EMPLOYABILITY_QUOTIENT_DIMENSIONS,
  EMPLOYABILITY_QUOTIENT_MAX_SCORE,
  getTopAndBottomDimensions,
  normalizeDimensionScores,
  scoreToPercentage,
  shortDimensionLabel,
  tierFromScore,
  tierMeta,
  type EmployabilityDimension,
} from "@/lib/employabilityQuotient/assessmentData";

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

function RadarChart({ scores }: { scores: Record<EmployabilityDimension, number> }) {
  const topics = EMPLOYABILITY_QUOTIENT_DIMENSIONS;
  const n = topics.length;
  const size = 300;
  const pad = 52;
  const vb = size + pad * 2;
  const cx = vb / 2;
  const cy = vb / 2;
  const R = 100;
  const labelRadius = R + 34;
  const rings = [20, 40, 60, 80, 100];

  const toXY = (pct: number, i: number) => {
    const angle = (i * (2 * Math.PI)) / n - Math.PI / 2;
    const r = (pct / 100) * R;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const labelXY = (radius: number, i: number) => {
    const angle = (i * (2 * Math.PI)) / n - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const ringPoly = (pct: number) =>
    topics.map((_, i) => `${toXY(pct, i).x},${toXY(pct, i).y}`).join(" ");

  const scorePoly = topics
    .map((topic, i) => {
      const pct = Math.round(((scores[topic] ?? 0) / 5) * 100);
      const pos = toXY(pct, i);
      return `${pos.x},${pos.y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} className="mx-auto w-full max-w-[380px]" role="img" aria-label="Employability dimension radar">
      {rings.map((p) => (
        <polygon
          key={p}
          points={ringPoly(p)}
          fill={p === 100 ? "rgba(248,250,252,0.6)" : "none"}
          stroke={p % 40 === 0 ? "#cbd5e1" : "#e2e8f0"}
          strokeWidth="1"
        />
      ))}
      {topics.map((_, i) => {
        const end = toXY(100, i);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon points={scorePoly} fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />
      {topics.map((topic, i) => {
        const pos = labelXY(labelRadius, i);
        return (
          <text
            key={topic}
            x={pos.x}
            y={pos.y}
            fontSize="8.5"
            fill="#475569"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {shortDimensionLabel(topic)}
          </text>
        );
      })}
    </svg>
  );
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
          <RadarChart scores={scores} />
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
