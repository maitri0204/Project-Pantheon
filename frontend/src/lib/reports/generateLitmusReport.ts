const STYLE_LABELS: Record<string, string> = {
  K: "King",
  S: "Servant",
  E: "Elder",
  P: "Prince",
  J: "Joker",
};

const STYLE_ORDER = ["K", "S", "E", "P", "J"] as const;

const toAbsoluteUrl = (value?: string): string => {
  if (!value) return "";
  if (/^data:image\//i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${window.location.origin}${value.startsWith("/") ? "" : "/"}${value}`;
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

const normalizeWebsite = (value?: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

export async function generateLitmusReport(args: {
  studentName: string;
  styleScores: Record<string, number>;
  organizationBranding?: {
    organizationName?: string;
    logoUrl?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    representativeName?: string;
  };
}, options?: { returnBlob?: boolean }): Promise<void | Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib") as any;
  const templateUrl = `${window.location.origin}/litmus/Litmus%20Test.pdf`;
  const response = await fetch(templateUrl);
  if (!response.ok) throw new Error("Litmus template not found");

  const templateBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  let embeddedLogo: any;
  const logoUrl = args.organizationBranding?.logoUrl;
  if (logoUrl) {
    try {
      const logoResponse = await fetch(toAbsoluteUrl(logoUrl));
      if (logoResponse.ok) {
        const logoBytes = await logoResponse.arrayBuffer();
        try {
          embeddedLogo = await pdfDoc.embedPng(logoBytes);
        } catch {
          embeddedLogo = await pdfDoc.embedJpg(logoBytes);
        }
      }
    } catch {
      embeddedLogo = undefined;
    }
  }

  const sortedStyles = [...STYLE_ORDER]
    .map((s) => ({ style: s, label: STYLE_LABELS[s], score: Number(args.styleScores[s] || 0) }))
    .sort((a, b) => b.score - a.score);

  const primaryStyle = sortedStyles[0];
  const secondaryStyle = sortedStyles[1];

  if (pages.length >= 2) {
    const page = pages[1];
    const { height } = page.getSize();
    const styleScoreColor = rgb(1, 1, 1);

    page.drawText(`${args.styleScores["K"] ?? 0}`, { x: 79, y: height - 158, size: 22, font: boldFont, color: styleScoreColor });
    page.drawText(`${args.styleScores["S"] ?? 0}`, { x: 197, y: height - 158, size: 22, font: boldFont, color: styleScoreColor });
    page.drawText(`${args.styleScores["E"] ?? 0}`, { x: 322, y: height - 158, size: 22, font: boldFont, color: styleScoreColor });
    page.drawText(`${args.styleScores["P"] ?? 0}`, { x: 132, y: height - 230, size: 22, font: boldFont, color: styleScoreColor });
    page.drawText(`${args.styleScores["J"] ?? 0}`, { x: 269, y: height - 230, size: 22, font: boldFont, color: styleScoreColor });

    page.drawText(primaryStyle.label.toUpperCase(), { x: 93, y: height - 293, size: 18, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
    page.drawText(secondaryStyle.label.toUpperCase(), { x: 283, y: height - 293, size: 18, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
  }

  const scorePages: Array<{ pageIndex: number; key: string; y: number }> = [
    { pageIndex: 4, key: "K", y: 83 },
    { pageIndex: 5, key: "S", y: 75 },
    { pageIndex: 6, key: "E", y: 81 },
    { pageIndex: 7, key: "P", y: 75 },
    { pageIndex: 8, key: "J", y: 67 },
  ];

  scorePages.forEach(({ pageIndex, key, y }) => {
    if (pages.length <= pageIndex) return;
    const page = pages[pageIndex];
    const { width } = page.getSize();
    page.drawText(`${args.styleScores[key] ?? 0}`, {
      x: width - 77,
      y,
      size: 22,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    });
  });

  const drawBranding = (pageIndex: number, withFooterContact: boolean) => {
    if (!pages[pageIndex]) return;
    const page = pages[pageIndex];
    const { width, height } = page.getSize();
    const PT = (mm: number) => mm * 2.8346;
    const interpretedBy = toFirstLastName(args.organizationBranding?.representativeName);

    // ── Logo area (same mm dimensions as CLEAR, correctly converted to pdf-lib pt) ──
    //    In pdf-lib: x from left in pt, y from BOTTOM in pt
    //    First page: x=76mm, top-edge=8mm → y_bottom = height - PT(8+28)
    //    Last page:  x=28mm, top-edge=150mm → y_bottom = height - PT(202+44)
    const logoArea = withFooterContact
      ? { x: PT(28), y: height - PT(150 + 44), width: PT(98), height: PT(44) }
      : { x: PT(76), y: height - PT(8 + 26), width: PT(80), height: PT(28) };

    if (embeddedLogo) {
      const dims = embeddedLogo.scale(1);
      const ratio = dims.width / dims.height;
      const maxW = logoArea.width - PT(2);
      const maxH = logoArea.height - PT(2);
      let drawW = maxW;
      let drawH = drawW / ratio;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * ratio;
      }
      page.drawImage(embeddedLogo, {
        x: logoArea.x + (logoArea.width - drawW) / 2,
        y: logoArea.y + (logoArea.height - drawH) / 2,
        width: drawW,
        height: drawH,
      });
    }

    // ── Website: Litmus template has a thin strip at the very bottom ──
    // y=12pt from bottom ≈ 4mm — sits inside the template's bottom url strip
    page.drawText(`${normalizeWebsite(args.organizationBranding?.website) || "—"}`, {
      x: 150,
      y: 23,
      size: 10,
      font: regularFont,
      color: rgb(0.12, 0.16, 0.2),
    });

    if (!withFooterContact) {
      // ── Interpreter name on first page ──
      // Template already has "Interpreted by:" printed; we draw the name just below it
      // y=54pt ≈ 19mm from bottom — matches the Litmus template text area
      page.drawText(interpretedBy, {
        x: PT(13),
        y: 89,
        size: 12,
        font: regularFont,
        color: rgb(1.0, 1.0, 1.0),
      });
      return;
    }

    // ── Last page phone/email ──
    // y=39.5pt ≈ 14mm from bottom — matches the Litmus template's bottom contact strip
    page.drawText(`Phone: ${args.organizationBranding?.contactPhone || "—"}`, {
      x: PT(16),
      y: 60,
      size: 10,
      font: regularFont,
      color: rgb(0.12, 0.16, 0.2),
    });
    page.drawText(`Email: ${args.organizationBranding?.contactEmail || "—"}`, {
      x: PT(90),
      y: 60,
      size: 10,
      font: regularFont,
      color: rgb(0.12, 0.16, 0.2),
    });
  };

  drawBranding(0, false);
  drawBranding(pages.length - 1, true);

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  if (options?.returnBlob) return blob;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = args.studentName.replace(/[^a-zA-Z0-9]/g, "_") || "Student";
  a.download = `Litmus_Report_${safeName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
