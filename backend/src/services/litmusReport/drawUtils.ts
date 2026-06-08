import PDFDocument from "pdfkit";
import { C, CONTENT_W, FOOTER_Y, MARGIN, PAGE, SP, TOTAL_PAGES } from "./theme";

type Doc = PDFKit.PDFDocument;

export function newPage(
  doc: Doc,
  pageNum: number,
  bg = C.warm,
  opts?: { skipAddPage?: boolean },
): void {
  if (pageNum > 1 && !opts?.skipAddPage) {
    doc.addPage({ size: "A4", margin: 0 });
  }
  doc.rect(0, 0, PAGE.w, PAGE.h).fill(bg);
  drawPageAccent(doc);
  drawFooter(doc, pageNum);
}

function drawPageAccent(doc: Doc): void {
  doc.save();
  doc.rect(0, 0, PAGE.w, 5).fill(C.gold);
  doc.rect(0, 5, 4, PAGE.h - 5).fill(C.navy);
  doc.restore();
}

export function drawFooter(doc: Doc, pageNum: number): void {
  const y = FOOTER_Y;
  doc.save();
  doc.rect(MARGIN.left, y, CONTENT_W, 0.5).fill(C.cardBorder);
  doc.font("Helvetica").fontSize(7).fillColor(C.textLight);
  doc.text("Parenting DNA Report  ·  Litmus Test Assessment  ·  Confidential Family Document", MARGIN.left + 8, y + 8, { width: CONTENT_W * 0.72 });
  doc.font("Helvetica-Bold").fontSize(7).fillColor(C.textMuted);
  doc.text(`${pageNum} / ${TOTAL_PAGES}`, MARGIN.left, y + 8, { width: CONTENT_W - 8, align: "right" });
  doc.restore();
}

export function drawCard(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { fill?: string; radius?: number; shadow?: boolean; border?: string } = {}
): void {
  const { fill = C.white, radius = 8, shadow = true, border = C.cardBorder } = opts;
  if (shadow) {
    doc.save();
    doc.roundedRect(x + 1, y + 2, w, h, radius).fillOpacity(0.35).fill(C.shadow);
    doc.restore();
  }
  doc.save();
  doc.roundedRect(x, y, w, h, radius).fill(fill);
  doc.roundedRect(x, y, w, h, radius).lineWidth(0.5).strokeColor(border).stroke();
  doc.restore();
}

export function sectionTitle(doc: Doc, title: string, y: number, subtitle?: string): number {
  doc.font("Helvetica-Bold").fontSize(18).fillColor(C.navy);
  doc.text(title, MARGIN.left + 10, y, { width: CONTENT_W - 10 });
  doc.moveTo(MARGIN.left + 10, y + 24).lineTo(MARGIN.left + 56, y + 24).strokeColor(C.gold).lineWidth(2).stroke();
  let ny = y + 32;
  if (subtitle) {
    doc.font("Helvetica").fontSize(8.5).fillColor(C.textMuted);
    doc.text(subtitle, MARGIN.left + 10, ny, { width: CONTENT_W - 10 });
    ny += 14;
  }
  return ny;
}

export function subTitle(doc: Doc, text: string, x: number, y: number, w: number, accent?: string): number {
  if (accent) {
    doc.save();
    doc.roundedRect(x, y + 2, 3, 12, 1).fill(accent);
    doc.restore();
    x += 8;
    w -= 8;
  }
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.navy);
  doc.text(text, x, y, { width: w });
  return y + 15;
}

export function bodyText(doc: Doc, text: string, x: number, y: number, w: number, size = 9): number {
  doc.font("Helvetica").fontSize(size).fillColor(C.text);
  doc.text(text, x, y, { width: w, lineGap: 2.5 });
  return doc.y + SP.sm;
}

export function measureBullets(doc: Doc, items: string[], w: number, size = 8.5): number {
  doc.font("Helvetica").fontSize(size);
  let h = 0;
  for (const item of items) {
    h += doc.heightOfString(item, { width: w - 14, lineGap: 1.5 }) + SP.xs + 4;
  }
  return h;
}

export function bullets(doc: Doc, items: string[], x: number, y: number, w: number, size = 8.5, dotColor = C.teal): number {
  let cy = y;
  doc.font("Helvetica").fontSize(size).fillColor(C.text);
  for (const item of items) {
    doc.save();
    doc.circle(x + 5, cy + 4.5, 2.2).fill(dotColor);
    doc.restore();
    doc.text(item, x + 14, cy, { width: w - 14, lineGap: 1.5 });
    cy = doc.y + SP.xs;
  }
  return cy + SP.xs;
}

