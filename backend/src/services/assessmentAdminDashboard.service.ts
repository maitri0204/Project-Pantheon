import { STUDY_ABROAD_TOPICS } from "./studyAbroadQuestionSelection.service";
import { scoreToPercentage as studyAbroadScoreToPct } from "./studyAbroadScoring.service";

export type AdminDashboardDimension = {
  key: string;
  label: string;
  value: number;
  max?: number;
};

export type AdminDashboardDistribution = {
  label: string;
  count: number;
};

export type AdminDashboardAttemptRow = {
  attemptId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  grade: string;
  division: string;
  completedAt?: Date;
  resultLabel: string;
  resultDetail?: string;
  score?: number;
  percentage?: number;
  metrics: Record<string, number>;
};

export type AdminDashboardSummary = {
  totalAttempts: number;
  uniqueStudents: number;
  metricLabel?: string;
  metricValue?: string;
  metricSub?: string;
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
  avgDomainScores: AdminDashboardDimension[];
  quadrantDistribution: AdminDashboardDistribution[];
  avgKnowledgePct: number;
  avgRegulationPct: number;
};

export type CareerDnaCombinationStats = {
  personalityTypes: AdminDashboardDistribution[];
  careerInterestCodes: AdminDashboardDistribution[];
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

export type AssessmentAdminDashboardPayload = {
  dashboardKind: string;
  summary: AdminDashboardSummary;
  distributions: AdminDashboardDistribution[];
  dimensionAverages: AdminDashboardDimension[];
  recentAttempts: AdminDashboardAttemptRow[];
  students: AdminDashboardAttemptRow[];
  allAttempts: AdminDashboardAttemptRow[];
  careerCompassPairs?: CareerCompassPairAverage[];
  metacognitionSummary?: MetacognitionAdminSummary;
  careerDnaCombinations?: CareerDnaCombinationStats;
  johariSummary?: JohariAdminSummary;
};

const bandFromStudyAbroadScore = (score: number): string => {
  const pct = studyAbroadScoreToPct(score);
  if (pct > 90) return "Completely Ready";
  if (pct >= 76) return "Almost Ready";
  if (pct >= 51) return "Moderately Ready";
  if (pct >= 26) return "Partially Ready";
  return "At Risk";
};

const avg = (values: number[]) =>
  values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : 0;

const increment = (map: Record<string, number>, key: string) => {
  if (!key) return;
  map[key] = (map[key] || 0) + 1;
};

const toDistributions = (map: Record<string, number>): AdminDashboardDistribution[] =>
  Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));

const latestByStudent = (rows: AdminDashboardAttemptRow[]) => {
  const map = new Map<string, AdminDashboardAttemptRow>();
  rows.forEach((row) => {
    if (!map.has(row.studentId)) map.set(row.studentId, row);
  });
  return Array.from(map.values());
};

type AttemptInput = {
  attemptId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  grade: string;
  division: string;
  completedAt?: Date;
  evaluation?: Record<string, unknown> | null;
};

type ParsedAttemptMetrics = {
  resultLabel: string;
  resultDetail?: string;
  score?: number;
  percentage?: number;
  metrics: Record<string, number>;
};

function parseStudyAbroad(evaluation: Record<string, unknown>): ParsedAttemptMetrics | null {
  const overallScore = Number(evaluation.overallScore);
  if (!Number.isFinite(overallScore)) return null;
  const percentage = Number.isFinite(Number(evaluation.overallPercentage))
    ? Number(evaluation.overallPercentage)
    : studyAbroadScoreToPct(overallScore);
  const band = typeof evaluation.band === "string"
    ? evaluation.band
    : bandFromStudyAbroadScore(overallScore);
  const metrics: Record<string, number> = {};
  const raw = evaluation.topicScores;
  if (raw && typeof raw === "object") {
    Object.entries(raw as Record<string, unknown>).forEach(([k, v]) => {
      const n = Number(v);
      if (Number.isFinite(n)) metrics[k] = n;
    });
  }
  return {
    resultLabel: band,
    resultDetail: `${overallScore} / 150`,
    score: overallScore,
    percentage,
    metrics,
  };
}

