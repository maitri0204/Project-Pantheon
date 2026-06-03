import { apiRequest } from "@/lib/api";
import { normalizeAssessmentCode } from "@/lib/assessmentAccess";

export type AssessmentAdminAttempt = {
  attemptId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  grade: string;
  division: string;
  completedAt?: string;
  resultLabel: string;
  resultDetail?: string;
  score?: number;
  percentage?: number;
  metrics: Record<string, number>;
};

export type AssessmentAdminDimension = {
  key: string;
  label: string;
  value: number;
  max?: number;
};

export type AssessmentAdminDistribution = {
  label: string;
  count: number;
};

export type CareerCompassPairAverage = {
  pair: string;
  styleLabel: string;
  codeA: string;
  codeB: string;
  nameA: string;
  nameB: string;
  percentA: number;
  percentB: number;
};

export type MetacognitionAdminSummary = {
  avgDomainScores: AssessmentAdminDimension[];
  quadrantDistribution: AssessmentAdminDistribution[];
  avgKnowledgePct: number;
  avgRegulationPct: number;
};

export type CareerDnaCombinationStats = {
  personalityTypes: AssessmentAdminDistribution[];
  careerInterestCodes: AssessmentAdminDistribution[];
};

export type JohariAdminSummary = {
  avgSolicitsFeedback: number;
  avgSelfDisclosure: number;
  quadrants: {
    open: number;
    blind: number;
    hidden: number;
    unknown: number;
  };
};

export type AssessmentAdminDashboardResponse = {
  assessment: {
    code: string;
    name: string;
    category: string;
  };
  dashboardKind: string;
  summary: {
    totalAttempts: number;
    uniqueStudents: number;
    metricLabel?: string;
    metricValue?: string;
    metricSub?: string;
  };
  distributions: AssessmentAdminDistribution[];
  dimensionAverages: AssessmentAdminDimension[];
  recentAttempts: AssessmentAdminAttempt[];
  students: AssessmentAdminAttempt[];
  allAttempts: AssessmentAdminAttempt[];
  careerCompassPairs?: CareerCompassPairAverage[];
  metacognitionSummary?: MetacognitionAdminSummary;
  careerDnaCombinations?: CareerDnaCombinationStats;
  johariSummary?: JohariAdminSummary;
};

export async function fetchAssessmentAdminDashboard(
  token: string,
  assessmentCode: string,
): Promise<AssessmentAdminDashboardResponse> {
  const code = encodeURIComponent(normalizeAssessmentCode(assessmentCode));
  return apiRequest<AssessmentAdminDashboardResponse>(
    `/platform/assessments/${code}/admin-dashboard`,
    {},
    token,
  );
}
