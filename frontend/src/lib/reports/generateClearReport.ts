import { apiRequest } from "@/lib/api";
import { captureMetacognitionHtmlToPdf } from "@/lib/reports/metacognitionPdfCapture";

function clearHtmlApiPath(reportFetchPath: string): string {
  return reportFetchPath.replace(/\/report$/, "/clear-report-html");
}

async function fetchClearReportHtml(reportFetchPath: string): Promise<string> {
  const path = clearHtmlApiPath(reportFetchPath);
  const data = await apiRequest<{ html?: string }>(path);
  if (!data.html?.trim()) {
    throw new Error("CLEAR report HTML was empty");
  }
  return data.html;
}

/** Build the CLEAR assessment PDF in the browser from server-rendered HTML. */
export async function generateClearReport(
  reportFetchPath: string,
  studentName: string,
): Promise<{ blob: Blob; fileName: string }> {
  const html = await fetchClearReportHtml(reportFetchPath);
  const blob = await captureMetacognitionHtmlToPdf(html);
  const fileName = `CLEAR_Report_${studentName.replace(/\s+/g, "_")}.pdf`;
  return { blob, fileName };
}
