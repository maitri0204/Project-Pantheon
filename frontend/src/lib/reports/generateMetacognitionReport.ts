import { API_URL } from "@/lib/api";
import { captureMetacognitionHtmlToPdf } from "@/lib/reports/metacognitionPdfCapture";

function metacognitionHtmlApiPath(reportFetchPath: string): string {
  return reportFetchPath.replace(/\/report$/, "/metacognition-report-html");
}

async function fetchMetacognitionReportHtml(token: string, reportFetchPath: string): Promise<string> {
  const path = metacognitionHtmlApiPath(reportFetchPath);
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const rawText = await response.text();
    let message = "Failed to load TEST report";
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
    throw new Error("TEST report HTML was empty");
  }

  return data.html;
}

/** Build the Thinking & Expression Skills Test PDF in the browser from server-rendered HTML. */
export async function generateMetacognitionReport(
  token: string,
  reportFetchPath: string,
  studentName: string,
): Promise<{ blob: Blob; fileName: string }> {
  const html = await fetchMetacognitionReportHtml(token, reportFetchPath);
  const blob = await captureMetacognitionHtmlToPdf(html);
  const fileName = `Thinking_Expression_Intelligence_Report_${studentName.replace(/\s+/g, "_")}.pdf`;
  return { blob, fileName };
}
