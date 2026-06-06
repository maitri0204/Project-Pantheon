import React from "react";
import { pdf } from "@react-pdf/renderer";

import { AcademicCareerResultPdfDocument, type AcademicCareerPdfReport } from "@/components/reports/AcademicCareerResultPdfDocument";

type InterestScore = {
  code: string;
  score: number;
  level: string;
  percentage: number;
};

type StreamAnalysis = {
  recommendedStream: string;
  confidence: string;
  streamReasoning: string;
  guidancePoints: string[];
  cautionAreas: string[];
  futureOpportunities: string[];
  suggestedCareers: string[];
  supportingDomains: string[];
};

type AcademicCareerEvaluation = {
  interestScores: InterestScore[];
  topInterests: string[];
  streamAnalysis: StreamAnalysis;
  completedAt: Date;
};

type ReportData = {
  studentName: string;
  classGrade?: string;
  schoolName?: string;
  submittedAt?: string;
  attemptId?: string;
  evaluation: AcademicCareerEvaluation;
  backCoverImageSrc?: string;
  organizationBranding?: {
    organizationName?: string;
    logoUrl?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    representativeName?: string;
  };
};

const CAREER_FALLBACKS: Record<string, string[]> = {
  A: ["Research Scientist", "Engineer"],
  B: ["Chartered Accountant", "Financial Analyst"],
  C: ["Lawyer", "Policy Analyst"],
  D: ["Designer", "Content Creator"],
  E: ["Software Developer", "AI Engineer"],
  F: ["Doctor", "Psychologist"],
  G: ["Teacher", "Journalist"],
  H: ["Entrepreneur", "Business Manager"],
  I: ["Environmental Scientist", "Sustainability Consultant"],
  J: ["Social Worker", "Counselor"],
};

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

const buildPdfReportPayload = (data: ReportData): AcademicCareerPdfReport => {
  const backCoverImageSrc = data.backCoverImageSrc;
  const scores = (data.evaluation.interestScores || []).map((item) => ({
    code: String(item.code || "").toUpperCase(),
    name: INTEREST_NAMES[String(item.code || "").toUpperCase()] || String(item.code || "").toUpperCase(),
    score: Number(item.score || 0),
    percentage: Number(item.percentage || 0),
    level: String(item.level || "Very Low"),
  }));

  const topCodes = (data.evaluation.topInterests || [])
    .map((code) => String(code || "").toUpperCase())
    .filter(Boolean);

  const topInterests = topCodes.slice(0, 3).map((code) => ({
    code,
    name: INTEREST_NAMES[code] || code,
    careers: CAREER_FALLBACKS[code] ?? ["Career Exploration"],
    streams: [String(data.evaluation.streamAnalysis?.recommendedStream || "Exploratory Stream")],
  }));

  const strongestDomain = topInterests[0]?.name
    || scores.slice().sort((a, b) => b.score - a.score)[0]?.name
    || "Interest Area";

  return {
    resultId: data.attemptId || "academic-career-result",
    grade: data.classGrade || "Grade 10",
    completedAt: data.submittedAt || new Date().toISOString(),
    attemptNumber: 1,
    totalAttempts: 1,
    totalQuestions: scores.reduce((sum, score) => sum + score.score, 0),
    strongestDomain,
    streamRecommendation: String(data.evaluation.streamAnalysis?.recommendedStream || "Exploratory Stream"),
    streamRecommendationDetailed: String(data.evaluation.streamAnalysis?.recommendedStream || "Exploratory Stream"),
    student: {
      fullName: data.studentName || "Student",
    },
    scores,
    topInterests: topInterests.length
      ? topInterests
      : scores.slice(0, 3).map((score) => ({
          code: score.code,
          name: score.name,
          careers: CAREER_FALLBACKS[score.code] ?? ["Career Exploration"],
          streams: [String(data.evaluation.streamAnalysis?.recommendedStream || "Exploratory Stream")],
        })),
    backCoverImageSrc,
  };
};

export async function generateAcademicCareerReport(
  data: ReportData,
  options?: { returnBlob?: boolean }
): Promise<void | Blob> {
  const report = buildPdfReportPayload(data);
  const documentElement = React.createElement(AcademicCareerResultPdfDocument, { report }) as unknown as React.ReactElement;
  const blob = await (pdf as any)(documentElement).toBlob();

  if (options?.returnBlob) {
    return blob;
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "Academic_Career_Report.pdf";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
