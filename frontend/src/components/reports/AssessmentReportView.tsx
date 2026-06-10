"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, BookOpen, GraduationCap } from "lucide-react";

import { apiRequest, getStoredAuth } from "../../lib/api";
import { getAssessmentDisplayName, normalizeAssessmentCode } from "@/lib/assessmentAccess";
import { generateCareerCompassReport } from "../../lib/reports/generateCareerCompassReport";
import { generateClearReport } from "../../lib/reports/generateClearReport";
import { generateLitmusReport } from "../../lib/reports/generateLitmusReport";
import { generateMetacognitionReport } from "../../lib/reports/generateMetacognitionReport";
import { generateCareerDnaExecutiveReport } from "@/lib/reports/generateCareerDnaExecutiveReport";
import { generateAcademicCareerReport } from "../../lib/reports/generateAcademicCareerReport";
import QuadrantGraph, { QuadrantLegend } from "./QuadrantGraph";
import AcademicCareerReport from "./AcademicCareerReport";
import StudyAbroadReport, { type StudyAbroadEvaluation } from "./StudyAbroadReport";
import CareerDnaReport, { type CareerDnaEvaluation } from "./CareerDnaReport";
import { generateStudyAbroadReportForEmail } from "@/lib/reports/generateStudyAbroadReport";
import { ALL_TOPICS as STUDY_ABROAD_TOPICS } from "@/lib/studyAbroad/assessmentData";
import {
  DOMAIN_INFO,
  DIMENSION_COLORS,
  DIMENSION_STYLES,
  LETTER_CODES,
  PERSONALITY_CAREERS,
  PERSONALITY_NAMES,
  PERSONALITY_STREAMS,
  PERSONALITY_SUBJECTS,
} from "@/lib/reports/reportConstants";

type ReportResponse = {
  report: {
    attemptId: string;
    assessmentCode: string;
    assessmentName: string;
    status: "IN_PROGRESS" | "COMPLETED";
    answeredCount: number;
    totalQuestions: number;
    submittedAt?: string;
    evaluation: Record<string, unknown>;
    student?: {
      firstName?: string;
      lastName?: string;
      grade?: string;
      institutionName?: string;
    };
    organization?: {
      name?: string;
      companyName?: string;
      logoUrl?: string;
      website?: string;
      contactEmail?: string;
      contactPhone?: string;
      representativeName?: string;
    };
  };
};

type AssessmentReportViewProps = {
  fetchPath: string;
  loginHref: string;
  topBackHref: string;
  topBackLabel: string;
  bottomBackHref: string;
  bottomBackLabel: string;
  retakeHref?: string;
};

const normalizeDisplayCode = (code: string) => {
  const normalized = normalizeAssessmentCode(code);
  if (normalized === "JOHARI_WINDOW") return "CLEAR";
  if (normalized === "METACOGNITION_TEST") return "TEST";
  return normalized;
};

const STYLE_LABELS: Record<string, string> = {
  K: "King",
  S: "Servant",
  E: "Elder",
  P: "Prince",
  J: "Joker",
};

const STYLE_COLORS: Record<string, string> = {
  K: "#f59e0b",
  S: "#3b82f6",
  E: "#8b5cf6",
  P: "#10b981",
  J: "#ef4444",
};

const STYLE_ORDER = ["K", "S", "E", "P", "J"] as const;
const G_LEFT = 80;
const G_TOP = 60;
const G_SIZE = 500;
const G_RIGHT = G_LEFT + G_SIZE;
const G_BOTTOM = G_TOP + G_SIZE;
const SCALE = G_SIZE / 50;
const TICKS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
function dataX(v: number) { return G_LEFT + v * SCALE; }
function dataY(v: number) { return G_TOP + v * SCALE; }

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN");
};

type RQSubscale = {
  dimension: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
};

type RQEvaluation = {
  totalScore: number;
  aqLevel: string;
  subscales: RQSubscale[];
};

type RQTrendPoint = {
  attempt: number;
  score: number;
  level: string;
  date: string;
  assessmentTitle: string;
  durationSeconds?: number;
  difficulty?: string;
};

type RQAttemptItem = {
  attemptId: string;
  assessmentCode: string;
  assessmentName: string;
  completedAt?: string;
  evaluation?: {
    totalScore?: number;
    aqLevel?: string;
  };
  attemptNumber: number;
};

type SubscaleAverage = {
  dimension: string;
  avgPercentage: number;
};

type RQHistoryResponse = {
  totalAttempts: number;
  bestScore: number;
  avgScore: number;
  latestScore: number | null;
  latestLevel: string | null;
  trend: RQTrendPoint[];
  subscaleAverages: SubscaleAverage[];
};

const RQ_LEVEL_DESCRIPTIONS: Record<string, string> = {
  Exceptional:
    "You operate in the highest tier of resilience intelligence. Your Control, Ownership, Reach, and Endurance profile enables you to navigate challenges with agency, accountability, and psychological strength.",
  Strong:
    "Your RQ profile demonstrates strong behavioral resilience. You handle most adversities with skill and composure. Targeted development in your lower dimensions will move you into the Exceptional tier.",
  Moderate:
    "Your RQ profile reveals developing resilience patterns. You show genuine strength in some dimensions while others present clear growth opportunities. Focused practice will yield measurable improvement.",
  Developing:
    "Your resilience capacity is in an early stage of development — this is not a limitation, it is a starting point with tremendous upside.",
};

