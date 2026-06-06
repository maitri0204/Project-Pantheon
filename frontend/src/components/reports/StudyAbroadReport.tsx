"use client";

import { useMemo, useState } from "react";
import {
  ALL_TOPICS,
  bandFromPercentage,
  bandMeta,
  getTopAndBottomTopics,
  normalizeTopicScores,
  scoreToPercentage,
  type Topic,
} from "@/lib/studyAbroad/assessmentData";

export type StudyAbroadEvaluation = {
  overallScore: number;
  overallPercentage?: number;
  band: string;
  topicScores: Record<Topic, number>;
  topicAnswered?: Record<Topic, number>;
  answeredCount?: number;
  totalQuestions?: number;
};

const READINESS_RANGES = [
  "0-25 At Risk",
  "26-50 Partially Ready",
  "51-75 Moderately Ready",
  "76-90 Almost Ready",
  "91-100 Completely Ready",
];

function topicBadge(score: number) {
  if (score >= 70) return { bg: "bg-violet-50", text: "text-violet-700", label: "Strong" };
  if (score >= 45) return { bg: "bg-sky-50", text: "text-sky-700", label: "Developing" };
  return { bg: "bg-rose-50", text: "text-rose-700", label: "Focus" };
}

const RADAR_TOPIC_SHORT: Record<string, string> = {
  "Language Readiness": "Language",
  "Scholastic Readiness": "Scholastic",
  "Academic Readiness": "Academic",
  "Career & Employability Readiness": "Career",
  "Financial Readiness": "Financial",
  "Visa & Compliance Readiness": "Visa",
  "Psychological Readiness": "Psychological",
  "Social & Cultural Readiness": "Social",
  "Parental Expectation Readiness": "Parental",
  "Physical & Lifestyle Readiness": "Physical",
  "Resilience Readiness": "Resilience",
  "Decision Readiness": "Decision",
};

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const topics = ALL_TOPICS;
  const n = topics.length;
  const size = 300;
  const pad = 52;
  const vb = size + pad * 2;
  const cx = vb / 2;
  const cy = vb / 2;
  const R = 100;
  const labelRadius = R + 38;
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

  const scorePoly = topics.map((t, i) => `${toXY(scores[t] ?? 0, i).x},${toXY(scores[t] ?? 0, i).y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} className="mx-auto w-full max-w-[380px]" role="img" aria-label="12-dimension readiness radar">
      {rings.map((p) => (
        <g key={p}>
          <polygon
            points={ringPoly(p)}
            fill={p === 100 ? "rgba(248,250,252,0.6)" : "none"}
            stroke={p % 40 === 0 ? "#cbd5e1" : "#e2e8f0"}
            strokeWidth="1"
          />
        </g>
      ))}
      {rings.map((p) => {
        const pos = toXY(p, 0);
        return (
          <text
            key={`ring-${p}`}
            x={pos.x + 6}
            y={pos.y}
            fontSize="9"
            fill="#64748b"
            dominantBaseline="middle"
          >
            {p}%
          </text>
        );
      })}
      {topics.map((_, i) => {
        const end = toXY(100, i);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon points={scorePoly} fill="rgba(165,180,252,0.24)" stroke="#818cf8" strokeWidth="2" strokeLinejoin="round" />
      {topics.map((t, i) => {
        const pos = labelXY(labelRadius, i);
        const short = RADAR_TOPIC_SHORT[t] ?? t.replace(" Readiness", "");
        return (
          <text
            key={`label-${t}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="#475569"
            fontWeight="600"
          >
            {short}
          </text>
        );
      })}
      {topics.map((t, i) => {
        const pt = toXY(scores[t] ?? 0, i);
        const score = Math.round(scores[t] ?? 0);
        const dotColor = score >= 70 ? "#22c55e" : score >= 45 ? "#6366f1" : "#f43f5e";
        const angle = (i * (2 * Math.PI)) / n - Math.PI / 2;
        const scoreOffset = 14;
        const scoreX = pt.x + scoreOffset * Math.cos(angle);
        const scoreY = pt.y + scoreOffset * Math.sin(angle);
        const active = hoveredIdx === i;

        return (
          <g
            key={t}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{ cursor: "default" }}
          >
            <circle
              cx={pt.x}
              cy={pt.y}
              r={active ? 7 : 5}
              fill={dotColor}
              stroke="white"
              strokeWidth="1.5"
            />
            <text
              x={scoreX}
              y={scoreY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={active ? 11 : 10}
              fontWeight="700"
              fill="#0f172a"
            >
              {score}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function StudyAbroadReport({
  evaluation,
  submittedAt,
}: {
  evaluation: StudyAbroadEvaluation;
  submittedAt?: string;
}) {
  const pct = evaluation.overallPercentage ?? scoreToPercentage(evaluation.overallScore);
  const band = bandFromPercentage(pct);
  const topicScores = useMemo(
    () => normalizeTopicScores(evaluation.topicScores),
    [evaluation.topicScores],
  );

  const resultLike = useMemo(
    () => ({
      id: "pantheon",
      submittedAt: submittedAt || new Date().toISOString(),
      overallScore: evaluation.overallScore,
      answeredCount: evaluation.answeredCount ?? evaluation.totalQuestions ?? 50,
      totalQuestions: evaluation.totalQuestions ?? 50,
      band,
      topicScores,
      topicAnswered: evaluation.topicAnswered || ({} as Record<Topic, number>),
    }),
    [evaluation, submittedAt, band, topicScores],
  );

  const { top, bottom } = getTopAndBottomTopics(resultLike, 4);
  const meta = bandMeta(band);

  const topics = ALL_TOPICS.map((topic) => ({
    topic,
    score: topicScores[topic] ?? 0,
  })).sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-sky-200 via-indigo-200 to-rose-200" />
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Overall Readiness Score</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-900">{evaluation.overallScore}</span>
                <span className="text-xl text-slate-400">/ 150</span>
              </div>
              <span className={`mt-3 inline-block rounded-full border px-3 py-1 text-sm font-semibold ${meta.bg} ${meta.colorClass} ${meta.border}`}>
                {band}
              </span>
              <p className="mt-2 max-w-md text-sm text-slate-600">{meta.desc}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{pct}%</p>
              <p className="text-xs text-slate-500">Readiness percentage</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs text-slate-500">
              <span>Progress toward maximum readiness</span>
              <span>{pct}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {READINESS_RANGES.map((range) => (
                <span key={range} className="rounded-md bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
                  {range}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">12-Dimension Radar</h2>
          <RadarChart scores={topicScores} />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Dimension Scores</h2>
          <div className="space-y-4">
            {topics.map(({ topic, score }) => {
              const badge = topicBadge(score);
              return (
                <div key={topic}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-700">{topic.replace(" Readiness", "")}</span>
                    <span className={`text-xs font-semibold ${badge.text}`}>{badge.label} · {score}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-violet-300" style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
          <h3 className="mb-3 font-bold text-emerald-800">Key Strengths</h3>
          <ul className="space-y-2">
            {top.map(({ label, score }) => (
              <li key={label} className="flex justify-between text-sm text-emerald-900">
                <span>{label}</span>
                <span className="font-semibold">{score}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6">
          <h3 className="mb-3 font-bold text-rose-800">Focus Areas</h3>
          <ul className="space-y-2">
            {bottom.map(({ label, score }) => (
              <li key={label} className="flex justify-between text-sm text-rose-900">
                <span>{label}</span>
                <span className="font-semibold">{score}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
