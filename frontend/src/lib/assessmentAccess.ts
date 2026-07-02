import {
  formatCareerDnaResultLabel,
  formatPersonalityType,
  isPersonalityTypeCode,
} from "@/lib/dashboard/displayLabels";
import { MAX_ASSESSMENT_SCORE } from "@/lib/studyAbroad/assessmentData";

export const RESILIENCE_ASSESSMENT_CODE = "RESILIENCE_TEST" as const;
const LEGACY_RESILIENCE_CODES = new Set(["ADVERSITY_TEST", "RQ_TEST", "RESILIENCE"]);

/** Platform assessments that support scored retakes. */
export const RETAKABLE_ASSESSMENT_CODES = new Set([
  "CAREER_COMPASS",
  "LITMUS_TEST",
  "CAREER_DNA",
  "METACOGNITION_TEST",
  "JOHARI_WINDOW",
  RESILIENCE_ASSESSMENT_CODE,
  "ACADEMIC_CAREER",
  "STUDY_ABROAD",
  "EMPLOYABILITY_QUOTIENT",
]);

export type AttemptHistoryEvaluation = {
  totalScore?: number;
  overallScore?: number;
  overallPercentage?: number;
  aqLevel?: string;
  band?: string;
  personalityType?: string;
  solicitsFeedbackScore?: number;
  selfDisclosureScore?: number;
  dominantQuadrant?: string;
  dominantStyle?: string;
  dominantCode?: string;
  topInterests?: string[];
  recommendedStream?: string;
};

const LITMUS_STYLE_LABELS: Record<string, string> = {
  K: "King",
  S: "Servant",
  E: "Elder",
  P: "Prophet",
  J: "Judge",
};

export function isResilienceAssessment(code: string): boolean {
  return normalizeAssessmentCode(code) === RESILIENCE_ASSESSMENT_CODE;
}

export function getAssessmentCodeAliases(code: string): string[] {
  const normalized = normalizeAssessmentCode(code);
  if (normalized === "METACOGNITION_TEST") return ["METACOGNITION_TEST", "METACOGNITION"];
  if (normalized === "JOHARI_WINDOW") return ["JOHARI_WINDOW", "JOHARI", "CLEAR"];
  if (normalized === "LITMUS_TEST") return ["LITMUS_TEST", "LITMUS"];
  if (normalized === RESILIENCE_ASSESSMENT_CODE) return [RESILIENCE_ASSESSMENT_CODE, "ADVERSITY_TEST"];
  return [normalized];
}

export function getAssessmentDisplayName(code: string, fallback?: string): string {
  const normalized = normalizeAssessmentCode(code);
  if (normalized === "METACOGNITION_TEST") return "TEST - Thinking & Expression Skills Test";
  if (normalized === "JOHARI_WINDOW") return "CLEAR - Cognitive Lens for Emotional Awareness & Reflection";
  if (normalized === RESILIENCE_ASSESSMENT_CODE) return "Resilience Quotient (RQ) Assessment";
  if (normalized === "EMPLOYABILITY_QUOTIENT") return "Employability Quotient";
  if (fallback && /adversity quotient|\(aq\)/i.test(fallback)) {
    return "Resilience Quotient (RQ) Assessment";
  }
  return fallback?.trim() || code;
}

