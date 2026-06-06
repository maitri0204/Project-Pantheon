import { buildReportHtml } from "./buildReport";
import { buildMetacognitionReportData } from "./buildMetacognitionReportData";

export const METACOGNITION_REPORT_FILENAME = "Thinking_Expression_Intelligence_Report.pdf";

export function buildMetacognitionReportHtml(input: {
  studentName: string;
  grade?: string;
  school?: string;
  submittedAt?: Date | string | null;
  counselor?: string;
  domainScores?: Record<string, unknown>;
  totalScore?: unknown;
}): string {
  const data = buildMetacognitionReportData(input);
  return buildReportHtml(data);
}
