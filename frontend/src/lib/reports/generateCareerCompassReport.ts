import { API_URL } from "@/lib/api";

function careerCompassReportApiPath(reportFetchPath: string): string {
  return reportFetchPath.replace(/\/report$/, "/career-compass-report");
}

/** Download the Career Compass intelligence PDF generated server-side. */
export async function generateCareerCompassReport(
  token: string,
  reportFetchPath: string,
  studentName: string,
): Promise<{ blob: Blob; fileName: string }> {
  const path = careerCompassReportApiPath(reportFetchPath);
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const rawText = await response.text();
    let message = "Failed to download Career Compass report";
    try {
      const data = JSON.parse(rawText) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      if (rawText) message = rawText;
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new Error("Career Compass report PDF was empty");
  }

  const fileName = `Career_Compass_Report_${studentName.replace(/\s+/g, "_")}.pdf`;
  return { blob, fileName };
}
