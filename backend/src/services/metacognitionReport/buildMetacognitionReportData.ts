import { getQuadrantType } from "./quadrantContent";
import type { AssessmentData, DomainScore } from "./types";

const DOMAIN_META = [
  { id: "D1", key: "domain1", name: "Awareness", max: 50 },
  { id: "D2", key: "domain2", name: "Planning", max: 50 },
  { id: "D3", key: "domain3", name: "Monitoring", max: 50 },
  { id: "D4", key: "domain4", name: "Regulation", max: 40 },
  { id: "D5", key: "domain5", name: "Reflection", max: 10 },
] as const;

const OVERALL_MAX = 200;

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAssessmentDate(value?: Date | string | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function buildMetacognitionReportData(input: {
  studentName: string;
  grade?: string;
  school?: string;
  submittedAt?: Date | string | null;
  counselor?: string;
  domainScores?: Record<string, unknown>;
  totalScore?: unknown;
}): AssessmentData {
  const domains: DomainScore[] = DOMAIN_META.map((meta) => {
    const score = Math.round(toNumber(input.domainScores?.[meta.key]));
    const percentage = meta.max > 0 ? Math.round((score / meta.max) * 100) : 0;
    return {
      id: meta.id,
      name: meta.name,
      score,
      max: meta.max,
      percentage,
    };
  });

  const totalScore = Math.round(toNumber(input.totalScore));
  const overallPercentage = Math.round((totalScore / OVERALL_MAX) * 100);
  const knowledge = domains[0].percentage;
  const regulationDenominator = DOMAIN_META.slice(1).reduce((sum, meta) => sum + meta.max, 0);
  const regulationScore = domains.slice(1).reduce((sum, domain) => sum + domain.score, 0);
  const regulation = regulationDenominator > 0
    ? Math.round((regulationScore / regulationDenominator) * 100)
    : 0;
  const learnerType = getQuadrantType(knowledge, regulation);

  return {
    student: {
      name: input.studentName,
      grade: input.grade?.trim() || "—",
      school: input.school?.trim() || "—",
      assessmentDate: formatAssessmentDate(input.submittedAt),
      counselor: input.counselor?.trim() || "Learning Counselor",
    },
    overall: {
      score: totalScore,
      maxScore: OVERALL_MAX,
      percentage: overallPercentage,
    },
    domains,
    quadrant: {
      type: learnerType,
      knowledge,
      regulation,
    },
    learnerType,
  };
}
