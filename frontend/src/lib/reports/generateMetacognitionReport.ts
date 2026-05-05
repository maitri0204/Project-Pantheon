import type jsPDF from "jspdf";

import {
  QUADRANT_LABELS,
  KNOWLEDGE_MAX,
  REGULATION_MAX,
  type QuadrantType,
  getQuadrantLabel,
} from "@/lib/reports/reportConstants";

type DomainScores = {
  domain1: number;
  domain2: number;
  domain3: number;
  domain4: number;
  domain5: number;
};

interface ReportData {
  studentName: string;
  email: string;
  location?: string;
  submittedAt: string;
  totalScore: number;
  domainScores: DomainScores;
  classGrade?: string;
  schoolName?: string;
  board?: string;
  organizationBranding?: {
    organizationName?: string;
    logoUrl?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    representativeName?: string;
  };
}

// ── Color constants ──
const PRIMARY_BLUE = [0, 123, 194];
const DARK_BLUE = [0, 72, 132];
const LIGHT_BLUE = [230, 244, 255];
const GRAY_500 = [107, 114, 128];

// ── Quadrant names — use shared labels from constants.ts ──
// (QuadrantType is imported from @/lib/constants)

// ── Helpers ──

async function fetchImageAsDataURL(url: string): Promise<string> {
  if (/^data:image\//i.test(url)) {
    return url;
  }
  // Use absolute URL so this works in both localhost and production deployments
  const absoluteUrl =
    typeof window !== "undefined" && url.startsWith("/")
      ? `${window.location.origin}${url}`
      : url;
  const response = await fetch(absoluteUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${absoluteUrl} (${response.status})`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Compress a data-URL image to JPEG via an off-screen canvas */
function compressImageToJPEG(
  dataUrl: string,
  quality = 0.55,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Scale down large images to A4-ish resolution (≈1240×1754 at 150 dpi)
      const MAX_W = 1240;
      const MAX_H = 1754;
      let w = img.width;
      let h = img.height;
      if (w > MAX_W || h > MAX_H) {
        const ratio = Math.min(MAX_W / w, MAX_H / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/** Adds border, top accent bar, and footer bar to a dynamic page */
const normalizeWebsite = (value?: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

function addPageChrome(doc: jsPDF, website?: string) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(0, 123, 194);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, w - 20, h - 20);
  doc.setFillColor(0, 123, 194);
  doc.rect(10, 10, w - 20, 3, "F");
  doc.setFillColor(0, 123, 194);
  doc.rect(10, h - 22, w - 20, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(normalizeWebsite(website) || "—", w / 2, h - 14, { align: "center" });
}

// ────────────────────────────────────────────
//  PAGE 2 — Student Information (Dynamic)
// ────────────────────────────────────────────
function addStudentInfoPage(doc: jsPDF, data: ReportData) {
  doc.addPage();
  addPageChrome(doc, data.organizationBranding?.website);

  const w = doc.internal.pageSize.getWidth();
  let y = 45;

  doc.setTextColor(DARK_BLUE[0], DARK_BLUE[1], DARK_BLUE[2]);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Student Information", w / 2, y, { align: "center" });
  y += 6;

  doc.setDrawColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
  doc.setLineWidth(0.8);
  doc.line(w / 2 - 35, y, w / 2 + 35, y);
  y += 20;

  const infoFields = [
    { label: "Student Name", value: data.studentName },
    { label: "Class / Grade", value: data.classGrade || "—" },
    { label: "School Name", value: data.schoolName || "—" },
    { label: "Date of Assessment", value: data.submittedAt },
    {
      label: "Counselor Name",
      value:
        data.organizationBranding?.representativeName
        || data.organizationBranding?.organizationName
        || "Administered by Organization",
    },
  ];

  const boxX = 30;
  const boxW = w - 60;
  const rowH = 22;
  const totalH = infoFields.length * rowH;

  doc.setDrawColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, y, boxW, totalH, 3, 3, "S");

  infoFields.forEach((field, i) => {
    const rowY = y + i * rowH;

    if (i % 2 === 0) {
      doc.setFillColor(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2]);
      doc.rect(
        boxX + 0.5,
        rowY + (i === 0 ? 0.5 : 0),
        boxW - 1,
        rowH - (i === 0 ? 0.5 : 0),
        "F",
      );
    }

    if (i < infoFields.length - 1) {
      doc.setDrawColor(200, 215, 235);
      doc.setLineWidth(0.2);
      doc.line(boxX, rowY + rowH, boxX + boxW, rowY + rowH);
    }

    doc.setTextColor(GRAY_500[0], GRAY_500[1], GRAY_500[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(field.label, boxX + 10, rowY + 9);

    doc.setTextColor(DARK_BLUE[0], DARK_BLUE[1], DARK_BLUE[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(field.value, boxX + 10, rowY + 17);
  });

  doc.setDrawColor(PRIMARY_BLUE[0], PRIMARY_BLUE[1], PRIMARY_BLUE[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(boxX, y, boxW, totalH, 3, 3, "S");
}

// ────────────────────────────────────────────
//  Determine quadrant from domain scores
// ────────────────────────────────────────────
function getQuadrant(ds: DomainScores): {
  label: QuadrantType;
  kPct: number;
  rPct: number;
} {
  const kPct = Math.min(
    100,
    Math.max(0, Math.round((ds.domain1 / KNOWLEDGE_MAX) * 100)),
  );
  const rPct = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((ds.domain2 + ds.domain3 + ds.domain4 + ds.domain5) / REGULATION_MAX) * 100,
      ),
    ),
  );

  const label = getQuadrantLabel(kPct, rPct);
  return { label, kPct, rPct };
}

// ────────────────────────────────────────────
//  PAGE 4 — Quadrant Chart (Dynamic)
//  Square orientation in upper portion with text below
// ────────────────────────────────────────────
function addQuadrantPage(doc: jsPDF, data: ReportData, bgImage: string) {
  doc.addPage();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  // Use 4.png as full-page background
  doc.addImage(bgImage, "PNG", 0, 0, w, h);

  const { label: quadrantLabel, kPct, rPct } = getQuadrant(data.domainScores);

  // ── Square chart geometry ──
  // Shifted right from center to leave room for y-axis label on the left
  const chartSize = 115; // square side in mm
  const chartX = 55;     // leaves ~45mm on the left for y-axis label + ticks
  const chartY = 20;     // near top so chart stays clear of background content below
  const chartW = chartSize;
  const chartH = chartSize;

  const xAt = (pct: number) => chartX + (pct / 100) * chartW;
  const yAt = (pct: number) => chartY + chartH - (pct / 100) * chartH;
  const midX = xAt(50);
  const midY = yAt(50);

  // ── Quadrant fills ──
  doc.setFillColor(206, 215, 252); // TL: periwinkle
  doc.rect(chartX, chartY, chartW / 2, chartH / 2, "F");
  doc.setFillColor(208, 245, 235); // TR: mint
  doc.rect(midX, chartY, chartW / 2, chartH / 2, "F");
  doc.setFillColor(252, 220, 220); // BL: pink
  doc.rect(chartX, midY, chartW / 2, chartH / 2, "F");
  doc.setFillColor(228, 210, 240); // BR: lavender
  doc.rect(midX, midY, chartW / 2, chartH / 2, "F");

  // ── Highlight region ──
  const dotX = xAt(kPct);
  const dotY = yAt(rPct);
  let hlX: number, hlY: number, hlW: number, hlH: number;
  let hlFill: [number, number, number];
  let hlBorder: [number, number, number];
  if (kPct >= 50 && rPct >= 50) {
    hlX = midX; hlY = dotY; hlW = dotX - midX; hlH = midY - dotY;
    hlFill = [34, 197, 94]; hlBorder = [22, 163, 74];
  } else if (kPct < 50 && rPct >= 50) {
    hlX = chartX; hlY = dotY; hlW = dotX - chartX; hlH = midY - dotY;
    hlFill = [59, 130, 246]; hlBorder = [37, 99, 235];
  } else if (kPct < 50 && rPct < 50) {
    hlX = chartX; hlY = dotY; hlW = dotX - chartX; hlH = chartY + chartH - dotY;
    hlFill = [239, 68, 68]; hlBorder = [220, 38, 38];
  } else {
    hlX = midX; hlY = dotY; hlW = dotX - midX; hlH = chartY + chartH - dotY;
    hlFill = [234, 179, 8]; hlBorder = [180, 130, 8];
  }
  if (hlW > 0 && hlH > 0) {
    const lf: [number, number, number] = [
      Math.min(255, hlFill[0] + Math.round((255 - hlFill[0]) * 0.72)),
      Math.min(255, hlFill[1] + Math.round((255 - hlFill[1]) * 0.72)),
      Math.min(255, hlFill[2] + Math.round((255 - hlFill[2]) * 0.72)),
    ];
    doc.setFillColor(lf[0], lf[1], lf[2]);
    doc.rect(hlX, hlY, hlW, hlH, "F");
    doc.setDrawColor(hlBorder[0], hlBorder[1], hlBorder[2]);
    doc.setLineWidth(0.8);
    doc.rect(hlX, hlY, hlW, hlH, "S");
  }

  // ── Midlines ──
  doc.setDrawColor(100, 110, 130);
  doc.setLineWidth(0.7);
  doc.line(midX, chartY, midX, chartY + chartH);
  doc.line(chartX, midY, chartX + chartW, midY);

  // ── Outer border + bold axes ──
  doc.setDrawColor(70, 80, 100);
  doc.setLineWidth(0.8);
  doc.rect(chartX, chartY, chartW, chartH);
  doc.setLineWidth(1.2);
  doc.line(chartX, chartY, chartX, chartY + chartH); // Y-axis
  doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH); // X-axis

  // ── Tick marks & numbers ──
  const ticks = [0, 25, 50, 75, 100];
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 75, 90);
  doc.setDrawColor(70, 80, 100);
  doc.setLineWidth(0.4);
  ticks.forEach((v) => {
    const tx = xAt(v);
    const ty = yAt(v);
    doc.line(tx, chartY + chartH, tx, chartY + chartH + 2.5);
    doc.text(String(v), tx, chartY + chartH + 7, { align: "center" });
    doc.line(chartX - 2.5, ty, chartX, ty);
    doc.text(String(v), chartX - 3.5, ty + 1.5, { align: "right" });
  });

  // ── Axis labels ──
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(45, 50, 65);
  doc.text(
    "Knowledge (Awareness) %",
    chartX + chartW / 2,
    chartY + chartH + 14,
    { align: "center" },
  );

  // Y-axis label — anchor shifted up so text midpoint aligns with chart center
  // Text at 8pt bold is ~97mm long; center = chartY + chartH/2 = 77.5mm
  // Anchor = 77.5 + 97/2 ≈ 126, i.e. chartY + chartH - 9
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 50, 100);
  doc.text(
    "Regulation (Planning + Monitoring + Regulation + Reflection) %",
    42,
    chartY + chartH - 9,
    { angle: 90 },
  );

  // ── Quadrant corner labels (full names, two lines each) ──
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  doc.setTextColor(37, 99, 235);
  doc.text("Reflective", xAt(25), yAt(80), { align: "center" });
  doc.text("Learner", xAt(25), yAt(76), { align: "center" });

  doc.setTextColor(22, 163, 74);
  doc.text("Self-Regulated", xAt(75), yAt(80), { align: "center" });
  doc.text("Learner", xAt(75), yAt(76), { align: "center" });

  doc.setTextColor(220, 38, 38);
  doc.text("Passive", xAt(25), yAt(28), { align: "center" });
  doc.text("Learner", xAt(25), yAt(24), { align: "center" });

  doc.setTextColor(180, 83, 9);
  doc.text("Strategic", xAt(75), yAt(28), { align: "center" });
  doc.text("Learner", xAt(75), yAt(24), { align: "center" });

  // ── Student dot ──
  doc.setFillColor(200, 30, 30);
  doc.circle(dotX, dotY, 2.8, "F");

  // ── Tooltip ──
  const ttText = `(${kPct}%, ${rPct}%)`;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  const ttW = doc.getTextWidth(ttText) + 6;
  const ttH = 6;
  let ttX = dotX - ttW / 2;
  const ttY = Math.max(chartY + 1, dotY - 12);
  if (ttX < chartX + 1) ttX = chartX + 1;
  if (ttX + ttW > chartX + chartW - 1) ttX = chartX + chartW - 1 - ttW;
  doc.setFillColor(90, 100, 120);
  doc.roundedRect(ttX + 0.6, ttY + 0.6, ttW, ttH, 1.5, 1.5, "F");
  doc.setFillColor(30, 40, 65);
  doc.roundedRect(ttX, ttY, ttW, ttH, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(ttText, ttX + ttW / 2, ttY + 4.2, { align: "center" });
  doc.setDrawColor(30, 40, 65);
  doc.setLineWidth(0.4);
  doc.line(dotX, ttY + ttH, dotX, dotY - 2.8);

  // ── "Quadrant: [label]" text below chart ──
  const textStartY = chartY + chartH + 24;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);

  const prefix = "Quadrant: ";
  const fullTextW = doc.getTextWidth(prefix + quadrantLabel);
  const startX = w / 2 - fullTextW / 2;

  doc.text(prefix, startX, textStartY);

  const qColorMap: Record<QuadrantType, [number, number, number]> = {
    [QUADRANT_LABELS.expertLearner]: [22, 163, 74],
    [QUADRANT_LABELS.reflectiveLearner]: [37, 99, 235],
    [QUADRANT_LABELS.unawareLearner]: [220, 38, 38],
    [QUADRANT_LABELS.strategicLearner]: [180, 83, 9],
  };
  const qc = qColorMap[quadrantLabel];
  doc.setTextColor(qc[0], qc[1], qc[2]);
  doc.text(quadrantLabel, startX + doc.getTextWidth(prefix), textStartY);
}

// ── Add a full-page static image ──
function addImagePage(doc: jsPDF, imgDataUrl: string, format: string = "PNG") {
  doc.addPage();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.addImage(imgDataUrl, format, 0, 0, w, h, undefined, "FAST");
}

const toAbsoluteUrl = (value?: string): string => {
  if (!value) return "";
  if (/^data:image\//i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (typeof window !== "undefined") return `${window.location.origin}${value.startsWith("/") ? "" : "/"}${value}`;
  return value;
};

const toFirstLastName = (value?: string): string => {
  const cleaned = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "—";
  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length <= 2) return parts.join(" ");
  return `${parts[0]} ${parts[parts.length - 1]}`;
};

function applyOrganizationBranding(
  doc: jsPDF,
  pageNumber: number,
  branding: NonNullable<ReportData["organizationBranding"]>,
  logoDataUrl?: string,
  includeFooterContact?: boolean,
) {
  doc.setPage(pageNumber);
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const firstPageBg: [number, number, number] = [236, 237, 239];
  const lastPageBg: [number, number, number] = [236, 237, 239];

  const website = normalizeWebsite(branding.website) || "—";
  const interpretedBy = toFirstLastName(branding.representativeName);
  const phone = branding.contactPhone || "—";
  const email = branding.contactEmail || "—";

  // 1) Logo area
  //    First page: covers "KAREERstudio – Powered by ADMITra" in the centre area
  //    Last page:  covers the brand block near the bottom
  const logoArea = includeFooterContact
    ? { x: 56, y: 205, width: 98, height: 46 }
    : { x: 40, y: 34, width: 130, height: 46 };

  if (logoDataUrl) {
    const tmpImg = new Image();
    tmpImg.src = logoDataUrl;
    const nw = tmpImg.naturalWidth || logoArea.width;
    const nh = tmpImg.naturalHeight || logoArea.height;
    const ratio = nw / nh;
    const maxW = logoArea.width - 6;
    const maxH = logoArea.height - 6;
    let dw = maxW;
    let dh = dw / ratio;
    if (dh > maxH) { dh = maxH; dw = dh * ratio; }
    const ox = logoArea.x + (logoArea.width - dw) / 2;
    const oy = logoArea.y + (logoArea.height - dh) / 2;
    doc.addImage(logoDataUrl, "JPEG", ox, oy, dw, dh, undefined, "FAST");
  }

  // 2) Website
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(website, w / 2, h - 9.5, { align: "center" });

  if (!includeFooterContact) {
    // 3) "Interpreted by"
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(interpretedBy, 18, 259);
    return;
  }

  // 4) Last-page phone/email
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Phone: ${phone}`, 16, 256.5);
  doc.text(`Email: ${email}`, 108, 256.5);
}

