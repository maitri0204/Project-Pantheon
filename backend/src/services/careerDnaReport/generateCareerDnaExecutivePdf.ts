import { buildCareerDnaExecutiveHtml } from "./buildCareerDnaExecutiveHtml";
import type { ReportData } from "./buildCareerDnaReportData";
import { renderHtmlReportPdf } from "../reportPdf/renderHtmlReportPdf";

/** Optional server-side PDF (requires Chrome). Prefer client-side capture via career-dna-report-html. */
export async function generateCareerDnaExecutivePdf(data: ReportData): Promise<Buffer> {
  const html = buildCareerDnaExecutiveHtml(data);
  return renderHtmlReportPdf(html);
}