const RQ_DIMENSION_INSIGHTS: Record<string, { high: string; low: string }> = {
  Control: {
    high: "You exhibit a strong internal locus of control. You approach adversity believing you can shape outcomes through intentional action.",
    low: "You may feel that adversity is largely beyond your control. A daily 'sphere of influence' practice will help rebuild agency.",
  },
  Ownership: {
    high: "You hold yourself accountable for outcomes and use setbacks as learning inputs instead of blame triggers.",
    low: "You may tend to externalize blame under stress. A brief 'what can I own?' reflection can shift this pattern.",
  },
  Reach: {
    high: "You contain adversity well and prevent setbacks from spreading into unrelated life areas.",
    low: "Adversity may spill into multiple life areas. Clear boundaries and 'parking lot' techniques will help contain it.",
  },
  Endurance: {
    high: "You view challenges as temporary, which supports rapid psychological bounce-back and sustained performance.",
    low: "You may perceive challenges as longer-lasting than they are. Evidence journaling can help reframe adversity as temporary.",
  },
};

const RQ_LEVEL_GRADIENTS: Record<string, string> = {
  Exceptional: "from-emerald-500 to-teal-600",
  Strong: "from-sky-500 to-cyan-600",
  Moderate: "from-amber-500 to-orange-600",
  Developing: "from-rose-500 to-red-600",
};

const RQ_LEVEL_ACCENTS: Record<string, string> = {
  Exceptional: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Strong: "text-sky-700 bg-sky-50 border-sky-200",
  Moderate: "text-amber-700 bg-amber-50 border-amber-200",
  Developing: "text-rose-700 bg-rose-50 border-rose-200",
};

const RQ_RECOMMENDATIONS = (result: RQEvaluation): string[] => {
  const control = result.subscales.find((s) => s.dimension === "Control")?.percentage ?? 0;
  const ownership = result.subscales.find((s) => s.dimension === "Ownership")?.percentage ?? 0;
  const reach = result.subscales.find((s) => s.dimension === "Reach")?.percentage ?? 0;
  const endurance = result.subscales.find((s) => s.dimension === "Endurance")?.percentage ?? 0;

  const recs: string[] = [];
  if (control < 60) recs.push("Build your internal locus of control by identifying 3 actions within your power each day.");
  if (ownership < 60) recs.push("Keep a short accountability journal: after setbacks, note what you contributed and what you can improve.");
  if (reach < 60) recs.push("Practice compartmentalization so one setback does not spill into other parts of your life.");
  if (endurance < 60) recs.push("Use evidence journaling to remind yourself that difficult phases are temporary and manageable.");
  if (!recs.length) {
    recs.push("Maintain your current resilience practices and continue challenging yourself with progressively harder goals.");
  }
  return recs.slice(0, 6);
};

async function loadPublicImageDataUrl(path: string): Promise<string> {
  const url = path.startsWith("http") || path.startsWith("data:")
    ? path
    : `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load report image: ${path}`);
  }
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error(`Unable to read report image: ${path}`));
      }
    };
    reader.onerror = () => reject(new Error(`Unable to read report image: ${path}`));
    reader.readAsDataURL(blob);
  });
}

async function generateRQReportBlob(
  result: RQEvaluation,
  report: ReportResponse["report"],
  studentName: string,
  email: string,
  attempts?: RQAttemptItem[]
): Promise<Blob> {
  const [{ pdf }, { AQReport }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/reports/AQReport"),
  ]);

  const [coverImageSrc, backCoverImageSrc] = await Promise.all([
    loadPublicImageDataUrl("/rq/cover.jpg"),
    loadPublicImageDataUrl("/rq/back-cover.jpg"),
  ]);

  const generatedDate = report.submittedAt
    ? new Date(report.submittedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const attemptList = Array.isArray(attempts) && attempts.length > 0
    ? [...attempts].sort((a, b) => {
        const left = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const right = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return left - right;
      })
    : [{
      attemptId: report.attemptId,
      assessmentCode: report.assessmentCode,
      assessmentName: report.assessmentName,
      completedAt: report.submittedAt,
      evaluation: result,
      attemptNumber: 1,
    }];

  const trend = attemptList.map((attempt) => ({
    attempt: attempt.attemptNumber,
    score: attempt.evaluation?.totalScore ?? 0,
    level: attempt.evaluation?.aqLevel ?? result.aqLevel,
    date: attempt.completedAt
      ? new Date(attempt.completedAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : generatedDate,
    assessmentTitle: attempt.assessmentName || report.assessmentName,
  }));

  const scores = trend.map((item) => item.score);
  const bestScore = scores.length ? Math.max(...scores) : result.totalScore;
  const avgScore = scores.length
    ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
    : result.totalScore;

  const aqHistory: RQHistoryResponse = {
    totalAttempts: attemptList.length,
    bestScore,
    avgScore,
    latestScore: result.totalScore,
    latestLevel: result.aqLevel,
    trend,
    subscaleAverages: result.subscales.map((sub) => ({
      dimension: sub.dimension,
      avgPercentage: Math.round(sub.percentage),
    })),
  };

  const element = AQReport({
    studentName,
    email,
    generatedDate,
    aqHistory,
    coverImageSrc,
    backCoverImageSrc,
  });

  return pdf(element).toBlob();
}

const blobToBase64 = async (blob: Blob): Promise<string> => {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to convert report to base64"));
      }
    };
    reader.onerror = () => reject(new Error("Unable to convert report to base64"));
    reader.readAsDataURL(blob);
  });

  const base64 = dataUrl.split(",")[1];
  if (!base64) {
    throw new Error("Unable to encode report PDF");
  }

  return base64;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function parseRqEvaluation(evaluation: unknown): RQEvaluation | null {
  if (!evaluation || typeof evaluation !== "object") {
    return null;
  }

  const ev = evaluation as Record<string, unknown>;
  const totalScore = Number(ev.totalScore);
  const aqLevel = String(ev.aqLevel ?? "").trim();
  if (!Number.isFinite(totalScore) || !aqLevel) {
    return null;
  }

  const rawSubscales = ev.subscales;
  if (!Array.isArray(rawSubscales) || rawSubscales.length === 0) {
    return null;
  }

  const subscales = rawSubscales
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const sub = item as Record<string, unknown>;
      const dimension = String(sub.dimension ?? "").trim();
      if (!dimension) {
        return null;
      }
      return {
        dimension,
        rawScore: toNumber(sub.rawScore),
        maxScore: toNumber(sub.maxScore, 10),
        percentage: toNumber(sub.percentage),
      };
    })
    .filter((item): item is RQSubscale => item !== null);

  if (!subscales.length) {
    return null;
  }

  return { totalScore, aqLevel, subscales };
}

