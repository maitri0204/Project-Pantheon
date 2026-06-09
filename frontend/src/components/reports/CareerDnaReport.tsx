"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Brain,
  Calculator,
  User,
  Target,
  Heart,
  BookOpen,
  Users,
  Shield,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import {
  DIMENSION_COLORS,
  DIMENSION_STYLES,
  LETTER_CODES,
} from "@/lib/reports/reportConstants";
import {
  formatCareerInterestCode,
  formatPersonalityType,
} from "@/lib/dashboard/displayLabels";

export type CareerDnaPersonalityDimension = {
  pair: string;
  winner: string;
  letterA: string;
  letterB: string;
  percentA: number;
  percentB: number;
};

export type CareerDnaSectionPart = {
  partName: string;
  score: number;
  maxScore: number;
  percentage: number;
};

export type CareerDnaSection = {
  parts?: CareerDnaSectionPart[];
  overallPercentage?: number;
  totalScore?: number;
  maxScore?: number;
  dominantCode?: string;
  personalityType?: string;
  personalityDimensions?: CareerDnaPersonalityDimension[];
};

export type CareerDnaEvaluation = {
  totalScore?: number;
  sections?: Record<string, CareerDnaSection>;
};

const PERSONALITY_DIMENSION_NAMES: Record<string, string> = {
  E: "Social Orientation",
  I: "Reflective Orientation",
  S: "Practical Observation",
  N: "Conceptual Thinking",
  T: "Logical Decision Style",
  F: "Value-Based Decision Style",
  J: "Structured Working Style",
  P: "Flexible Working Style",
};

const PERSONALITY_PAIR_NAMES: Record<string, string> = {
  "E/I": "Social Style",
  "S/N": "Thinking Style",
  "T/F": "Decision Style",
  "J/P": "Working Style",
};

const SECTION_CONFIG = [
  {
    key: "COGNITIVE",
    label: "Cognitive",
    title: "Cognitive Ability",
    description: "Verbal, numerical, spatial reasoning and processing speed.",
    icon: Brain,
    color: "#8b5cf6",
    barClass: "bg-violet-500",
    image: "/CognitiveIntelligence.jpeg",
    borderColor: "border-violet-200",
    chipColor: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    key: "APTITUDE",
    label: "Aptitude",
    title: "Aptitude Tests",
    description: "Logical, numerical, verbal, mechanical aptitude and creativity.",
    icon: Calculator,
    color: "#06b6d4",
    barClass: "bg-cyan-500",
    image: "/Aptitude.jpeg",
    borderColor: "border-cyan-200",
    chipColor: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    key: "PERSONALITY",
    label: "Personality",
    title: "Personality Profile",
    description: "Energy, thinking, decision and working style patterns.",
    icon: User,
    color: "#f43f5e",
    barClass: "bg-rose-500",
    image: "/PersonalityType.jpeg",
    borderColor: "border-rose-200",
    chipColor: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    key: "CAREER_INTEREST",
    label: "Interests",
    title: "Career Interests",
    description: "RIASEC themes across realistic to conventional interests.",
    icon: Target,
    color: "#f59e0b",
    barClass: "bg-amber-500",
    image: "/CareerInterest.jpeg",
    borderColor: "border-amber-200",
    chipColor: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    key: "EMOTIONAL_INTELLIGENCE",
    label: "EQ",
    title: "Emotional Intelligence",
    description: "Self-awareness, regulation, empathy and social skills.",
    icon: Heart,
    color: "#ec4899",
    barClass: "bg-pink-500",
    image: "/EmotionalIntelligence.jpeg",
    borderColor: "border-pink-200",
    chipColor: "bg-pink-50 text-pink-700 border-pink-100",
  },
  {
    key: "LEARNING_STYLE",
    label: "Learning",
    title: "Learning Style",
    description: "Visual, auditory, kinesthetic and other learning preferences.",
    icon: BookOpen,
    color: "#10b981",
    barClass: "bg-emerald-500",
    image: "/LearningStyle.jpeg",
    borderColor: "border-emerald-200",
    chipColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    key: "BEHAVIORAL_SOCIAL",
    label: "Social",
    title: "Behavioral & Social",
    description: "Adaptability, teamwork, leadership and communication.",
    icon: Users,
    color: "#3b82f6",
    barClass: "bg-blue-500",
    image: "/Behavioural.jpeg",
    borderColor: "border-blue-200",
    chipColor: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    key: "STRESS_RESILIENCE",
    label: "Resilience",
    title: "Stress & Resilience",
    description: "Stress awareness, coping, problem-solving and resilience.",
    icon: Shield,
    color: "#14b8a6",
    barClass: "bg-teal-500",
    image: "/Stress&Resilience.jpeg",
    borderColor: "border-teal-200",
    chipColor: "bg-teal-50 text-teal-700 border-teal-100",
  },
] as const;

