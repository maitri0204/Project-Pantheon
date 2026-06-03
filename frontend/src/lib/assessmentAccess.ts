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
  return buildStudentResultPath(slug, assessmentCode);
}