async function resolveRqAttemptsForReport(
  normalizedCode: string,
  rqAttempts: RQAttemptItem[] | null,
  authToken: string | undefined,
  fetchPath: string
): Promise<RQAttemptItem[] | undefined> {
  if (normalizedCode !== "RESILIENCE_TEST") {
    return undefined;
  }
  if (Array.isArray(rqAttempts)) {
    return rqAttempts;
  }
  if (!authToken || !fetchPath.startsWith("/platform/student/")) {
    return undefined;
  }

  try {
    const res = await apiRequest<{ attempts: RQAttemptItem[] }>(
      `/platform/student/assessments/${normalizedCode}/attempts`,
      {},
      authToken
    );
    return res.attempts;
  } catch {
    return undefined;
  }
}

type DetailedReportPdfContext = {
  normalizedCode: string;
  report: ReportResponse["report"];
  evaluation: Record<string, unknown>;
  reportStudentName: string;
  reportEmail: string;
  classGrade: string;
  schoolName: string;
  reportBranding: {
    organizationName: string;
    logoUrl: string;
    website: string;
    contactEmail: string;
    contactPhone: string;
    representativeName: string;
  };
  profileFromAuth: { grade?: string; institutionName?: string; firstName?: string; lastName?: string; email?: string };
  authEmail?: string;
  rqAttempts: RQAttemptItem[] | null;
  authToken?: string;
  fetchPath: string;
};

