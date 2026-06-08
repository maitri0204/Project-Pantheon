import { PDFDocument } from "pdf-lib";

import { buildCareerCompassBackCoverPdf } from "./backCoverPage";

export async function mergeCareerCompassReportPdf(contentBuffer: Buffer): Promise<Buffer> {
  const backBytes = await buildCareerCompassBackCoverPdf();

  const merged = await PDFDocument.create();
  const contentDoc = await PDFDocument.load(contentBuffer);
  const backDoc = await PDFDocument.load(backBytes);

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
