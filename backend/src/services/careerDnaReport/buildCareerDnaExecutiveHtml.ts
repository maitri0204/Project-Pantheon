import { buildReportHtml } from "./reportTemplate";
import type { ReportData } from "./buildCareerDnaReportData";
import { embedPublicAssetsInHtml } from "../reportPdf/embedPublicAssetsInHtml";

export function buildCareerDnaExecutiveHtml(data: ReportData): string {
  return embedPublicAssetsInHtml(buildReportHtml(data));
}
