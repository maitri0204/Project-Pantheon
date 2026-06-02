interface InterestScore {

  code: string;
  score: number;
  level: string;
  percentage: number;
}

interface StreamAnalysis {
  recommendedStream: string;
  confidence: string;
  streamReasoning: string;
  guidancePoints: string[];
  cautionAreas: string[];
  futureOpportunities: string[];
  suggestedCareers: string[];
  supportingDomains: string[];
}

interface AcademicCareerEvaluation {
  interestScores: InterestScore[];
  topInterests: string[];
  streamAnalysis: StreamAnalysis;
  completedAt: Date;
}

interface ReportData {
  studentName: string;
  classGrade?: string;
  schoolName?: string;
  submittedAt?: string;
  evaluation: AcademicCareerEvaluation;
  organizationBranding?: {
    organizationName?: string;
    logoUrl?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    representativeName?: string;
  };
}

const INTEREST_NAMES: Record<string, string> = {
  A: "Science & Research",
  B: "Commerce & Financial",
  C: "Social Science, Law & Public Policy",
  D: "Creative Arts, Design & Media",
  E: "Technology & Digital Systems",
  F: "Health, Biology & Human Performance",
  G: "Communication, Language & Education",
  H: "Entrepreneurship, Leadership & Management",
  I: "Environment, Sustainability & Agriculture",
  J: "Social Impact, Community & Helping",
};

const INTEREST_COLORS: Record<string, string> = {
  A: "#4f46e5",
  B: "#d97706",
  C: "#dc2626",
  D: "#ec4899",
  E: "#0ea5e9",
  F: "#059669",
  G: "#7c3aed",
  H: "#f97316",
  I: "#14b8a6",
  J: "#a855f7",
};

const parseColor = (hex: string) => {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
};

const safeText = (value?: string) => String(value || "—");

