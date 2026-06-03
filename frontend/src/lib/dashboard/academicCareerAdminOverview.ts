import { apiRequest } from "@/lib/api";

export type StreamCategory = "Science" | "Commerce" | "Arts" | "Hybrid";

export type AcademicCareerAdminInterestItem = {
  code: string;
  name: string;
  color: string;
  icon: string;
};

export type AcademicCareerAdminResultRow = {
  resultId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  grade: string;
  gradeLabel: string;
  location: string;
  completedAt: string;
  attemptNumber: number;
  streamRecommendation: StreamCategory;
  streamRecommendationDetailed: string;
  strongestDomain: string;
  topInterests: AcademicCareerAdminInterestItem[];
  totalQuestions: number;
  reportGeneratedAt: string;
};

export type AcademicCareerAdminOverview = {
  totalRegisteredStudents: number;
  gradeWiseStudents: Array<{ grade: string; count: number }>;
  totalCompletedAssessments: number;
  recentAssessmentActivity: AcademicCareerAdminResultRow[];
  topInterestDomains: Array<{ domain: string; count: number }>;
  streamRecommendationDistribution: Array<{ stream: StreamCategory; count: number }>;
  mostCommonCareerInterests: Array<{ interest: string; count: number }>;
  recentReportsGenerated: AcademicCareerAdminResultRow[];
  gradeWiseAnalytics: Array<{
    grade: string;
    students: number;
    completedAssessments: number;
    participationRate: number;
    topDomain: string;
    topStream: string;
  }>;
  assessmentParticipationTrends: Array<{
    month: string;
    registeredStudents: number;
    completedAssessments: number;
  }>;
  domainDistribution: Array<{ domain: string; count: number }>;
  streamAnalyticsByGrade: Array<{
    grade: string;
    Science: number;
    Commerce: number;
    Arts: number;
    Hybrid: number;
  }>;
  gradeComparisonDomains: Array<{
    domain: string;
    grade8: number;
    grade9: number;
    grade10: number;
  }>;
};

export async function fetchAcademicCareerAdminOverview(
  token: string,
): Promise<AcademicCareerAdminOverview> {
  return apiRequest<AcademicCareerAdminOverview>(
    "/platform/assessments/ACADEMIC_CAREER/admin-overview",
    {},
    token,
  );
}
