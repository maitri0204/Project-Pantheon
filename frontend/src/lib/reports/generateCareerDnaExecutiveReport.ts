import { API_URL } from "@/lib/api";

function careerDnaReportApiPath(reportFetchPath: string): string {
  return reportFetchPath.replace(/\/report$/, "/career-dna-report");
}

export async function generateCareerDnaExecutiveReport(
  token: string,
  reportFetchPath: string,
  studentName: string,
): Promise<{ blob: Blob; fileName: string }> {
  const path = careerDnaReportApiPath(reportFetchPath);
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const rawText = await response.text();
    let message = "Failed to generate Career DNA report";
    try {
      const data = JSON.parse(rawText) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      if (rawText) message = rawText;
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const fileName = `Career_DNA_Executive_Report_${studentName.replace(/\s+/g, "_")}.pdf`;
  return { blob, fileName };
}