// ────────────────────────────────────────────
//  MAIN EXPORT
// ────────────────────────────────────────────
export async function generateMetacognitionReport(
  data: ReportData,
  options?: { returnBlob?: boolean; skipSave?: boolean },
): Promise<Blob | void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Determine quadrant
  const { label: quadrantLabel } = getQuadrant(data.domainScores);

  // ── Page mapping (new structure) ──
  // Common static pages: 1, 3, 5-11, 24, 25
  // Conditional pages based on quadrant:
  //   Passive Learner    → 12-14
  //   Reflective Learner → 15-17
  //   Strategic Learner  → 18-20
  //   Self-Regulated Learner → 21-23
  // Dynamic pages: 2 (student info), 4 (quadrant), disclaimer (end)

  const quadrantPageRange: Record<QuadrantType, [number, number]> = {
    [QUADRANT_LABELS.unawareLearner]: [12, 14],
    [QUADRANT_LABELS.reflectiveLearner]: [15, 17],
    [QUADRANT_LABELS.strategicLearner]: [18, 20],
    [QUADRANT_LABELS.expertLearner]: [21, 23],
  };
  const [qStart, qEnd] = quadrantPageRange[quadrantLabel];

  // All static image pages we need
  const commonPages = [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 24];
  const quadrantPages: number[] = [];
  for (let p = qStart; p <= qEnd; p++) quadrantPages.push(p);
  const allStaticPages = [...commonPages, ...quadrantPages];

  // Pre-fetch all needed images (now PNG format, named N.png)
  const compress = !!options?.returnBlob; // compress for email, keep full quality for download
  const imgFormat = compress ? "JPEG" : "PNG";
  const imageUrls = allStaticPages.map((num) => `/test/${num}.png`);
  let imageDataUrls = await Promise.all(
    imageUrls.map((url) => fetchImageAsDataURL(url)),
  );

  // Compress to JPEG for email to keep PDF size small
  if (compress) {
    imageDataUrls = await Promise.all(
      imageDataUrls.map((du) => compressImageToJPEG(du, 0.5)),
    );
  }

  const imageMap = new Map<number, string>();
  allStaticPages.forEach((num, i) => {
    imageMap.set(num, imageDataUrls[i]);
  });

  let organizationLogo: string | undefined;
  if (data.organizationBranding?.logoUrl) {
    try {
      const logoData = await fetchImageAsDataURL(toAbsoluteUrl(data.organizationBranding.logoUrl));
      organizationLogo = await compressImageToJPEG(logoData, options?.returnBlob ? 0.72 : 0.82);
    } catch {
      organizationLogo = undefined;
    }
  }

  // ── Page 1 — Cover (first page of doc, no addPage needed) ──
  doc.addImage(imageMap.get(1)!, imgFormat, 0, 0, w, h);

  // ── Page 2 — Student Information (dynamic) ──
  addStudentInfoPage(doc, data);

  // ── Page 3 — Static image ──
  addImagePage(doc, imageMap.get(3)!, imgFormat);

  // ── Page 4 — Quadrant Chart (4.png background with dynamic quadrant overlay) ──
  addQuadrantPage(doc, data, imageMap.get(4)!);

  // ── Pages 5-11 — Common static images ──
  for (let p = 5; p <= 11; p++) {
    const img = imageMap.get(p);
    if (img) addImagePage(doc, img, imgFormat);
  }

  // ── Quadrant-specific pages ──
  for (let p = qStart; p <= qEnd; p++) {
    const img = imageMap.get(p);
    if (img) addImagePage(doc, img, imgFormat);
  }

  // ── Page 24 — Common ending page ──
  addImagePage(doc, imageMap.get(24)!, imgFormat);

  const totalPages = doc.getNumberOfPages();
  applyOrganizationBranding(doc, 1, data.organizationBranding || {}, organizationLogo, false);
  applyOrganizationBranding(doc, totalPages, data.organizationBranding || {}, organizationLogo, true);

  // Save and/or return blob
  const fileName = `TEST_Detailed_Report_${data.studentName.replace(/\s+/g, "_")}.pdf`;

  if (!options?.skipSave) {
    doc.save(fileName);
  }

  if (options?.returnBlob) {
    return doc.output("blob");
  }
}
