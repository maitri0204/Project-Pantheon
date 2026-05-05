import jsPDF from "jspdf";

/* ═══════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════ */
export interface ReportData {
  studentName: string;
  classGrade?: string;
  schoolName?: string;
  submittedAt?: string;
  sfScore: number;   // Solicits Feedback  (0-50)
  sdScore: number;   // Self-Disclosure     (0-50)
  dominantQuadrant: string;
  organizationBranding?: {
    organizationName?: string;
    logoUrl?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    representativeName?: string;
  };
}

function drawPage2(pdf: jsPDF, data: ReportData, W: number, H: number) {
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, W, H, "F");
  pdf.setFillColor(8, 145, 178);
  pdf.rect(0, 0, W, 3, "F");

  pdf.setTextColor(15, 23, 42);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("Student Information", W / 2, 32, { align: "center" });

  pdf.setDrawColor(8, 145, 178);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(20, 52, W - 40, 162, 4, 4, "S");

  const infoFields = [
    { label: "Student Name", value: data.studentName || "—" },
    { label: "Class / Grade", value: data.classGrade || "—" },
    { label: "Institute Name", value: data.schoolName || "—" },
    { label: "Date of Assessment", value: data.submittedAt || "—" },
    {
      label: "Counselor Name",
      value:
        data.organizationBranding?.representativeName
        || data.organizationBranding?.organizationName
        || "Administered by Organization",
    },
  ];

  let y = 70;
  infoFields.forEach((field, index) => {
    pdf.setFillColor(8, 145, 178);
    pdf.rect(28, y - 4, 3, 16, "F");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.text(field.label.toUpperCase(), 38, y);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(15, 23, 42);
    pdf.text(String(field.value), 38, y + 9);

    if (index < infoFields.length - 1) {
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.2);
      pdf.line(37, y + 14, W - 28, y + 14);
    }

    y += 28;
  });
}

/* ═══════════════════════════════════════════════
   Image loader (PNG → dataURL via canvas)
   ═══════════════════════════════════════════════ */