export function metricCard(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  accent: string,
  soft?: string
): void {
  drawCard(doc, x, y, w, h, { fill: soft || C.white });
  doc.save();
  doc.roundedRect(x, y, w, 3, 1).fill(accent);
  doc.font("Helvetica").fontSize(7).fillColor(C.textMuted);
  doc.text(label.toUpperCase(), x + 10, y + 12, { width: w - 20 });
  doc.font("Helvetica-Bold").fontSize(14).fillColor(C.navy);
  doc.text(value, x + 10, y + 26, { width: w - 20 });
  doc.restore();
}

export function styleBadge(doc: Doc, x: number, y: number, letter: string, style: string, color: string, score?: string): number {
  const bw = 108;
  const bh = score ? 56 : 44;
  drawCard(doc, x, y, bw, bh, { fill: C.white, radius: 6, shadow: true });
  doc.save();
  doc.circle(x + 22, y + bh / 2, 14).fill(color);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.white);
  doc.text(letter, x + 15, y + bh / 2 - 7, { width: 14, align: "center" });
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.navy);
  doc.text(style, x + 40, y + (score ? 12 : 16), { width: bw - 48 });
  if (score) {
    doc.font("Helvetica").fontSize(7.5).fillColor(C.textMuted);
    doc.text(score, x + 40, y + 28, { width: bw - 48 });
  }
  doc.restore();
  return x + bw + 8;
}

export function progressBar(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  label: string,
  percent: number,
  color: string,
  showLabel = true
): number {
  if (showLabel && label) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(C.navy);
    doc.text(label, x, y, { width: w * 0.55 });
    doc.font("Helvetica-Bold").fontSize(8).fillColor(color);
    doc.text(`${percent}%`, x, y, { width: w, align: "right" });
  } else if (showLabel) {
    doc.font("Helvetica-Bold").fontSize(10).fillColor(color);
    doc.text(`${percent}`, x, y, { width: w, align: "right" });
  }
  const barY = y + (showLabel && label ? 13 : 0);
  const barH = showLabel && label ? 7 : 10;
  doc.roundedRect(x, barY, w, barH, 3).fill(C.warmDark);
  const fillW = Math.max(6, (w * percent) / 100);
  doc.roundedRect(x, barY, fillW, barH, 3).fill(color);
  return barY + barH + (showLabel ? 10 : 6);
}

export function drawRadarChart(
  doc: Doc,
  cx: number,
  cy: number,
  radius: number,
  scores: Record<string, number>,
  maxScore: number,
  colors: Record<string, string>,
  labelOffset = 18
): void {
  const styles = ["King", "Servant", "Elder", "Prince", "Joker"];
  const n = styles.length;
  const angles = styles.map((_, i) => -Math.PI / 2 + (2 * Math.PI * i) / n);

  doc.save();
  doc.circle(cx, cy, radius + 4).fillOpacity(0.06).fill(C.blue);

  for (let ring = 1; ring <= 5; ring++) {
    const r = (radius * ring) / 5;
    doc.moveTo(cx + r * Math.cos(angles[0]), cy + r * Math.sin(angles[0]));
    for (let i = 1; i < n; i++) doc.lineTo(cx + r * Math.cos(angles[i]), cy + r * Math.sin(angles[i]));
    doc.closePath().strokeColor(ring === 5 ? C.cardBorder : "#E8E4DC").lineWidth(ring === 5 ? 0.8 : 0.35).stroke();
  }

  for (let i = 0; i < n; i++) {
    doc.moveTo(cx, cy).lineTo(cx + radius * Math.cos(angles[i]), cy + radius * Math.sin(angles[i]))
      .strokeColor("#E8E4DC").lineWidth(0.4).stroke();
  }

  const points = styles.map((style, i) => {
    const ratio = scores[style] / maxScore;
    const r = radius * ratio;
    return { x: cx + r * Math.cos(angles[i]), y: cy + r * Math.sin(angles[i]), style };
  });

  doc.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) doc.lineTo(points[i].x, points[i].y);
  doc.closePath().fillColor(C.teal).fillOpacity(0.22).fill();
  doc.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) doc.lineTo(points[i].x, points[i].y);
  doc.closePath().strokeColor(C.teal).lineWidth(2).stroke();

  const labelTweaks: Record<string, { dx: number; dy: number; extraOffset: number }> = {
    King: { dx: 0, dy: 6, extraOffset: 4 },
    Servant: { dx: 4, dy: 0, extraOffset: 0 },
    Elder: { dx: -4, dy: 0, extraOffset: 0 },
    Prince: { dx: 0, dy: 0, extraOffset: 0 },
    Joker: { dx: -4, dy: 0, extraOffset: 0 },
  };

  points.forEach((p, i) => {
    const style = styles[i];
    doc.circle(p.x, p.y, 4).fill(C.white);
    doc.circle(p.x, p.y, 3).fill(colors[style]);
    const tweak = labelTweaks[style] || { dx: 0, dy: 0, extraOffset: 0 };
    const offset = labelOffset + tweak.extraOffset;
    const lx = cx + (radius + offset) * Math.cos(angles[i]) + tweak.dx;
    const ly = cy + (radius + offset) * Math.sin(angles[i]) + tweak.dy;
    doc.font("Helvetica-Bold").fontSize(6.5).fillColor(C.navy).fillOpacity(1);
    doc.text(style, lx - 18, ly - 5, { width: 36, align: "center" });
    doc.font("Helvetica").fontSize(6).fillColor(C.textMuted);
    doc.text(`${scores[style]}`, lx - 18, ly + 5, { width: 36, align: "center" });
  });
  doc.restore();
}

