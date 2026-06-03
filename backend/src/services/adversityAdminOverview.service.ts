import StudentAssessmentAttempt from "../models/StudentAssessmentAttempt";
import User from "../models/User";
import type { AQLevel } from "./aqScoring.service";

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

export type AdversityAdminOverviewPayload = {
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

const BUCKET_BOUNDARIES = [
  { label: "0–24", min: 0, max: 24, fill: "#f43f5e" },
  { label: "25–49", min: 25, max: 49, fill: "#f97316" },
  { label: "50–64", min: 50, max: 64, fill: "#f59e0b" },
  { label: "65–79", min: 65, max: 79, fill: "#0ea5e9" },
  { label: "80–100", min: 80, max: 100, fill: "#10b981" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseAqEvaluation(evaluation: Record<string, unknown> | null | undefined) {
  if (!evaluation || typeof evaluation !== "object") return null;
  const totalScore = Number(evaluation.totalScore);
  if (!Number.isFinite(totalScore)) return null;
  const aqLevel = typeof evaluation.aqLevel === "string"
    ? evaluation.aqLevel as AQLevel
    : "Moderate";
  const subscales: Array<{ dimension: string; percentage: number }> = [];
  if (Array.isArray(evaluation.subscales)) {
    evaluation.subscales.forEach((s) => {
      if (s && typeof s === "object") {
        const dim = String((s as { dimension?: string }).dimension || "");
        const pct = Number((s as { percentage?: number }).percentage);
        if (dim && Number.isFinite(pct)) subscales.push({ dimension: dim, percentage: pct });
      }
    });
  }
  return { totalScore, aqLevel, subscales };
}

function formatMonthLabel(date: Date): string {
  const currentYear = new Date().getFullYear();
  const month = MONTHS[date.getMonth()];
  return date.getFullYear() === currentYear
    ? month
    : `${month} '${String(date.getFullYear()).slice(2)}`;
}

export async function buildAdversityAdminOverview(
  organizationFilter: Record<string, unknown> | Record<string, never>,
): Promise<AdversityAdminOverviewPayload> {
  const students = await User.find({ role: "STUDENT", ...organizationFilter })
    .select("firstName lastName email createdAt")
    .lean();

  const studentById = new Map(students.map((s) => [String(s._id), s]));

  const attempts = await StudentAssessmentAttempt.find({
    ...organizationFilter,
    assessmentCode: { $in: ["ADVERSITY_TEST"] },
    status: "COMPLETED",
  })
    .sort({ completedAt: -1, updatedAt: -1 })
    .lean();

  type ParsedAttempt = {
    studentId: string;
    totalScore: number;
    aqLevel: AQLevel;
    subscales: Array<{ dimension: string; percentage: number }>;
    completedAt: Date;
  };

  const parsed: ParsedAttempt[] = [];
  for (const attempt of attempts) {
    const ev = parseAqEvaluation(attempt.evaluation as Record<string, unknown> | undefined);
    if (!ev) continue;
    parsed.push({
      studentId: String(attempt.user),
      ...ev,
      completedAt: attempt.completedAt || attempt.updatedAt || new Date(),
    });
  }

  const scores = parsed.map((p) => p.totalScore);
  const uniqueStudentIds = new Set(parsed.map((p) => p.studentId));

  const levelDistribution: AdversityLevelDistribution = {
    Exceptional: 0,
    Strong: 0,
    Moderate: 0,
    Developing: 0,
  };
  parsed.forEach((p) => {
    if (p.aqLevel in levelDistribution) {
      levelDistribution[p.aqLevel as keyof AdversityLevelDistribution] += 1;
    }
  });

  const scoreDistribution = BUCKET_BOUNDARIES.map((b) => ({
    range: b.label,
    count: parsed.filter((p) => p.totalScore >= b.min && p.totalScore <= b.max).length,
    fill: b.fill,
  }));

  const subscaleTotals: Record<string, { sum: number; count: number }> = {};
  parsed.forEach((p) => {
    p.subscales.forEach((s) => {
      if (!subscaleTotals[s.dimension]) subscaleTotals[s.dimension] = { sum: 0, count: 0 };
      subscaleTotals[s.dimension].sum += s.percentage;
      subscaleTotals[s.dimension].count += 1;
    });
  });

  const subscaleAverages = {
    Control: 0,
    Ownership: 0,
    Reach: 0,
    Endurance: 0,
  };
  (["Control", "Ownership", "Reach", "Endurance"] as const).forEach((dim) => {
    const t = subscaleTotals[dim];
    subscaleAverages[dim] = t?.count ? Math.round(t.sum / t.count) : 0;
  });

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const trendMap = new Map<string, {
    year: number;
    month: number;
    scoreSum: number;
    totalAttempts: number;
    highResilient: number;
    atRisk: number;
  }>();

  parsed.forEach((p) => {
    if (p.completedAt < sixMonthsAgo) return;
    const key = `${p.completedAt.getFullYear()}-${p.completedAt.getMonth()}`;
    const existing = trendMap.get(key);
    if (existing) {
      existing.scoreSum += p.totalScore;
      existing.totalAttempts += 1;
      if (p.totalScore >= 65) existing.highResilient += 1;
      if (p.totalScore < 50) existing.atRisk += 1;
    } else {
      trendMap.set(key, {
        year: p.completedAt.getFullYear(),
        month: p.completedAt.getMonth(),
        scoreSum: p.totalScore,
        totalAttempts: 1,
        highResilient: p.totalScore >= 65 ? 1 : 0,
        atRisk: p.totalScore < 50 ? 1 : 0,
      });
    }
  });

  const trend = Array.from(trendMap.values())
    .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))
    .map((m) => ({
      month: formatMonthLabel(new Date(m.year, m.month, 1)),
      avgAQ: Math.round(m.scoreSum / m.totalAttempts),
      totalAttempts: m.totalAttempts,
      highResilient: Math.round((m.highResilient / m.totalAttempts) * 100),
      atRisk: Math.round((m.atRisk / m.totalAttempts) * 100),
    }));

  const byStudent = new Map<string, ParsedAttempt[]>();
  parsed.forEach((p) => {
    const list = byStudent.get(p.studentId) ?? [];
    list.push(p);
    byStudent.set(p.studentId, list);
  });

  const studentStats: AdversityAdminStudentStat[] = Array.from(byStudent.entries())
    .map(([studentId, list]) => {
      const sorted = [...list].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
      const latest = sorted[0];
      const best = Math.max(...list.map((x) => x.totalScore));
      const avg = Math.round((list.reduce((s, x) => s + x.totalScore, 0) / list.length) * 10) / 10;
      const student = studentById.get(studentId);
      const name = student
        ? `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.email || "Student"
        : "Student";
      return {
        studentId,
        name,
        email: student?.email ?? "",
        bestScore: best,
        avgScore: avg,
        totalAttempts: list.length,
        latestScore: latest.totalScore,
        latestLevel: latest.aqLevel,
        lastAttempt: latest.completedAt.toISOString(),
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  return {
    overview: {
      totalAttempts: parsed.length,
      avgScore: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
      bestScore: scores.length ? Math.max(...scores) : 0,
      worstScore: scores.length ? Math.min(...scores) : 0,
      uniqueStudentCount: uniqueStudentIds.size,
    },
    levelDistribution,
    scoreDistribution,
    subscaleAverages,
    trend,
    students: studentStats,
    reportsTotal: parsed.length,
  };
}
