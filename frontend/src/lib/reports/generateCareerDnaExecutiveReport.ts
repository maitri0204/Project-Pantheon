import { apiRequest } from "@/lib/api";
import { captureCareerDnaHtmlToPdf } from "@/lib/reports/careerDnaPdfCapture";

function careerDnaHtmlApiPath(reportFetchPath: string): string {
  return reportFetchPath.replace(/\/report$/, "/career-dna-report-html");
}

async function fetchCareerDnaReportHtml(reportFetchPath: string): Promise<string> {
  const path = careerDnaHtmlApiPath(reportFetchPath);
  const data = await apiRequest<{ html?: string }>(path);
  if (!data.html?.trim()) {
    throw new Error("Career DNA report HTML was empty");
  }
  return data.html;
}

/** Build the executive Career DNA PDF in the browser (no server Chrome/Puppeteer required). */
export async function generateCareerDnaExecutiveReport(
  reportFetchPath: string,
  studentName: string,
): Promise<{ blob: Blob; fileName: string }> {
  const html = await fetchCareerDnaReportHtml(reportFetchPath);
  const blob = await captureCareerDnaHtmlToPdf(html);
  const fileName = `Career_DNA_Executive_Report_${studentName.replace(/\s+/g, "_")}.pdf`;
  return { blob, fileName };
}
