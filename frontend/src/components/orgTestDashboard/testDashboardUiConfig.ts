import type { AssessmentAdminDashboardResponse } from "@/lib/dashboard/assessmentAdminDashboard";
import { formatPersonalityType } from "@/lib/dashboard/displayLabels";
import { bandFromPercentage, bandMeta } from "@/lib/studyAbroad/assessmentData";

export type DashboardLayoutVariant =
  | "standard"
  | "study-abroad"
  | "johari"
  | "career-compass"
  | "litmus"
  | "metacognition"
  | "career-dna";

export type StatCardDef = {
  label: string;
  value: string | number;
  sub?: string;
};

export type DashboardAudienceLabels = {
  /** Table/list column header (e.g. Parent vs Student). */
  singular: string;
  plural: string;
  hideGradeColumn?: boolean;
  recentSectionTitle?: string;
  recentSectionDescription?: string;
  viewAllLabel?: string;
  emptyTableMessage?: string;
  emptySectionTitle?: string;
  emptySectionDescription?: string;
};

export type TestDashboardUiConfig = {
  layout: DashboardLayoutVariant;
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptySubtitle: string;
  accentClass: string;
  chartColors: string[];
  barClass: string;
  distributionTitle: string;
  distributionDescription: string;
  dimensionsTitle: string;
  dimensionsDescription: string;
  buildStatCards: (data: AssessmentAdminDashboardResponse) => StatCardDef[];
  resultColumnLabel?: string;
  audience?: DashboardAudienceLabels;
};

function avgPct(data: AssessmentAdminDashboardResponse): number {
  const withPct = data.allAttempts.filter((r) => Number.isFinite(r.percentage));
  return withPct.length
    ? Math.round(withPct.reduce((s, r) => s + (r.percentage ?? 0), 0) / withPct.length)
    : 0;
}

