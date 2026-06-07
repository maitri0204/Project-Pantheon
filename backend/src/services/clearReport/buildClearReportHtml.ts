import { buildClearReportData } from "./buildClearReportData";
import { generateReportHTML } from "./reportHtmlGenerator";

export const CLEAR_REPORT_FILENAME = "CLEAR_Report.pdf";

export function buildClearReportHtml(input: {
  studentName: string;
  grade?: string;
  school?: string;
  email?: string;
  submittedAt?: Date | string | null;
  counselor?: string;
  solicitsFeedbackScore?: unknown;
  selfDisclosureScore?: unknown;
  dominantQuadrant?: string;
  totalAnswered?: unknown;
}): string {
  const data = buildClearReportData(input);
  return generateReportHTML(data);
}
