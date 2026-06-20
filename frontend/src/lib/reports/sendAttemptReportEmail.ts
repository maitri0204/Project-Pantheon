import { apiRequest, uploadEmailReportPdf } from "@/lib/api";

import {
  PREMIUM_CLIENT_PDF_EMAIL_CODES,
  SERVER_GENERATED_EMAIL_CODES,
  supportsEmailReport,
} from "./emailReportConfig";

type SendAttemptReportEmailInput = {
  normalizedCode: string;
  attemptId: string;
  buildDetailedReportPdf: () => Promise<{ blob: Blob; fileName: string }>;
};

/** Sends the report email using the same user-facing flow for every assessment. */
export async function sendAttemptReportEmail({
  normalizedCode,
  attemptId,
  buildDetailedReportPdf,
}: SendAttemptReportEmailInput): Promise<void> {
  if (!supportsEmailReport(normalizedCode)) {
    throw new Error("Email report is not available for this assessment.");
  }

  const emailPath = `/platform/student/attempts/${attemptId}/email-report`;

  if (SERVER_GENERATED_EMAIL_CODES.has(normalizedCode)) {
    await apiRequest(emailPath, {
      method: "POST",
      body: JSON.stringify({ serverGenerate: true }),
    });
    return;
  }

  if (PREMIUM_CLIENT_PDF_EMAIL_CODES.has(normalizedCode)) {
    const { blob, fileName } = await buildDetailedReportPdf();
    await uploadEmailReportPdf(emailPath, blob, fileName);
    return;
  }

  throw new Error("Email report is not available for this assessment.");
}