export function drawRadarInCard(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  scores: Record<string, number>,
  maxScore: number,
  colors: Record<string, string>
): number {
  drawCard(doc, x, y, w, h, { fill: C.white });
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.navy);
  doc.text(title, x + 16, y + 14);

  const plotTop = y + 38;
  const plotH = h - 46;
  const cx = x + w / 2;
  const cy = plotTop + plotH / 2 + 6;
  const radius = Math.min(w / 2 - 40, plotH / 2 - 18, 52);

  doc.save();
  doc.roundedRect(x + 8, plotTop, w - 16, plotH, 6).clip();
  drawRadarChart(doc, cx, cy, radius, scores, maxScore, colors, 14);
  doc.restore();

  return y + h + SP.md;
}

export function scoreRing(doc: Doc, cx: number, cy: number, r: number, percent: number, label: string, accent = C.gold, lightText = false): void {
  doc.save();
  doc.circle(cx, cy, r + 6).fillOpacity(0.12).fill(accent);
  doc.fillOpacity(1);
  doc.circle(cx, cy, r).lineWidth(8).strokeColor(C.warmDark).stroke();
  const start = -Math.PI / 2;
  const sweep = (2 * Math.PI * percent) / 100;
  const steps = Math.max(12, Math.ceil((percent / 100) * 48));
  doc.moveTo(cx + r * Math.cos(start), cy + r * Math.sin(start));
  for (let i = 1; i <= steps; i++) {
    const angle = start + (sweep * i) / steps;
    doc.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  doc.lineWidth(8).strokeColor(accent).stroke();

  if (!lightText) {
    doc.circle(cx, cy, 32).fill(C.white);
  }

  const textColor = lightText ? "#FFFFFF" : C.navy;
  const labelColor = lightText ? "#FFFFFF" : "#000000";
  doc.fillOpacity(1);
  doc.font("Helvetica-Bold").fontSize(24).fillColor(textColor);
  doc.text(`${percent}%`, cx - 34, cy - 14, { width: 68, align: "center" });
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(labelColor);
  doc.text(label.toUpperCase(), cx - 40, cy + 18, { width: 80, align: "center" });
  doc.restore();
}

export function insightCard(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  title: string,
  body: string,
  accent = C.blue,
  soft?: string
): number {
  const padX = 14;
  const titleH = 14;
  doc.font("Helvetica").fontSize(8.5).fillColor(C.text);
  const bodyH = doc.heightOfString(body, { width: w - padX * 2 - 6, lineGap: 1.5 });
  const h = Math.max(72, titleH + bodyH + 28);

  drawCard(doc, x, y, w, h, { fill: soft || C.white });
  doc.save();
  doc.roundedRect(x, y, 4, h, 2).fill(accent);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.navy);
  doc.text(title, x + padX, y + 10, { width: w - padX - 8 });
  doc.font("Helvetica").fontSize(8.5).fillColor(C.text);
  doc.text(body, x + padX, y + 24, { width: w - padX - 8, lineGap: 1.5 });
  doc.restore();
  return y + h + SP.md;
}