function loadImageAsDataURL(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

const toAbsoluteUrl = (value?: string): string => {
  if (!value) return "";
  if (/^data:image\//i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (typeof window !== "undefined") return `${window.location.origin}${value.startsWith("/") ? "" : "/"}${value}`;
  return value;
};

const toFirstLastName = (value?: string): string => {
  const cleaned = String(value || "").replace(/\s+/g, " ").trim();
  if (!cleaned) return "—";
  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length <= 2) return parts.join(" ");
  return `${parts[0]} ${parts[parts.length - 1]}`;
};

const normalizeWebsite = (value?: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

const applyOrganizationBranding = (
  pdf: jsPDF,
  pageNumber: number,
  pageHeight: number,
  branding: NonNullable<ReportData["organizationBranding"]>,
  logoDataUrl?: string,
  includeFooterContact?: boolean,
) => {
  pdf.setPage(pageNumber);
  const white: [number, number, number] = [255, 255, 255];
  const website = normalizeWebsite(branding.website) || "—";
  const interpretedBy = toFirstLastName(branding.representativeName);

  // ── Logo area ──
  const logoArea = includeFooterContact
    ? { x: 56, y: 202, width: 98, height: 44 }
    : { x: 116, y: 8, width: 80, height: 28 };

  if (logoDataUrl) {
    const tmpImg = new Image();
    tmpImg.src = logoDataUrl;
    const nw = tmpImg.naturalWidth || logoArea.width;
    const nh = tmpImg.naturalHeight || logoArea.height;
    const ratio = nw / nh;
    const maxW = logoArea.width - 4;
    const maxH = logoArea.height - 4;
    let dw = maxW;
    let dh = dw / ratio;
    if (dh > maxH) { dh = maxH; dw = dh * ratio; }
    const ox = logoArea.x + (logoArea.width - dw) / 2;
    const oy = logoArea.y + (logoArea.height - dh) / 2;
    pdf.addImage(logoDataUrl, "JPEG", ox, oy, dw, dh, undefined, "FAST");
  }

  // ── Website ──
  pdf.setTextColor(30, 41, 59);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text(website, 105, pageHeight - 9.5, { align: "center" });

  if (!includeFooterContact) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text(interpretedBy, 18, 259);
    return;
  }

  // ── Last page phone/email ──
  pdf.setTextColor(15, 23, 42);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text(`Phone: ${branding.contactPhone || "—"}`, 16, 256.5);
  pdf.text(`Email: ${branding.contactEmail || "—"}`, 108, 256.5);
};

/* ═══════════════════════════════════════════════
   Quadrant metadata
   ═══════════════════════════════════════════════ */
const QUADRANTS = [
  {
    key: "open",
    title: "Open Self",
    subtitle: "Known to self, Known to others",
    fill: [134, 239, 172] as const,       // green-300
    text: [5, 150, 105] as const,         // green-600
    desc: "This is the part of you that both you and others clearly understand — your strengths, habits, and how you perform in class. When this zone is strong, teachers recognize your abilities and you participate with confidence. It helps you build trust and get better support in your studies. The goal is to make your strengths visible and consistent.",
  },
  {
    key: "blind",
    title: "Blind Self",
    subtitle: "Not Known to self, Known to others",
    fill: [253, 224, 71] as const,        // yellow-300
    text: [217, 119, 6] as const,         // amber-600
    desc: "This includes behaviors and habits that others notice, but you may not realize. In academics, this can affect how teachers and classmates experience you — like unclear answers, hesitation, or overconfidence. If ignored, it can limit your progress. The key is to listen to feedback and understand how others see you.",
  },
  {
    key: "hidden",
    title: "Hidden Self",
    subtitle: "Known to self, Not Known to others",
    fill: [147, 197, 253] as const,       // blue-300
    text: [37, 99, 235] as const,         // blue-600
    desc: "This is what you know about yourself but don\u2019t express — your ideas, answers, or abilities. Many students face this when they hesitate to speak or share in class. If this zone is large, your true potential remains unseen. The goal is to express yourself more so others can recognize your strengths.",
  },
  {
    key: "unknown",
    title: "Unknown Self",
    subtitle: "Not Known to self, Not Known to others",
    fill: [196, 181, 253] as const,       // purple-300
    text: [124, 58, 237] as const,        // purple-600
    desc: "This represents your untapped potential — skills and abilities that neither you nor others have discovered yet. In academics, this means there may be subjects or talents you haven\u2019t explored. This zone reduces when you try new things and take on challenges. The more you explore, the more you grow.",
  },
];

/* ═══════════════════════════════════════════════
   Page-5 renderer (graph + quadrant descriptions)
   ═══════════════════════════════════════════════ */
function drawPage5(pdf: jsPDF, data: ReportData, W: number, H: number) {
  const { sfScore, sdScore } = data;

  /* ── white background ─────────────────────── */
  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, W, H, "F");

  /* ── thin cyan accent bar (matches report pages) ── */
  pdf.setFillColor(8, 145, 178);
  pdf.rect(0, 0, W, 3, "F");

  /* ─────────────────────────────────────────────
     Graph layout
     gLeft = 56  →  extra room for Y-axis label
     gSize = 100  →  smaller graph, more space for cards
  ───────────────────────────────────────────── */
  const gLeft  = 56;
  const gTop   = 46;   // extra room above for axis dimension labels
  const gSize  = 100;
  const gRight  = gLeft + gSize;
  const gBottom = gTop  + gSize;
  const scale   = gSize / 50;

  const px = gLeft + sfScore * scale;
  const py = gTop  + sdScore * scale;

  /* ── Quadrant fills ───────────────────────── */
  const [oR, oG, oB] = QUADRANTS[0].fill;
  pdf.setFillColor(oR, oG, oB);
  pdf.rect(gLeft, gTop, Math.max(0.5, px - gLeft), Math.max(0.5, py - gTop), "F");

  const [bR, bG, bB] = QUADRANTS[1].fill;
  pdf.setFillColor(bR, bG, bB);
  pdf.rect(px, gTop, Math.max(0.5, gRight - px), Math.max(0.5, py - gTop), "F");

  const [hR, hG, hB] = QUADRANTS[2].fill;
  pdf.setFillColor(hR, hG, hB);
  pdf.rect(gLeft, py, Math.max(0.5, px - gLeft), Math.max(0.5, gBottom - py), "F");

  const [uR, uG, uB] = QUADRANTS[3].fill;
  pdf.setFillColor(uR, uG, uB);
  pdf.rect(px, py, Math.max(0.5, gRight - px), Math.max(0.5, gBottom - py), "F");

  /* ── Graph border ─────────────────────────── */
  pdf.setDrawColor(30, 41, 59);
  pdf.setLineWidth(0.5);
  pdf.rect(gLeft, gTop, gSize, gSize, "S");

  /* ── Ticks & grid ─────────────────────────── */
  const ticks = [0, 10, 20, 30, 40, 50];

  // X-axis (top of graph)
  ticks.forEach((t) => {
    const x = gLeft + t * scale;
    pdf.setDrawColor(30, 41, 59);
    pdf.setLineWidth(0.3);
    pdf.line(x, gTop, x, gTop - 2.5);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(71, 85, 105);
    pdf.text(String(t), x, gTop - 4, { align: "center" });
    if (t > 0 && t < 50) {
      pdf.setDrawColor(200, 210, 220);
      pdf.setLineWidth(0.15);
      pdf.line(x, gTop, x, gBottom);
    }
  });

  // Y-axis (left of graph)
  ticks.forEach((t) => {
    const y = gTop + t * scale;
    pdf.setDrawColor(30, 41, 59);
    pdf.setLineWidth(0.3);
    pdf.line(gLeft - 2.5, y, gLeft, y);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(71, 85, 105);
    pdf.text(String(t), gLeft - 3.5, y + 1.5, { align: "right" });
    if (t > 0 && t < 50) {
      pdf.setDrawColor(200, 210, 220);
      pdf.setLineWidth(0.15);
      pdf.line(gLeft, y, gRight, y);
    }
  });

  /* ── X-axis title (above graph) ──────────── */
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 41, 59);
  pdf.text("Solicits Feedback", (gLeft + gRight) / 2, gTop - 11, { align: "center" });

  /* ── Y-axis title (left side, rotated 90° CCW) ──
     Use getTextWidth so we can manually centre the
     label around yMid without relying on align+angle
     interaction (which varies across jsPDF versions).
  ─────────────────────────────────────────────── */
  const yAxisLabel = "Willingness to Self-Disclose";
  const yMid = (gTop + gBottom) / 2;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(30, 41, 59);
  // angle=90 (CCW): text baseline starts at (x, startY) and goes UP.
  // To centre the label around yMid we start at yMid + halfWidth.
  // x=40 places the label close to the axis tick numbers (at gLeft-3.5=52.5).
  const labelW = pdf.getTextWidth(yAxisLabel);
  pdf.text(yAxisLabel, 40, yMid + labelW / 2, { angle: 90 });

  /* ── Crosshair dashed lines through point ── */
  pdf.setDrawColor(30, 41, 59);
  pdf.setLineWidth(0.35);
  for (let y = gTop; y < gBottom; y += 3) {
    pdf.line(px, y, px, Math.min(y + 1.5, gBottom));
  }
  for (let x = gLeft; x < gRight; x += 3) {
    pdf.line(x, py, Math.min(x + 1.5, gRight), py);
  }

  /* ── Quadrant labels (black) + dimension subtitles ── */
  const qLabelData = [
    { label: "Open",    sub: "Known to self,\nKnown to others",         cx: (gLeft + px) / 2,  cy: (gTop + py) / 2 },
    { label: "Blind",   sub: "Not Known to self,\nKnown to others",     cx: (px + gRight) / 2, cy: (gTop + py) / 2 },
    { label: "Hidden",  sub: "Known to self,\nNot Known to others",     cx: (gLeft + px) / 2,  cy: (py + gBottom) / 2 },
    { label: "Unknown", sub: "Not Known to self,\nNot Known to others", cx: (px + gRight) / 2, cy: (py + gBottom) / 2 },
  ];
  qLabelData.forEach(({ label, sub, cx, cy }) => {
    /* main label — black */
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text(label, cx, cy, { align: "center" });
    /* dimension subtitle — dark grey, smaller */
    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    const subLines = sub.split("\n");
    pdf.text(subLines, cx, cy + 4, { align: "center", lineHeightFactor: 1.3 });
  });

  /* ── Data point (red dot) ─────────────────── */
  pdf.setFillColor(239, 68, 68);
  pdf.circle(px, py, 2.2, "F");
  pdf.setDrawColor(255, 255, 255);
  pdf.setLineWidth(0.6);
  pdf.circle(px, py, 2.2, "S");

  /* ── Score label ──────────────────────────── */
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(239, 68, 68);
  pdf.text(`(${sfScore}, ${sdScore})`, px + 3.5, py - 3.5);

  /* ═══════════════════════════════════════════
     Quadrant Descriptions — clean 2 × 2 table (matches reference)
  ══════════════════════════════════════════ */
  const margin     = 14;
  const descStartY = gBottom + 8;       // tight gap below graph
  const tableW     = W - 2 * margin;
  const cellW      = tableW / 2;
  const cellH      = 62;               // comfortable height per card (larger fonts)
  const tableH     = cellH * 2;        // no row gap — clean dividing line only
  const tableX     = margin;
  const tableY     = descStartY;

  /* ── white cell backgrounds ─────────────── */
  pdf.setFillColor(255, 255, 255);
  pdf.rect(tableX, tableY, tableW, tableH, "F");

  /* ── cell content ────────────────────────── */
  const cellOrigins = [
    { x: tableX,           y: tableY },
    { x: tableX + cellW,   y: tableY },
    { x: tableX,           y: tableY + cellH },
    { x: tableX + cellW,   y: tableY + cellH },
  ];

  QUADRANTS.forEach((q, i) => {
    const { x, y } = cellOrigins[i];
    const [tr, tg, tb] = q.text;
    const padX = 5;
    const textX = x + padX;
    let curY = y + 9;

    /* ── title: bold, quadrant colour ───── */
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(tr, tg, tb);
    pdf.text(q.title, textX, curY);

    /* ── subtitle: italic, grey, parens ── */
    curY += 6;
    pdf.setFontSize(9.5);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(80, 80, 80);
    pdf.text(`(${q.subtitle})`, textX, curY);

    /* ── thin coloured rule ───────────── */
    curY += 4;
    pdf.setDrawColor(tr, tg, tb);
    pdf.setLineWidth(0.3);
    pdf.line(textX, curY, x + cellW - padX, curY);
    curY += 5;

    /* ── body text (wrapped) ───────────── */
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(20, 20, 20);
    const maxTextW = cellW - 2 * padX;
    const lines = pdf.splitTextToSize(q.desc, maxTextW);
    pdf.text(lines, textX, curY, { lineHeightFactor: 1.45 });
  });

  /* ── grid borders drawn last so they sit on top ── */
  pdf.setDrawColor(8, 145, 178);   // cyan-600
  pdf.setLineWidth(0.6);
  // outer rectangle
  pdf.rect(tableX, tableY, tableW, tableH, "S");
  // horizontal centre divider
  pdf.setLineWidth(0.4);
  pdf.line(tableX, tableY + cellH, tableX + tableW, tableY + cellH);
  // vertical centre divider
  pdf.line(tableX + cellW, tableY, tableX + cellW, tableY + tableH);
}