async function buildDetailedReportPdf(ctx: DetailedReportPdfContext): Promise<{ blob: Blob; fileName: string }> {
  const {
    normalizedCode,
          report,
    evaluation,
          reportStudentName,
          reportEmail,
    classGrade,
    schoolName,
    reportBranding,
    profileFromAuth,
    authEmail,
    rqAttempts,
    authToken,
    fetchPath,
  } = ctx;

  const submittedLabel = report.submittedAt
    ? new Date(report.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  if (normalizedCode === "RESILIENCE_TEST") {
    const rqEvaluation = parseRqEvaluation(evaluation);
    if (!rqEvaluation) {
      throw new Error("RQ report data is not available for this attempt");
    }
    const attempts = await resolveRqAttemptsForReport(normalizedCode, rqAttempts, authToken, fetchPath);
    const blob = await generateRQReportBlob(
      rqEvaluation,
      report,
      reportStudentName,
      reportEmail,
      attempts
    );
    return {
      blob,
      fileName: `RQ-Report-${reportStudentName.replace(/\s+/g, "-")}.pdf`,
    };
      }

      if (normalizedCode === "JOHARI_WINDOW") {
    if (!authToken) {
      throw new Error("Sign in is required to download the CLEAR report");
    }
    return generateClearReport(authToken, fetchPath, reportStudentName);
      }

      if (normalizedCode === "CAREER_COMPASS") {
    if (!authToken) {
      throw new Error("Sign in is required to download the Career Compass report");
    }
    return generateCareerCompassReport(authToken, fetchPath, reportStudentName);
      }

      if (normalizedCode === "METACOGNITION_TEST") {
    if (!authToken) {
      throw new Error("Sign in is required to download the TEST report");
    }
    return generateMetacognitionReport(authToken, fetchPath, reportStudentName);
      }

      if (normalizedCode === "LITMUS_TEST") {
    if (!authToken) {
      throw new Error("Sign in is required to download the Litmus report");
    }
    return generateLitmusReport(authToken, fetchPath, reportStudentName);
      }

      if (normalizedCode === "CAREER_DNA") {
    if (!authToken) {
      throw new Error("Sign in is required to download the Career DNA report");
    }
    return generateCareerDnaExecutiveReport(authToken, fetchPath, reportStudentName);
  }

  if (normalizedCode === "STUDY_ABROAD") {
    if (!authToken) {
      throw new Error("Sign in is required to download the Study Abroad report");
    }
    const { blob, fileName } = await generateStudyAbroadReportForEmail(
      authToken,
      report.attemptId,
      fetchPath,
    );
    return { blob, fileName };
      }

      if (normalizedCode === "ACADEMIC_CAREER") {
    const backCoverImageSrc = await loadPublicImageDataUrl("/academic-career/back-cover.jpg");
    const blob = await generateAcademicCareerReport({
          studentName: reportStudentName,
          classGrade,
          schoolName,
      submittedAt: submittedLabel,
      evaluation: evaluation as never,
          organizationBranding: reportBranding,
      backCoverImageSrc,
    }, { returnBlob: true }) as Blob;
    return { blob, fileName: `Academic_Career_Report_${reportStudentName.replace(/\s+/g, "_")}.pdf` };
      }

      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text(`${report.assessmentName} Report`, 15, 20);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.text(`Submitted: ${formatDateTime(report.submittedAt)}`, 15, 30);
      pdf.text(`Answered: ${report.answeredCount}/${report.totalQuestions}`, 15, 37);
      pdf.text(`Attempt ID: ${report.attemptId}`, 15, 44);
  return {
    blob: pdf.output("blob"),
    fileName: `${normalizeDisplayCode(report.assessmentCode)}_Report.pdf`,
  };
}

const triggerPdfDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function AssessmentReportView({
  fetchPath,
  loginHref,
  topBackHref,
  topBackLabel,
  bottomBackHref,
  bottomBackLabel,
  retakeHref,
}: AssessmentReportViewProps) {
  const router = useRouter();
  const auth = getStoredAuth();
  const isStudentReportView = fetchPath.startsWith("/platform/student/");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse["report"] | null>(null);
  const [rqAttempts, setRQAttempts] = useState<RQAttemptItem[] | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [emailing, setEmailing] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.token) {
      router.replace(loginHref);
      return;
    }

    apiRequest<ReportResponse>(fetchPath, {}, auth.token)
      .then((res) => setReport(res.report))
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load report"))
      .finally(() => setLoading(false));
  }, [auth?.token, fetchPath, loginHref, router]);

  useEffect(() => {
    if (!auth?.token || !report || !fetchPath.startsWith("/platform/student/")) {
      return;
    }

    const normalizedCode = normalizeAssessmentCode(String(report.assessmentCode || ""));
    if (normalizedCode !== "RESILIENCE_TEST") {
      return;
    }

    apiRequest<{ attempts: RQAttemptItem[] }>(`/platform/student/assessments/${report.assessmentCode}/attempts`, {}, auth.token)
      .then((res) => {
        setRQAttempts(res.attempts);
      })
      .catch(() => {
        setRQAttempts(null);
      });
  }, [auth?.token, report, fetchPath]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Assessment Report</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error || "Report not found."}</div>
        <button
          onClick={() => router.replace(bottomBackHref)}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back
        </button>
      </div>
    );
  }

  const evaluation = report.evaluation as Record<string, unknown>;
  const normalizedCode = normalizeAssessmentCode(String(report.assessmentCode || ""));
  const reportTitle = getAssessmentDisplayName(normalizedCode, report.assessmentName);
  const rqReport = normalizedCode === "RESILIENCE_TEST" ? parseRqEvaluation(evaluation) : null;
  const profileFromReport = report.student || {};
  const profileFromAuth = (auth?.user || {}) as { grade?: string; institutionName?: string; firstName?: string; lastName?: string; email?: string };
  const classGrade = profileFromReport.grade || profileFromAuth.grade || "";
  const schoolName = profileFromReport.institutionName || profileFromAuth.institutionName || "";
  const reportStudentName = `${profileFromReport.firstName || profileFromAuth.firstName || ""} ${profileFromReport.lastName || profileFromAuth.lastName || ""}`.trim() || "Student";
  const reportEmail = (profileFromReport as { email?: string }).email || profileFromAuth.email || (auth?.user as { email?: string })?.email || "";
  const orgProfile = report.organization || {};
  const reportBranding = {
    organizationName: orgProfile.companyName || orgProfile.name || "",
    logoUrl: orgProfile.logoUrl || "",
    website: orgProfile.website || "",
    contactEmail: orgProfile.contactEmail || "",
    contactPhone: orgProfile.contactPhone || "",
    representativeName: orgProfile.representativeName || "",
  };
  const pdfContext: DetailedReportPdfContext = {
    normalizedCode,
          report,
    evaluation,
          reportStudentName,
          reportEmail,
          classGrade,
          schoolName,
    reportBranding,
    profileFromAuth,
    authEmail: (auth?.user as { email?: string })?.email,
    rqAttempts,
    authToken: auth?.token,
    fetchPath,
  };

  const downloadDetailedReport = async () => {
    const currentAuth = getStoredAuth();
    setDownloading(true);
    setDownloadError(null);
    try {
      const { blob, fileName } = await buildDetailedReportPdf({
        ...pdfContext,
        authToken: currentAuth?.token,
      });
      triggerPdfDownload(blob, fileName);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Failed to generate report PDF");
    } finally {
      setDownloading(false);
    }
  };

  const emailDetailedReport = async () => {
    const currentAuth = getStoredAuth();
    if (!report || !currentAuth?.token) return;
    setEmailing(true);
    setEmailSuccess(false);
    setEmailError(null);
    try {
      const serverGeneratedEmailCodes = new Set([
        "CAREER_COMPASS",
        "LITMUS_TEST",
        "CAREER_DNA",
        "METACOGNITION_TEST",
        "JOHARI_WINDOW",
        "RESILIENCE_TEST",
        "ACADEMIC_CAREER",
        "STUDY_ABROAD",
      ]);
      if (serverGeneratedEmailCodes.has(normalizedCode)) {
        await apiRequest(
          `/platform/student/attempts/${report.attemptId}/email-report`,
          { method: "POST", body: JSON.stringify({ serverGenerate: true }) },
          currentAuth.token,
        );
      } else {
        const { blob, fileName } = await buildDetailedReportPdf({
          ...pdfContext,
          authToken: currentAuth.token,
        });
        const base64 = await blobToBase64(blob);

        await apiRequest(
          `/platform/student/attempts/${report.attemptId}/email-report`,
          { method: "POST", body: JSON.stringify({ pdfBase64: base64, fileName }) },
          currentAuth.token,
        );
      }
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : "Failed to send report email");
    } finally {
      setEmailing(false);
    }
  };

  const renderBody = () => {
    if (normalizedCode === "RESILIENCE_TEST" && rqReport) {
      const recommendations = RQ_RECOMMENDATIONS(rqReport);
      return (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className={`rounded-2xl bg-gradient-to-br ${RQ_LEVEL_GRADIENTS[rqReport.aqLevel] || RQ_LEVEL_GRADIENTS.Moderate} p-8 text-white shadow-xl`}>
            <div className="text-center">
              <p className="text-lg font-semibold opacity-90 mb-4">Your RQ Score</p>
              <div className="text-7xl font-bold mb-4">{rqReport.totalScore}</div>
              <div className="text-2xl font-semibold mb-2">{rqReport.aqLevel} Resilience</div>
              <p className="text-base opacity-90 max-w-3xl mx-auto">{RQ_LEVEL_DESCRIPTIONS[rqReport.aqLevel] || RQ_LEVEL_DESCRIPTIONS.Moderate}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Dimension Breakdown</h2>
              <div className="space-y-5">
                {rqReport.subscales.map((subscale) => (
                  <div key={subscale.dimension} className="border-b border-slate-200 pb-5 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{subscale.dimension}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {RQ_DIMENSION_INSIGHTS[subscale.dimension]?.[subscale.percentage >= 70 ? "high" : "low"] || ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-bold text-blue-600">{subscale.rawScore}/{subscale.maxScore}</div>
                        <div className="text-sm text-slate-600">{subscale.percentage.toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${subscale.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Insights</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start"><span className="text-blue-600 mr-3 mt-0.5">•</span><span>Your RQ score indicates your overall capacity to handle adversity and change.</span></li>
                  <li className="flex items-start"><span className="text-blue-600 mr-3 mt-0.5">•</span><span>The four dimensions — Control, Ownership, Reach, and Endurance — show different aspects of resilience.</span></li>
                  <li className="flex items-start"><span className="text-blue-600 mr-3 mt-0.5">•</span><span>Focus on dimensions with lower scores to strengthen your overall resilience.</span></li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Recommendations</h3>
                <ul className="space-y-3 text-blue-800">
                  {recommendations.map((rec) => (
                    <li key={rec} className="flex items-start"><span className="text-blue-600 mr-3 mt-0.5">•</span><span>{rec}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (normalizedCode === "CAREER_DNA") {
      return (
        <CareerDnaReport
          evaluation={evaluation as CareerDnaEvaluation}
          submittedAt={report.submittedAt}
          answeredCount={report.answeredCount}
          totalQuestions={report.totalQuestions}
          actions={{
            onDownload: downloadDetailedReport,
            onEmail: isStudentReportView ? emailDetailedReport : undefined,
            downloading,
            emailing,
            emailSuccess,
            emailError,
            showEmail: isStudentReportView,
            onRetake: isStudentReportView && retakeHref ? () => router.push(retakeHref) : undefined,
          }}
        />
      );
    }

    if (normalizedCode === "CAREER_COMPASS") {
      const personalityType = String(evaluation.personalityType || "—");
      const description = String(evaluation.description || "");
      const dimensions = Array.isArray(evaluation.dimensions) ? evaluation.dimensions as Array<Record<string, unknown>> : [];
      const careers = PERSONALITY_CAREERS[personalityType] || [];
      const stream = PERSONALITY_STREAMS[personalityType] || "—";
      const subjects = PERSONALITY_SUBJECTS[personalityType] || [];
      return (
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Test Result</h1>
                <p className="text-gray-500 mt-1">Submitted on {new Date(report.submittedAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Personality Type</p>
                <p className="text-2xl font-bold text-blue-600">{PERSONALITY_NAMES[personalityType] || personalityType}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="text-center mb-10">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Personality Profile</h2>
              <p className="text-lg font-bold text-gray-600 mt-2">{PERSONALITY_NAMES[personalityType] || personalityType}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {dimensions.map((dim, index) => {
                const pair = String(dim.pair || "");
                const letterA = String(dim.letterA || "A");
                const letterB = String(dim.letterB || "B");
                const winner = String(dim.winner || "");
                const percentA = toNumber(dim.percentA, 0);
                const percentB = toNumber(dim.percentB, 0);
                const styleLabel = DIMENSION_STYLES[pair] || pair;
                const col = DIMENSION_COLORS[pair] || { a: "#6c5ce7", b: "#00b894" };
                const aWins = winner === letterA;
                return (
                  <div key={`${pair}-${index}`} className="flex flex-col items-center border-r border-gray-100 last:border-r-0 px-2">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-[0.15em] mb-6 text-center">{styleLabel}</span>
                    <span className="text-lg font-black mb-3" style={{ color: col.a }}>{percentA}%</span>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-lg font-black" style={{ backgroundColor: aWins ? col.a : `${col.a}15`, color: aWins ? "white" : col.a, boxShadow: aWins ? `0 6px 20px ${col.a}40` : "none" }}>{LETTER_CODES[letterA] ?? letterA}</div>
                    <div className="my-3 text-2xl font-bold" style={{ color: `${col.a}40` }}>↕</div>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-lg font-black" style={{ backgroundColor: !aWins ? col.b : `${col.b}15`, color: !aWins ? "white" : col.b, boxShadow: !aWins ? `0 6px 20px ${col.b}40` : "none" }}>{LETTER_CODES[letterB] ?? letterB}</div>
                    <span className="text-lg font-black mt-3" style={{ color: col.b }}>{percentB}%</span>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-sm font-black text-gray-300 uppercase tracking-[0.3em] mt-10">Personality Type</p>
          </div>
          {description && <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"><h2 className="text-lg font-bold text-gray-900 mb-2">About This Personality</h2><p className="text-sm text-gray-700 leading-relaxed">{description}</p></div>}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 flex items-center justify-between">
              <div><h2 className="text-lg font-bold text-white">Your Career Pathway</h2><p className="text-sm text-blue-100 mt-0.5">Tailored for {PERSONALITY_NAMES[personalityType] || personalityType}</p></div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Briefcase size={22} className="text-white" /></div>
            </div>
            <div className="bg-white grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-100">
              <div className="p-5"><div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center"><GraduationCap size={14} className="text-blue-600" /></div><span className="text-xs font-black text-gray-500 uppercase tracking-[0.15em]">Suggested Stream</span></div><p className="text-2xl font-black text-gray-800 mt-1">{stream}</p></div>
              <div className="p-5"><div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center"><BookOpen size={14} className="text-cyan-600" /></div><span className="text-xs font-black text-gray-500 uppercase tracking-[0.15em]">Suggested Subjects</span></div><div className="flex flex-wrap gap-1.5 mt-1">{subjects.map((sub) => <span key={sub} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border border-blue-100">{sub}</span>)}</div></div>
            </div>
            {careers.length > 0 && <div className="bg-gradient-to-b from-blue-50/70 to-cyan-50/50 p-5 border-t border-blue-100"><p className="text-sm font-black text-gray-600 uppercase tracking-[0.15em] mb-3">Top 10 Recommended Careers</p><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{careers.map((career, i) => <div key={career} className="flex items-center gap-3 bg-white rounded-xl px-3.5 py-3 border border-blue-100 shadow-sm"><span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-black text-white">{i + 1}</span><span className="text-base font-semibold text-gray-800">{career}</span></div>)}</div></div>}
          </div>
        </div>
      );
    }

    if (normalizedCode === "JOHARI_WINDOW") {
      const sf = Number(evaluation.solicitsFeedbackScore || 0);
      const sd = Number(evaluation.selfDisclosureScore || 0);
      const px = dataX(sf);
      const py = dataY(sd);
      return (
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Solicits Feedback</p><p className="text-2xl font-bold text-slate-900 mt-1">{sf}</p></div>
            <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Self Disclosure</p><p className="text-2xl font-bold text-slate-900 mt-1">{sd}</p></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Your CLEAR</h2>
            <div className="flex justify-center overflow-x-auto">
              <svg viewBox={`0 0 ${G_RIGHT + 30} ${G_BOTTOM + 20}`} className="w-full max-w-[620px]" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
                <defs><pattern id="crosshatch" patternUnits="userSpaceOnUse" width="12" height="12"><path d="M0,0 l12,12" stroke="rgba(139,92,246,0.32)" strokeWidth="1.2" /><path d="M12,0 l-12,12" stroke="rgba(139,92,246,0.32)" strokeWidth="1.2" /></pattern></defs>
                <rect x={G_LEFT} y={G_TOP} width={Math.max(1, px - G_LEFT)} height={Math.max(1, py - G_TOP)} fill="rgba(16,185,129,0.12)" />
                <rect x={px} y={G_TOP} width={Math.max(1, G_RIGHT - px)} height={Math.max(1, py - G_TOP)} fill="rgba(245,158,11,0.12)" />
                <rect x={G_LEFT} y={py} width={Math.max(1, px - G_LEFT)} height={Math.max(1, G_BOTTOM - py)} fill="rgba(59,130,246,0.12)" />
                <rect x={px} y={py} width={Math.max(1, G_RIGHT - px)} height={Math.max(1, G_BOTTOM - py)} fill="rgba(139,92,246,0.06)" />
                <rect x={px} y={py} width={Math.max(1, G_RIGHT - px)} height={Math.max(1, G_BOTTOM - py)} fill="url(#crosshatch)" />
                <rect x={G_LEFT} y={G_TOP} width={G_SIZE} height={G_SIZE} fill="none" stroke="#1e293b" strokeWidth={2} />
                {TICKS.map((t) => { const x = dataX(t); return <g key={`xt-${t}`}><line x1={x} y1={G_TOP} x2={x} y2={G_TOP - 8} stroke="#1e293b" strokeWidth={1.5} />{t > 0 && t < 50 && <line x1={x} y1={G_TOP} x2={x} y2={G_BOTTOM} stroke="#e2e8f0" strokeWidth={0.5} />}<text x={x} y={G_TOP - 12} textAnchor="middle" fontSize={15} fill="#475569">{t}</text></g>; })}
                <text x={(G_LEFT + G_RIGHT) / 2} y={G_TOP - 32} textAnchor="middle" fontSize={17} fontWeight={700} fill="#1e293b">Solicits Feedback</text>
                {TICKS.map((t) => { const y = dataY(t); return <g key={`yt-${t}`}><line x1={G_LEFT - 6} y1={y} x2={G_LEFT} y2={y} stroke="#1e293b" strokeWidth={1.5} />{t > 0 && t < 50 && <line x1={G_LEFT} y1={y} x2={G_RIGHT} y2={y} stroke="#e2e8f0" strokeWidth={0.5} />}<text x={G_LEFT - 10} y={y + 4} textAnchor="end" fontSize={15} fill="#475569">{t}</text></g>; })}
                <line x1={px} y1={G_TOP} x2={px} y2={G_BOTTOM} stroke="#1e293b" strokeWidth={1.5} strokeDasharray="6 4" />
                <line x1={G_LEFT} y1={py} x2={G_RIGHT} y2={py} stroke="#1e293b" strokeWidth={1.5} strokeDasharray="6 4" />
                <text x={(G_LEFT + px) / 2} y={(G_TOP + py) / 2 + 4} textAnchor="middle" fontSize={16} fontWeight={700} fill="#10b981">OPEN</text>
                <text x={(px + G_RIGHT) / 2} y={(G_TOP + py) / 2 + 4} textAnchor="middle" fontSize={16} fontWeight={700} fill="#f59e0b">BLIND</text>
                <text x={(G_LEFT + px) / 2} y={(py + G_BOTTOM) / 2 + 4} textAnchor="middle" fontSize={16} fontWeight={700} fill="#3b82f6">HIDDEN</text>
                <text x={(px + G_RIGHT) / 2} y={(py + G_BOTTOM) / 2 + 4} textAnchor="middle" fontSize={16} fontWeight={700} fill="#8b5cf6">UNKNOWN</text>
                <circle cx={px} cy={py} r={7} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                <text x={px + 12} y={py - 10} fontSize={12} fontWeight={600} fill="#ef4444">({sf}, {sd})</text>
                <text x={18} y={(G_TOP + G_BOTTOM) / 2} textAnchor="middle" fontSize={17} fontWeight={600} fill="#1e293b" transform={`rotate(-90, 18, ${(G_TOP + G_BOTTOM) / 2})`}>Willingness to Self-Disclose</text>
              </svg>
            </div>
          </div>
        </div>
      );
    }

    if (normalizedCode === "LITMUS_TEST") {
      const styleScores = (evaluation.styleScores || {}) as Record<string, number>;
      const totalScore = Number(evaluation.totalScore || 0);
      const sortedStyles = [...STYLE_ORDER].map((style) => ({ style, score: toNumber(styleScores[style]) })).sort((a, b) => b.score - a.score);
      const primary = sortedStyles[0];
      const secondary = sortedStyles[1];
      return (
        <div className="max-w-5xl mx-auto space-y-8 w-full">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900">Your Test Result</h1><p className="text-gray-500 mt-1">Submitted on {new Date(report.submittedAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div><div className="text-right"><p className="text-4xl font-bold text-blue-600">{totalScore}</p><p className="text-sm text-gray-500">out of 150</p></div></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"><p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">Primary Style</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: STYLE_COLORS[primary.style] }}>{primary.style}</div><div><p className="font-bold text-gray-900">{STYLE_LABELS[primary.style]}</p><p className="text-sm text-gray-500">Score: {primary.score}/30</p></div></div></div><div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"><p className="text-xs font-semibold text-cyan-600 mb-1 uppercase tracking-wide">Secondary Style</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: STYLE_COLORS[secondary.style] }}>{secondary.style}</div><div><p className="font-bold text-gray-900">{STYLE_LABELS[secondary.style]}</p><p className="text-sm text-gray-500">Score: {secondary.score}/30</p></div></div></div></div>
          {/* <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"><h2 className="text-lg font-bold text-gray-900 mb-3">Style Scores</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-2">{sortedStyles.map(({ style, score }, index) => <div key={style} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between text-sm"><span className="text-slate-700">{style} · {STYLE_LABELS[style] || style}</span><span className="font-semibold text-slate-900">{score}{index === 0 ? " (Primary)" : ""}</span></div>)}</div></div> */}
        </div>
      );
    }

    if (normalizedCode === "METACOGNITION_TEST") {
      const domainScores = (evaluation.domainScores || {}) as Record<string, number>;
      const totalScore = Number(evaluation.totalScore || 0);
      const knowledge = toNumber(domainScores.domain1);
      const regulation = toNumber(domainScores.domain2) + toNumber(domainScores.domain3) + toNumber(domainScores.domain4) + toNumber(domainScores.domain5);
      const knowledgePct = Math.round((knowledge / 50) * 100);
      const regulationPct = Math.round((regulation / 150) * 100);
      const domainScoreArr = [
        { num: 1, score: toNumber(domainScores.domain1), max: DOMAIN_INFO[1].maxScore },
        { num: 2, score: toNumber(domainScores.domain2), max: DOMAIN_INFO[2].maxScore },
        { num: 3, score: toNumber(domainScores.domain3), max: DOMAIN_INFO[3].maxScore },
        { num: 4, score: toNumber(domainScores.domain4), max: DOMAIN_INFO[4].maxScore },
        { num: 5, score: toNumber(domainScores.domain5), max: DOMAIN_INFO[5].maxScore },
      ];
      return (
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900">Your Test Result</h1><p className="text-gray-500 mt-1">Submitted on {new Date(report.submittedAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p></div><div className="text-right"><p className="text-4xl font-bold text-blue-600">{totalScore}</p><p className="text-sm text-gray-500">out of 200</p></div></div></div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"><h2 className="text-lg font-bold text-gray-900 mb-4">Domain Scores</h2><div className="space-y-4">{domainScoreArr.map(({ num, score, max }) => { const info = DOMAIN_INFO[num]; const pct = Math.round((score / max) * 100); return <div key={num}><div className="flex justify-between items-center mb-1.5"><span className="text-sm font-semibold text-gray-700">D{num}: {info.name}</span><span className="text-sm font-bold text-gray-900">{score}/{max} ({pct}%)</span></div><div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-3 rounded-full" style={{ width: `${pct}%`, backgroundColor: info.color }} /></div></div>; })}</div></div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"><h2 className="text-lg font-bold text-gray-900 mb-2">Metacognition Quadrant Analysis</h2><p className="text-sm text-gray-500 mb-6">X-axis: Knowledge (Awareness - Domain 1) | Y-axis: Regulation (Domains 2-5)</p><div className="grid sm:grid-cols-2 gap-6 items-center"><QuadrantGraph knowledgePct={knowledgePct} regulationPct={regulationPct} /><QuadrantLegend /></div></div>
        </div>
      );
    }

    if (normalizedCode === "ACADEMIC_CAREER") {
      const acEvaluation = evaluation as any;
      return <AcademicCareerReport evaluation={acEvaluation} submittedAt={report.submittedAt} />;
    }

    if (normalizedCode === "STUDY_ABROAD") {
      const topicScores = STUDY_ABROAD_TOPICS.reduce((acc, topic) => {
        acc[topic] = Number((evaluation.topicScores as Record<string, number>)?.[topic] ?? 0);
        return acc;
      }, {} as Record<string, number>);
      const saEvaluation: StudyAbroadEvaluation = {
        overallScore: Number(evaluation.overallScore ?? 0),
        overallPercentage: Number(evaluation.overallPercentage ?? 0),
        band: String(evaluation.band ?? ""),
        topicScores: topicScores as StudyAbroadEvaluation["topicScores"],
        topicAnswered: evaluation.topicAnswered as StudyAbroadEvaluation["topicAnswered"],
        answeredCount: Number(evaluation.answeredCount ?? report.answeredCount),
        totalQuestions: Number(evaluation.totalQuestions ?? report.totalQuestions),
      };
      return <StudyAbroadReport evaluation={saEvaluation} submittedAt={report.submittedAt} />;
    }

    return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Report generated successfully.</div>;
  };

  return (
    <div className="min-w-0 space-y-5">
      <button onClick={() => router.replace(topBackHref)} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> {topBackLabel}
      </button>

      {normalizedCode !== "CAREER_DNA" && (
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
              <h1 className="break-words text-xl font-bold sm:text-2xl">{reportTitle}</h1>
            <p className="mt-1 text-blue-100 text-sm">Code: {normalizeDisplayCode(report.assessmentCode)} • {report.answeredCount}/{report.totalQuestions} answered</p>
            <p className="mt-1 text-blue-100 text-xs">Submitted: {formatDateTime(report.submittedAt)}</p>
          </div>
          </div>
        </div>
      )}

      {normalizedCode !== "CAREER_DNA" && (
        <div className="space-y-3">
      <div className="flex flex-wrap justify-end gap-3">
        <button onClick={downloadDetailedReport} disabled={downloading} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          {downloading ? "Generating Report..." : "Download Detailed Report"}
        </button>
            {isStudentReportView && (
        <button onClick={emailDetailedReport} disabled={emailing} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
          {emailing ? "Sending..." : emailSuccess ? "✓ Report Sent!" : "Email Report to Me"}
        </button>
            )}
            {isStudentReportView && retakeHref && (
              <button onClick={() => router.push(retakeHref)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Retake Test
              </button>
            )}
      </div>
          {downloadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {downloadError}
            </div>
          )}
          {emailError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {emailError}
            </div>
          )}
        </div>
      )}

      {renderBody()}

      <div className="flex items-center gap-3">
        <button onClick={() => router.replace(bottomBackHref)} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          {bottomBackLabel}
        </button>
      </div>
    </div>
  );
}