function parseAdversity(evaluation: Record<string, unknown>) {
  const totalScore = Number(evaluation.totalScore);
  if (!Number.isFinite(totalScore)) return null;
  const level = typeof evaluation.aqLevel === "string" ? evaluation.aqLevel : "-";
  const metrics: Record<string, number> = {};
  const subscales = evaluation.subscales;
  if (Array.isArray(subscales)) {
    subscales.forEach((s) => {
      if (s && typeof s === "object") {
        const dim = String((s as { dimension?: string }).dimension || "");
        const pct = Number((s as { percentage?: number }).percentage);
        if (dim && Number.isFinite(pct)) metrics[dim] = pct;
      }
    });
  }
  return {
    resultLabel: level,
    resultDetail: `${totalScore} / 100`,
    score: totalScore,
    percentage: totalScore,
    metrics,
  };
}

const INTEREST_NAMES: Record<string, string> = {
  A: "Science & Research",
  B: "Commerce & Financial",
  C: "Social Science & Law",
  D: "Creative Arts & Design",
  E: "Technology & Digital",
  F: "Health & Biology",
  G: "Communication & Education",
  H: "Entrepreneurship & Leadership",
  I: "Sports & Performance",
  J: "Environment & Sustainability",
};

function parseAcademicCareer(evaluation: Record<string, unknown>) {
  const stream = (evaluation.streamAnalysis as { recommendedStream?: string } | undefined)?.recommendedStream;
  const topInterests = Array.isArray(evaluation.topInterests)
    ? evaluation.topInterests.map(String)
    : [];
  if (!stream && topInterests.length === 0) return null;
  const metrics: Record<string, number> = {};
  const scores = evaluation.interestScores;
  if (Array.isArray(scores)) {
    scores.forEach((item) => {
      if (item && typeof item === "object") {
        const code = String((item as { code?: string }).code || "");
        const score = Number((item as { score?: number }).score);
        if (code && Number.isFinite(score)) metrics[code] = score;
      }
    });
  }
  const topLabel = topInterests
    .slice(0, 3)
    .map((c) => INTEREST_NAMES[c] || c)
    .join(", ");
  return {
    resultLabel: stream || topLabel || "-",
    resultDetail: topLabel ? `Top: ${topLabel}` : undefined,
    score: topInterests.length ? metrics[topInterests[0]] : undefined,
    percentage: undefined,
    metrics,
  };
}

function parseCareerCompass(evaluation: Record<string, unknown>) {
  const personalityType = typeof evaluation.personalityType === "string"
    ? evaluation.personalityType
    : "";
  if (!personalityType) return null;
  const metrics: Record<string, number> = {};
  const dimensions = evaluation.dimensions;
  if (Array.isArray(dimensions)) {
    dimensions.forEach((d) => {
      if (d && typeof d === "object") {
        const winner = String((d as { winner?: string }).winner || "");
        const pct = Number((d as { percentA?: number; percentB?: number }).percentA);
        if (winner) metrics[winner] = Number.isFinite(pct) ? pct : 50;
      }
    });
  }
  return {
    resultLabel: personalityType,
    resultDetail: typeof evaluation.description === "string"
      ? evaluation.description.slice(0, 80)
      : undefined,
    metrics,
  };
}

function parseJohari(evaluation: Record<string, unknown>) {
  const dominant = typeof evaluation.dominantQuadrant === "string"
    ? evaluation.dominantQuadrant
    : "";
  const quadrants = evaluation.quadrants as Record<string, number> | undefined;
  if (!dominant && !quadrants) return null;
  const metrics: Record<string, number> = {};
  if (quadrants && typeof quadrants === "object") {
    Object.entries(quadrants).forEach(([k, v]) => {
      const n = Number(v);
      if (Number.isFinite(n)) metrics[k] = n;
    });
  }
  return {
    resultLabel: dominant || "-",
    resultDetail: evaluation.solicitsFeedbackScore != null && evaluation.selfDisclosureScore != null
      ? `Feedback ${evaluation.solicitsFeedbackScore} · Disclosure ${evaluation.selfDisclosureScore}`
      : undefined,
    metrics,
  };
}

const LITMUS_STYLE_NAMES: Record<string, string> = {
  K: "King",
  S: "Servant",
  E: "Elder",
  P: "Prince",
  J: "Joker",
};

