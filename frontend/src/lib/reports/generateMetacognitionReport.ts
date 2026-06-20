import { apiRequest } from "@/lib/api";
import { captureMetacognitionHtmlToPdf } from "@/lib/reports/metacognitionPdfCapture";

function metacognitionHtmlApiPath(reportFetchPath: string): string {
  return reportFetchPath.replace(/\/report$/, "/metacognition-report-html");
}

async function fetchMetacognitionReportHtml(reportFetchPath: string): Promise<string> {
  const path = metacognitionHtmlApiPath(reportFetchPath);
  const data = await apiRequest<{ html?: string }>(path);
  if (!data.html?.trim()) {
    throw new Error("TEST report HTML was empty");
  }
  return data.html;
}

/** Build the Thinking & Expression Skills Test PDF in the browser from server-rendered HTML. */
export async function generateMetacognitionReport(
  reportFetchPath: string,
  studentName: string,
): Promise<{ blob: Blob; fileName: string }> {
  const html = await fetchMetacognitionReportHtml(reportFetchPath);
  const blob = await captureMetacognitionHtmlToPdf(html);
  const fileName = `Thinking_Expression_Intelligence_Report_${studentName.replace(/\s+/g, "_")}.pdf`;
  return { blob, fileName };
}