export function contentBand(doc: Doc, x: number, y: number, w: number, title: string, body: string, fill: string): number {
  doc.font("Helvetica").fontSize(8.5);
  const bodyH = doc.heightOfString(body, { width: w - 24, lineGap: 1.5 });
  const h = Math.max(52, bodyH + 36);
  drawCard(doc, x, y, w, h, { fill, shadow: false, border: fill });
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.navy);
  doc.text(title, x + 12, y + 10);
  doc.font("Helvetica").fontSize(8.5).fillColor(C.text);
  doc.text(body, x + 12, y + 24, { width: w - 24, lineGap: 1.5 });
  return y + h + SP.md;
}

export function labelValue(doc: Doc, x: number, y: number, w: number, label: string, value: string): number {
  doc.font("Helvetica").fontSize(7).fillColor(C.textMuted);
  doc.text(label.toUpperCase(), x, y, { width: w });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.navy);
  doc.text(value, x, y + 11, { width: w });
  return y + 30;
}

export function numberedItem(doc: Doc, num: number, x: number, y: number, w: number, title: string, body: string, accent: string): number {
  doc.font("Helvetica").fontSize(8);
  const bodyH = doc.heightOfString(body, { width: w - 44, lineGap: 1.5 });
  const h = Math.max(68, bodyH + 38);
  drawCard(doc, x, y, w, h);
  doc.save();
  doc.roundedRect(x, y, 28, h, 6).fill(accent);
  doc.font("Helvetica-Bold").fontSize(14).fillColor(C.white);
  doc.text(String(num), x + 6, y + 28, { width: 16, align: "center" });
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.navy);
  doc.text(title, x + 36, y + 10, { width: w - 44 });
  doc.font("Helvetica").fontSize(8).fillColor(C.text);
  doc.text(body, x + 36, y + 26, { width: w - 44, lineGap: 1.5 });
  doc.restore();
  return y + h + SP.md;
}

export function phaseHeader(doc: Doc, x: number, y: number, w: number, phase: string, color: string): number {
  doc.save();
  doc.roundedRect(x, y, w, 22, 4).fill(color);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.white);
  doc.text(phase, x + 12, y + 6, { width: w - 24 });
  doc.restore();
  return y + 30;
}

export function splitPanel(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  leftTitle: string,
  leftItems: string[],
  rightTitle: string,
  rightItems: string[],
  leftAccent: string,
  rightAccent: string,
  leftSoft: string,
  rightSoft: string
): number {
  const hw = (w - 12) / 2;
  const pad = 12;
  const leftContentH = measureBullets(doc, leftItems, hw - pad * 2) + 34;
  const rightContentH = measureBullets(doc, rightItems, hw - pad * 2) + 34;
  const h = Math.max(leftContentH, rightContentH, 110);

  drawCard(doc, x, y, hw, h, { fill: leftSoft });
  doc.roundedRect(x, y, hw, 3, 1).fill(leftAccent);
  subTitle(doc, leftTitle, x + pad, y + 14, hw - pad * 2, leftAccent);
  bullets(doc, leftItems, x + pad, y + 32, hw - pad * 2, 8.5, leftAccent);

  const rx = x + hw + 12;
  drawCard(doc, rx, y, hw, h, { fill: rightSoft });
  doc.roundedRect(rx, y, hw, 3, 1).fill(rightAccent);
  subTitle(doc, rightTitle, rx + pad, y + 14, hw - pad * 2, rightAccent);
  bullets(doc, rightItems, rx + pad, y + 32, hw - pad * 2, 8.5, rightAccent);

  return y + h + SP.lg;
}

export function timelineRow(doc: Doc, x: number, y: number, w: number, title: string, desc: string, accent: string, isLast = false): number {
  doc.font("Helvetica").fontSize(8.5);
  const descH = doc.heightOfString(desc, { width: w - 44, lineGap: 1.5 });
  const h = Math.max(56, descH + 32);
  doc.save();
  doc.circle(x + 8, y + 10, 5).fill(accent);
  if (!isLast) doc.moveTo(x + 8, y + 16).lineTo(x + 8, y + h).strokeColor(C.cardBorder).lineWidth(1).stroke();
  doc.restore();
  drawCard(doc, x + 20, y, w - 20, h - 4);
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(accent);
  doc.text(title, x + 32, y + 8, { width: w - 44 });
  doc.font("Helvetica").fontSize(8.5).fillColor(C.text);
  doc.text(desc, x + 32, y + 24, { width: w - 44, lineGap: 1.5 });
  return y + h + SP.xs;
}