const LITMUS_STYLE_MAX_SCORE = 30;

function toLitmusStylePercentage(rawScore: number): number {
  if (!Number.isFinite(rawScore)) return 0;
  return Math.round((rawScore / LITMUS_STYLE_MAX_SCORE) * 100);
}

const METACOGNITION_DOMAIN_LABELS: Record<string, string> = {
  domain1: "Awareness",
  domain2: "Planning",
  domain3: "Monitoring",
  domain4: "Regulation",
  domain5: "Reflection",
};

const METACOGNITION_DOMAIN_MAX: Record<string, number> = {
  domain1: 50,
  domain2: 50,
  domain3: 50,
  domain4: 40,
  domain5: 10,
};

const CAREER_COMPASS_PAIR_META: Record<
  string,
  { styleLabel: string; letterA: string; letterB: string; codeA: string; codeB: string; nameA: string; nameB: string }
> = {
  "E/I": {
    styleLabel: "Energy Style",
    letterA: "E",
    letterB: "I",
    codeA: "SO",
    codeB: "RO",
    nameA: "Social Orientation",
    nameB: "Reflective Orientation",
  },
  "S/N": {
    styleLabel: "Cognitive Style",
    letterA: "S",
    letterB: "N",
    codeA: "PO",
    codeB: "CT",
    nameA: "Practical Observation",
    nameB: "Conceptual Thinking",
  },
  "T/F": {
    styleLabel: "Values Style",
    letterA: "T",
    letterB: "F",
    codeA: "LD",
    codeB: "VD",
    nameA: "Logical Decision Style",
    nameB: "Value-Based Decision Style",
  },
  "J/P": {
    styleLabel: "Life Style",
    letterA: "J",
    letterB: "P",
    codeA: "SW",
    codeB: "FW",
    nameA: "Structured Working Style",
    nameB: "Flexible Working Style",
  },
};

const CAREER_DNA_SCORE_SECTIONS = new Set([
  "COGNITIVE",
  "APTITUDE",
  "EMOTIONAL_INTELLIGENCE",
  "LEARNING_STYLE",
  "BEHAVIORAL_SOCIAL",
  "STRESS_RESILIENCE",
]);

const CAREER_DNA_SECTION_LABELS: Record<string, string> = {
  PERSONALITY: "Personality Type",
  CAREER_INTEREST: "Career Interest",
  COGNITIVE: "Cognitive",
  APTITUDE: "Aptitude",
  EMOTIONAL_INTELLIGENCE: "Emotional Intelligence",
  LEARNING_STYLE: "Learning Style",
  BEHAVIORAL_SOCIAL: "Behavioral & Social",
  STRESS_RESILIENCE: "Stress & Resilience",
};

function parseLitmus(evaluation: Record<string, unknown>) {
  const dominant = typeof evaluation.dominantStyle === "string" ? evaluation.dominantStyle : "";
  const totalScore = Number(evaluation.totalScore);
  if (!dominant && !Number.isFinite(totalScore)) return null;
  const metrics: Record<string, number> = {};
  const styleScores = evaluation.styleScores;
  if (styleScores && typeof styleScores === "object") {
    Object.entries(styleScores as Record<string, unknown>).forEach(([k, v]) => {
      const n = Number(v);
      if (Number.isFinite(n)) metrics[k] = n;
    });
  }
  return {
    resultLabel: LITMUS_STYLE_NAMES[dominant] || dominant || "-",
    resultDetail: Number.isFinite(totalScore) ? `Score ${totalScore}` : undefined,
    score: Number.isFinite(totalScore) ? totalScore : undefined,
    metrics,
  };
}