/** Sections expressed as type/code combinations — not a single aggregate percentage. */
const COMBINATION_SECTION_KEYS = new Set<string>(["PERSONALITY", "CAREER_INTEREST"]);

function isCombinationSection(key: string): boolean {
  return COMBINATION_SECTION_KEYS.has(key);
}

function normalizeMbtiTypeCode(raw: string): string {
  const normalized = String(raw || "").toUpperCase();
  const match = normalized.match(/[EI][SN][TF][JP]/);
  return match ? match[0] : "";
}

function formatLearningStyleCode(raw: string): string {
  const normalized = String(raw || "").toUpperCase().replace(/[^VAK]/g, "");
  const unique = normalized
    .split("")
    .filter((c, i, arr) => arr.indexOf(c) === i);
  const map: Record<string, string> = { V: "Visual", A: "Auditory", K: "Kinesthetic" };
  const names = unique.map((c) => map[c]).filter(Boolean);
  return names.length ? names.join(" · ") : "—";
}

function scoreBand(pct: number) {
  if (pct >= 75) return { label: "Strong", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (pct >= 50) return { label: "Developing", text: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" };
  if (pct >= 30) return { label: "Emerging", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
  return { label: "Focus", text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
}

function barColor(pct: number) {
  if (pct >= 75) return "#22c55e";
  if (pct >= 50) return "#8b5cf6";
  if (pct >= 30) return "#f59e0b";
  return "#ef4444";
}

function sectionPercent(key: string, section?: CareerDnaSection): number {
  if (!section) return 0;
  if (key === "PERSONALITY") {
    const dims = section.personalityDimensions ?? [];
    if (dims.length === 0) return 0;
    const avg = dims.reduce((sum, d) => {
      const winnerPct = d.winner === d.letterA ? d.percentA : d.percentB;
      return sum + winnerPct;
    }, 0);
    return Math.round(avg / dims.length);
  }
  if (section.overallPercentage != null && section.overallPercentage > 0) {
    return section.overallPercentage;
  }
  const parts = section.parts ?? [];
  if (parts.length === 0) return 0;
  return Math.round(parts.reduce((s, p) => s + p.percentage, 0) / parts.length);
}

function collectInsightItems(sections: Record<string, CareerDnaSection>) {
  const items: Array<{ label: string; pct: number; section: string }> = [];
  SECTION_CONFIG.forEach(({ key, label }) => {
    const section = sections[key];
    if (!section) return;
    if (key === "PERSONALITY") {
      (section.personalityDimensions ?? []).forEach((d) => {
        const winnerPct = d.winner === d.letterA ? d.percentA : d.percentB;
        items.push({
          label: PERSONALITY_DIMENSION_NAMES[d.winner] || d.winner,
          pct: winnerPct,
          section: label,
        });
      });
      return;
    }
    (section.parts ?? []).forEach((p) => {
      items.push({ label: p.partName, pct: p.percentage, section: label });
    });
  });
  return items;
}

function SectionRadar({ scores }: { scores: Array<{ label: string; pct: number }> }) {
  const n = scores.length;
  const size = 280;
  const pad = 48;
  const vb = size + pad * 2;
  const cx = vb / 2;
  const cy = vb / 2;
  const R = 95;
  const labelRadius = R + 32;
  const rings = [25, 50, 75, 100];

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
    scores.map((_, i) => `${toXY(pct, i).x},${toXY(pct, i).y}`).join(" ");

  const scorePoly = scores.map((s, i) => `${toXY(s.pct, i).x},${toXY(s.pct, i).y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} className="mx-auto w-full max-w-[360px]" role="img" aria-label="Career DNA section radar">
      {rings.map((p) => (
        <polygon
          key={p}
          points={ringPoly(p)}
          fill={p === 100 ? "rgba(248,250,252,0.7)" : "none"}
          stroke={p % 50 === 0 ? "#cbd5e1" : "#e2e8f0"}
          strokeWidth="1"
        />
      ))}
      {scores.map((_, i) => {
        const end = toXY(100, i);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#e2e8f0" strokeWidth="1" />;
      })}
      <polygon
        points={scorePoly}
        fill="rgba(139,92,246,0.2)"
        stroke="#8b5cf6"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {scores.map((s, i) => {
        const pt = toXY(s.pct, i);
        const pos = labelXY(labelRadius, i);
        return (
          <g key={s.label}>
            <circle cx={pt.x} cy={pt.y} r="5" fill={barColor(s.pct)} stroke="white" strokeWidth="1.5" />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="#475569"
              fontWeight="600"
            >
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type CareerDnaReportActions = {
  onDownload: () => void;
  onEmail?: () => void;
  downloading: boolean;
  emailing: boolean;
  emailSuccess: boolean;
  emailError?: string | null;
  showEmail?: boolean;
};

export default function CareerDnaReport({
  evaluation,
  submittedAt,
  answeredCount,
  totalQuestions,
  actions,
}: {
  evaluation: CareerDnaEvaluation;
  submittedAt?: string;
  answeredCount?: number;
  totalQuestions?: number;
  actions?: CareerDnaReportActions;
}) {
  const sections = evaluation.sections ?? {};
  const [activeSection, setActiveSection] = useState<string>("COGNITIVE");

  const personalitySection = sections.PERSONALITY;
  const personalityTypeCode = normalizeMbtiTypeCode(personalitySection?.personalityType ?? "");
  const personalityTypeLabel = personalityTypeCode ? formatPersonalityType(personalityTypeCode) : "";
  const personalityDimensions = personalitySection?.personalityDimensions ?? [];

  const sectionScores = useMemo(
    () =>
      SECTION_CONFIG.map((cfg) => ({
        key: cfg.key,
        label: cfg.label,
        pct: sectionPercent(cfg.key, sections[cfg.key]),
        config: cfg,
      })),
    [sections],
  );

  const dominantInterest = sections.CAREER_INTEREST?.dominantCode;
  const dominantLearning = sections.LEARNING_STYLE?.dominantCode;
  const careerInterestLabel = dominantInterest ? formatCareerInterestCode(dominantInterest) : "";

  const radarScores = sectionScores
    .filter((s) => !isCombinationSection(s.key))
    .map((s) => ({ label: s.label, pct: s.pct }));

  const insights = useMemo(() => collectInsightItems(sections), [sections]);
  const strengths = [...insights]
    .filter((i) => i.section !== "Personality" && i.section !== "Interests")
    .filter((i) => i.pct >= 75)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);
  const focusAreas = [...insights]
    .filter((i) => i.section !== "Personality" && i.section !== "Interests")
    .filter((i) => i.pct < 50)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 4);
  const activeConfig = SECTION_CONFIG.find((c) => c.key === activeSection) ?? SECTION_CONFIG[0];
  const activeData = sections[activeSection];

  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-8 text-white md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Your Multi-Dimensional Profile</h2>
              <p className="mt-2 text-sm text-blue-100">Submitted on {submittedLabel}</p>
              {answeredCount != null && totalQuestions != null && (
                <p className="mt-1 text-xs text-blue-100/90">
                  {answeredCount} / {totalQuestions} questions answered
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-2xl bg-white/15 px-6 py-4 text-center backdrop-blur-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-100">Total Score</p>
                <p className="mt-1 text-4xl font-black">{evaluation.totalScore ?? 0}</p>
              </div>
              {personalityTypeLabel && (
                <div className="rounded-2xl bg-white/15 px-6 py-4 backdrop-blur-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-100">Personality Type</p>
                  <p className="mt-1 text-xl font-bold">{personalityTypeLabel}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {(dominantInterest || dominantLearning) && (
          <div className="grid divide-x divide-slate-100 border-t border-slate-100 sm:grid-cols-2">
            {dominantInterest && (
              <div className="px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Dominant Career Interest</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{formatCareerInterestCode(dominantInterest)}</p>
              </div>
            )}
            {dominantLearning && (
              <div className="px-6 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Dominant Learning Style</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{formatLearningStyleCode(dominantLearning)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {actions && (
        <div className="space-y-3">
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={actions.onDownload}
              disabled={actions.downloading}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actions.downloading ? "Generating Report..." : "Download Detailed Report"}
            </button>
            {actions.showEmail && actions.onEmail && (
              <button
                type="button"
                onClick={actions.onEmail}
                disabled={actions.emailing}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actions.emailing ? "Sending..." : actions.emailSuccess ? "✓ Report Sent!" : "Email Report to Me"}
              </button>
            )}
          </div>
          {actions.emailError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actions.emailError}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sectionScores.map(({ key, label, pct, config }) => {
          const Icon = config.icon;
          const combinationSection = isCombinationSection(key);
          const band = combinationSection ? null : scoreBand(pct);
          const combinationLabel =
            key === "PERSONALITY"
              ? personalityTypeLabel
              : key === "CAREER_INTEREST"
                ? careerInterestLabel
                : "";
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key)}
              className={`rounded-2xl border p-4 text-left transition-all hover:shadow-md ${
                activeSection === key
                  ? `${config.borderColor} shadow-md ring-2 ring-offset-1`
                  : "border-slate-100 bg-white hover:border-slate-200"
              }`}
              style={
                activeSection === key
                  ? { boxShadow: `0 0 0 2px ${config.color}33` }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: config.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {combinationSection ? (
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.chipColor}`}>
                    Profile
                  </span>
                ) : band ? (
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${band.bg} ${band.text} ${band.border}`}>
                    {band.label}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{label}</p>
              {combinationSection ? (
                <p className="mt-1 text-sm font-bold leading-snug text-slate-800" style={{ color: config.color }}>
                  {combinationLabel || "—"}
                </p>
              ) : (
                <>
                  <p className="text-2xl font-black" style={{ color: config.color }}>
                    {pct}%
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: config.color }} />
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {personalityDimensions.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
          <div className="border-b border-rose-50 bg-gradient-to-r from-rose-50 to-violet-50 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-900">Personality Dimensions</h3>
            <p className="text-sm text-slate-600">How you energize, process, decide and work</p>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
            {personalityDimensions.map((dim, index) => {
              const pair = dim.pair;
              const letterA = dim.letterA;
              const letterB = dim.letterB;
              const winner = dim.winner;
              const percentA = dim.percentA;
              const percentB = dim.percentB;
              const styleLabel = DIMENSION_STYLES[pair] || PERSONALITY_PAIR_NAMES[pair] || pair;
              const col = DIMENSION_COLORS[pair] || { a: "#8b5cf6", b: "#10b981" };
              const aWins = winner === letterA;
              return (
                <div
                  key={`${pair}-${index}`}
                  className="flex flex-col items-center border-r border-slate-100 px-2 last:border-r-0"
                >
                  <span className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    {styleLabel}
                  </span>
                  <span className="mb-2 text-lg font-black" style={{ color: col.a }}>
                    {percentA}%
                  </span>
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-base font-black"
                    style={{
                      backgroundColor: aWins ? col.a : `${col.a}18`,
                      color: aWins ? "white" : col.a,
                      boxShadow: aWins ? `0 4px 16px ${col.a}40` : "none",
                    }}
                  >
                    {LETTER_CODES[letterA] ?? letterA}
                  </div>
                  <div className="my-2 text-xl font-bold text-slate-300">↕</div>
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full text-base font-black"
                    style={{
                      backgroundColor: !aWins ? col.b : `${col.b}18`,
                      color: !aWins ? "white" : col.b,
                      boxShadow: !aWins ? `0 4px 16px ${col.b}40` : "none",
                    }}
                  >
                    {LETTER_CODES[letterB] ?? letterB}
                  </div>
                  <span className="mt-2 text-lg font-black" style={{ color: col.b }}>
                    {percentB}%
                  </span>
                  <p className="mt-3 text-center text-xs font-semibold text-slate-700">
                    {PERSONALITY_DIMENSION_NAMES[winner] || winner}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Section Radar</h3>
          <p className="mb-4 text-xs text-slate-500">Scored dimensions only — personality and interests use profile combinations.</p>
          <SectionRadar scores={radarScores} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-emerald-800">Top Strengths</h3>
            </div>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((item) => (
                  <li key={`${item.section}-${item.label}`} className="flex justify-between gap-2 text-sm text-emerald-900">
                    <span className="truncate">{item.label}</span>
                    <span className="shrink-0 font-semibold">{item.pct}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-emerald-800/80">Balanced profile — review section details for nuance.</p>
            )}
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              <h3 className="font-bold text-rose-800">Development Focus</h3>
            </div>
            {focusAreas.length > 0 ? (
              <ul className="space-y-2">
                {focusAreas.map((item) => (
                  <li key={`${item.section}-${item.label}`} className="flex justify-between gap-2 text-sm text-rose-900">
                    <span className="truncate">{item.label}</span>
                    <span className="shrink-0 font-semibold">{item.pct}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-rose-800/80">No major gaps flagged — keep building across all areas.</p>
            )}
          </div>
        </div>
      </div>

      <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${activeConfig.borderColor}`}>
        <div className="flex flex-col md:flex-row">
          <div className="flex shrink-0 flex-col items-center justify-center border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-6 py-8 md:w-[min(360px,40%)] md:border-b-0 md:border-r">
            <div className="relative aspect-square w-full max-w-[300px]">
              <Image
                src={activeConfig.image}
                alt={activeConfig.title}
                fill
                className="object-contain object-center"
                sizes="(max-width: 768px) 300px, 360px"
              />
            </div>
            <span className={`mt-5 inline-block rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-sm ${activeConfig.chipColor}`}>
              Section {SECTION_CONFIG.findIndex((c) => c.key === activeSection) + 1} of 8
            </span>
          </div>
          <div className="min-w-0 flex-1 p-6 md:pl-8 lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{activeConfig.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{activeConfig.description}</p>
              </div>
              {!isCombinationSection(activeSection) && activeData && (
                <div className="text-right">
                  <p className="text-3xl font-black" style={{ color: activeConfig.color }}>
                    {sectionPercent(activeSection, activeData)}%
                  </p>
                  <p className="text-xs text-slate-500">
                    {activeData.totalScore ?? 0} / {activeData.maxScore ?? 0} points
                  </p>
                </div>
              )}
              {activeSection === "PERSONALITY" && personalityTypeLabel && (
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Personality Type</p>
                  <p className="text-lg font-bold text-slate-900">{personalityTypeLabel}</p>
                </div>
              )}
              {activeSection === "CAREER_INTEREST" && careerInterestLabel && (
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Interest Profile</p>
                  <p className="text-lg font-bold text-slate-900">{careerInterestLabel}</p>
                </div>
              )}
            </div>

            {activeData?.dominantCode && activeSection !== "CAREER_INTEREST" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
                <Target className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                  Dominant:{" "}
                  {activeSection === "LEARNING_STYLE"
                    ? formatLearningStyleCode(activeData.dominantCode)
                    : activeData.dominantCode}
                </span>
              </div>
            )}

            <div className="mt-5 space-y-4">
              {activeSection === "PERSONALITY" && personalityDimensions.length > 0
                ? personalityDimensions.map((dim, idx) => {
                    const pairName = PERSONALITY_PAIR_NAMES[dim.pair] || dim.pair;
                    const winnerName = PERSONALITY_DIMENSION_NAMES[dim.winner] || dim.winner;
                    const winnerLetter = LETTER_CODES[dim.winner] ?? dim.winner;
                    return (
                      <div
                        key={`${dim.pair}-${idx}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-slate-700">{pairName}</span>
                        <span className="text-sm font-semibold text-slate-900">
                          {winnerLetter} — {winnerName}
                        </span>
                      </div>
                    );
                  })
                : activeSection === "CAREER_INTEREST" && careerInterestLabel
                  ? (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Your interest combination</p>
                      <p className="mt-2 text-base font-bold text-slate-900">{careerInterestLabel}</p>
                      {(activeData?.parts ?? []).length > 0 && (
                        <p className="mt-2 text-xs text-slate-600">
                          Based on your strongest RIASEC themes across realistic, investigative, artistic, social, enterprising, and conventional areas.
                        </p>
                      )}
                    </div>
                  )
                : (activeData?.parts ?? []).map((part, idx) => {
                    const label =
                      activeSection === "PERSONALITY"
                        ? PERSONALITY_PAIR_NAMES[part.partName] || part.partName
                        : part.partName;
                    const band = scoreBand(part.percentage);
                    return (
                      <div key={`${part.partName}-${idx}`}>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-700">{label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${band.bg} ${band.text} ${band.border}`}>
                              {band.label}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">
                              {part.score}/{part.maxScore} ({part.percentage}%)
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${part.percentage}%`, backgroundColor: barColor(part.percentage) }}
                          />
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTION_CONFIG.map((cfg) => (
          <button
            key={cfg.key}
            type="button"
            onClick={() => setActiveSection(cfg.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeSection === cfg.key ? `${cfg.chipColor} shadow-sm` : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>
    </div>
  );
}
