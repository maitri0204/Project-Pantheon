/**
 * Resilience Quotient (RQ) Assessment Component
 *
 * This component allows users to take the RQ assessment with real-time progress tracking,
 * dimension scoring, and report generation.
 */

"use client";

/**
 * @deprecated Unused legacy RQ flow. The live assessment uses
 * `/whitelabel/[slug]/student/assessments/ADVERSITY_TEST/take` instead.
 * API paths below target the current platform routes if this component is revived.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader } from "lucide-react";

interface AQQuestion {
  _id: string;
  questionNumber: number;
  questionText: string;
  category: string;
  categoryLabel: string;
  options: Array<{
    label: string;
    text: string;
  }>;
}

interface AQAttempt {
  _id: string;
  assessmentCode: string;
  questions: Array<{
    questionNumber: number;
    selectedOption?: string;
  }>;
  answeredCount: number;
  totalQuestions: number;
  status: "IN_PROGRESS" | "COMPLETED";
  evaluation?: {
    totalScore: number;
    aqLevel: string;
    subscales: Array<{
      dimension: string;
      rawScore: number;
      maxScore: number;
      percentage: number;
      interpretation: string;
    }>;
  };
}

interface AQResult {
  totalScore: number;
  aqLevel: string;
  subscales: Array<{
    dimension: string;
    rawScore: number;
    maxScore: number;
    percentage: number;
    interpretation: string;
  }>;
}

interface ResultProps {
  attempt: AQAttempt;
  result: AQResult;
}

const getLevelDescription = (level: string): string => {
  const descriptions: Record<string, string> = {
    Exceptional:
      "You operate in the highest tier of resilience intelligence. Your Control, Ownership, Reach, and Endurance profile enables you to navigate challenges with agency, accountability, and psychological strength.",
    Strong:
      "Your RQ profile demonstrates strong behavioral resilience. You handle most adversities with skill and composure. Targeted development in your lower dimensions will move you into the Exceptional tier.",
    Moderate:
      "Your RQ profile reveals developing resilience patterns. You show genuine strength in some dimensions while others present clear growth opportunities. Focused practice will yield measurable improvement.",
    Developing:
      "Your resilience capacity is in an early stage of development — this is not a limitation, it is a starting point with tremendous upside.",
  };
  return descriptions[level] || descriptions.Moderate;
};

const getDimensionInsight = (dimension: string, percentage: number): string => {
  const high: Record<string, string> = {
    Control: "You exhibit a strong internal locus of control. You approach adversity believing you can shape outcomes through intentional action.",
    Ownership: "You hold yourself accountable for outcomes and use setbacks as learning inputs instead of blame triggers.",
    Reach: "You contain adversity well and prevent setbacks from spreading into unrelated life areas.",
    Endurance: "You view challenges as temporary, which supports rapid psychological bounce-back and sustained performance.",
  };
  const low: Record<string, string> = {
    Control: "You may feel that adversity is largely beyond your control. A daily 'sphere of influence' practice will help rebuild agency.",
    Ownership: "You may tend to externalize blame under stress. A brief 'what can I own?' reflection can shift this pattern.",
    Reach: "Adversity may spill into multiple life areas. Clear boundaries and 'parking lot' techniques will help contain it.",
    Endurance: "You may perceive challenges as longer-lasting than they are. Evidence journaling can help reframe adversity as temporary.",
  };

  return percentage >= 70 ? high[dimension] : low[dimension];
};

const buildRecommendations = (result: AQResult): string[] => {
  const recs: string[] = [];
  const control = result.subscales.find((s) => s.dimension === "Control")?.percentage ?? 0;
  const ownership = result.subscales.find((s) => s.dimension === "Ownership")?.percentage ?? 0;
  const reach = result.subscales.find((s) => s.dimension === "Reach")?.percentage ?? 0;
  const endurance = result.subscales.find((s) => s.dimension === "Endurance")?.percentage ?? 0;

  if (control < 60) recs.push("Build your internal locus of control by identifying 3 actions within your power each day.");
  if (ownership < 60) recs.push("Keep a short accountability journal: after setbacks, note what you contributed and what you can improve.");
  if (reach < 60) recs.push("Practice compartmentalization so one setback does not spill into other parts of your life.");
  if (endurance < 60) recs.push("Use evidence journaling to remind yourself that difficult phases are temporary and manageable.");

  if (recs.length === 0) {
    recs.push("Maintain your current resilience practices and continue challenging yourself with progressively harder goals.");
  }

  return recs.slice(0, 6);
};

const getLevelBadgeClasses = (level: string) => {
  switch (level) {
    case "Exceptional":
      return "from-emerald-500 to-teal-600";
    case "Strong":
      return "from-sky-500 to-cyan-600";
    case "Moderate":
      return "from-amber-500 to-orange-600";
    case "Developing":
      return "from-rose-500 to-red-600";
    default:
      return "from-slate-500 to-slate-600";
  }
};

async function downloadAQPdf(result: AQResult, attempt: AQAttempt) {
  const { default: jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 14;
  const maxWidth = pageWidth - margin * 2;
  const level = result.aqLevel;
  const recommendations = buildRecommendations(result);

  const line = (text: string, x: number, y: number, size = 11, bold = false, color = "#0f172a") => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(color);
    pdf.text(text, x, y, { maxWidth });
  };

  let y = 20;
  line("Resilience Quotient Assessment Report", margin, y, 18, true, "#0f172a");
  y += 8;
  line(`RQ Level: ${level}`, margin, y, 13, true, level === "Exceptional" ? "#059669" : level === "Strong" ? "#0284c7" : level === "Moderate" ? "#d97706" : "#e11d48");
  y += 7;
  line(`Score: ${result.totalScore}/100`, margin, y, 12, true);
  y += 6;
  line(`Answered: ${attempt.answeredCount}/${attempt.totalQuestions}`, margin, y, 10, false, "#475569");
  y += 10;

  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(margin, y, maxWidth, 28, 3, 3, "F");
  line(getLevelDescription(level), margin + 4, y + 8, 10, false, "#334155");
  y += 36;

  line("Dimension Breakdown", margin, y, 13, true);
  y += 7;
  result.subscales.forEach((sub) => {
    if (y > 245) {
      pdf.addPage();
      y = 18;
      line("Dimension Breakdown (cont.)", margin, y, 13, true);
      y += 7;
    }
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin, y, maxWidth, 22, 3, 3, "S");
    line(`${sub.dimension} — ${sub.rawScore}/${sub.maxScore} (${Math.round(sub.percentage)}%)`, margin + 4, y + 7, 11, true);
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(margin + 4, y + 11, maxWidth - 8, 4);
    const fill = (maxWidth - 8) * (sub.percentage / 100);
    pdf.setFillColor(37, 99, 235);
    pdf.rect(margin + 4, y + 11, fill, 4, "F");
    line(getDimensionInsight(sub.dimension, sub.percentage), margin + 4, y + 18, 8, false, "#475569");
    y += 28;
  });

  if (y > 240) {
    pdf.addPage();
    y = 18;
  }

  line("Key Insights", margin, y, 13, true);
  y += 7;
  [
    "Your RQ score indicates your overall capacity to handle adversity and change.",
    "The four dimensions show different aspects of resilience: Control, Ownership, Reach, and Endurance.",
    "Focus on dimensions with lower scores to strengthen your overall resilience.",
  ].forEach((bullet) => {
    line(`• ${bullet}`, margin + 2, y, 9, false, "#0f172a");
    y += 6;
  });

  y += 5;
  line("Recommendations", margin, y, 13, true);
  y += 7;
  recommendations.forEach((item) => {
    if (y > 272) {
      pdf.addPage();
      y = 18;
      line("Recommendations (cont.)", margin, y, 13, true);
      y += 7;
    }
    line(`• ${item}`, margin + 2, y, 9, false, "#0f172a");
    y += 6;
  });

  pdf.save(`Resilience_Quotient_Report_${attempt._id}.pdf`);
}

const ResultCard: React.FC<ResultProps> = ({ attempt, result }) => {
  const recommendations = buildRecommendations(result);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Your RQ Assessment Results</h1>
          <p className="text-slate-600">Resilience Quotient Analysis & Resilience Profile</p>
        </div>

        <div className={`bg-gradient-to-br ${getLevelBadgeClasses(result.aqLevel)} rounded-2xl shadow-xl p-8 text-white`}>
          <div className="text-center">
            <p className="text-lg font-semibold opacity-90 mb-4">Your RQ Score</p>
            <div className="text-7xl font-bold mb-4">{result.totalScore}</div>
            <div className="text-2xl font-semibold mb-2">{result.aqLevel} Resilience</div>
            <p className="text-base opacity-90 max-w-3xl mx-auto">{getLevelDescription(result.aqLevel)}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Dimension Breakdown</h2>
            <div className="space-y-5">
              {result.subscales.map((subscale) => (
                <div key={subscale.dimension} className="border-b border-slate-200 pb-5 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{subscale.dimension}</h3>
                      <p className="text-sm text-slate-600 mt-1">{getDimensionInsight(subscale.dimension, subscale.percentage)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{subscale.rawScore}/{subscale.maxScore}</div>
                      <div className="text-sm text-slate-600">{subscale.percentage.toFixed(0)}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${subscale.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Insights</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">•</span>
                  <span>Your RQ score indicates your overall capacity to handle adversity and change.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">•</span>
                  <span>The four dimensions — Control, Ownership, Reach, Endurance — show different aspects of resilience.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-0.5">•</span>
                  <span>Focus on dimensions with lower scores to strengthen your overall resilience.</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Recommendations</h3>
              <ul className="space-y-3 text-blue-800">
                {recommendations.map((rec) => (
                  <li key={rec} className="flex items-start">
                    <span className="text-blue-600 mr-3 mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Report Actions</h3>
              <p className="text-sm text-slate-600">Print or download a copy of your RQ report.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => window.print()}
                className="px-5 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Print Report
              </button>
              <button
                onClick={() => { void downloadAQPdf(result, attempt); }}
                className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Download PDF
              </button>
              <button
                onClick={() => {
                  window.location.href = "/dashboard/assessments";
                }}
                className="px-5 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg font-semibold hover:border-slate-400 transition-colors"
              >
                Back to Assessments
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestInterface: React.FC<{ attemptId: string; onComplete: (result: AQResult) => void }> = ({
  attemptId,
  onComplete,
}) => {
  const router = useRouter();
  const [attempt, setAttempt] = useState<AQAttempt | null>(null);
  const [questions, setQuestions] = useState<AQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);

  const handleSubmit = useCallback(async () => {
    if (!attempt) return;

    try {
      setSubmitting(true);

      const auth = getStoredAuth();
      if (!auth) {
        router.push("/login");
        return;
      }

      const data = await apiRequest<{ result: AQResult }>(
        `/platform/student/attempts/${attemptId}/submit`,
        {
          method: "POST",
          body: JSON.stringify({ status: "COMPLETED" }),
        },
        auth.token
      );

      onComplete(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit assessment");
      setSubmitting(false);
    }
  }, [attempt, attemptId, onComplete, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const auth = getStoredAuth();
        if (!auth) {
          router.push("/login");
          return;
        }

        const [attemptData, questionsData] = await Promise.all([
          apiRequest<{ attempt: AQAttempt }>(
            `/platform/student/attempts/${attemptId}`,
            { method: "GET" },
            auth.token
          ),
          apiRequest<{ questions: AQQuestion[] }>(
            "/api/assessments/questions?assessmentCode=ADVERSITY_TEST",
            { method: "GET" },
            auth.token
          ),
        ]);

        setAttempt(attemptData.attempt);
        setQuestions(questionsData.questions || []);
        setCurrentIndex(attemptData.attempt.answeredCount || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [attemptId, router]);

  useEffect(() => {
    if (attempt?.status === "COMPLETED" || submitting) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, submitting, handleSubmit]);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = attempt?.questions[currentIndex]?.selectedOption;

  const handleSelectOption = async (option: string) => {
    if (!attempt) return;

    try {
      setSubmitting(true);

      const updatedAttempt = {
        ...attempt,
        questions: attempt.questions.map((q, i) =>
          i === currentIndex ? { ...q, selectedOption: option } : q
        ),
      };

      const auth = getStoredAuth();
      if (!auth) {
        router.push("/login");
        return;
      }

      await apiRequest<{ attempt: AQAttempt }>(
        `/platform/student/attempts/${attemptId}/answers`,
        {
          method: "PATCH",
          body: JSON.stringify({
            questions: updatedAttempt.questions,
            answeredCount: Math.max(attempt.answeredCount, currentIndex + 1),
          }),
        },
        auth.token
      );

      setAttempt(updatedAttempt);

      if (currentIndex < questions.length - 1) {
        setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save answer");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion || !attempt) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Resilience Quotient Assessment</h1>
            <p className="text-slate-600 text-sm">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Clock className="w-5 h-5 text-blue-600" />
              {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-2">{progress.toFixed(0)}% complete</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">{currentQuestion.questionText}</h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleSelectOption(option.label)}
                disabled={submitting}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedAnswer === option.label
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedAnswer === option.label
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}
                  >
                    {selectedAnswer === option.label && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span
                    className={`font-semibold mr-3 ${
                      selectedAnswer === option.label ? "text-blue-600" : "text-slate-700"
                    }`}
                  >
                    {option.label}.
                  </span>
                  <span className={selectedAnswer === option.label ? "text-blue-900" : "text-slate-600"}>
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0 || submitting}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-300 text-slate-900 rounded-lg font-semibold hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={attempt.answeredCount < questions.length || submitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Submit & Get Results
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdversityQuotientAssessment() {
  const [attempt, setAttempt] = useState<AQAttempt | null>(null);
  const [result, setResult] = useState<AQResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
    setError("This legacy assessment component has been retired. Please take the Resilience Quotient (RQ) assessment from your student portal.");
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return <ResultCard attempt={attempt!} result={result} />;
  }

  if (!attempt) {
    return null;
  }

  return <TestInterface attemptId={attempt._id} onComplete={setResult} />;
}