function parseMetacognition(evaluation: Record<string, unknown>) {
  const totalScore = Number(evaluation.totalScore);
  if (!Number.isFinite(totalScore)) return null;
  const metrics: Record<string, number> = {};
  const domainScores = evaluation.domainScores as Record<string, number> | undefined;
  if (domainScores && typeof domainScores === "object") {
    Object.entries(domainScores).forEach(([k, v]) => {
      const n = Number(v);
      const label = METACOGNITION_DOMAIN_LABELS[k] || k;
      if (Number.isFinite(n)) metrics[label] = n;
    });
  }

  let resultLabel = `${totalScore} pts`;
  if (domainScores) {
    const knowledgeScore = Number(domainScores.domain1) || 0;
    const regulationScore =
      (Number(domainScores.domain2) || 0)
      + (Number(domainScores.domain3) || 0)
      + (Number(domainScores.domain4) || 0)
      + (Number(domainScores.domain5) || 0);
    const knowledgePct = Math.round((knowledgeScore / 50) * 100);
    const regulationPct = Math.round((regulationScore / 150) * 100);
    resultLabel = getMetacognitionQuadrantLabel(knowledgePct, regulationPct);
  }

  return {
    resultLabel,
    resultDetail: `${totalScore} pts total`,
    score: totalScore,
    metrics,
  };
}

function parseCareerDna(evaluation: Record<string, unknown>) {
  const sections = evaluation.sections;
  if (!sections || typeof sections !== "object") return null;
  const metrics: Record<string, number> = {};
  let headline = "";
  Object.entries(sections as Record<string, unknown>).forEach(([key, section]) => {
    if (!section || typeof section !== "object") return;
    const pct = Number((section as { overallPercentage?: number }).overallPercentage);
    if (Number.isFinite(pct) && CAREER_DNA_SCORE_SECTIONS.has(key)) {
      metrics[CAREER_DNA_SECTION_LABELS[key] || key] = pct;
    }
    if (key === "PERSONALITY" && typeof (section as { personalityType?: string }).personalityType === "string") {
      headline = (section as { personalityType: string }).personalityType;
    }
    if (key === "CAREER_INTEREST" && typeof (section as { dominantCode?: string }).dominantCode === "string") {
      headline = (section as { dominantCode: string }).dominantCode;
    }
  });
  const sectionCount = Object.keys(sections).length;
  return {
    resultLabel: headline || `${sectionCount} sections`,
    resultDetail: `${sectionCount} profile sections completed`,
    metrics,
  };
}

function parseEvaluation(
  code: string,
  evaluation: Record<string, unknown> | null | undefined,
): ParsedAttemptMetrics | null {
  if (!evaluation || typeof evaluation !== "object") return null;

  switch (code) {
    case "STUDY_ABROAD": {
      const parsed = parseStudyAbroad(evaluation);
      return parsed ? { ...parsed } : null;
    }
    case "RESILIENCE_TEST":
    case "ADVERSITY_TEST": {
      const parsed = parseAdversity(evaluation);
      return parsed ? { ...parsed } : null;
    }
    case "ACADEMIC_CAREER": {
      const parsed = parseAcademicCareer(evaluation);
      return parsed ? { ...parsed } : null;
    }
    case "CAREER_COMPASS": {
      const parsed = parseCareerCompass(evaluation);
      return parsed ? { ...parsed } : null;
    }
    case "JOHARI_WINDOW": {
      const parsed = parseJohari(evaluation);
      return parsed ? { ...parsed } : null;
    }
    case "LITMUS_TEST": {
      const parsed = parseLitmus(evaluation);
      return parsed ? { ...parsed } : null;
    }
    case "METACOGNITION_TEST": {
      const parsed = parseMetacognition(evaluation);
      return parsed ? { ...parsed } : null;
    }
    case "CAREER_DNA": {
      const parsed = parseCareerDna(evaluation);
      return parsed ? { ...parsed } : null;
    }
    default:
      return {
        resultLabel: "Completed",
        metrics: {},
      };
  }
}

function buildDimensionAverages(
  rows: AdminDashboardAttemptRow[],
  labelMap?: Record<string, string>,
): AdminDashboardDimension[] {
  const totals: Record<string, { sum: number; count: number }> = {};
  rows.forEach((row) => {
    Object.entries(row.metrics).forEach(([key, value]) => {
      if (!totals[key]) totals[key] = { sum: 0, count: 0 };
      totals[key].sum += value;
      totals[key].count += 1;
    });
  });
  return Object.entries(totals)
    .map(([key, { sum, count }]) => ({
      key,
      label: labelMap?.[key] || key,
      value: count > 0 ? Math.round(sum / count) : 0,
      max: 100,
    }))
    .sort((a, b) => b.value - a.value);
}

