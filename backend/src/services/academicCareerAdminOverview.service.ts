import StudentAssessmentAttempt from "../models/StudentAssessmentAttempt";
import User from "../models/User";
import {
  INTEREST_META,
  type IInterestScore,
  type InterestCode,
  buildStreamAnalysis,
} from "./academicCareerScoring.service";

export type StreamCategory = "Science" | "Commerce" | "Arts" | "Hybrid";

export type AcademicCareerAdminInterestItem = {
  code: string;
  name: string;
  color: string;
  icon: string;
};

export type AcademicCareerAdminScoreItem = {
  code: string;
  name: string;
  percentage: number;
  score: number;
  level: string;
  color: string;
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
  scores: AcademicCareerAdminScoreItem[];
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

const GRADES = ["Grade 8", "Grade 9", "Grade 10"] as const;
type GradeLabel = (typeof GRADES)[number];

function normalizeStream(streamName: string): StreamCategory {
  const normalized = streamName.toLowerCase();
  if (
    normalized.includes("humanities")
    || normalized.includes("arts")
    || normalized.includes("political science")
    || normalized.includes("social science")
    || normalized.includes("sociology")
    || normalized.includes("psychology")
  ) {
    return "Arts";
  }
  if (normalized.includes("commerce") || normalized.includes("business") || normalized.includes("finance")) {
    return "Commerce";
  }
  if (normalized.includes("science")) return "Science";
  return "Hybrid";
}

function normalizeGrade(grade?: string): GradeLabel | null {
  const match = String(grade || "").match(/\d+/);
  if (!match) return null;
  const n = Number(match[0]);
  if (n === 8) return "Grade 8";
  if (n === 9) return "Grade 9";
  if (n === 10) return "Grade 10";
  return null;
}

function gradeToShort(grade: GradeLabel | null): string {
  if (!grade) return "—";
  if (grade === "Grade 8") return "8";
  if (grade === "Grade 9") return "9";
  return "10";
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function parseEvaluation(evaluation: Record<string, unknown> | null | undefined) {
  if (!evaluation || typeof evaluation !== "object") return null;

  const interestScoresRaw = evaluation.interestScores;
  if (!Array.isArray(interestScoresRaw) || interestScoresRaw.length === 0) return null;

  const interestScores = interestScoresRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const code = String((item as { code?: string }).code || "") as InterestCode;
      const score = Number((item as { score?: number }).score);
      const percentage = Number((item as { percentage?: number }).percentage);
      const level = String((item as { level?: string }).level || "");
      if (!INTEREST_META[code]) return null;
      return {
        code,
        score: Number.isFinite(score) ? score : 0,
        percentage: Number.isFinite(percentage) ? percentage : 0,
        level,
      };
    })
    .filter((s): s is IInterestScore => Boolean(s));

  if (!interestScores.length) return null;

  const topInterestsRaw = Array.isArray(evaluation.topInterests)
    ? evaluation.topInterests.map(String).filter((c): c is InterestCode => c in INTEREST_META)
    : [];

  const sorted = [...interestScores].sort((a, b) => b.score - a.score);
  const topInterests = (topInterestsRaw.length
    ? topInterestsRaw
    : sorted.slice(0, 3).map((s) => s.code)) as InterestCode[];

  const streamAnalysisRaw = evaluation.streamAnalysis as { recommendedStream?: string } | undefined;
  const streamAnalysis = streamAnalysisRaw?.recommendedStream
    ? streamAnalysisRaw
    : buildStreamAnalysis(topInterests, interestScores);

  const recommendedStream = typeof streamAnalysis === "object" && streamAnalysis && "recommendedStream" in streamAnalysis
    ? String((streamAnalysis as { recommendedStream: string }).recommendedStream)
    : buildStreamAnalysis(topInterests, interestScores).recommendedStream;

  const strongest = sorted[0];

  return {
    interestScores,
    topInterests,
    recommendedStream,
    strongestDomain: INTEREST_META[strongest.code].name,
  };
}

type EnrichedRow = AcademicCareerAdminResultRow;