function avgScore(data: AssessmentAdminDashboardResponse): number {
  const scores = data.allAttempts.map((r) => r.score).filter((s): s is number => Number.isFinite(s));
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

function quadrantValue(data: AssessmentAdminDashboardResponse, key: string): number {
  return data.dimensionAverages.find((d) => d.key === key)?.value ?? 0;
}

export const TEST_DASHBOARD_UI_CONFIG: Record<string, TestDashboardUiConfig> = {
  STUDY_ABROAD: {
    layout: "study-abroad",
    title: "Study Abroad Readiness Dashboard",
    subtitle: "Track 12-dimension readiness: language, academics, finances, visa, culture, and decision confidence.",
    emptyTitle: "Study Abroad Readiness — Organization Overview",
    emptySubtitle: "Readiness dimensions and bands appear when students complete the assessment.",
    accentClass: "from-sky-600 to-indigo-600",
    chartColors: ["#0ea5e9", "#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"],
    barClass: "bg-sky-500",
    distributionTitle: "Readiness band distribution",
    distributionDescription: "How students cluster across readiness bands.",
    dimensionsTitle: "12 readiness dimensions (org average)",
    dimensionsDescription: "Topic scores averaged across all completed assessments.",
    resultColumnLabel: "Readiness band",
    buildStatCards: (data) => {
      const pct = avgPct(data);
      const band = bandFromPercentage(pct);
      return [
        { label: "Avg readiness score", value: data.summary.metricValue ?? "—", sub: data.summary.metricSub },
        { label: "Avg readiness %", value: `${pct}%`, sub: band },
        { label: "Students assessed", value: data.summary.uniqueStudents, sub: "Unique learners" },
        { label: "Total attempts", value: data.summary.totalAttempts, sub: "Completed assessments" },
      ];
    },
  },
  CAREER_COMPASS: {
    layout: "career-compass",
    title: "Career Compass Dashboard",
    subtitle: "Personality profiles and dimension tendencies across your student cohort.",
    emptyTitle: "Career Compass — Personality Type Analytics",
    emptySubtitle: "Type distribution appears when students complete Career Compass.",
    accentClass: "from-emerald-600 to-teal-600",
    chartColors: ["#10b981", "#0ea5e9", "#6366f1", "#f59e0b", "#f43f5e", "#8b5cf6"],
    barClass: "bg-emerald-500",
    distributionTitle: "Personality type mix",
    distributionDescription: "Most common personality types in your organization.",
    dimensionsTitle: "Dimension overview",
    dimensionsDescription: "Org-average split on each personality axis using full style names.",
    resultColumnLabel: "Personality type",
    buildStatCards: (data) => {
      const topCode = data.distributions[0]?.label ?? "";
      const displayType = topCode ? formatPersonalityType(topCode) : "—";
      return [
        { label: "Most common profile", value: displayType, sub: data.summary.metricSub },
        { label: "Unique types", value: data.distributions.length, sub: "Observed in cohort" },
        { label: "Students", value: data.summary.uniqueStudents },
        { label: "Assessments", value: data.summary.totalAttempts, sub: "Completed" },
      ];
    },
  },
  JOHARI_WINDOW: {
    layout: "johari",
    title: "CLEAR Dashboard",
    subtitle: "Organization-wide self-awareness across open, blind, hidden, and unknown quadrants.",
    emptyTitle: "CLEAR — Johari Window Self-Awareness Map",
    emptySubtitle: "Quadrant analytics appear after students complete CLEAR.",
    accentClass: "from-indigo-600 to-blue-600",
    chartColors: ["#10b981", "#f59e0b", "#0ea5e9", "#8b5cf6"],
    barClass: "bg-indigo-500",
    distributionTitle: "",
    distributionDescription: "",
    dimensionsTitle: "",
    dimensionsDescription: "",
    resultColumnLabel: "Profile",
    buildStatCards: (data) => {
      const j = data.johariSummary;
      return [
        {
          label: "Avg solicits feedback",
          value: j ? j.avgSolicitsFeedback.toFixed(1) : "—",
          sub: "Org cohort average (0–50)",
        },
        {
          label: "Avg self-disclosure",
          value: j ? j.avgSelfDisclosure.toFixed(1) : "—",
          sub: "Org cohort average (0–50)",
        },
        { label: "Open area (avg)", value: `${quadrantValue(data, "open").toFixed(1)}%`, sub: "Known to self & others" },
        { label: "Students", value: data.summary.uniqueStudents, sub: `${data.summary.totalAttempts} attempts` },
      ];
    },
  },
  LITMUS_TEST: {
    layout: "litmus",
    title: "Litmus Test Dashboard",
    subtitle: "Parenting style profile - King, Servant, Elder, Prince, and Joker - across parent respondents.",
    emptyTitle: "Litmus Test — Parenting Style Profile",
    emptySubtitle: "Style analytics appear when parents complete Litmus.",
    accentClass: "from-rose-600 to-pink-600",
    chartColors: ["#e11d48", "#ec4899", "#d946ef", "#8b5cf6", "#f43f5e"],
    barClass: "bg-rose-500",
    distributionTitle: "Parenting style distribution",
    distributionDescription: "Dominant styles among completed Litmus profiles.",
    dimensionsTitle: "Style score breakdown",
    dimensionsDescription: "Org-average strength per style as a percentage of 30 points per style.",
    resultColumnLabel: "Dominant style",
    audience: {
      singular: "Parent",
      plural: "Parents",
      hideGradeColumn: true,
      recentSectionTitle: "Recent parents",
      recentSectionDescription: "Latest completed Litmus assessments from parents in your organization.",
      viewAllLabel: "View all parents",
      emptyTableMessage: "No parents found.",
      emptySectionTitle: "No parents yet",
      emptySectionDescription: "Parent activity will appear here after Litmus assessments are completed.",
    },
    buildStatCards: (data) => [
      { label: "Dominant style", value: data.summary.metricValue ?? "—" },
      { label: "Parents assessed", value: data.summary.uniqueStudents },
      { label: "Completed tests", value: data.summary.totalAttempts },
      { label: "Style variants", value: data.distributions.length, sub: "Observed in cohort" },
    ],
  },
  METACOGNITION_TEST: {
    layout: "metacognition",
    title: "Thinking & Expression Skills Dashboard",
    subtitle: "Metacognition across Awareness, Planning, Monitoring, Regulation, and Reflection — plus learner quadrant profiles.",
    emptyTitle: "Thinking & Expression Skills — Domain Analytics",
    emptySubtitle: "Domain patterns appear after students complete the test.",
    accentClass: "from-cyan-600 to-blue-600",
    chartColors: ["#0891b2", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6"],
    barClass: "bg-cyan-500",
    distributionTitle: "Learner quadrant distribution",
    distributionDescription: "How students cluster by knowledge and self-regulation (matches report quadrants).",
    dimensionsTitle: "Domain scores (org average)",
    dimensionsDescription: "Average points per metacognition domain.",
    resultColumnLabel: "Learner profile",
    buildStatCards: (data) => {
      const meta = data.metacognitionSummary;
      const topQuadrant = meta?.quadrantDistribution[0]?.label ?? "—";
      return [
        { label: "Avg total score", value: data.summary.metricValue ?? avgScore(data), sub: "Across all domains" },
        { label: "Knowledge (avg)", value: meta ? `${meta.avgKnowledgePct}%` : "—", sub: "Awareness domain" },
        { label: "Regulation (avg)", value: meta ? `${meta.avgRegulationPct}%` : "—", sub: "Planning through Reflection" },
        { label: "Top learner quadrant", value: topQuadrant, sub: "Most common profile" },
      ];
    },
  },
  CAREER_DNA: {
    layout: "career-dna",
    title: "Career DNA Profiler Dashboard",
    subtitle: "Personality type and career interest combinations, plus scored profiler sections across your cohort.",
    emptyTitle: "Career DNA Profiler — Multi-Section Overview",
    emptySubtitle: "Section analytics appear after students complete Career DNA.",
    accentClass: "from-fuchsia-600 to-violet-600",
    chartColors: ["#d946ef", "#a855f7", "#8b5cf6", "#6366f1", "#ec4899", "#f43f5e"],
    barClass: "bg-fuchsia-500",
    distributionTitle: "",
    distributionDescription: "",
    dimensionsTitle: "Scored sections (org average %)",
    dimensionsDescription: "Cognitive, aptitude, EQ, learning style, behavioral, and resilience sections only.",
    resultColumnLabel: "Profile",
    buildStatCards: (data) => [
      { label: "Sections measured", value: data.dimensionAverages.length, sub: "Scored profiler areas" },
      { label: "Students", value: data.summary.uniqueStudents },
      { label: "Profiles completed", value: data.summary.totalAttempts },
      {
        label: "Top scored section",
        value: data.dimensionAverages[0]?.label ?? "—",
        sub: data.dimensionAverages[0] ? `${data.dimensionAverages[0].value}% avg` : undefined,
      },
    ],
  },
};

export function getTestDashboardUiConfig(code: string): TestDashboardUiConfig | null {
  return TEST_DASHBOARD_UI_CONFIG[code] ?? null;
}

export const ENHANCED_ORG_DASHBOARD_CODES = Object.keys(TEST_DASHBOARD_UI_CONFIG);