function buildSummary(
  code: string,
  rows: AdminDashboardAttemptRow[],
  distributions: AdminDashboardDistribution[],
  dimensionAverages: AdminDashboardDimension[],
): AdminDashboardSummary {
  const uniqueStudents = new Set(rows.map((r) => r.studentId)).size;
  const summary: AdminDashboardSummary = {
    totalAttempts: rows.length,
    uniqueStudents,
  };

  switch (code) {
    case "STUDY_ABROAD": {
      const scores = rows.map((r) => r.score).filter((s): s is number => Number.isFinite(s));
      const avgScore = avg(scores);
      summary.metricLabel = "Avg Score";
      summary.metricValue = scores.length ? `${avgScore} / 150` : "-";
      summary.metricSub = scores.length ? bandFromStudyAbroadScore(avgScore) : undefined;
      break;
    }
    case "RESILIENCE_TEST":
    case "ADVERSITY_TEST": {
      const scores = rows.map((r) => r.score).filter((s): s is number => Number.isFinite(s));
      summary.metricLabel = "Avg RQ Score";
      summary.metricValue = scores.length ? `${avg(scores)} / 100` : "-";
      summary.metricSub = distributions[0]?.label;
      break;
    }
    case "ACADEMIC_CAREER":
      summary.metricLabel = "Top Stream (mode)";
      summary.metricValue = distributions[0]?.label || "-";
      summary.metricSub = distributions[0] ? `${distributions[0].count} students` : undefined;
      break;
    case "CAREER_COMPASS":
    case "CAREER_DNA":
      summary.metricLabel = "Most Common Type";
      summary.metricValue = distributions[0]?.label || "-";
      summary.metricSub = distributions[0] ? `${distributions[0].count} students` : undefined;
      break;
    case "JOHARI_WINDOW":
      summary.metricLabel = "Dominant Quadrant";
      summary.metricValue = distributions[0]?.label || "-";
      break;
    case "LITMUS_TEST":
      summary.metricLabel = "Dominant Style";
      summary.metricValue = distributions[0]?.label || "-";
      break;
    case "METACOGNITION_TEST": {
      const scores = rows.map((r) => r.score).filter((s): s is number => Number.isFinite(s));
      summary.metricLabel = "Avg Total Score";
      summary.metricValue = scores.length ? String(avg(scores)) : "-";
      break;
    }
    default:
      if (dimensionAverages[0]) {
        summary.metricLabel = "Top Dimension";
        summary.metricValue = dimensionAverages[0].label;
      }
  }

  return summary;
}

const DIMENSION_LABELS: Record<string, Record<string, string>> = {
  STUDY_ABROAD: Object.fromEntries(
    STUDY_ABROAD_TOPICS.map((t) => [t, t.replace(" Readiness", "")]),
  ),
  RESILIENCE_TEST: {
    Control: "Control",
    Ownership: "Ownership",
    Reach: "Reach",
    Endurance: "Endurance",
  },
  ADVERSITY_TEST: {
    Control: "Control",
    Ownership: "Ownership",
    Reach: "Reach",
    Endurance: "Endurance",
  },
  ACADEMIC_CAREER: INTEREST_NAMES,
  LITMUS_TEST: LITMUS_STYLE_NAMES,
  JOHARI_WINDOW: {
    open: "Open Area",
    blind: "Blind Spot",
    hidden: "Hidden Area",
    unknown: "Unknown",
  },
};

function getMetacognitionQuadrantLabel(knowledgePct: number, regulationPct: number): string {
  if (knowledgePct >= 50 && regulationPct >= 50) return "Self-Regulated Learner";
  if (knowledgePct < 50 && regulationPct >= 50) return "Reflective Learner";
  if (knowledgePct < 50 && regulationPct < 50) return "Passive Learner";
  return "Strategic Learner";
}