function formatAttemptHistoryScoreValue(
  assessmentCode: string,
  evaluation: AttemptHistoryEvaluation,
): string | null {
  const code = normalizeAssessmentCode(assessmentCode);

  if (code === "STUDY_ABROAD") {
    const overallScore = Number(evaluation.overallScore);
    if (Number.isFinite(overallScore)) {
      return `${overallScore} / ${MAX_ASSESSMENT_SCORE}`;
    }
    const pct = Number(evaluation.overallPercentage);
    if (Number.isFinite(pct)) return `${Math.round(pct)}%`;
    return null;
  }

  if (code === "EMPLOYABILITY_QUOTIENT") {
    const overallScore = Number(evaluation.overallScore);
    if (Number.isFinite(overallScore)) {
      return `${overallScore} / 50`;
    }
    const pct = Number(evaluation.overallPercentage);
    if (Number.isFinite(pct)) return `${Math.round(pct)}%`;
    return null;
  }

  if (isResilienceAssessment(code)) {
    const totalScore = Number(evaluation.totalScore);
    if (Number.isFinite(totalScore)) {
      return evaluation.aqLevel ? `${totalScore} (${evaluation.aqLevel})` : String(totalScore);
    }
    if (evaluation.aqLevel) return evaluation.aqLevel;
    return null;
  }

  if (code === "JOHARI_WINDOW") {
    const feedback = Number(evaluation.solicitsFeedbackScore);
    const disclosure = Number(evaluation.selfDisclosureScore);
    const hasFeedback = Number.isFinite(feedback);
    const hasDisclosure = Number.isFinite(disclosure);
    if (hasFeedback && hasDisclosure) {
      return `${feedback} · ${disclosure}`;
    }
    if (hasFeedback) return String(feedback);
    if (hasDisclosure) return String(disclosure);
    return null;
  }

  if (code === "CAREER_COMPASS" || code === "ACADEMIC_CAREER") {
    return null;
  }

  const totalScore = Number(evaluation.totalScore);
  return Number.isFinite(totalScore) ? String(totalScore) : null;
}

function formatAttemptHistoryTraitValue(
  assessmentCode: string,
  evaluation: AttemptHistoryEvaluation,
): string | null {
  const code = normalizeAssessmentCode(assessmentCode);

  if (evaluation.personalityType) {
    const raw = String(evaluation.personalityType).trim();
    if (code === "CAREER_COMPASS" || isPersonalityTypeCode(raw)) {
      return formatPersonalityType(raw);
    }
    return formatCareerDnaResultLabel(raw);
  }

  if (evaluation.dominantQuadrant && code !== "JOHARI_WINDOW") {
    return String(evaluation.dominantQuadrant);
  }

  if (evaluation.dominantStyle) {
    const style = String(evaluation.dominantStyle).toUpperCase();
    const label = LITMUS_STYLE_LABELS[style];
    return label ? `${style} (${label})` : style;
  }

  if (evaluation.recommendedStream) {
    return String(evaluation.recommendedStream);
  }

  if (Array.isArray(evaluation.topInterests) && evaluation.topInterests.length > 0) {
    return evaluation.topInterests.slice(0, 3).join(", ");
  }

  if (evaluation.dominantCode) {
    return formatCareerDnaResultLabel(String(evaluation.dominantCode));
  }

  if (code === "STUDY_ABROAD" && evaluation.band) {
    return String(evaluation.band);
  }

  if (code === "EMPLOYABILITY_QUOTIENT" && (evaluation as { tier?: string }).tier) {
    return String((evaluation as { tier?: string }).tier);
  }

  if (isResilienceAssessment(code) && evaluation.aqLevel) {
    return evaluation.aqLevel;
  }

  return null;
}

export type AttemptHistoryScoreLine = {
  label: string;
  value: string;
};

export type AttemptHistoryResultDisplay = {
  label: "Score" | "Trait" | "Scores";
  value: string;
  scoreLines?: AttemptHistoryScoreLine[];
};

