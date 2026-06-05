import { API_URL } from "@/lib/api";
import { captureCareerDnaHtmlToPdf } from "@/lib/reports/careerDnaPdfCapture";

function careerDnaHtmlApiPath(reportFetchPath: string): string {
  return reportFetchPath.replace(/\/report$/, "/career-dna-report-html");
}

async function fetchCareerDnaReportHtml(token: string, reportFetchPath: string): Promise<string> {
  const path = careerDnaHtmlApiPath(reportFetchPath);
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const rawText = await response.text();
    let message = "Failed to load Career DNA report";
    try {
      const data = JSON.parse(rawText) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      if (rawText) message = rawText;
    }
    throw new Error(message);
  }

  const data = (await response.json()) as { html?: string };
  if (!data.html?.trim()) {
    throw new Error("Career DNA report HTML was empty");
  }

  return data.html;
}

/** Build the executive Career DNA PDF in the browser (no server Chrome/Puppeteer required). */
export async function generateCareerDnaExecutiveReport(
  token: string,
  reportFetchPath: string,
  studentName: string,
): Promise<{ blob: Blob; fileName: string }> {
  const html = await fetchCareerDnaReportHtml(token, reportFetchPath);
  const blob = await captureCareerDnaHtmlToPdf(html);
  const fileName = `Career_DNA_Executive_Report_${studentName.replace(/\s+/g, "_")}.pdf`;
  return { blob, fileName };
}