function buildCareerCompassPairs(attempts: AttemptInput[]): CareerCompassPairAverage[] {
  const agg: Record<string, { aSum: number; bSum: number; count: number }> = {};

  attempts.forEach((attempt) => {
    const dimensions = attempt.evaluation?.dimensions;
    if (!Array.isArray(dimensions)) return;
    dimensions.forEach((raw) => {
      if (!raw || typeof raw !== "object") return;
      const pair = String((raw as { pair?: string }).pair || "");
      const meta = CAREER_COMPASS_PAIR_META[pair];
      if (!meta) return;
      const percentA = Number((raw as { percentA?: number }).percentA);
      const percentB = Number((raw as { percentB?: number }).percentB);
      if (!Number.isFinite(percentA) || !Number.isFinite(percentB)) return;
      if (!agg[pair]) agg[pair] = { aSum: 0, bSum: 0, count: 0 };
      agg[pair].aSum += percentA;
      agg[pair].bSum += percentB;
      agg[pair].count += 1;
    });
  });

  return Object.entries(agg)
    .map(([pair, { aSum, bSum, count }]) => {
      const meta = CAREER_COMPASS_PAIR_META[pair];
      return {
        pair,
        styleLabel: meta.styleLabel,
        codeA: meta.codeA,
        codeB: meta.codeB,
        nameA: meta.nameA,
        nameB: meta.nameB,
        percentA: Math.round(aSum / count),
        percentB: Math.round(bSum / count),
      };
    })
    .sort((a, b) => a.pair.localeCompare(b.pair));
}

function buildMetacognitionSummary(attempts: AttemptInput[]): MetacognitionAdminSummary | undefined {
  const domainTotals: Record<string, { sum: number; count: number; max: number }> = {};
  const quadrantMap: Record<string, number> = {};
  let knowledgePctSum = 0;
  let regulationPctSum = 0;
  let quadrantCount = 0;

  attempts.forEach((attempt) => {
    const domainScores = attempt.evaluation?.domainScores as Record<string, number> | undefined;
    if (!domainScores || typeof domainScores !== "object") return;

    let knowledgeScore = 0;
    let regulationScore = 0;
    Object.entries(domainScores).forEach(([key, raw]) => {
      const score = Number(raw);
      if (!Number.isFinite(score)) return;
      const label = METACOGNITION_DOMAIN_LABELS[key] || key;
      const max = METACOGNITION_DOMAIN_MAX[key] ?? 50;
      if (!domainTotals[label]) domainTotals[label] = { sum: 0, count: 0, max };
      domainTotals[label].sum += score;
      domainTotals[label].count += 1;
      if (key === "domain1") knowledgeScore = score;
      if (key === "domain2" || key === "domain3" || key === "domain4" || key === "domain5") {
        regulationScore += score;
      }
    });

    const knowledgePct = Math.round((knowledgeScore / 50) * 100);
    const regulationPct = Math.round((regulationScore / 150) * 100);
    const quadrant = getMetacognitionQuadrantLabel(knowledgePct, regulationPct);
    increment(quadrantMap, quadrant);
    knowledgePctSum += knowledgePct;
    regulationPctSum += regulationPct;
    quadrantCount += 1;
  });

  if (!Object.keys(domainTotals).length) return undefined;

  const avgDomainScores = Object.entries(domainTotals)
    .map(([label, { sum, count, max }]) => ({
      key: label,
      label,
      value: count > 0 ? Math.round(sum / count) : 0,
      max,
    }))
    .sort((a, b) => {
      const order = ["Awareness", "Planning", "Monitoring", "Regulation", "Reflection"];
      return order.indexOf(a.label) - order.indexOf(b.label);
    });

  return {
    avgDomainScores,
    quadrantDistribution: toDistributions(quadrantMap),
    avgKnowledgePct: quadrantCount ? Math.round(knowledgePctSum / quadrantCount) : 0,
    avgRegulationPct: quadrantCount ? Math.round(regulationPctSum / quadrantCount) : 0,
  };
}

function computeJohariQuadrantsFromScores(sfScore: number, sdScore: number) {
  const total = 50 * 50;
  const pct = (n: number) => Number(n.toFixed(1));
  return {
    open: pct((sfScore * sdScore) / total * 100),
    blind: pct((sfScore * (50 - sdScore)) / total * 100),
    hidden: pct(((50 - sfScore) * sdScore) / total * 100),
    unknown: pct(((50 - sfScore) * (50 - sdScore)) / total * 100),
  };
}

