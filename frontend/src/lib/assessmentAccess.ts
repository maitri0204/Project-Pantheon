import { MAX_ASSESSMENT_SCORE } from "@/lib/studyAbroad/assessmentData";

export const RESILIENCE_ASSESSMENT_CODE = "RESILIENCE_TEST" as const;
const LEGACY_RESILIENCE_CODES = new Set(["ADVERSITY_TEST", "RQ_TEST", "RESILIENCE"]);

export type AttemptHistoryEvaluation = {
  totalScore?: number;
  overallScore?: number;
  overallPercentage?: number;
  aqLevel?: string;
  band?: string;
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
  if (fallback && /adversity quotient|\(aq\)/i.test(fallback)) {
    return "Resilience Quotient (RQ) Assessment";
  }
  return fallback?.trim() || code;
}

/** Display label for score on the multi-attempt history list. */
export function formatAttemptHistoryScore(
  assessmentCode: string,
  evaluation?: AttemptHistoryEvaluation | null,
): string {
  if (!evaluation) return "—";

  const code = normalizeAssessmentCode(assessmentCode);

  if (code === "STUDY_ABROAD") {
    const overallScore = Number(evaluation.overallScore);
    if (Number.isFinite(overallScore)) {
      return `${overallScore} / ${MAX_ASSESSMENT_SCORE}`;
    }
    const pct = Number(evaluation.overallPercentage);
    if (Number.isFinite(pct)) return `${Math.round(pct)}%`;
    return "—";
  }

  if (isResilienceAssessment(code)) {
    const totalScore = Number(evaluation.totalScore);
    if (Number.isFinite(totalScore)) {
      return evaluation.aqLevel ? `${totalScore} (${evaluation.aqLevel})` : String(totalScore);
    }
    return "—";
  }

  const totalScore = Number(evaluation.totalScore);
  return Number.isFinite(totalScore) ? String(totalScore) : "—";
}

export function normalizeAssessmentCode(code: string): string {
  const normalized = String(code || "").toUpperCase().trim();
  if (normalized === "METACOGNITION") return "METACOGNITION_TEST";
  if (normalized === "JOHARI" || normalized === "CLEAR") return "JOHARI_WINDOW";
  if (normalized === "LITMUS") return "LITMUS_TEST";
  if (LEGACY_RESILIENCE_CODES.has(normalized)) return RESILIENCE_ASSESSMENT_CODE;
  return normalized;
}

/** Assessments where students may complete more than one scored attempt. */
export function allowsMultipleAttempts(assessmentCode: string): boolean {
  const code = normalizeAssessmentCode(assessmentCode);
  return isResilienceAssessment(code) || code === "STUDY_ABROAD";
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
