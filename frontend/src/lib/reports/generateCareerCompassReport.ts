import { PERSONALITY_CAREERS, PERSONALITY_NAMES, PERSONALITY_STREAMS, PERSONALITY_SUBJECTS } from "@/lib/reports/reportConstants";
import { PERSONALITY_CONTENT } from "@/lib/reports/personalityContent";

type OrganizationBranding = {
  organizationName?: string;
  logoUrl?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  representativeName?: string;
};

async function loadImageAsJpeg(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unavailable"));
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
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
  pdf: any,
  pageNumber: number,
  pageHeight: number,
  branding: OrganizationBranding,
  logoDataUrl?: string,
  includeFooterContact?: boolean,
) => {
  pdf.setPage(pageNumber);

  const website = normalizeWebsite(branding.website) || "—";
  const interpretedBy = toFirstLastName(branding.representativeName);

  // ── Logo area (same coordinates as CLEAR) ──
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

export async function generateCareerCompassReport(args: {
  studentName: string;
  submittedAt?: string;
  personalityType: string;
  classGrade?: string;
  schoolName?: string;
  organizationBranding?: OrganizationBranding;
}, options?: { returnBlob?: boolean }): Promise<void | Blob> {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const pageWidth = 210;
  const pageHeight = 297;

  const addImagePage = async (src: string) => {
    try {
      const dataUrl = await loadImageAsJpeg(src);
      pdf.addImage(dataUrl, "JPEG", 0, 0, pageWidth, pageHeight);
    } catch {
      pdf.setFontSize(14);
      pdf.text("Page content unavailable", pageWidth / 2, pageHeight / 2, { align: "center" });
    }
  };

  const pt = args.personalityType || "UNKNOWN";
  let organizationLogo: string | undefined;
  if (args.organizationBranding?.logoUrl) {
    try {
      organizationLogo = await loadImageAsJpeg(toAbsoluteUrl(args.organizationBranding.logoUrl));
    } catch {
      organizationLogo = undefined;
    }
  }

  await addImagePage("/career/1.png");

  pdf.addPage();
  pdf.setFillColor(255, 251, 244);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  pdf.setFillColor(255, 189, 89);
  pdf.rect(0, 0, pageWidth, 45, "F");
  pdf.setFillColor(230, 168, 48);
  pdf.rect(0, 43, pageWidth, 3, "F");
  pdf.setTextColor(30, 20, 5);
  pdf.setFontSize(30);
  pdf.setFont("helvetica", "bold");
  pdf.text("Student Information", pageWidth / 2, 28, { align: "center" });

  const infoFields = [
    { label: "Student Name", value: args.studentName || "—" },
    { label: "Class / Grade", value: args.classGrade || "—" },
    { label: "Institute Name", value: args.schoolName || "—" },
    { label: "Date of Assessment", value: args.submittedAt || "—" },
    { label: "Counselor Name", value: args.organizationBranding?.representativeName || args.organizationBranding?.organizationName || "Administered by Organization" },
  ];

  const infoCardHeight = Math.max(165, infoFields.length * 30 + 18);

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(20, 60, 170, infoCardHeight, 6, 6, "F");
  pdf.setDrawColor(255, 189, 89);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(20, 60, 170, infoCardHeight, 6, 6, "S");
  pdf.setLineWidth(0.2);

  let yPos = 80;
  infoFields.forEach((field, idx) => {
    pdf.setFillColor(255, 189, 89);
    pdf.rect(27, yPos - 4, 3, 16, "F");
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(160, 120, 60);
    pdf.text(field.label.toUpperCase(), 36, yPos);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(20, 20, 20);
    pdf.text(String(field.value), 36, yPos + 10);
    if (idx < infoFields.length - 1) {
      pdf.setDrawColor(250, 220, 170);
      pdf.line(35, yPos + 16, 178, yPos + 16);
    }
    yPos += 30;
  });

  pdf.addPage();
  await addImagePage("/career/3.png");
  pdf.addPage();
  await addImagePage("/career/4.png");
  pdf.addPage();
  await addImagePage("/career/5.png");

  const profileContent = PERSONALITY_CONTENT[pt];
  if (profileContent) {
    pdf.addPage();
    pdf.setFillColor(255, 251, 244);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setFillColor(255, 189, 89);
    pdf.rect(0, 0, pageWidth, 45, "F");
    pdf.setFillColor(230, 168, 48);
    pdf.rect(0, 43, pageWidth, 3, "F");
    pdf.setTextColor(30, 20, 5);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text("Your Personality Profile", pageWidth / 2, 22, { align: "center" });
    pdf.setFontSize(14);
    pdf.setTextColor(80, 50, 10);
    pdf.text(PERSONALITY_NAMES[pt] || pt, pageWidth / 2, 36, { align: "center" });

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const overviewLines = pdf.splitTextToSize(profileContent.overview, 160);
    const overviewTextH = overviewLines.length * 6;
    const overviewBoxH = overviewTextH + 20;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(15, 55, 180, overviewBoxH, 4, 4, "F");
    pdf.setDrawColor(255, 189, 89);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(15, 55, 180, overviewBoxH, 4, 4, "S");
    pdf.setLineWidth(0.2);
    pdf.setFillColor(255, 189, 89);
    pdf.roundedRect(15, 55, 4, overviewBoxH, 2, 2, "F");
    pdf.setTextColor(40, 40, 40);
    pdf.text(overviewLines, 26, 65, { lineHeightFactor: 1.6 });

    let currentY = 55 + overviewBoxH + 12;
    const marginBottom = 280;
    const sectionGap = 8;
    const isBlindSpots = (title: string) => title.toLowerCase().includes("blind spot");

    for (const section of profileContent.sections) {
      const titleHeight = 10;
      const bulletHeight = section.bullets.length * 7;
      const totalSectionHeight = titleHeight + bulletHeight + sectionGap;

      if (currentY + totalSectionHeight > marginBottom) {
        pdf.addPage();
        pdf.setFillColor(255, 251, 244);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");
        pdf.setFillColor(255, 189, 89);
        pdf.rect(0, 0, pageWidth, 8, "F");
        currentY = 20;
      }

      pdf.setFillColor(255, 189, 89);
      pdf.roundedRect(15, currentY - 1, 180, 9, 2, 2, "F");
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 20, 5);
      pdf.text(section.title, 20, currentY + 5);
      currentY += 13;

      pdf.setFontSize(9.5);
      pdf.setTextColor(50, 50, 50);
      for (const bullet of section.bullets) {
        if (isBlindSpots(section.title) && (bullet.includes(" – ") || bullet.includes(" - "))) {
          const sep = bullet.includes(" – ") ? " – " : " - ";
          const parts = bullet.split(sep);
          const boldPart = parts[0];
          const restPart = sep + parts.slice(1).join(sep);
          const bulletPrefix = "•  ";
          if (currentY + 6 > marginBottom) {
            pdf.addPage();
            pdf.setFillColor(255, 251, 244);
            pdf.rect(0, 0, pageWidth, pageHeight, "F");
            pdf.setFillColor(255, 189, 89);
            pdf.rect(0, 0, pageWidth, 8, "F");
            currentY = 20;
          }
          pdf.setFont("helvetica", "normal");
          pdf.text(bulletPrefix, 22, currentY);
          const prefixW = pdf.getTextWidth(bulletPrefix);
          pdf.setFont("helvetica", "bold");
          pdf.text(boldPart, 22 + prefixW, currentY);
          const boldW = pdf.getTextWidth(boldPart);
          pdf.setFont("helvetica", "normal");
          const restLines = pdf.splitTextToSize(restPart, 168 - prefixW - boldW);
          if (restLines.length > 1) {
            pdf.text(restLines[0], 22 + prefixW + boldW, currentY);
            const remainingLines = pdf.splitTextToSize(restLines.slice(1).join(" "), 168);
            currentY += 5;
            for (const rl of remainingLines) {
              pdf.text(rl, 22, currentY);
              currentY += 5;
            }
            currentY += 1.5;
          } else {
            pdf.text(restPart, 22 + prefixW + boldW, currentY);
            currentY += 6.5;
          }
        } else {
          pdf.setFont("helvetica", "normal");
          const bulletLines = pdf.splitTextToSize(`•  ${bullet}`, 168);
          const neededH = bulletLines.length * 5;
          if (currentY + neededH > marginBottom) {
            pdf.addPage();
            pdf.setFillColor(255, 251, 244);
            pdf.rect(0, 0, pageWidth, pageHeight, "F");
            pdf.setFillColor(255, 189, 89);
            pdf.rect(0, 0, pageWidth, 8, "F");
            currentY = 20;
          }
          pdf.text(bulletLines, 22, currentY);
          currentY += neededH + 1.5;
        }
      }
      currentY += sectionGap;
    }
  }

  pdf.addPage();
  pdf.setFillColor(255, 251, 244);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  pdf.setFillColor(255, 189, 89);
  pdf.rect(0, 0, pageWidth, 45, "F");
  pdf.setFillColor(230, 168, 48);
  pdf.rect(0, 43, pageWidth, 3, "F");
  pdf.setTextColor(30, 20, 5);
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.text("Your Career Pathway", pageWidth / 2, 28, { align: "center" });

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(20, 55, 170, 24, 4, 4, "F");
  pdf.setFillColor(255, 189, 89);
  pdf.roundedRect(20, 55, 5, 24, 2, 2, "F");
  pdf.setTextColor(120, 80, 20);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("PERSONALITY TYPE", 32, 63);
  pdf.setFontSize(18);
  pdf.setTextColor(20, 20, 20);
  pdf.text(PERSONALITY_NAMES[pt] || pt, 32, 74);

  const colW = 80;
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(20, 90, colW, 38, 4, 4, "F");
  pdf.setFillColor(255, 189, 89);
  pdf.roundedRect(20, 90, 4, 38, 2, 2, "F");
  pdf.setFontSize(12);
  pdf.setTextColor(150, 100, 20);
  pdf.text("SUGGESTED STREAM", 30, 99);
  pdf.setFontSize(17);
  pdf.setTextColor(20, 20, 20);
  pdf.text(PERSONALITY_STREAMS[pt] || "—", 30, 113);

  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(110, 90, colW, 38, 4, 4, "F");
  pdf.setFillColor(230, 168, 48);
  pdf.roundedRect(110, 90, 4, 38, 2, 2, "F");
  pdf.setFontSize(12);
  pdf.setTextColor(150, 100, 20);
  pdf.text("SUGGESTED SUBJECTS", 120, 99);
  pdf.setFontSize(11);
  pdf.setTextColor(20, 20, 20);
  const subjLines = pdf.splitTextToSize((PERSONALITY_SUBJECTS[pt] || []).join(", "), 58);
  pdf.text(subjLines, 120, 109);

  const careers = PERSONALITY_CAREERS[pt] || [];
  let y6 = 142;
  pdf.setFillColor(255, 189, 89);
  pdf.roundedRect(20, y6 - 2, 170, 14, 3, 3, "F");
  pdf.setTextColor(30, 20, 5);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("TOP 10 RECOMMENDED CAREERS", pageWidth / 2, y6 + 7, { align: "center" });
  y6 += 20;
  const colA = 20;
  const colB = 110;
  careers.forEach((career, i) => {
    const xPos = i % 2 === 0 ? colA : colB;
    const row = Math.floor(i / 2);
    const yItem = y6 + row * 16;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(xPos, yItem - 3, colW, 13, 3, 3, "F");
    pdf.setFillColor(255, 189, 89);
    pdf.circle(xPos + 7, yItem + 3, 4, "F");
    pdf.setTextColor(30, 20, 5);
    pdf.setFontSize(10);
    pdf.text(String(i + 1), xPos + 7, yItem + 5, { align: "center" });
    pdf.setTextColor(20, 20, 20);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(career, xPos + 14, yItem + 5);
  });

  pdf.addPage();
  await addImagePage("/career/7.png");

  const totalPages = pdf.getNumberOfPages();
  applyOrganizationBranding(pdf, 1, pageHeight, args.organizationBranding || {}, organizationLogo, false);
  applyOrganizationBranding(pdf, totalPages, pageHeight, args.organizationBranding || {}, organizationLogo, true);

  if (options?.returnBlob) return pdf.output("blob");
  pdf.save("Career_Compass_Report.pdf");
}
