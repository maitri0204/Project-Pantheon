"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Brain, Briefcase, BookOpen, GraduationCap } from "lucide-react";

import { apiRequest, getStoredAuth } from "@/lib/api";
import { generateCareerCompassReport } from "@/lib/reports/generateCareerCompassReport";
import { generateClearReport } from "@/lib/reports/generateClearReport";
import { generateLitmusReport } from "@/lib/reports/generateLitmusReport";
import { generateMetacognitionReport } from "@/lib/reports/generateMetacognitionReport";
import QuadrantGraph, { QuadrantLegend } from "@/components/reports/QuadrantGraph";
import {
  DOMAIN_INFO,
  DIMENSION_COLORS,
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
  };
};

const normalizeDisplayCode = (code: string) => {
  const normalized = String(code || "").toUpperCase().trim();
  if (normalized === "JOHARI_WINDOW") return "CLEAR";
  if (normalized === "METACOGNITION_TEST" || normalized === "METACOGNITION") return "TEST";
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

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function StudentAssessmentResultPage() {
  const router = useRouter();
  const params = useParams<{ slug?: string; code?: string; rest?: string[] }>();
  const searchParams = useSearchParams();
  const auth = useMemo(() => getStoredAuth(), []);

  const slug = params?.slug || "";
  const codeFromRest = Array.isArray(params?.rest) ? params.rest[2] : "";
  const code = (params?.code || codeFromRest || "").toUpperCase();
  const attemptId = searchParams?.get("attemptId") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse["report"] | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!auth?.token) {
      router.replace(`/whitelabel/${slug}/login`);
      return;
    }

    if (!attemptId) {
      setError("Report link is invalid. Missing attempt ID.");
      setLoading(false);
      return;
    }

    apiRequest<ReportResponse>(`/platform/student/attempts/${attemptId}/report`, {}, auth.token)
      .then((res) => {
        setReport(res.report);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Unable to load report");
      })
      .finally(() => setLoading(false));
  }, [attemptId, auth?.token, router, slug]);

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
          onClick={() => router.replace(`/whitelabel/${slug}/student/assessments`)}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to Assessments
        </button>
      </div>
    );
  }

  const evaluation = report.evaluation as Record<string, unknown>;
  const normalizedCode = String(report.assessmentCode || code).toUpperCase();

  const downloadDetailedReport = async () => {
    if (!report) return;

    setDownloading(true);
    try {
      if (normalizedCode === "JOHARI_WINDOW") {
        await generateClearReport({
          studentName: `${auth?.user.firstName || ""} ${auth?.user.lastName || ""}`.trim() || "Student",
          sfScore: toNumber(evaluation.solicitsFeedbackScore),
          sdScore: toNumber(evaluation.selfDisclosureScore),
          dominantQuadrant: String(evaluation.dominantQuadrant || "Open Area"),
        });
        return;
      }

      if (normalizedCode === "CAREER_COMPASS") {
        await generateCareerCompassReport({
          studentName: `${auth?.user.firstName || ""} ${auth?.user.lastName || ""}`.trim() || "Student",
          submittedAt: report.submittedAt ? new Date(report.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—",
          personalityType: String(evaluation.personalityType || "UNKNOWN"),
        });
        return;
      }

      if (normalizedCode === "METACOGNITION_TEST") {
        const domainScores = (evaluation.domainScores || {}) as Record<string, number>;
        await generateMetacognitionReport({
          studentName: `${auth?.user.firstName || ""} ${auth?.user.lastName || ""}`.trim() || "Student",
          email: auth?.user.email || "",
          submittedAt: report.submittedAt ? new Date(report.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—",
          totalScore: toNumber(evaluation.totalScore),
          domainScores: {
            domain1: toNumber(domainScores.domain1),
            domain2: toNumber(domainScores.domain2),
            domain3: toNumber(domainScores.domain3),
            domain4: toNumber(domainScores.domain4),
            domain5: toNumber(domainScores.domain5),
          },
        });
        return;
      }

      if (normalizedCode === "LITMUS_TEST") {
        const styleScores = (evaluation.styleScores || {}) as Record<string, number>;
        await generateLitmusReport({
          studentName: `${auth?.user.firstName || ""} ${auth?.user.lastName || ""}`.trim() || "Student",
          styleScores: {
            K: toNumber(styleScores.K),
            S: toNumber(styleScores.S),
            E: toNumber(styleScores.E),
            P: toNumber(styleScores.P),
            J: toNumber(styleScores.J),
          },
        });
        return;
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
      pdf.save(`${normalizeDisplayCode(report.assessmentCode)}_Report.pdf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate report PDF");
    } finally {
      setDownloading(false);
    }
  };

  const renderBody = () => {
    if (normalizedCode === "CAREER_DNA") {
      const sections = (evaluation.sections || {}) as Record<string, { parts?: Array<{ partName: string; score: number; maxScore: number; percentage: number }>; overallPercentage?: number; totalScore?: number; maxScore?: number; dominantCode?: string; personalityType?: string }>;
      const sectionOrder = [
        "COGNITIVE",
        "APTITUDE",
        "PERSONALITY",
        "CAREER_INTEREST",
        "EMOTIONAL_INTELLIGENCE",
        "LEARNING_STYLE",
        "BEHAVIORAL_SOCIAL",
        "STRESS_RESILIENCE",
      ];

      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Career DNA Score</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{toNumber(evaluation.totalScore)}</p>
          </div>
          {sectionOrder.map((key) => {
            const section = sections[key];
            if (!section) return null;
            return (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-slate-900">{key.replaceAll("_", " ")}</h2>
                  <span className="text-sm font-semibold text-slate-600">{toNumber(section.totalScore)}/{toNumber(section.maxScore)}</span>
                </div>
                {section.personalityType && <p className="text-sm text-slate-700 mb-2">Personality: {section.personalityType}</p>}
                {section.dominantCode && <p className="text-sm text-slate-700 mb-2">Dominant Code: {section.dominantCode}</p>}
                <div className="space-y-2">
                  {(section.parts || []).map((p, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-sm"><span className="text-slate-700">{p.partName}</span><span className="font-semibold text-slate-900">{p.score}/{p.maxScore} ({p.percentage}%)</span></div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${p.percentage}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
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
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
                <Brain size={36} className="text-white opacity-80" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/80 uppercase tracking-widest font-bold mb-1">Your Personality Type</p>
                <h1 className="text-3xl font-black text-white">{PERSONALITY_NAMES[personalityType] || personalityType}</h1>
                <p className="mt-2 text-sm text-white/80">{formatDateTime(report.submittedAt)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Dimension Breakdown</h2>
            <div className="space-y-3">
              {dimensions.map((d, index) => (
                <div key={index} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{String(d.pair || "")}</span>
                    <span className="text-xs text-slate-500">Winner: {String(d.winner || "—")}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-slate-700">
                    <span>{LETTER_CODES[String(d.letterA || "A")]} · {String(d.nameA || "")}</span>
                    <strong>{String(d.percentA || 0)}%</strong>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-slate-700">
                    <span>{LETTER_CODES[String(d.letterB || "B")]} · {String(d.nameB || "")}</span>
                    <strong>{String(d.percentB || 0)}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {description && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-semibold text-slate-900 mb-2">About This Personality</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{description}</p>
            </div>
          )}

          <div className="rounded-2xl overflow-hidden shadow-sm border border-amber-100">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Your Career Pathway</h2>
                <p className="text-sm text-amber-100 mt-0.5">Tailored for {PERSONALITY_NAMES[personalityType] || personalityType}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Briefcase size={22} className="text-white" /></div>
            </div>
            <div className="bg-white grid grid-cols-1 md:grid-cols-2 divide-x divide-amber-50">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center"><GraduationCap size={14} className="text-amber-600" /></div><span className="text-xs font-black text-gray-500 uppercase tracking-[0.15em]">Suggested Stream</span></div>
                <p className="text-2xl font-black text-gray-800 mt-1">{stream}</p>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2"><div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center"><BookOpen size={14} className="text-orange-500" /></div><span className="text-xs font-black text-gray-500 uppercase tracking-[0.15em]">Suggested Subjects</span></div>
                <div className="flex flex-wrap gap-1.5 mt-1">{subjects.map((sub) => <span key={sub} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-100">{sub}</span>)}</div>
              </div>
            </div>
            {careers.length > 0 && (
              <div className="bg-gradient-to-b from-orange-50/60 to-amber-50/30 p-5 border-t border-amber-100">
                <p className="text-sm font-black text-gray-600 uppercase tracking-[0.15em] mb-3">Top 10 Recommended Careers</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{careers.map((career, i) => <div key={career} className="flex items-center gap-3 bg-white rounded-xl px-3.5 py-3 border border-amber-100/70 shadow-sm"><span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-black text-white">{i + 1}</span><span className="text-base font-semibold text-gray-800">{career}</span></div>)}</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (normalizedCode === "JOHARI_WINDOW") {
      const sf = Number(evaluation.solicitsFeedbackScore || 0);
      const sd = Number(evaluation.selfDisclosureScore || 0);
      const dominant = String(evaluation.dominantQuadrant || "—");
      const quadrants = (evaluation.quadrants || {}) as Record<string, unknown>;
      const px = dataX(sf);
      const py = dataY(sd);

      return (
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Solicits Feedback</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{sf}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Self Disclosure</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{sd}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs text-emerald-700">Dominant Quadrant</p>
              <p className="text-lg font-bold text-emerald-900 mt-1">{dominant}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Your CLEAR</h2>
            <div className="flex justify-center overflow-x-auto">
              <svg viewBox={`0 0 ${G_RIGHT + 30} ${G_BOTTOM + 20}`} className="w-full max-w-[620px]" style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}>
                <defs>
                  <pattern id="crosshatch" patternUnits="userSpaceOnUse" width="12" height="12">
                    <path d="M0,0 l12,12" stroke="rgba(139,92,246,0.32)" strokeWidth="1.2" />
                    <path d="M12,0 l-12,12" stroke="rgba(139,92,246,0.32)" strokeWidth="1.2" />
                  </pattern>
                </defs>

                <rect x={G_LEFT} y={G_TOP} width={Math.max(1, px - G_LEFT)} height={Math.max(1, py - G_TOP)} fill="rgba(16,185,129,0.12)" />
                <rect x={px} y={G_TOP} width={Math.max(1, G_RIGHT - px)} height={Math.max(1, py - G_TOP)} fill="rgba(245,158,11,0.12)" />
                <rect x={G_LEFT} y={py} width={Math.max(1, px - G_LEFT)} height={Math.max(1, G_BOTTOM - py)} fill="rgba(59,130,246,0.12)" />
                <rect x={px} y={py} width={Math.max(1, G_RIGHT - px)} height={Math.max(1, G_BOTTOM - py)} fill="rgba(139,92,246,0.06)" />
                <rect x={px} y={py} width={Math.max(1, G_RIGHT - px)} height={Math.max(1, G_BOTTOM - py)} fill="url(#crosshatch)" />

                <rect x={G_LEFT} y={G_TOP} width={G_SIZE} height={G_SIZE} fill="none" stroke="#1e293b" strokeWidth={2} />

                {TICKS.map((t) => {
                  const x = dataX(t);
                  return (
                    <g key={`xt-${t}`}>
                      <line x1={x} y1={G_TOP} x2={x} y2={G_TOP - 8} stroke="#1e293b" strokeWidth={1.5} />
                      {t > 0 && t < 50 && <line x1={x} y1={G_TOP} x2={x} y2={G_BOTTOM} stroke="#e2e8f0" strokeWidth={0.5} />}
                      <text x={x} y={G_TOP - 12} textAnchor="middle" fontSize={15} fill="#475569">{t}</text>
                    </g>
                  );
                })}
                <text x={(G_LEFT + G_RIGHT) / 2} y={G_TOP - 32} textAnchor="middle" fontSize={17} fontWeight={700} fill="#1e293b">Solicits Feedback</text>

                {TICKS.map((t) => {
                  const y = dataY(t);
                  return (
                    <g key={`yt-${t}`}>
                      <line x1={G_LEFT - 6} y1={y} x2={G_LEFT} y2={y} stroke="#1e293b" strokeWidth={1.5} />
                      {t > 0 && t < 50 && <line x1={G_LEFT} y1={y} x2={G_RIGHT} y2={y} stroke="#e2e8f0" strokeWidth={0.5} />}
                      <text x={G_LEFT - 10} y={y + 4} textAnchor="end" fontSize={15} fill="#475569">{t}</text>
                    </g>
                  );
                })}

                <line x1={px} y1={G_TOP} x2={px} y2={G_BOTTOM} stroke="#1e293b" strokeWidth={1.5} strokeDasharray="6 4" />
                <line x1={G_LEFT} y1={py} x2={G_RIGHT} y2={py} stroke="#1e293b" strokeWidth={1.5} strokeDasharray="6 4" />

                <text x={(G_LEFT + px) / 2} y={(G_TOP + py) / 2 + 4} textAnchor="middle" fontSize={16} fontWeight={700} fill="#10b981">OPEN</text>
                <text x={(px + G_RIGHT) / 2} y={(G_TOP + py) / 2 + 4} textAnchor="middle" fontSize={16} fontWeight={700} fill="#f59e0b">BLIND</text>
                <text x={(G_LEFT + px) / 2} y={(py + G_BOTTOM) / 2 + 4} textAnchor="middle" fontSize={16} fontWeight={700} fill="#3b82f6">HIDDEN</text>
                <text x={(px + G_RIGHT) / 2} y={(py + G_BOTTOM) / 2 + 4} textAnchor="middle" fontSize={16} fontWeight={700} fill="#8b5cf6">UNKNOWN</text>

                <circle cx={px} cy={py} r={7} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                <text x={px + 12} y={py - 10} fontSize={12} fontWeight={600} fill="#ef4444">({sf}, {sd})</text>

                <text x={18} y={(G_TOP + G_BOTTOM) / 2} textAnchor="middle" fontSize={17} fontWeight={600} fill="#1e293b" transform={`rotate(-90, 18, ${(G_TOP + G_BOTTOM) / 2})`}>
                  Willingness to Self-Disclose
                </text>
              </svg>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Quadrant Distribution</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">Open: <strong>{String(quadrants.open ?? 0)}%</strong></div>
              <div className="rounded-lg bg-slate-50 p-3">Blind: <strong>{String(quadrants.blind ?? 0)}%</strong></div>
              <div className="rounded-lg bg-slate-50 p-3">Hidden: <strong>{String(quadrants.hidden ?? 0)}%</strong></div>
              <div className="rounded-lg bg-slate-50 p-3">Unknown: <strong>{String(quadrants.unknown ?? 0)}%</strong></div>
            </div>
          </div>
        </div>
      );
    }

    if (normalizedCode === "LITMUS_TEST") {
      const styleScores = (evaluation.styleScores || {}) as Record<string, number>;
      const dominantStyle = String(evaluation.dominantStyle || "—");
      const totalScore = Number(evaluation.totalScore || 0);
      const sortedStyles = [...STYLE_ORDER]
        .map((style) => ({ style, score: toNumber(styleScores[style]) }))
        .sort((a, b) => b.score - a.score);
      const primary = sortedStyles[0];
      const secondary = sortedStyles[1];

      return (
        <div className="space-y-6 w-full">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-blue-100 text-sm mb-1">{new Date(report.submittedAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            <h1 className="text-2xl font-bold mb-3">Assessment Result</h1>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center"><p className="text-xs text-blue-100">Total Score</p><p className="text-xl font-bold">{totalScore}/150</p></div>
              <div className="bg-white/20 rounded-xl px-4 py-2 text-center"><p className="text-xs text-blue-100">Dominant Style</p><p className="text-xl font-bold">{STYLE_LABELS[dominantStyle]}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-amber-600 mb-1 uppercase tracking-wide">★ Primary Style</p>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: STYLE_COLORS[primary.style] }}>{primary.style}</div><div><p className="font-bold text-gray-900">{STYLE_LABELS[primary.style]}</p><p className="text-sm text-gray-500">Score: {primary.score}/30</p></div></div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">◆ Secondary Style</p>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: STYLE_COLORS[secondary.style] }}>{secondary.style}</div><div><p className="font-bold text-gray-900">{STYLE_LABELS[secondary.style]}</p><p className="text-sm text-gray-500">Score: {secondary.score}/30</p></div></div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold text-slate-900 mb-3">Style Scores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {sortedStyles.map(({ style, score }, index) => (
                <div key={style} className="rounded-lg bg-slate-50 px-3 py-2 flex items-center justify-between">
                  <span>{style} · {STYLE_LABELS[style] || style}</span>
                  <strong>{score}{index === 0 ? " (Primary)" : ""}</strong>
                </div>
              ))}
            </div>
          </div>
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
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Test Result</h1>
                <p className="text-gray-500 mt-1">Submitted on {new Date(report.submittedAt || "").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <div className="text-right"><p className="text-4xl font-bold text-blue-600">{totalScore}</p><p className="text-sm text-gray-500">out of 200</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Domain Scores</h2>
            <div className="space-y-4">
              {domainScoreArr.map(({ num, score, max }) => {
                const info = DOMAIN_INFO[num];
                const pct = Math.round((score / max) * 100);
                return (
                  <div key={num}>
                    <div className="flex justify-between items-center mb-1.5"><span className="text-sm font-semibold text-gray-700">D{num}: {info.name}</span><span className="text-sm font-bold text-gray-900">{score}/{max} ({pct}%)</span></div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-3 rounded-full" style={{ width: `${pct}%`, backgroundColor: info.color }} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Metacognition Quadrant Analysis</h2>
            <p className="text-sm text-gray-500 mb-6">X-axis: Knowledge (Awareness - Domain 1) | Y-axis: Regulation (Domains 2-5)</p>
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <QuadrantGraph knowledgePct={knowledgePct} regulationPct={regulationPct} />
              <QuadrantLegend />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        Report generated successfully.
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <button
        onClick={() => router.replace(`/whitelabel/${slug}/student/results`)}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Results
      </button>

      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">{report.assessmentName}</h1>
        <p className="mt-1 text-blue-100 text-sm">Code: {normalizeDisplayCode(report.assessmentCode)} • {report.answeredCount}/{report.totalQuestions} answered</p>
        <p className="mt-1 text-blue-100 text-xs">Submitted: {formatDateTime(report.submittedAt)}</p>
      </div>

      {normalizedCode !== "CAREER_DNA" && (
        <div className="flex justify-end">
          <button
            onClick={downloadDetailedReport}
            disabled={downloading}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading ? "Generating Report..." : "Download Detailed Report"}
          </button>
        </div>
      )}

      {renderBody()}

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.replace(`/whitelabel/${slug}/student/assessments`)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to Assessments
        </button>
      </div>
    </div>
  );
}
