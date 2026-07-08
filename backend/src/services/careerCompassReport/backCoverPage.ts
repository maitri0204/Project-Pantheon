import fs from "fs";
import { PDFDocument } from "pdf-lib";

import { REPORT_BACK_COVER_IMAGE } from "../reportPdf/reportCoverAssets";
import { resolvePublicReportAsset } from "../reportPdf/resolvePublicReportAsset";

const PAGE = { w: 595.28, h: 841.89 };

export async function buildCareerCompassBackCoverPdf(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE.w, PAGE.h]);

  const backBytes = fs.readFileSync(resolvePublicReportAsset(REPORT_BACK_COVER_IMAGE));
  const backImage = await pdf.embedJpg(backBytes);
  page.drawImage(backImage, { x: 0, y: 0, width: PAGE.w, height: PAGE.h });

  return pdf.save();
}
