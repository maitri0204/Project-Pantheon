import { API_URL, authenticatedFetch } from "@/lib/api";

function litmusReportApiPath(reportFetchPath: string): string {
  return reportFetchPath.replace(/\/report$/, "/litmus-report");
}

/** Download the Litmus parenting assessment PDF generated server-side via PDFKit. */
export async function generateLitmusReport(
  reportFetchPath: string,
  parentName: string,
): Promise<{ blob: Blob; fileName: string }> {
  const path = litmusReportApiPath(reportFetchPath);
  const response = await authenticatedFetch(path);

  if (!response.ok) {
    const rawText = await response.text();
    let message = "Failed to download Litmus report";
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
    throw new Error("Litmus report PDF was empty");
  }

  const fileName = `Litmus_Report_${parentName.replace(/\s+/g, "_")}.pdf`;
  return { blob, fileName };
}
