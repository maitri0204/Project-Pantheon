/**
 * Assessments whose downloadable report is built only in the browser
 * (premium React-PDF / print-capture). Email must upload that same PDF -
 * the server cannot reproduce these templates from simplified HTML.
 */
export const PREMIUM_CLIENT_PDF_EMAIL_CODES = new Set([
  "RESILIENCE_TEST",
  "ACADEMIC_CAREER",
  "STUDY_ABROAD",
]);

/** Assessments whose email PDF is generated on the server via serverGenerate: true. */
export const SERVER_GENERATED_EMAIL_CODES = new Set([
  "CAREER_COMPASS",
  "LITMUS_TEST",
  "CAREER_DNA",
  "METACOGNITION_TEST",
  "JOHARI_WINDOW",
]);

export function supportsEmailReport(assessmentCode: string): boolean {
  const code = assessmentCode.toUpperCase().trim();
  return PREMIUM_CLIENT_PDF_EMAIL_CODES.has(code) || SERVER_GENERATED_EMAIL_CODES.has(code);
}
