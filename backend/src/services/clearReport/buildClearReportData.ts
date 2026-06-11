import { assessmentData as templateAssessmentData } from "./templateAssessmentData";
import type { ClearAssessmentData } from "./types";

const TEMPLATE_STUDENT_NAME = templateAssessmentData.student.name;
const TEMPLATE_COUNSELOR_NAME = templateAssessmentData.student.counselor;
const JOHARI_MAX = 50;
const JOHARI_TOTAL = JOHARI_MAX * JOHARI_MAX;

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAssessmentDate(value?: Date | string | null): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function formatSubmittedAt(value?: Date | string | null): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function computeJohariAreas(sfScore: number, sdScore: number) {
  const open = Number(((sfScore * sdScore) / JOHARI_TOTAL * 100).toFixed(1));
  const blind = Number(((sfScore * (JOHARI_MAX - sdScore)) / JOHARI_TOTAL * 100).toFixed(1));
  const hidden = Number((((JOHARI_MAX - sfScore) * sdScore) / JOHARI_TOTAL * 100).toFixed(1));
  const unknown = Number((((JOHARI_MAX - sfScore) * (JOHARI_MAX - sdScore)) / JOHARI_TOTAL * 100).toFixed(1));
  return { open, blind, hidden, unknown };
}

function johariPositionLabel(dominantQuadrant: string): string {
  const normalized = dominantQuadrant.toLowerCase();
  if (normalized.includes("open")) return "Open & Visible";
  if (normalized.includes("blind")) return "Feedback Growth Zone";
  if (normalized.includes("hidden")) return "Expanding Awareness";
  return "Discovery & Exploration";
}

function growthPotentialLabel(growthIndex: number): string {
  if (growthIndex >= 65) return "High";
  if (growthIndex >= 45) return "Moderate";
  return "Developing";
}

function replaceTemplateNames<T>(value: T, studentName: string, counselorName: string): T {
  if (typeof value === "string") {
    return value
      .split(TEMPLATE_STUDENT_NAME).join(studentName)
      .split(TEMPLATE_COUNSELOR_NAME).join(counselorName) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceTemplateNames(item, studentName, counselorName)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      replaceTemplateNames(item, studentName, counselorName),
    ]);
    return Object.fromEntries(entries) as T;
  }

  return value;
}

function buildKeyTakeaways(
  sfScore: number,
  sdScore: number,
  areas: ReturnType<typeof computeJohariAreas>,
): string[] {
  const largestZone = (["open", "blind", "hidden", "unknown"] as const).reduce((winner, zone) => (
    areas[zone] > areas[winner] ? zone : winner
  ), "open" as const);

  const zoneLabels = {
    open: "Open",
    blind: "Blind",
    hidden: "Hidden",
    unknown: "Unknown",
  } as const;

  const feedbackComparison = sfScore > sdScore
    ? `Your feedback-seeking score (${sfScore}) exceeds your self-disclosure score (${sdScore}), meaning others may know more about your impact than you realize.`
    : sfScore < sdScore
      ? `Your self-disclosure score (${sdScore}) exceeds your feedback-seeking score (${sfScore}), meaning you share more than you seek feedback on - balance both for growth.`
      : `Your feedback-seeking and self-disclosure scores are balanced (${sfScore}/${sdScore}), creating a steady foundation for self-awareness growth.`;

  return [
    feedbackComparison,
    `Your ${zoneLabels[largestZone]} zone (${areas[largestZone]}%) is your largest area - focus here for the fastest self-awareness gains.`,
    `Your Blind zone (${areas.blind}%) signals important growth opportunities through active feedback.`,
    `Expanding your Open zone from ${areas.open}% will directly improve trust, grades, and relationships.`,
    "With intentional effort, your growth trajectory over 90 days can be substantial.",
  ];
}

export function buildClearReportData(input: {
  studentName: string;
  grade?: string;
  school?: string;
  email?: string;
  submittedAt?: Date | string | null;
  counselor?: string;
  solicitsFeedbackScore?: unknown;
  selfDisclosureScore?: unknown;
  dominantQuadrant?: string;
  totalAnswered?: unknown;
}): ClearAssessmentData {
  const studentName = input.studentName.trim() || "Student";
  const counselorName = input.counselor?.trim() || "Learning Counselor";
  const sfScore = Math.max(0, Math.min(JOHARI_MAX, Math.round(toNumber(input.solicitsFeedbackScore))));
  const sdScore = Math.max(0, Math.min(JOHARI_MAX, Math.round(toNumber(input.selfDisclosureScore))));
  const areas = computeJohariAreas(sfScore, sdScore);
  const visibilityIndex = Math.round(areas.open + areas.hidden);
  const selfAwarenessIndex = Math.round(areas.open + areas.blind);
  const growthIndex = Math.round(50 + sfScore / 2 + sdScore / 2);
  const totalAnswered = Math.max(0, Math.round(toNumber(input.totalAnswered)));
  const dominantQuadrant = input.dominantQuadrant?.trim() || "Open Area";

  const data = structuredClone(templateAssessmentData) as ClearAssessmentData;

  data.student = {
    ...data.student,
    name: studentName,
    classGrade: input.grade?.trim() || "-",
    institute: input.school?.trim() || "-",
    assessmentDate: formatAssessmentDate(input.submittedAt),
    counselor: counselorName,
    email: input.email?.trim() || data.student.email,
  };

  data.assessment = {
    ...data.assessment,
    questionsAnswered: totalAnswered > 0 ? `${totalAnswered}/20` : data.assessment.questionsAnswered,
    submittedAt: formatSubmittedAt(input.submittedAt),
  };

  data.scores = {
    feedbackSeeking: sfScore,
    selfDisclosure: sdScore,
    maxScore: JOHARI_MAX,
    johariPosition: { x: sfScore, y: sdScore },
  };

  data.johariAreas = areas;

  data.indices = {
    visibilityIndex,
    selfAwarenessIndex,
    growthIndex,
    growthPotential: growthPotentialLabel(growthIndex),
    currentJohariPosition: johariPositionLabel(dominantQuadrant),
  };

  data.executiveSummary = {
    ...data.executiveSummary,
    keyTakeaways: buildKeyTakeaways(sfScore, sdScore, areas),
  };

  data.selfAwarenessProfile = {
    ...data.selfAwarenessProfile,
    feedbackReception: `You actively solicit feedback (score: ${sfScore}/50), showing maturity and openness. However, integrating that feedback into daily behavior requires more consistent practice.`,
    keyInsights: [
      `Your self-disclosure gap is the primary driver of your Hidden zone (${areas.hidden}%).`,
      "Increasing expression by just 15% could shift your Johari position significantly.",
      "Your feedback-seeking behavior is a strategic advantage - leverage it weekly.",
    ],
  };

  data.finalSummary = {
    ...data.finalSummary,
    ninetyDayGoal: `Shift Johari Open zone from ${areas.open}% to ${Math.min(areas.open + 6, 35).toFixed(1)}%+, complete one leadership challenge, and establish a permanent feedback practice.`,
    biggestOpportunity: `Expanding self-expression to match your actual capabilities and reduce the ${areas.blind}% Blind zone.`,
  };

  return replaceTemplateNames(data, studentName, counselorName);
}
