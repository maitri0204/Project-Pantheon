import {
  PERSONALITY_CAREERS,
  PERSONALITY_DISPLAY_NAMES,
  PERSONALITY_STREAMS,
  PERSONALITY_SUBJECTS,
} from "./personalityMappings";
import type { CareerCompassAssessmentData, CareerCompassDimensionSlice } from "./types";

type EvaluationDimension = {
  pair?: string;
  letterA?: string;
  letterB?: string;
  nameA?: string;
  nameB?: string;
  percentA?: number;
  percentB?: number;
  winner?: string;
};

function formatAssessmentDate(value?: Date | string | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function mapDimension(
  dimension: EvaluationDimension | undefined,
  label: string,
): CareerCompassDimensionSlice {
  const letterA = String(dimension?.letterA || "A");
  const letterB = String(dimension?.letterB || "B");

  return {
    label,
    traitA: String(dimension?.nameA || letterA),
    traitB: String(dimension?.nameB || letterB),
    percentA: Number(dimension?.percentA ?? 50),
    percentB: Number(dimension?.percentB ?? 50),
  };
}

function strongestTraitFromDimensions(
  dimensions: EvaluationDimension[],
  personalityCode: string,
): string {
  let best = dimensions[0];
  let bestMargin = -1;

  for (const dimension of dimensions) {
    const margin = Math.abs(Number(dimension?.percentA ?? 50) - Number(dimension?.percentB ?? 50));
    if (margin > bestMargin) {
      bestMargin = margin;
      best = dimension;
    }
  }

  if (best?.winner && best.nameA && best.nameB) {
    const winnerName = best.winner === best.letterA ? best.nameA : best.nameB;
    const short = winnerName.replace(/\s+Style$/i, "").replace(/\s+Orientation$/i, "").trim();
    if (short) return short;
  }

  const displayName = PERSONALITY_DISPLAY_NAMES[personalityCode] || personalityCode;
  return displayName.replace(/^The\s+/i, "").trim() || "Career Readiness";
}

export function buildCareerCompassReportData(input: {
  studentName: string;
  grade?: string;
  institute?: string;
  counselor?: string;
  submittedAt?: Date | string | null;
  personalityCode: string;
  description?: string;
  dimensions?: EvaluationDimension[];
}): CareerCompassAssessmentData {
  const personalityCode = String(input.personalityCode || "ENTP").toUpperCase();
  const dimensionList = Array.isArray(input.dimensions) ? input.dimensions : [];
  const byPair = new Map(dimensionList.map((item) => [String(item.pair || ""), item]));

  const energy = mapDimension(byPair.get("E/I"), "Energy Style");
  const cognitive = mapDimension(byPair.get("S/N"), "Cognitive Style");
  const decision = mapDimension(byPair.get("T/F"), "Decision Style");
  const working = mapDimension(byPair.get("J/P"), "Working Style");

  const winningPercents = dimensionList.map((item) => Math.max(
    Number(item.percentA ?? 50),
    Number(item.percentB ?? 50),
  ));
  const careerReadinessScore = winningPercents.length
    ? Math.round(winningPercents.reduce((sum, value) => sum + value, 0) / winningPercents.length)
    : 75;

  return {
    student: {
      name: input.studentName || "Student",
      grade: input.grade || "—",
      institute: input.institute || "—",
      assessmentDate: formatAssessmentDate(input.submittedAt),
      counselor: input.counselor || "Career Counselor",
    },
    personalityType: PERSONALITY_DISPLAY_NAMES[personalityCode] || personalityCode,
    personalityCode,
    description: input.description || "",
    dimensions: {
      energy,
      cognitive,
      decision,
      working,
    },
    suggestedStream: PERSONALITY_STREAMS[personalityCode] || "Commerce / Science",
    suggestedSubjects: PERSONALITY_SUBJECTS[personalityCode] || ["Economics", "Business Studies", "Mathematics"],
    recommendedCareers: PERSONALITY_CAREERS[personalityCode] || PERSONALITY_CAREERS.ENTP,
    careerReadinessScore,
    strongestTrait: strongestTraitFromDimensions(dimensionList, personalityCode),
  };
}
