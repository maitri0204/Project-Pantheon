/**
 * RQ (Resilience Quotient) Scoring Service for Project Pantheon
 *
 * Evaluates Resilience Quotient based on four dimensions:
 * - Control: Ability to influence outcomes (6 questions × 4 points = 24 max)
 * - Ownership: Taking responsibility (5 questions × 4 points = 20 max)
 * - Reach: Limiting scope of setbacks (7 questions × 4 points = 28 max)
 * - Endurance: Duration of response (7 questions × 4 points = 28 max)
 *
 * Total max score: 100 points
 */

import { IStudentAssessmentAttempt } from "../models/StudentAssessmentAttempt";
import Question from "../models/Question";

export type AQDimension = "Control" | "Ownership" | "Reach" | "Endurance";
export type AQLevel = "Exceptional" | "Strong" | "Moderate" | "Developing";

export interface AQSubscaleScore {
  dimension: AQDimension;
  rawScore: number;
  maxScore: number;
  percentage: number;
}

export interface AQEvaluationResult {
  totalScore: number;
  aqLevel: AQLevel;
  subscales: AQSubscaleScore[];
}

// Max score per dimension (based on question distribution)
const DIMENSION_MAX_SCORES: Record<AQDimension, number> = {
  Control: 24,
  Ownership: 20,
  Reach: 28,
  Endurance: 28,
};

// Question ID to dimension mapping (loaded dynamically from DB)
let dimensionMap: Record<string, AQDimension> | null = null;
let scoringMap: Record<string, Record<string, number>> | null = null;

/**
 * Initialize dimension and scoring maps from database
 */
async function initializeMaps(): Promise<void> {
  if (dimensionMap && scoringMap) return;

  const questions = await Question.find({
    assessmentCode: { $in: ["RESILIENCE_TEST", "ADVERSITY_TEST"] },
    isActive: true,
  });

  dimensionMap = {};
  scoringMap = {};

  for (const q of questions) {
    const qIdStr = q._id.toString();
    dimensionMap[qIdStr] = (q.category as AQDimension) || "Control"; // category stores dimension

    const qScoring: Record<string, number> = {};
    for (const opt of q.options) {
      qScoring[opt.label] = opt.score ?? 1;
    }
    scoringMap[qIdStr] = qScoring;
  }
}

/**
 * Classify RQ level based on total score
 */
function classifyAQLevel(totalScore: number): AQLevel {
  if (totalScore >= 80) return "Exceptional";
  if (totalScore >= 65) return "Strong";
  if (totalScore >= 50) return "Moderate";
  return "Developing";
}

/**
 * Evaluate RQ answers from a StudentAssessmentAttempt
 */
export async function evaluateAQAnswers(attempt: IStudentAssessmentAttempt): Promise<AQEvaluationResult> {
  await initializeMaps();

  if (!dimensionMap || !scoringMap) {
    throw new Error("Failed to initialize dimension maps");
  }

  // Accumulate scores by dimension
  const dimensionTotals: Record<AQDimension, number> = {
    Control: 0,
    Ownership: 0,
    Reach: 0,
    Endurance: 0,
  };

  for (const q of attempt.questions) {
    if (!q.answer) continue;

    const qIdStr = q.questionId.toString();
    const dimension = dimensionMap[qIdStr];
    const optionScore = scoringMap[qIdStr]?.[q.answer];
    if (optionScore === undefined) {
      continue;
    }

    if (dimension) {
      dimensionTotals[dimension] += optionScore;
    }
  }

  // Calculate total score (max 100)
  const totalRaw = Object.values(dimensionTotals).reduce((sum, score) => sum + score, 0);
  const totalScore = Math.min(100, Math.round(totalRaw));

  // Build subscale breakdown
  const subscales: AQSubscaleScore[] = (Object.keys(DIMENSION_MAX_SCORES) as AQDimension[]).map((dim) => ({
    dimension: dim,
    rawScore: dimensionTotals[dim],
    maxScore: DIMENSION_MAX_SCORES[dim],
    percentage: Math.round((dimensionTotals[dim] / DIMENSION_MAX_SCORES[dim]) * 100),
  }));

  const aqLevel = classifyAQLevel(totalScore);

  return { totalScore, aqLevel, subscales };
}

/**
 * Get RQ level description
 */
export function getAQLevelDescription(level: AQLevel): string {
  const descriptions: Record<AQLevel, string> = {
    Exceptional: "You demonstrate exceptional resilience and adaptability. You effectively manage adversity and maintain a positive outlook.",
    Strong: "You show strong resilience with good ability to handle challenges. You bounce back well from setbacks.",
    Moderate: "You have moderate resilience. You can handle challenges but may struggle with unexpected adversities.",
    Developing: "You are developing your resilience skills. Focus on building adaptive strategies and expanding your perspective.",
  };
  return descriptions[level];
}

/**
 * Get dimension interpretation
 */
export function getDimensionInterpretation(dimension: AQDimension, percentage: number): string {
  const interpretations: Record<AQDimension, Record<string, string>> = {
    Control: {
      high: "You believe you can influence outcomes and take action in the face of adversity.",
      low: "You may feel helpless or believe external factors control your fate.",
    },
    Ownership: {
      high: "You take responsibility for your challenges and work toward solutions.",
      low: "You might blame external factors and avoid taking responsibility.",
    },
    Reach: {
      high: "You contain setbacks to specific situations and don't let them spread to other areas.",
      low: "You may allow setbacks to affect multiple areas of your life.",
    },
    Endurance: {
      high: "You believe challenges are temporary and view recovery as possible.",
      low: "You may perceive obstacles as long-lasting or permanent.",
    },
  };

  const level = percentage >= 70 ? "high" : "low";
  return interpretations[dimension][level];
}
