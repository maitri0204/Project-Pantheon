import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont, type RGB } from "pdf-lib";

import { STYLE_COLORS } from "./templateAssessmentData";
import type { LitmusAssessmentData, LitmusStyleKey } from "./types";
import { PAGE } from "./theme";

/** Cover overlay layout - measured from LITMUS.jpg template (1414×2000 → A4). */
const COVER_NAME_LEFT = 58;
const COVER_NAME_TOP = 455;
const COVER_LEFT_BOX_LEFT = 59;
const COVER_LEFT_BOX_TOP = 536;
const COVER_LEFT_BOX_WIDTH = 190;
const COVER_RIGHT_BOX_LEFT = 273;
const COVER_RIGHT_BOX_TOP = 536;
const COVER_RIGHT_BOX_WIDTH = 192;
const COVER_STYLE_LABEL_TOP = 566;
const COVER_LABEL_COLOR = rgb(0.58, 0.64, 0.72);
const COVER_DATE_LEFT = 110;
const COVER_DATE_BOTTOM = 45;

function resolveLitmusAsset(fileName: string): string {
  const candidates = [
    path.join(__dirname, "assets", fileName),
    path.join(__dirname, "..", "..", "..", "src", "services", "litmusReport", "assets", fileName),
    path.join(process.cwd(), "src", "services", "litmusReport", "assets", fileName),
    path.join(process.cwd(), "dist", "services", "litmusReport", "assets", fileName),
    path.join(process.cwd(), "..", "frontend", "public", "litmus-report", fileName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(`Litmus report asset not found: ${fileName}`);
}

function hexToRgb(hex: string): RGB {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return rgb(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  );
}

function styleTextColor(style: LitmusStyleKey): RGB {
  return hexToRgb(STYLE_COLORS[style] ?? "#14532d");
}

/** Convert a top-down PDFKit-style Y to pdf-lib bottom-up baseline. */
function topToBaseline(top: number, fontSize: number): number {
  return PAGE.h - top - fontSize;
}

function drawCenteredInBox(
  page: PDFPage,
  text: string,
  boxLeft: number,
  boxTop: number,
  boxWidth: number,
  fontSize: number,
  font: PDFFont,
  color: RGB,
): void {
  let size = fontSize;
  while (size > 10 && font.widthOfTextAtSize(text, size) > boxWidth - 8) {
    size -= 1;
  }
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: boxLeft + (boxWidth - textWidth) / 2,
    y: topToBaseline(boxTop, size),
    size,
    font,
    color,
  });
}

function drawStyleBox(
  page: PDFPage,
  styleName: string,
  label: string,
  boxLeft: number,
  boxTop: number,
  boxWidth: number,
  styleFontSize: number,
  styleFont: PDFFont,
  labelFont: PDFFont,
  styleColor: RGB,
): void {
  drawCenteredInBox(
    page,
    styleName.toUpperCase(),
    boxLeft,
    boxTop,
    boxWidth,
    styleFontSize,
    styleFont,
    styleColor,
  );
  drawCenteredInBox(
    page,
    label,
    boxLeft,
    COVER_STYLE_LABEL_TOP,
    boxWidth,
    7.5,
    labelFont,
    COVER_LABEL_COLOR,
  );
}

export async function buildLitmusCoverPdf(data: LitmusAssessmentData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE.w, PAGE.h]);

  const coverBytes = fs.readFileSync(resolveLitmusAsset("cover.jpg"));
  const coverImage = await pdf.embedJpg(coverBytes);
  page.drawImage(coverImage, { x: 0, y: 0, width: PAGE.w, height: PAGE.h });

  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText(data.parentName, {
    x: COVER_NAME_LEFT,
    y: topToBaseline(COVER_NAME_TOP, 26),
    size: 26,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  });

  drawStyleBox(
    page,
    data.primaryStyle,
    "PRIMARY STYLE",
    COVER_LEFT_BOX_LEFT,
    COVER_LEFT_BOX_TOP,
    COVER_LEFT_BOX_WIDTH,
    20,
    helveticaBold,
    helvetica,
    styleTextColor(data.primaryStyle),
  );

  drawStyleBox(
    page,
    data.secondaryStyle,
    "SECONDARY STYLE",
    COVER_RIGHT_BOX_LEFT,
    COVER_RIGHT_BOX_TOP,
    COVER_RIGHT_BOX_WIDTH,
    20,
    helveticaBold,
    helvetica,
    styleTextColor(data.secondaryStyle),
  );

  page.drawText(data.assessmentDate, {
    x: COVER_DATE_LEFT,
    y: COVER_DATE_BOTTOM,
    size: 8,
    font: helvetica,
    color: rgb(0.796, 0.835, 0.882),
  });

  return pdf.save();
}

export async function buildLitmusBackCoverPdf(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE.w, PAGE.h]);

  const backBytes = fs.readFileSync(resolveLitmusAsset("back-cover.jpg"));
  const backImage = await pdf.embedJpg(backBytes);
  page.drawImage(backImage, { x: 0, y: 0, width: PAGE.w, height: PAGE.h });

  return pdf.save();
}