/* ═══════════════════════════════════════════════
   Main: assemble full report PDF
   ═══════════════════════════════════════════════ */
export async function generateClearReport(data: ReportData, options?: { returnBlob?: boolean }): Promise<void | Blob> {
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
  const W = 210;
  const H = 297;

  /* load all static page images in parallel */
  const pageNums = [1, 3, 4, 6, 7, 8, 9, 10];
  const entries = await Promise.all(
    pageNums.map(async (n) => {
      try {
        const dataURL = await loadImageAsDataURL(`/clear/${n}.png`);
        return [n, dataURL] as const;
      } catch {
        return [n, null] as const;
      }
    }),
  );
  const images = Object.fromEntries(entries.filter(([, v]) => v !== null)) as Record<number, string>;

  let organizationLogo: string | undefined;
  if (data.organizationBranding?.logoUrl) {
    try {
      organizationLogo = await loadImageAsDataURL(toAbsoluteUrl(data.organizationBranding.logoUrl));
    } catch {
      organizationLogo = undefined;
    }
  }

  let needsNewPage = false;

  if (images[1]) {
    pdf.addImage(images[1], "JPEG", 0, 0, W, H);
    needsNewPage = true;
  }

  /* Page 2 — dynamic student info */
  if (needsNewPage) pdf.addPage();
  drawPage2(pdf, data, W, H);
  needsNewPage = true;

  /* Pages 3-4 */
  for (let i = 3; i <= 4; i++) {
    if (!images[i]) continue;
    pdf.addPage();
    pdf.addImage(images[i], "JPEG", 0, 0, W, H);
  }

  /* Page 5 — dynamic graph + descriptions */
  if (needsNewPage) pdf.addPage();
  drawPage5(pdf, data, W, H);
  needsNewPage = true;

  /* ── Quadrant area % scores ─────────────────
     SF = Solicits Feedback  → "Known to Others"
     SD = Self-Disclosure    → "Known to Self"
     Formula: (dimension_A × dimension_B) / (50×50) × 100
  ─────────────────────────────────────────── */
  const sf = data.sfScore;
  const sd = data.sdScore;
  const TOTAL = 50 * 50; // 2500

  const quadrantScores: Record<number, { label: string; score: number }> = {
    6: { label: "Open",    score: Math.round((sf * sd                   / TOTAL) * 100 * 10) / 10 },
    7: { label: "Blind",   score: Math.round((sf * (50 - sd)            / TOTAL) * 100 * 10) / 10 },
    8: { label: "Hidden",  score: Math.round(((50 - sf) * sd            / TOTAL) * 100 * 10) / 10 },
    9: { label: "Unknown", score: Math.round(((50 - sf) * (50 - sd)     / TOTAL) * 100 * 10) / 10 },
  };

  /* Pages 6-10 */
  for (let i = 6; i <= 10; i++) {
    if (!images[i]) continue;
    pdf.addPage();
    pdf.addImage(images[i], "JPEG", 0, 0, W, H);

    /* Overlay quadrant score on pages 6-9 */
    if (quadrantScores[i]) {
      const qs = quadrantScores[i];

      /* Score badge — positioned at top-right area beside the "What it means" box */
      const badgeX = W - 28;   // shifted left for better visibility
      const badgeY = 38;       // near top of content area
      const badgeR = 14;       // radius of circle badge

      /* circle background */
      pdf.setFillColor(8, 145, 178);          // cyan-600
      pdf.circle(badgeX, badgeY, badgeR, "F");

      /* score number */
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${qs.score}%`, badgeX, badgeY + 2, { align: "center" });

      /* label below score */
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(255, 255, 255);
      pdf.text("Area", badgeX, badgeY + 7, { align: "center" });
    }
  }

  /* Download or return blob */
  const totalPages = pdf.getNumberOfPages();
  applyOrganizationBranding(pdf, 1, H, data.organizationBranding || {}, organizationLogo, false);
  applyOrganizationBranding(pdf, totalPages, H, data.organizationBranding || {}, organizationLogo, true);

  const safe = data.studentName.replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "_");
  if (options?.returnBlob) {
    return pdf.output("blob");
  }
  pdf.save(`CLEAR_Report_${safe || "Student"}.pdf`);
}
