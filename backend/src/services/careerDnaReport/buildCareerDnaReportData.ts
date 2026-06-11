import { reportData as sampleReportData } from "./reportData";

export type ReportData = typeof sampleReportData;

type SectionPart = {
  partName?: string;
  partNumber?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
};

type EvaluationSection = {
  parts?: SectionPart[];
  totalScore?: number;
  maxScore?: number;
  overallPercentage?: number;
  dominantCode?: string;
  personalityType?: string;
  personalityDimensions?: Array<{
    pair: string;
    winner: string;
    percentA?: number;
    percentB?: number;
  }>;
};

const PERSONALITY_PAIR_LABELS: Record<string, string> = {
  "E/I": "Social Style",
  "S/N": "Thinking Style",
  "T/F": "Decision Style",
  "J/P": "Working Style",
};

const PERSONALITY_WINNER_NAMES: Record<string, string> = {
  E: "Social Orientation",
  I: "Reflective Orientation",
  S: "Practical Observation",
  N: "Conceptual Thinking",
  T: "Logical Decision Style",
  F: "Value-Based Decision Style",
  J: "Structured Working Style",
  P: "Flexible Working Style",
};

function formatPersonalityTypeName(name: string): string {
  return name
    .replace(/ Decision Style$/, " Decision")
    .replace(/ Working Style$/, " Working");
}

function formatReportDate(value?: string | Date): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function mapScoredItems(parts: SectionPart[]) {
  return parts.map((part) => ({
    label: String(part.partName || "Section").replace(/\s*-\s*/g, " - ").replace(/^\w\s-\s/, (m) => m),
    score: Number(part.score ?? 0),
    max: Number(part.maxScore ?? 0),
    pct: Number(part.percentage ?? 0),
  }));
}

function mapInterestItems(parts: SectionPart[]) {
  return parts.map((part) => {
    const raw = String(part.partName || "");
    const code = raw.split(" ")[0]?.replace(/[^A-Z]/gi, "") || "";
    const title = raw.includes("-") ? raw.split("-")[1]?.trim() : raw;
    const label = title ? `${title} (${code})` : raw;
    return {
      label,
      score: Number(part.score ?? 0),
      max: Number(part.maxScore ?? 0),
      pct: Number(part.percentage ?? 0),
    };
  });
}

function mapPersonality(section?: EvaluationSection) {
  const pairs = ["E/I", "S/N", "T/F", "J/P"] as const;
  const dimensions = section?.personalityDimensions ?? [];
  const parts = section?.parts ?? [];

  const items = pairs.map((pair, index) => {
    const dim = dimensions.find((d) => d.pair === pair);
    const part = parts[index];
    const winner = dim?.winner || part?.partName?.split("/")?.[0] || "";
    const score = dim
      ? Math.max(Number(dim.percentA ?? 0), Number(dim.percentB ?? 0))
      : Number(part?.percentage ?? 0);
    const typeName = formatPersonalityTypeName(PERSONALITY_WINNER_NAMES[winner] || winner || "-");
    return {
      label: PERSONALITY_PAIR_LABELS[pair],
      type: typeName,
      score,
      max: 100,
    };
  });

  return { items };
}

type InsightItem = { label: string; pct: number; section: string };

function collectInsightItems(report: Omit<ReportData, "topStrengths" | "developmentAreas" | "keyTakeaways">): InsightItem[] {
  const items: InsightItem[] = [];

  report.cognitive.items.forEach((i) => items.push({ label: i.label, pct: i.pct, section: "Cognitive" }));
  report.aptitude.items.forEach((i) => items.push({ label: i.label, pct: i.pct, section: "Aptitude" }));
  report.careerInterest.items.forEach((i) => items.push({ label: i.label, pct: i.pct, section: "Career Interest" }));
  report.emotionalIntelligence.items.forEach((i) => items.push({ label: i.label, pct: i.pct, section: "Emotional Intelligence" }));
  report.learningStyle.items.forEach((i) => items.push({ label: i.label, pct: i.pct, section: "Learning Style" }));
  report.behavioralSocial.items.forEach((i) => items.push({ label: i.label, pct: i.pct, section: "Behavioral & Social" }));
  report.stressResilience.items.forEach((i) => items.push({ label: i.label, pct: i.pct, section: "Resilience" }));
  report.personality.items.forEach((i) => items.push({ label: i.type, pct: i.score, section: "Personality" }));

  return items;
}

function deriveTopStrengths(items: InsightItem[]): string[] {
  return [...items]
    .filter((i) => i.pct >= 75)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5)
    .map((i) => `${i.label} (${i.pct}%) - strong performance in ${i.section.toLowerCase()}`);
}

function deriveDevelopmentAreas(items: InsightItem[]): string[] {
  return [...items]
    .filter((i) => i.pct < 50)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 4)
    .map((i) => `${i.label} (${i.pct}%) - focused development recommended`);
}

function deriveKeyTakeaways(
  dominantInterest: string,
  dominantLearning: string,
  personalityType: string,
  cognitivePct: number,
  aptitudePct: number,
  strengths: string[],
  gaps: string[],
): string[] {
  const takeaways: string[] = [];
  if (dominantInterest) {
    takeaways.push(`${dominantInterest} interest profile shapes recommended career exploration paths.`);
  }
  if (personalityType) {
    takeaways.push(`Personality type ${personalityType} indicates consistent decision and working style patterns.`);
  }
  if (cognitivePct >= 70 || aptitudePct >= 70) {
    takeaways.push(`Strong cognitive (${cognitivePct}%) and aptitude (${aptitudePct}%) scores support analytical career paths.`);
  }
  if (strengths[0]) {
    takeaways.push(`Primary strength: ${strengths[0].split(" -")[0]}.`);
  }
  if (gaps[0]) {
    takeaways.push(`Priority development area: ${gaps[0].split(" -")[0]}.`);
  }
  if (dominantLearning) {
    takeaways.push(`Learning style code ${dominantLearning} suggests tailoring study methods to preferred modalities.`);
  }
  return takeaways.slice(0, 5);
}