export function experienceTile(doc: Doc, x: number, y: number, w: number, title: string, desc: string, accent: string): number {
  doc.font("Helvetica").fontSize(7.8);
  const descH = doc.heightOfString(desc, { width: w - 20, lineGap: 1.5 });
  const h = Math.max(68, descH + 36);
  drawCard(doc, x, y, w, h);
  doc.save();
  doc.roundedRect(x, y, 4, h, 2).fill(accent);
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.navy);
  doc.text(title, x + 12, y + 10, { width: w - 20 });
  doc.font("Helvetica").fontSize(7.8).fillColor(C.text);
  doc.text(desc, x + 12, y + 26, { width: w - 20, lineGap: 1.5 });
  doc.restore();
  return h + SP.sm;
}

export function conversationShift(doc: Doc, x: number, y: number, w: number): number {
  const h = 96;
  drawCard(doc, x, y, w, h, { fill: C.warm });
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.navy);
  doc.text("Sample Conversation Shift", x + 14, y + 10);

  drawCard(doc, x + 14, y + 26, (w - 38) / 2, 58, { fill: C.dangerSoft, shadow: false });
  doc.font("Helvetica").fontSize(7.5).fillColor(C.textMuted);
  doc.text("Instead of:", x + 22, y + 32);
  doc.font("Helvetica").fontSize(8).fillColor(C.danger);
  doc.text('"You need to study harder if you want results."', x + 22, y + 44, { width: (w - 54) / 2, lineGap: 1 });

  const rx = x + 24 + (w - 38) / 2;
  drawCard(doc, rx, y + 26, (w - 38) / 2, 58, { fill: C.successSoft, shadow: false });
  doc.font("Helvetica").fontSize(7.5).fillColor(C.textMuted);
  doc.text("Try:", rx + 8, y + 32);
  doc.font("Helvetica").fontSize(8).fillColor(C.success);
  doc.text('"What felt hardest today? Let\'s choose one thing to tackle together."', rx + 8, y + 44, { width: (w - 54) / 2, lineGap: 1 });

  return y + h + SP.sm;
}

export function gaugeCard(doc: Doc, x: number, y: number, w: number, label: string, score: number, color: string): void {
  const h = 76;
  drawCard(doc, x, y, w, h);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.navy);
  doc.text(label as string, x + 12, y + 10);
  doc.font("Helvetica-Bold").fontSize(18).fillColor(color);
  doc.text(`${score}`, x + 12, y + 26);
  progressBar(doc, x + 12, y + 50, w - 24, "", score, color, false);
}

export function scenarioCard(doc: Doc, x: number, y: number, w: number, num: number, title: string, response: string, accent: string): void {
  const h = 82;
  drawCard(doc, x, y, w, h);
  doc.save();
  doc.roundedRect(x, y, w, 20, 6).fill(accent);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(C.white);
  doc.text(`${num}. ${title}`, x + 10, y + 6, { width: w - 20 });
  doc.font("Helvetica").fontSize(7.5).fillColor(C.textMuted);
  doc.text("Recommended:", x + 10, y + 28);
  doc.font("Helvetica").fontSize(8).fillColor(C.text);
  doc.text(response, x + 10, y + 40, { width: w - 20, lineGap: 1.3 });
  doc.restore();
}

export function balanceRow(doc: Doc, x: number, y: number, w: number, style: string, when: string, scenario: string, color: string): number {
  const h = 48;
  drawCard(doc, x, y, w, h);
  doc.save();
  doc.roundedRect(x, y, 32, h, 6).fill(color);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.white);
  doc.text(STYLE_LETTERS[style] || style[0], x + 8, y + 18, { width: 16, align: "center" });
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.navy);
  doc.text(style, x + 38, y + 8);
  doc.font("Helvetica").fontSize(7.8).fillColor(C.text);
  doc.text(when, x + 38, y + 20, { width: w - 50, lineGap: 0.5 });
  doc.font("Helvetica-Oblique").fontSize(7).fillColor(C.textMuted);
  doc.text(`Scenario: ${scenario}`, x + 38, y + 34, { width: w - 50 });
  const dashY = y + h / 2;
  doc.moveTo(x + w - 6, dashY).lineTo(x + w + 4, dashY).strokeColor(color).lineWidth(1.5).stroke();
  doc.restore();
  return y + h + 6;
}

const STYLE_LETTERS: Record<string, string> = {
  King: "K", Servant: "S", Elder: "E", Prince: "P", Joker: "J",
};

