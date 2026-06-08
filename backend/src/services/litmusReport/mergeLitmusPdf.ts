import { PDFDocument } from "pdf-lib";

import { buildLitmusBackCoverPdf, buildLitmusCoverPdf } from "./coverPages";
import type { LitmusAssessmentData } from "./types";

export async function mergeLitmusReportPdf(
  data: LitmusAssessmentData,
  contentBuffer: Buffer,
): Promise<Buffer> {
  const [coverBytes, backBytes] = await Promise.all([
    buildLitmusCoverPdf(data),
    buildLitmusBackCoverPdf(),
  ]);

  const merged = await PDFDocument.create();
  const coverDoc = await PDFDocument.load(coverBytes);
  const contentDoc = await PDFDocument.load(contentBuffer);
  const backDoc = await PDFDocument.load(backBytes);

  const [coverPage] = await merged.copyPages(coverDoc, [0]);
  merged.addPage(coverPage);

  const contentPageCount = contentDoc.getPageCount();
  if (contentPageCount > 0) {
    const contentIndices = Array.from({ length: contentPageCount }, (_, index) => index);
    const contentPages = await merged.copyPages(contentDoc, contentIndices);
    contentPages.forEach((page) => merged.addPage(page));
  }

  const [backPage] = await merged.copyPages(backDoc, [0]);
  merged.addPage(backPage);

  return Buffer.from(await merged.save());
}