function buildJohariSummary(attempts: AttemptInput[]): JohariAdminSummary | undefined {
  let sfSum = 0;
  let sdSum = 0;
  let count = 0;

  attempts.forEach((attempt) => {
    const sf = Number(attempt.evaluation?.solicitsFeedbackScore);
    const sd = Number(attempt.evaluation?.selfDisclosureScore);
    if (!Number.isFinite(sf) || !Number.isFinite(sd)) return;
    sfSum += sf;
    sdSum += sd;
    count += 1;
  });

  if (!count) return undefined;

  const avgSolicitsFeedback = Math.round((sfSum / count) * 10) / 10;
  const avgSelfDisclosure = Math.round((sdSum / count) * 10) / 10;
  const quadrants = computeJohariQuadrantsFromScores(avgSolicitsFeedback, avgSelfDisclosure);

  return { avgSolicitsFeedback, avgSelfDisclosure, quadrants };
}

function buildCareerDnaCombinations(attempts: AttemptInput[]): CareerDnaCombinationStats | undefined {
  const personalityMap: Record<string, number> = {};
  const interestMap: Record<string, number> = {};

  attempts.forEach((attempt) => {
    const sections = attempt.evaluation?.sections as Record<string, unknown> | undefined;
    if (!sections || typeof sections !== "object") return;
    const personality = sections.PERSONALITY as { personalityType?: string } | undefined;
    const interest = sections.CAREER_INTEREST as { dominantCode?: string } | undefined;
    if (personality?.personalityType) increment(personalityMap, personality.personalityType);
    if (interest?.dominantCode) increment(interestMap, interest.dominantCode);
  });

  const personalityTypes = toDistributions(personalityMap);
  const careerInterestCodes = toDistributions(interestMap);
  if (!personalityTypes.length && !careerInterestCodes.length) return undefined;
  return { personalityTypes, careerInterestCodes };
}

export function buildAssessmentAdminDashboard(
  code: string,
  attempts: AttemptInput[],
): AssessmentAdminDashboardPayload {
  const rows: AdminDashboardAttemptRow[] = [];

  for (const attempt of attempts) {
    const parsed = parseEvaluation(code, attempt.evaluation);
    if (!parsed && code !== "STUDY_ABROAD") continue;
    if (!parsed && code === "STUDY_ABROAD") continue;

    rows.push({
      attemptId: attempt.attemptId,
      studentId: attempt.studentId,
      studentName: attempt.studentName,
      studentEmail: attempt.studentEmail,
      grade: attempt.grade,
      division: attempt.division,
      completedAt: attempt.completedAt,
      resultLabel: parsed!.resultLabel,
      resultDetail: parsed!.resultDetail,
      score: parsed!.score,
      percentage: parsed!.percentage,
      metrics: parsed!.metrics,
    });
  }

  const distributionMap: Record<string, number> = {};
  rows.forEach((row) => increment(distributionMap, row.resultLabel));

  const distributions = toDistributions(distributionMap);
  let dimensionAverages = buildDimensionAverages(rows, DIMENSION_LABELS[code]);
  if (code === "LITMUS_TEST") {
    dimensionAverages = dimensionAverages.map((d) => ({
      ...d,
      value: toLitmusStylePercentage(d.value),
      max: 100,
    }));
  }
  const summary = buildSummary(code, rows, distributions, dimensionAverages);
  const students = latestByStudent(rows);

  const payload: AssessmentAdminDashboardPayload = {
    dashboardKind: code,
    summary,
    distributions,
    dimensionAverages: dimensionAverages.slice(0, code === "STUDY_ABROAD" ? 12 : 10),
    recentAttempts: rows.slice(0, 12),
    students,
    allAttempts: rows,
  };

  if (code === "CAREER_COMPASS") {
    payload.careerCompassPairs = buildCareerCompassPairs(attempts);
  }
  if (code === "METACOGNITION_TEST") {
    payload.metacognitionSummary = buildMetacognitionSummary(attempts);
    if (payload.metacognitionSummary) {
      payload.dimensionAverages = payload.metacognitionSummary.avgDomainScores;
      payload.distributions = payload.metacognitionSummary.quadrantDistribution;
    }
  }
  if (code === "CAREER_DNA") {
    payload.careerDnaCombinations = buildCareerDnaCombinations(attempts);
  }
  if (code === "JOHARI_WINDOW") {
    payload.johariSummary = buildJohariSummary(attempts);
  }

  return payload;
}