function enrichAttempt(
  attempt: {
    _id: { toString(): string };
    user: unknown;
    completedAt?: Date;
    updatedAt?: Date;
    totalQuestions?: number;
    evaluation?: Record<string, unknown>;
  },
  student: {
    _id: { toString(): string };
    firstName?: string;
    lastName?: string;
    email?: string;
    grade?: string;
    city?: string;
    state?: string;
    country?: string;
  } | null,
): EnrichedRow | null {
  const parsed = parseEvaluation(attempt.evaluation);
  if (!parsed) return null;

  const gradeNorm = normalizeGrade(student?.grade);
  const grade = gradeNorm ?? "Grade 8";
  const stream = normalizeStream(parsed.recommendedStream);
  const topInterests = parsed.topInterests.slice(0, 3).map((code) => ({
    code,
    name: INTEREST_META[code].name,
    color: INTEREST_META[code].color,
    icon: INTEREST_META[code].icon,
  }));

  const completedAt = attempt.completedAt || attempt.updatedAt || new Date();

  return {
    resultId: attempt._id.toString(),
    studentId: student?._id.toString() ?? "",
    studentName: student
      ? `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.email || "Student"
      : "Student",
    studentEmail: student?.email ?? "",
    grade,
    gradeLabel: gradeToShort(gradeNorm),
    location: student
      ? [student.city, student.state, student.country].filter(Boolean).join(", ")
      : "",
    completedAt: completedAt.toISOString(),
    attemptNumber: 1,
    streamRecommendation: stream,
    streamRecommendationDetailed: parsed.recommendedStream,
    strongestDomain: parsed.strongestDomain,
    topInterests,
    totalQuestions: attempt.totalQuestions ?? 60,
    scores: parsed.interestScores.map((score) => ({
      code: score.code,
      name: INTEREST_META[score.code].name,
      percentage: score.percentage,
      score: score.score,
      level: score.level,
      color: INTEREST_META[score.code].color,
    })),
    reportGeneratedAt: completedAt.toISOString(),
  };
}

export async function buildAcademicCareerAdminOverview(
  organizationFilter: Record<string, unknown> | Record<string, never>,
): Promise<AcademicCareerAdminOverview> {
  const students = await User.find({ role: "STUDENT", ...organizationFilter })
    .select("firstName lastName email grade city state country createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const studentById = new Map<string, typeof students[number]>();
  students.forEach((s) => studentById.set(String(s._id), s));

  const attempts = await StudentAssessmentAttempt.find({
    ...organizationFilter,
    assessmentCode: { $in: ["ACADEMIC_CAREER"] },
    status: "COMPLETED",
  })
    .sort({ completedAt: -1, updatedAt: -1 })
    .limit(1000)
    .lean();

  const enrichedAttempts: EnrichedRow[] = [];
  const attemptsByStudent = new Map<string, EnrichedRow[]>();

  for (const attempt of attempts) {
    const student = studentById.get(String(attempt.user));
    const row = enrichAttempt(attempt, student ?? null);
    if (!row) continue;
    enrichedAttempts.push(row);
    const list = attemptsByStudent.get(row.studentId) ?? [];
    list.push(row);
    attemptsByStudent.set(row.studentId, list);
  }

  const gradeWiseStudents = GRADES.map((grade) => ({
    grade,
    count: students.filter((s) => normalizeGrade(s.grade) === grade).length,
  }));

  const streamDistributionMap = new Map<StreamCategory, number>([
    ["Science", 0],
    ["Commerce", 0],
    ["Arts", 0],
    ["Hybrid", 0],
  ]);
  enrichedAttempts.forEach((attempt) => {
    streamDistributionMap.set(
      attempt.streamRecommendation,
      (streamDistributionMap.get(attempt.streamRecommendation) ?? 0) + 1,
    );
  });

  const strongestDomainMap = new Map<string, number>();
  const topInterestMap = new Map<string, number>();
  enrichedAttempts.forEach((attempt) => {
    strongestDomainMap.set(
      attempt.strongestDomain,
      (strongestDomainMap.get(attempt.strongestDomain) ?? 0) + 1,
    );
    attempt.topInterests.forEach((interest) => {
      topInterestMap.set(interest.name, (topInterestMap.get(interest.name) ?? 0) + 1);
    });
  });

  const sortedDomains = Array.from(strongestDomainMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([domain, count]) => ({ domain, count }));

  const sortedInterests = Array.from(topInterestMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([interest, count]) => ({ interest, count }));

  const latestByStudent = new Map<string, EnrichedRow>();
  enrichedAttempts.forEach((attempt) => {
    if (!latestByStudent.has(attempt.studentId)) {
      latestByStudent.set(attempt.studentId, attempt);
    }
  });

  const gradeWiseAnalytics = GRADES.map((grade) => {
    const gradeStudents = students.filter((s) => normalizeGrade(s.grade) === grade);
    const gradeStudentIds = new Set(gradeStudents.map((s) => String(s._id)));
    const gradeAttempts = enrichedAttempts.filter((a) => a.grade === grade);
    const studentsWithAttempts = gradeStudents.filter(
      (s) => (attemptsByStudent.get(String(s._id)) ?? []).length > 0,
    ).length;
    const participationRate = gradeStudents.length
      ? Math.round((studentsWithAttempts / gradeStudents.length) * 100)
      : 0;

    const latestGradeAttempts = Array.from(latestByStudent.values()).filter((a) =>
      gradeStudentIds.has(a.studentId),
    );

    const topDomain = latestGradeAttempts.length
      ? Object.entries(
          latestGradeAttempts.reduce<Record<string, number>>((acc, a) => {
            acc[a.strongestDomain] = (acc[a.strongestDomain] ?? 0) + 1;
            return acc;
          }, {}),
        ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A"
      : "N/A";

    const topStream = latestGradeAttempts.length
      ? Object.entries(
          latestGradeAttempts.reduce<Record<string, number>>((acc, a) => {
            acc[a.streamRecommendation] = (acc[a.streamRecommendation] ?? 0) + 1;
            return acc;
          }, {}),
        ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A"
      : "N/A";

    return {
      grade,
      students: gradeStudents.length,
      completedAssessments: gradeAttempts.length,
      participationRate,
      topDomain,
      topStream,
    };
  });

  const now = new Date();
  const trendMonths: Date[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    trendMonths.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }

  const participationTrends = trendMonths.map((monthStart) => {
    const nextMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    const registeredStudents = students.filter((s) => {
      const created = s.createdAt ? new Date(s.createdAt) : new Date(0);
      return created < nextMonthStart;
    }).length;
    const completedAssessments = attempts.filter((a) => {
      const completed = a.completedAt ? new Date(a.completedAt) : null;
      return completed && completed >= monthStart && completed < nextMonthStart;
    }).length;
    return {
      month: formatMonthLabel(monthStart),
      registeredStudents,
      completedAssessments,
    };
  });

  const streamAnalyticsByGrade = GRADES.map((grade) => {
    const latestGradeAttempts = Array.from(latestByStudent.values()).filter((a) => a.grade === grade);
    const streamCounters: Record<StreamCategory, number> = {
      Science: 0,
      Commerce: 0,
      Arts: 0,
      Hybrid: 0,
    };
    latestGradeAttempts.forEach((a) => {
      streamCounters[a.streamRecommendation] += 1;
    });
    return { grade, ...streamCounters };
  });

  const domainNames = Object.values(INTEREST_META).map((m) => m.name);
  const gradeComparisonDomains = domainNames.map((domainName) => {
    const grades: Record<GradeLabel, number> = {
      "Grade 8": 0,
      "Grade 9": 0,
      "Grade 10": 0,
    };

    GRADES.forEach((grade) => {
      const attemptsInGrade = enrichedAttempts.filter((a) => a.grade === grade);
      if (!attemptsInGrade.length) {
        grades[grade] = 0;
        return;
      }
      const percentages = attemptsInGrade.map((attempt) => {
        const entry = attempt.scores.find((s) => s.name === domainName);
        return entry?.percentage ?? 0;
      });
      grades[grade] = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
    });

    return {
      domain: domainName,
      grade8: grades["Grade 8"],
      grade9: grades["Grade 9"],
      grade10: grades["Grade 10"],
    };
  });

  return {
    totalRegisteredStudents: students.length,
    gradeWiseStudents,
    totalCompletedAssessments: enrichedAttempts.length,
    recentAssessmentActivity: enrichedAttempts.slice(0, 12),
    topInterestDomains: sortedDomains.slice(0, 8),
    streamRecommendationDistribution: Array.from(streamDistributionMap.entries()).map(([stream, count]) => ({
      stream,
      count,
    })),
    mostCommonCareerInterests: sortedInterests.slice(0, 10),
    recentReportsGenerated: enrichedAttempts.slice(0, 12),
    gradeWiseAnalytics,
    assessmentParticipationTrends: participationTrends,
    domainDistribution: sortedDomains,
    streamAnalyticsByGrade,
    gradeComparisonDomains,
  };
}