/** Display score or trait on the multi-attempt history list. */
export function formatAttemptHistoryResult(
  assessmentCode: string,
  evaluation?: AttemptHistoryEvaluation | null,
): AttemptHistoryResultDisplay {
  if (!evaluation) {
    return { label: "Score", value: "-" };
  }

  const code = normalizeAssessmentCode(assessmentCode);
  if (code === "JOHARI_WINDOW") {
    const feedback = Number(evaluation.solicitsFeedbackScore);
    const disclosure = Number(evaluation.selfDisclosureScore);
    const hasFeedback = Number.isFinite(feedback);
    const hasDisclosure = Number.isFinite(disclosure);
    if (hasFeedback || hasDisclosure) {
      const scoreLines: AttemptHistoryScoreLine[] = [];
      if (hasFeedback) {
        scoreLines.push({ label: "Solicits Feedback", value: String(feedback) });
      }
      if (hasDisclosure) {
        scoreLines.push({ label: "Self Disclosure", value: String(disclosure) });
      }
      return {
        label: "Scores",
        value: scoreLines.map((line) => line.value).join(" · "),
        scoreLines,
      };
    }
  }

  const scoreValue = formatAttemptHistoryScoreValue(assessmentCode, evaluation);
  if (scoreValue) {
    return { label: "Score", value: scoreValue };
  }

  const traitValue = formatAttemptHistoryTraitValue(assessmentCode, evaluation);
  if (traitValue) {
    return { label: "Trait", value: traitValue };
  }

  return { label: "Score", value: "-" };
}

/** @deprecated Use formatAttemptHistoryResult for trait-aware attempt lists. */
export function formatAttemptHistoryScore(
  assessmentCode: string,
  evaluation?: AttemptHistoryEvaluation | null,
): string {
  return formatAttemptHistoryResult(assessmentCode, evaluation).value;
}

export function normalizeAssessmentCode(code: string): string {
  const normalized = String(code || "").toUpperCase().trim();
  if (normalized === "METACOGNITION") return "METACOGNITION_TEST";
  if (normalized === "JOHARI" || normalized === "CLEAR") return "JOHARI_WINDOW";
  if (normalized === "LITMUS") return "LITMUS_TEST";
  if (LEGACY_RESILIENCE_CODES.has(normalized)) return RESILIENCE_ASSESSMENT_CODE;
  if (normalized === "EMPLOYABILITY-QUOTIENT" || normalized === "EMPLOYABILITYQUOTIENT") {
    return "EMPLOYABILITY_QUOTIENT";
  }
  return normalized;
}

/** Assessments where learners may complete more than one scored attempt. */
export function allowsMultipleAttempts(assessmentCode: string): boolean {
  const code = normalizeAssessmentCode(assessmentCode);
  return RETAKABLE_ASSESSMENT_CODES.has(code);
}

export function buildStudentRetakePath(slug: string, assessmentCode: string): string {
  const code = normalizeAssessmentCode(assessmentCode);
  return `/whitelabel/${slug}/student/assessments?retake=${encodeURIComponent(code)}`;
}

/** Multi-attempt assessments always use a dedicated attempt list before opening a report. */
export function shouldShowAttemptList(assessmentCode: string): boolean {
  return allowsMultipleAttempts(assessmentCode);
}

export function buildStudentResultPath(
  slug: string,
  assessmentCode: string,
  options?: { attemptId?: string }
): string {
  const code = normalizeAssessmentCode(assessmentCode);
  const base = `/whitelabel/${slug}/student/assessments/${code}/result`;
  if (options?.attemptId) {
    return `${base}?attemptId=${options.attemptId}`;
  }
  return base;
}

export function buildStudentAttemptListPath(slug: string, assessmentCode: string): string {
  const code = normalizeAssessmentCode(assessmentCode);
  return `/whitelabel/${slug}/student/assessments/${code}`;
}

/** Org admin: attempt picker for a student on a multi-attempt assessment. */
export function buildOrgAttemptListPath(
  usersBasePath: string,
  studentId: string,
  assessmentCode: string,
): string {
  const code = normalizeAssessmentCode(assessmentCode);
  return `${usersBasePath}/${studentId}/assessments/${code}/attempts`;
}

/** Org admin: open a specific attempt report (optional assessmentCode for back navigation). */
export function buildOrgReportPath(
  usersBasePath: string,
  studentId: string,
  attemptId: string,
  assessmentCode?: string,
): string {
  const base = `${usersBasePath}/${studentId}/reports/${attemptId}`;
  if (!assessmentCode) return base;
  const code = normalizeAssessmentCode(assessmentCode);
  return `${base}?assessmentCode=${encodeURIComponent(code)}`;
}
