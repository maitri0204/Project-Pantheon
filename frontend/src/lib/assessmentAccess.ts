import { MAX_ASSESSMENT_SCORE } from "@/lib/studyAbroad/assessmentData";

export type AttemptHistoryEvaluation = {
  totalScore?: number;
  overallScore?: number;
  overallPercentage?: number;
  aqLevel?: string;
  band?: string;
};

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

  if (code === "ADVERSITY_TEST") {
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
  return normalized;
}

/** Assessments where students may complete more than one scored attempt. */
export function allowsMultipleAttempts(assessmentCode: string): boolean {
  const code = normalizeAssessmentCode(assessmentCode);
  return code === "ADVERSITY_TEST" || code === "STUDY_ABROAD";
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
  const base = `/whitelabel/${slug}/student/assessments/${assessmentCode}/result`;
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
