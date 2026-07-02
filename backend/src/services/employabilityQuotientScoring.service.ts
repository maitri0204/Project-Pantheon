import { IStudentAssessmentAttempt } from "../models/StudentAssessmentAttempt";
import {
  EMPLOYABILITY_QUOTIENT_CODE,
  EMPLOYABILITY_QUOTIENT_DIMENSIONS,
} from "../data/employabilityQuotientBank";

export const EMPLOYABILITY_QUOTIENT_MAX_SCORE = 50;

export type EmployabilityQuotientDimension = (typeof EMPLOYABILITY_QUOTIENT_DIMENSIONS)[number];
export type EmployabilityQuotientDimensionScoreMap = Record<EmployabilityQuotientDimension, number>;

export interface EmployabilityQuotientEvaluationResult {
  assessmentCode: typeof EMPLOYABILITY_QUOTIENT_CODE;
  overallScore: number;
  overallPercentage: number;
  tier: string;
  dimensionScores: EmployabilityQuotientDimensionScoreMap;
  dimensionAnswered: EmployabilityQuotientDimensionScoreMap;
  answeredCount: number;
  totalQuestions: number;
}

function createEmptyDimensionMap(initial: number): EmployabilityQuotientDimensionScoreMap {
  return EMPLOYABILITY_QUOTIENT_DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension] = initial;
    return acc;
  }, {} as EmployabilityQuotientDimensionScoreMap);
}

export function scoreToPercentage(score: number): number {
  return Math.max(0, Math.min(100, Math.round((score / EMPLOYABILITY_QUOTIENT_MAX_SCORE) * 100)));
}

export function tierFromScore(score: number): string {
  if (score >= 45) return "Future-Ready Leader Tier";
  if (score >= 35) return "Adaptive Professional Tier";
  return "Emerging Contender Tier";
}

export function evaluateEmployabilityQuotientAnswers(
  attempt: IStudentAssessmentAttempt,
): EmployabilityQuotientEvaluationResult {
  const dimensionScores = createEmptyDimensionMap(0);
  const dimensionAnswered = createEmptyDimensionMap(0);

  let overallScore = 0;

  for (const question of attempt.questions) {
    if (!question.answer) continue;

    const dimension = String(question.category || "") as EmployabilityQuotientDimension;
    if (!EMPLOYABILITY_QUOTIENT_DIMENSIONS.includes(dimension)) continue;

    const selected = (question.options || []).find((opt) => opt.label === question.answer);
    const score = Number(selected?.score);
    if (!Number.isFinite(score)) continue;

    dimensionScores[dimension] += score;
    dimensionAnswered[dimension] += 1;
    overallScore += score;
  }

  const answeredCount = attempt.questions.filter((q) => q.answer).length;
  const overallPercentage = scoreToPercentage(overallScore);

  return {
    assessmentCode: EMPLOYABILITY_QUOTIENT_CODE,
    overallScore,
    overallPercentage,
    tier: tierFromScore(overallScore),
    dimensionScores,
    dimensionAnswered,
    answeredCount,
    totalQuestions: attempt.totalQuestions,
  };
}
