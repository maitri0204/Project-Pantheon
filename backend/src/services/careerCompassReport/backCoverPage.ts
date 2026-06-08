import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

const PAGE = { w: 595.28, h: 841.89 };

function resolveCareerCompassAsset(fileName: string): string {
  const candidates = [
    path.join(__dirname, "assets", fileName),
    path.join(__dirname, "..", "..", "..", "src", "services", "careerCompassReport", "assets", fileName),
    path.join(process.cwd(), "src", "services", "careerCompassReport", "assets", fileName),
    path.join(process.cwd(), "dist", "services", "careerCompassReport", "assets", fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(`Career Compass report asset not found: ${fileName}`);
}

export async function buildCareerCompassBackCoverPdf(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE.w, PAGE.h]);

  const backBytes = fs.readFileSync(resolveCareerCompassAsset("back-cover.jpg"));
  const backImage = await pdf.embedJpg(backBytes);
  page.drawImage(backImage, { x: 0, y: 0, width: PAGE.w, height: PAGE.h });

  return pdf.save();
}