export function buildCareerDnaReportData(input: {
  studentName: string;
  email?: string;
  submittedAt?: string | Date;
  answeredCount?: number;
  totalQuestions?: number;
  evaluation: Record<string, unknown>;
}): ReportData {
  const sections = (input.evaluation.sections || {}) as Record<string, EvaluationSection>;
  const cognitiveSec = sections.COGNITIVE;
  const aptitudeSec = sections.APTITUDE;
  const personalitySec = sections.PERSONALITY;
  const interestSec = sections.CAREER_INTEREST;
  const eqSec = sections.EMOTIONAL_INTELLIGENCE;
  const lsSec = sections.LEARNING_STYLE;
  const bsSec = sections.BEHAVIORAL_SOCIAL;
  const srSec = sections.STRESS_RESILIENCE;

  const cognitive = {
    total: Number(cognitiveSec?.totalScore ?? 0),
    outOf: Number(cognitiveSec?.maxScore ?? 40),
    percent: Number(cognitiveSec?.overallPercentage ?? 0),
    items: mapScoredItems(cognitiveSec?.parts ?? []),
  };

  const aptitude = {
    total: Number(aptitudeSec?.totalScore ?? 0),
    outOf: Number(aptitudeSec?.maxScore ?? 50),
    percent: Number(aptitudeSec?.overallPercentage ?? 0),
    items: mapScoredItems(aptitudeSec?.parts ?? []),
  };

  const personality = mapPersonality(personalitySec);

  const careerInterest = {
    total: Number(interestSec?.totalScore ?? 0),
    outOf: Number(interestSec?.maxScore ?? 40),
    dominantCode: String(interestSec?.dominantCode || ""),
    items: mapInterestItems(interestSec?.parts ?? []),
  };

  const emotionalIntelligence = {
    total: Number(eqSec?.totalScore ?? 0),
    outOf: Number(eqSec?.maxScore ?? 160),
    percent: Number(eqSec?.overallPercentage ?? 0),
    items: mapScoredItems(eqSec?.parts ?? []),
  };

  const learningStyle = {
    total: Number(lsSec?.totalScore ?? 0),
    outOf: Number(lsSec?.maxScore ?? 120),
    dominantCode: String(lsSec?.dominantCode || ""),
    items: mapScoredItems(lsSec?.parts ?? []),
  };

  const behavioralSocial = {
    total: Number(bsSec?.totalScore ?? 0),
    outOf: Number(bsSec?.maxScore ?? 160),
    percent: Number(bsSec?.overallPercentage ?? 0),
    items: mapScoredItems(bsSec?.parts ?? []),
  };

  const stressResilience = {
    total: Number(srSec?.totalScore ?? 0),
    outOf: Number(srSec?.maxScore ?? 160),
    percent: Number(srSec?.overallPercentage ?? 0),
    items: mapScoredItems(srSec?.parts ?? []),
  };

  const totalScore = Number(input.evaluation.totalScore ?? (
    cognitive.total + aptitude.total + careerInterest.total
    + emotionalIntelligence.total + learningStyle.total
    + behavioralSocial.total + stressResilience.total
  ));

  const answered = input.answeredCount ?? 0;
  const totalQ = input.totalQuestions ?? answered;

  const base = {
    candidate: {
      name: input.studentName,
      email: input.email || "",
      assessmentDate: formatReportDate(input.submittedAt),
      reportDate: formatReportDate(new Date()),
      totalScore,
      code: "CAREER_DNA",
      answeredLabel: `${answered} / ${totalQ} answered`,
    },
    cognitive,
    aptitude,
    personality,
    careerInterest,
    emotionalIntelligence,
    learningStyle,
    behavioralSocial,
    stressResilience,
    careerRecommendations: [] as ReportData["careerRecommendations"],
    industries: [] as string[],
    workEnvironments: [] as string[],
    futureSkills: [] as string[],
    roadmap: [] as ReportData["roadmap"],
  };

  const insightItems = collectInsightItems(base);
  const topStrengths = deriveTopStrengths(insightItems);
  const developmentAreas = deriveDevelopmentAreas(insightItems);
  const keyTakeaways = deriveKeyTakeaways(
    careerInterest.dominantCode,
    learningStyle.dominantCode,
    String(personalitySec?.personalityType || ""),
    cognitive.percent,
    aptitude.percent,
    topStrengths,
    developmentAreas,
  );

  return {
    ...base,
    topStrengths: topStrengths.length ? topStrengths : [
      "Consistent effort across assessed dimensions",
    ],
    developmentAreas: developmentAreas.length ? developmentAreas : [
      "Continue building balanced skills across all profiler sections",
    ],
    keyTakeaways: keyTakeaways.length ? keyTakeaways : [
      `Completed ${answered}/${totalQ} profiler questions with a total score of ${totalScore}.`,
      "Review each section dashboard with a counselor for a personalised action plan.",
    ],
  };
}
