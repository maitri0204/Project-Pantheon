import { authenticatedFetch } from "@/lib/api";

function studyAbroadReportApiPath(reportFetchPath: string): string {
  return reportFetchPath.replace(/\/report$/, "/study-abroad-report");
}

/** Download the Study Abroad readiness PDF generated server-side. */
export async function generateStudyAbroadReport(
  reportFetchPath: string,
  studentName: string,
): Promise<{ blob: Blob; fileName: string }> {
  const path = studyAbroadReportApiPath(reportFetchPath);
  const response = await authenticatedFetch(path);

  if (!response.ok) {
    const rawText = await response.text();
    let message = "Failed to download Study Abroad report";
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
    throw new Error("Study Abroad report PDF was empty");
  }

  const fileName = `Study_Abroad_Report_${studentName.replace(/\s+/g, "_")}.pdf`;
  return { blob, fileName };
}

/** @deprecated Use generateStudyAbroadReport — server-side PDF replaces client iframe capture. */
export const generateStudyAbroadReportForEmail = generateStudyAbroadReport;

export function studyAbroadPrintReportPath(
  slug: string,
  assessmentCode: string,
): string {
  return `/whitelabel/${slug}/student/assessments/${assessmentCode}/report-print`;
}
