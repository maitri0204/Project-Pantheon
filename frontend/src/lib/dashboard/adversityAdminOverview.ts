import { apiRequest } from "@/lib/api";

export type AQLevel = "Exceptional" | "Strong" | "Moderate" | "Developing";

export type AdversityLevelDistribution = {
  Exceptional: number;
  Strong: number;
  Moderate: number;
  Developing: number;
};

export type AdversityMonthlyTrend = {
  month: string;
  avgAQ: number;
  totalAttempts: number;
  highResilient: number;
  atRisk: number;
};

export type AdversityAdminStudentStat = {
  studentId: string;
  name: string;
  email: string;
  bestScore: number;
  avgScore: number;
  totalAttempts: number;
  latestScore: number;
  latestLevel: AQLevel;
  lastAttempt: string;
};

export type AdversityAdminOverview = {
  overview: {
    totalAttempts: number;
    avgScore: number;
    bestScore: number;
    worstScore: number;
    uniqueStudentCount: number;
  };
  levelDistribution: AdversityLevelDistribution;
  scoreDistribution: Array<{ range: string; count: number; fill: string }>;
  subscaleAverages: {
    Control: number;
    Ownership: number;
    Reach: number;
    Endurance: number;
  };
  trend: AdversityMonthlyTrend[];
  students: AdversityAdminStudentStat[];
  reportsTotal: number;
};

export async function fetchAdversityAdminOverview(token: string): Promise<AdversityAdminOverview> {
  return apiRequest<AdversityAdminOverview>(
    "/platform/assessments/ADVERSITY_TEST/admin-overview",
    {},
    token,
  );
}