export function academicRow(doc: Doc, x: number, y: number, w: number, title: string, desc: string, accent: string, alt: boolean): number {
  doc.font("Helvetica").fontSize(8.5);
  const descH = doc.heightOfString(desc, { width: w - 120, lineGap: 1.5 });
  const h = Math.max(44, descH + 16);
  drawCard(doc, x, y, w, h, { fill: alt ? C.white : C.warm });
  doc.save();
  doc.roundedRect(x, y, 5, h, 2).fill(accent);
  doc.font("Helvetica-Bold").fontSize(8.5).fillColor(accent);
  doc.text(title, x + 14, y + 10, { width: 88 });
  doc.font("Helvetica").fontSize(8.5).fillColor(C.text);
  doc.text(desc, x + 108, y + 10, { width: w - 120, lineGap: 1.5 });
  doc.restore();
  return y + h + SP.sm;
}

export function textCard(doc: Doc, x: number, y: number, w: number, title: string, body: string, fill: string, accent?: string, darkBg = false): number {
  doc.font("Helvetica").fontSize(8.5);
  const bodyH = doc.heightOfString(body, { width: w - 28, lineGap: 1.5 });
  const h = Math.max(48, bodyH + (title ? 38 : 24));
  drawCard(doc, x, y, w, h, { fill, border: darkBg ? fill : C.cardBorder });
  if (accent) doc.roundedRect(x, y, 4, h, 2).fill(accent);
  let ty = y + 12;
  if (title) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor(darkBg ? C.gold : C.navy);
    doc.text(title, x + 14, ty, { width: w - 28 });
    ty += 16;
  }
  doc.font("Helvetica").fontSize(8.5).fillColor(darkBg ? C.white : C.text);
  doc.text(body, x + 14, ty, { width: w - 28, lineGap: 1.5 });
  return y + h + SP.md;
}

export function monthPlanBlock(
  doc: Doc,
  x: number,
  y: number,
  w: number,
  monthTitle: string,
  goals: string[],
  tasks: string[],
  guidance: string,
  mentorship: string,
  accent: string,
  soft: string
): number {
  const pad = 12;
  const innerW = w - pad * 2;
  doc.font("Helvetica").fontSize(8);

  const goalsH = measureBullets(doc, goals, innerW) + 16;
  const tasksH = measureBullets(doc, tasks, innerW) + 16;
  const guidanceH = doc.heightOfString(guidance, { width: innerW, lineGap: 1.5 }) + 16;
  const mentorshipH = doc.heightOfString(mentorship, { width: innerW, lineGap: 1.5 }) + 16;
  const h = Math.max(155, 32 + goalsH + tasksH + guidanceH + mentorshipH + pad);

  drawCard(doc, x, y, w, h, { fill: soft });
  doc.roundedRect(x, y, w, 22, 6).fill(accent);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.white);
  doc.text(monthTitle, x + pad, y + 7, { width: innerW });

  let cy = y + 30;
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(accent);
  doc.text("GOALS", x + pad, cy);
  cy = bullets(doc, goals, x + pad, cy + 10, innerW, 8, accent) + 2;

  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(accent);
  doc.text("TASKS", x + pad, cy);
  cy = bullets(doc, tasks, x + pad, cy + 10, innerW, 8, accent) + 2;

  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(accent);
  doc.text("GUIDANCE", x + pad, cy);
  doc.font("Helvetica").fontSize(8).fillColor(C.text);
  doc.text(guidance, x + pad, cy + 10, { width: innerW, lineGap: 1.5 });
  cy = doc.y + 6;

  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(accent);
  doc.text("MENTORSHIP", x + pad, cy);
  doc.font("Helvetica").fontSize(8).fillColor(C.text);
  doc.text(mentorship, x + pad, cy + 10, { width: innerW, lineGap: 1.5 });

  return y + h + SP.sm;
}

export function bulletCard(doc: Doc, x: number, y: number, w: number, title: string, items: string[], fill: string, accent: string): number {
  const contentH = measureBullets(doc, items, w - 28) + 36;
  const h = Math.max(90, contentH);
  drawCard(doc, x, y, w, h, { fill });
  doc.roundedRect(x, y, w, 3, 1).fill(accent);
  subTitle(doc, title, x + 14, y + 14, w - 28, accent);
  bullets(doc, items, x + 14, y + 32, w - 28, 8.5, accent);
  return y + h + SP.md;
}
