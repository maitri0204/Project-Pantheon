import type { LitmusAssessmentData, LitmusStyleKey } from "./types";

export const templateAssessmentData: LitmusAssessmentData = {
  parentName: "TDTesting DEF",
  assessmentDate: "June 6, 2026",
  overallScore: 84,
  maxScore: 150,
  primaryStyle: "Prince",
  secondaryStyle: "King",
  scores: { King: 18, Servant: 9, Elder: 14, Prince: 28, Joker: 15 },
  maxStyleScore: 30,
};

export const STYLE_COLORS: Record<string, string> = {
  King: "#C0392B",
  Servant: "#27AE60",
  Elder: "#8E44AD",
  Prince: "#2980B9",
  Joker: "#F39C12",
};

export const STYLE_LETTERS: Record<string, string> = {
  King: "K",
  Servant: "S",
  Elder: "E",
  Prince: "P",
  Joker: "J",
};

export function stylePercent(data: LitmusAssessmentData, style: LitmusStyleKey): number {
  return Math.round((data.scores[style] / data.maxStyleScore) * 100);
}

export function overallPercent(data: LitmusAssessmentData): number {
  return Math.round((data.overallScore / data.maxScore) * 100);
}

export function leastStyle(data: LitmusAssessmentData): LitmusStyleKey {
  const entries = Object.entries(data.scores) as [LitmusStyleKey, number][];
  return entries.reduce((a, b) => (a[1] < b[1] ? a : b))[0];
}

export function balanceScore(data: LitmusAssessmentData): number {
  const vals = Object.values(data.scores);
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  const variance = vals.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / vals.length;
  return Math.max(35, Math.min(92, Math.round(100 - variance * 1.8)));
}
