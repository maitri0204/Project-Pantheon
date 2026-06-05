import { buildReportHtml } from "./reportTemplate";
import type { ReportData } from "./buildCareerDnaReportData";

export function buildCareerDnaExecutiveHtml(data: ReportData): string {
  return buildReportHtml(data);
}
