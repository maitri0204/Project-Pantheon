export const EMPLOYABILITY_QUOTIENT_DIMENSIONS = [
  "Analytical Thinking",
  "Resilience, Flexibility, and Agility",
  "Leadership and Social Influence",
  "Creative Thinking",
  "Motivation and Self-Awareness",
  "Technological Literacy",
  "Empathy and Active Listening",
  "Curiosity and Lifelong Learning",
  "Talent Management",
  "Service Orientation and Customer Service",
] as const;

export type EmployabilityDimension = (typeof EMPLOYABILITY_QUOTIENT_DIMENSIONS)[number];

export const EMPLOYABILITY_QUOTIENT_MAX_SCORE = 50;

export function scoreToPercentage(score: number): number {
  return Math.max(0, Math.min(100, Math.round((score / EMPLOYABILITY_QUOTIENT_MAX_SCORE) * 100)));
}

export function tierFromScore(score: number): string {
  if (score >= 45) return "Future-Ready Leader Tier";
  if (score >= 35) return "Adaptive Professional Tier";
  return "Emerging Contender Tier";
}

export function tierMeta(tier: string): { color: string; bg: string; border: string } {
  if (tier.includes("Future-Ready")) {
    return { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  }
  if (tier.includes("Adaptive")) {
    return { color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200" };
  }
  return { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
}

export function normalizeDimensionScores(
  raw?: Record<string, number>,
): Record<EmployabilityDimension, number> {
  return EMPLOYABILITY_QUOTIENT_DIMENSIONS.reduce((acc, dimension) => {
    const value = Number(raw?.[dimension] ?? 0);
    acc[dimension] = Number.isFinite(value) ? value : 0;
    return acc;
  }, {} as Record<EmployabilityDimension, number>);
}

export function dimensionPercentage(correctCount: number): number {
  return Math.round((correctCount / 5) * 100);
}

export function getTopAndBottomDimensions(scores: Record<EmployabilityDimension, number>) {
  const ranked = EMPLOYABILITY_QUOTIENT_DIMENSIONS.map((dimension) => ({
    dimension,
    score: scores[dimension] ?? 0,
    percentage: dimensionPercentage(scores[dimension] ?? 0),
  })).sort((a, b) => b.score - a.score);

  return {
    strengths: ranked.filter((item) => item.score >= 4).slice(0, 4),
    focusAreas: [...ranked].reverse().filter((item) => item.score <= 2).slice(0, 4),
    ranked,
  };
}

const DIMENSION_SHORT: Record<string, string> = {
  "Analytical Thinking": "Analytical",
  "Resilience, Flexibility, and Agility": "Resilience",
  "Leadership and Social Influence": "Leadership",
  "Creative Thinking": "Creative",
  "Motivation and Self-Awareness": "Motivation",
  "Technological Literacy": "Technology",
  "Empathy and Active Listening": "Empathy",
  "Curiosity and Lifelong Learning": "Curiosity",
  "Talent Management": "Talent Mgmt",
  "Service Orientation and Customer Service": "Service",
};

export function shortDimensionLabel(dimension: string): string {
  return DIMENSION_SHORT[dimension] || dimension;
}
