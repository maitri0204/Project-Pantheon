const STYLE_LABELS: Record<string, string> = {
  K: "King",
  S: "Servant",
  E: "Elder",
  P: "Prince",
  J: "Joker",
};

const STYLE_ORDER = ["K", "S", "E", "P", "J"] as const;

export async function generateLitmusReport(args: {
  studentName: string;
  styleScores: Record<string, number>;
}): Promise<void> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib") as any;
  const templateUrl = `${window.location.origin}/litmus/Litmus%20Test.pdf`;
  const response = await fetch(templateUrl);
  if (!response.ok) throw new Error("Litmus template not found");

  const templateBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(templateBytes);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

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

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
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
