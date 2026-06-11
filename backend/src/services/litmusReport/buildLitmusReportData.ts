import { templateAssessmentData } from "./templateAssessmentData";
import type { LitmusAssessmentData, LitmusStyleKey } from "./types";

const LITMUS_MAX_STYLE_SCORE = 30;
const LITMUS_MAX_TOTAL_SCORE = 150;
const TEMPLATE_PARENT_NAME = templateAssessmentData.parentName;

const CODE_TO_STYLE: Record<string, LitmusStyleKey> = {
  K: "King",
  S: "Servant",
  E: "Elder",
  P: "Prince",
  J: "Joker",
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAssessmentDate(value?: Date | string | null): string {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function rankStyles(scores: Record<LitmusStyleKey, number>): [LitmusStyleKey, LitmusStyleKey] {
  const ordered = (Object.entries(scores) as [LitmusStyleKey, number][])
    .sort((a, b) => b[1] - a[1]);
  return [ordered[0]?.[0] ?? "Prince", ordered[1]?.[0] ?? "King"];
}

function replaceTemplateParentName<T>(value: T, parentName: string): T {
  if (typeof value === "string") {
    return value.split(TEMPLATE_PARENT_NAME).join(parentName) as T;
  }
  return value;
}

export function buildLitmusReportData(input: {
  parentName: string;
  submittedAt?: Date | string | null;
  styleScores?: Record<string, unknown>;
  totalScore?: unknown;
  dominantStyle?: string;
}): LitmusAssessmentData {
  const parentName = input.parentName.trim() || "Parent";
  const scores: Record<LitmusStyleKey, number> = {
    King: Math.max(0, Math.min(LITMUS_MAX_STYLE_SCORE, Math.round(toNumber(input.styleScores?.K)))),
    Servant: Math.max(0, Math.min(LITMUS_MAX_STYLE_SCORE, Math.round(toNumber(input.styleScores?.S)))),
    Elder: Math.max(0, Math.min(LITMUS_MAX_STYLE_SCORE, Math.round(toNumber(input.styleScores?.E)))),
    Prince: Math.max(0, Math.min(LITMUS_MAX_STYLE_SCORE, Math.round(toNumber(input.styleScores?.P)))),
    Joker: Math.max(0, Math.min(LITMUS_MAX_STYLE_SCORE, Math.round(toNumber(input.styleScores?.J)))),
  };

  const [primaryStyle, secondaryStyle] = rankStyles(scores);
  const dominantCode = String(input.dominantStyle || "").toUpperCase();
  const resolvedPrimary = CODE_TO_STYLE[dominantCode] ?? primaryStyle;

  const overallScore = Math.max(
    0,
    Math.min(
      LITMUS_MAX_TOTAL_SCORE,
      Math.round(toNumber(input.totalScore)) || Object.values(scores).reduce((sum, value) => sum + value, 0),
    ),
  );

  return replaceTemplateParentName({
    parentName,
    assessmentDate: formatAssessmentDate(input.submittedAt),
    overallScore,
    maxScore: LITMUS_MAX_TOTAL_SCORE,
    primaryStyle: resolvedPrimary,
    secondaryStyle: secondaryStyle === resolvedPrimary
      ? rankStyles(scores).find((style) => style !== resolvedPrimary) ?? secondaryStyle
      : secondaryStyle,
    scores,
    maxStyleScore: LITMUS_MAX_STYLE_SCORE,
  }, parentName);
}
