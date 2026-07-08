import type { ClearAssessmentData } from "./types";
import { REPORT_BACK_COVER_IMAGE } from "../reportPdf/reportCoverAssets";

/** Cover overlay positions - same RQ/DNA layout scaled to 794×1123 capture canvas. */
const COVER_SCALE_X = 794 / 595;
const COVER_SCALE_Y = 1123 / 841;
const COVER_IMAGE = "/clear-report/cover.jpg";
const BACK_COVER_IMAGE = REPORT_BACK_COVER_IMAGE;
const COVER_NAME_TOP = 455;
const COVER_SCORE_NUM_TOP = 524;
const COVER_SCORE_LABEL_TOP = 564;
const COVER_PATH_TEXT_TOP = 530;
const COVER_PATH_LABEL_TOP = 564;
const COVER_DATE_BOTTOM_PDF = 50;

const scaled = (pdfUnits: number, axis: "x" | "y" = "x") =>
  Math.round(pdfUnits * (axis === "x" ? COVER_SCALE_X : COVER_SCALE_Y));

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function coverOverlayPos(leftPdf: number, topPdf: number): string {
  return `left:${scaled(leftPdf)}px;top:${scaled(topPdf, "y")}px;`;
}

const coverFont = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif";

export function buildCoverPage(data: ClearAssessmentData): string {
  const pathBoxWidth = scaled(178);
  const scoreBoxWidth = scaled(98);
  const score = data.indices.growthIndex;

  return `
  <div class="page cover-template-page">
    <img src="${COVER_IMAGE}" alt=""
         style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;"/>

    <p style="position:absolute;${coverOverlayPos(58, COVER_NAME_TOP)}margin:0;font-size:${scaled(26)}px;font-weight:700;color:#ffffff;
              font-family:${coverFont};">
      ${escapeHtml(data.student.name)}
    </p>

    <p style="position:absolute;${coverOverlayPos(52, COVER_SCORE_NUM_TOP)}margin:0;width:${scoreBoxWidth}px;
              text-align:center;font-size:${scaled(30)}px;font-weight:700;color:#0ea5e9;line-height:1;
              font-family:${coverFont};">
      ${score}
    </p>
    <p style="position:absolute;${coverOverlayPos(52, COVER_SCORE_LABEL_TOP)}margin:0;width:${scoreBoxWidth}px;
              text-align:center;font-size:${scaled(7.5)}px;font-weight:400;color:#94a3b8;letter-spacing:0.06em;
              font-family:${coverFont};">
      SCORE
    </p>

    <p style="position:absolute;${coverOverlayPos(168, COVER_PATH_TEXT_TOP)}margin:0;width:${pathBoxWidth}px;
              text-align:center;font-size:${scaled(14)}px;font-weight:700;color:#14532d;line-height:1.2;
              font-family:${coverFont};">
      ${escapeHtml(data.indices.growthPotential)}
    </p>
    <p style="position:absolute;${coverOverlayPos(168, COVER_PATH_LABEL_TOP)}margin:0;width:${pathBoxWidth}px;
              text-align:center;font-size:${scaled(7.5)}px;font-weight:600;color:#15803d;letter-spacing:0.06em;
              font-family:${coverFont};">
      GROWTH POTENTIAL
    </p>

    <p style="position:absolute;left:${scaled(110)}px;
              bottom:${scaled(COVER_DATE_BOTTOM_PDF, "y")}px;margin:0;font-size:${scaled(8)}px;
              font-weight:400;color:#cbd5e1;line-height:1;
              font-family:${coverFont};">
      ${escapeHtml(data.student.assessmentDate)}
    </p>
  </div>`;
}

export function buildBackCoverPage(): string {
  return `
  <div class="page cover-template-page">
    <img src="${BACK_COVER_IMAGE}" alt=""
         style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;"/>
  </div>`;
}