export async function generateAcademicCareerReport(
  data: ReportData,
  options?: { returnBlob?: boolean }
): Promise<void | Blob> {
  const evaluation = data.evaluation;
  const topInterests = evaluation.topInterests.slice(0, 3);
  const { default: jsPDFLib } = await import("jspdf");
  const pdf = new jsPDFLib({ unit: "mm", format: "a4", compress: true });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let y = 20;

  const drawSectionTitle = (title: string) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(15, 23, 42);
    pdf.text(title, 15, y);
    y += 7;
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.line(15, y, pageWidth - 15, y);
    y += 8;
  };

  const drawWrappedText = (text: string, x: number, maxWidth: number, lineHeight: number) => {
    const lines = pdf.splitTextToSize(text, maxWidth) as string[];
    lines.forEach((line: string) => {
      pdf.text(line, x, y);
      y += lineHeight;
    });
  };

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(15, 23, 42);
  pdf.text("Academic Career & Interest Report", 15, y);
  y += 9;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(75, 85, 99);
  pdf.text("Personalized career pathway assessment based on interest mapping.", 15, y);
  y += 12;

  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(1);
  pdf.line(15, y, pageWidth - 15, y);
  y += 10;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Student Name:", 15, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(safeText(data.studentName), 50, y);
  y += 6;

  if (data.classGrade) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Grade:", 15, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(data.classGrade, 50, y);
    y += 6;
  }

  if (data.schoolName) {
    pdf.setFont("helvetica", "bold");
    pdf.text("School:", 15, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(data.schoolName, 50, y);
    y += 6;
  }

  if (data.submittedAt) {
    pdf.setFont("helvetica", "bold");
    pdf.text("Submitted:", 15, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(data.submittedAt, 50, y);
    y += 6;
  }

  y += 4;
  drawSectionTitle("Top 3 Interest Areas");
  y += 2;

  topInterests.forEach((code) => {
    const score = evaluation.interestScores.find((item) => item.code === code);
    if (!score) return;

    const [r, g, b] = parseColor(INTEREST_COLORS[code] || "#111111");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(r, g, b);
    pdf.text(`${code}. ${INTEREST_NAMES[code] || code}`, 15, y);
    y += 5;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(51, 65, 85);
    pdf.text(`${score.percentage}% • ${score.level}`, 15, y);
    y += 5;

    const barWidth = Math.max(8, Math.min(140, (score.percentage / 100) * 140));
    pdf.setFillColor(229, 231, 235);
    pdf.rect(15, y, 140, 5, "F");
    pdf.setFillColor(r, g, b);
    pdf.rect(15, y, barWidth, 5, "F");
    y += 12;
  });

  y += 2;
  drawSectionTitle("Recommended Stream");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(evaluation.streamAnalysis.recommendedStream, 15, y);
  y += 6;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(55, 65, 81);
  drawWrappedText(evaluation.streamAnalysis.streamReasoning, 15, pageWidth - 30, 6);
  y += 4;

  if (y > 240) {
    pdf.addPage();
    y = 20;
  }

  drawSectionTitle("Why This Stream?");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  evaluation.streamAnalysis.guidancePoints.forEach((point) => {
    pdf.text(`• ${point}`, 18, y);
    y += 5;
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });

  y += 4;
  drawSectionTitle("Important Considerations");
  evaluation.streamAnalysis.cautionAreas.forEach((area) => {
    pdf.text(`• ${area}`, 18, y);
    y += 5;
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });

  pdf.addPage();
  y = 20;
  drawSectionTitle("Complete Interest Scores");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  evaluation.interestScores.forEach((score, index) => {
    const x = index % 2 === 0 ? 15 : 105;
    const row = Math.floor(index / 2);
    const itemY = y + row * 24;
    pdf.setDrawColor(226, 232, 240);
    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(x, itemY - 4, 90, 20, 3, 3, "F");

    const [r, g, b] = parseColor(INTEREST_COLORS[score.code] || "#111111");
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(r, g, b);
    pdf.text(`${score.code}. ${INTEREST_NAMES[score.code] || score.code}`, x + 4, itemY + 1);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(51, 65, 85);
    pdf.text(`${score.percentage}% • ${score.level}`, x + 4, itemY + 7);

    if (index % 2 === 1) {
      y += 24;
      if (y > 240) {
        pdf.addPage();
        y = 20;
      }
    }
  });

  y += 28;
  if (y > 240) {
    pdf.addPage();
    y = 20;
  }

  drawSectionTitle("Recommended Careers");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  evaluation.streamAnalysis.suggestedCareers.forEach((career) => {
    pdf.text(`• ${career}`, 18, y);
    y += 5;
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });

  pdf.addPage();
  y = 20;
  drawSectionTitle("Future Opportunities");
  evaluation.streamAnalysis.futureOpportunities.forEach((opp) => {
    pdf.text(`• ${opp}`, 18, y);
    y += 5;
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });

  y += 8;
  if (y > 260) {
    pdf.addPage();
    y = 20;
  }

  drawSectionTitle("Next Steps");
  const nextSteps = [
    "Explore the recommended stream through subject descriptions, webinars, and career talks.",
    "Discuss your results with teachers, parents, and career counselors.",
    "Try small projects or workshops in your top interest areas.",
    "Decide on a stream based on sustained interest and subject aptitude.",
  ];
  nextSteps.forEach((step, idx) => {
    pdf.text(`${idx + 1}. ${step}`, 18, y);
    y += 6;
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });

  if (data.organizationBranding?.organizationName) {
    y += 10;
    if (y > 250) {
      pdf.addPage();
      y = 20;
    }
    drawSectionTitle("Assessment Provider");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(safeText(data.organizationBranding.organizationName), 15, y);
    y += 5;
    if (data.organizationBranding.website) {
      pdf.text(`Website: ${safeText(data.organizationBranding.website)}`, 15, y);
      y += 5;
    }
    if (data.organizationBranding.contactEmail) {
      pdf.text(`Email: ${safeText(data.organizationBranding.contactEmail)}`, 15, y);
      y += 5;
    }
  }

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(107, 114, 128);
  pdf.text(
    `Generated on ${new Date().toLocaleDateString("en-IN")}`,
    15,
    pageHeight - 10,
  );

  if (options?.returnBlob) {
    return pdf.output("blob");
  }
  pdf.save("Academic_Career_Report.pdf");
}
