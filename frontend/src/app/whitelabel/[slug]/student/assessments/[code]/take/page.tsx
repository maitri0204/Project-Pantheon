"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize,
} from "lucide-react";

import { apiRequest, getStoredAuth } from "@/lib/api";

type AttemptOption = {
  label: string;
  text: string;
  score?: number;
};

type AttemptQuestion = {
  questionId: string;
  questionNumber: number;
  category: string;
  categoryLabel: string;
  questionText: string;
  sourceTestType?: string;
  partNumber?: number;
  passage?: string;
  options: AttemptOption[];
  answer?: string;
};

type StartAttemptResponse = {
  attempt: {
    id: string;
    assessmentCode: string;
    assessmentName: string;
    status: "IN_PROGRESS" | "COMPLETED";
    questions: AttemptQuestion[];
    answeredCount: number;
    totalQuestions: number;
  };
};

const CAREER_DNA_SECTION_META = [
  {
    type: "COGNITIVE",
    title: "Cognitive Ability Assessment",
    description: "Verbal reasoning, numerical reasoning, spatial reasoning, and memory & processing speed.",
  },
  {
    type: "APTITUDE",
    title: "Aptitude Tests",
    description: "Logical reasoning, numerical aptitude, verbal aptitude, mechanical aptitude, and creativity.",
  },
  {
    type: "PERSONALITY",
    title: "Personality Assessment",
    description: "Energy source, information processing, decision making, work style, and reflection patterns.",
  },
  {
    type: "CAREER_INTEREST",
    title: "Career Interest Assessment",
    description: "RIASEC career themes across realistic, investigative, artistic, social, enterprising, and conventional interests.",
  },
  {
    type: "EMOTIONAL_INTELLIGENCE",
    title: "Emotional Intelligence Assessment",
    description: "Self-awareness, emotional regulation, empathy, and social skills.",
  },
  {
    type: "LEARNING_STYLE",
    title: "Learning Style Assessment",
    description: "Visual, auditory, reading-writing, kinesthetic, logical, social, solitary, and musical learning preferences.",
  },
  {
    type: "BEHAVIORAL_SOCIAL",
    title: "Behavioral and Social Skills Assessment",
    description: "Adaptability, teamwork, leadership skills, and communication skills.",
  },
  {
    type: "STRESS_RESILIENCE",
    title: "Stress and Resilience Assessment",
    description: "Stress awareness, coping strategies, problem-solving, and resilience skills.",
  },
] as const;

const CAREER_DNA_SECTION_VISUALS: Record<string, {
  image: string;
  borderColor: string;
  chipColor: string;
}> = {
  COGNITIVE: {
    image: "/CognitiveIntelligence.jpeg",
    borderColor: "border-violet-200",
    chipColor: "bg-violet-50 text-violet-700 border-violet-100",
  },
  APTITUDE: {
    image: "/Aptitude.jpeg",
    borderColor: "border-cyan-200",
    chipColor: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  PERSONALITY: {
    image: "/PersonalityType.jpeg",
    borderColor: "border-rose-200",
    chipColor: "bg-rose-50 text-rose-700 border-rose-100",
  },
  CAREER_INTEREST: {
    image: "/CareerInterest.jpeg",
    borderColor: "border-amber-200",
    chipColor: "bg-amber-50 text-amber-700 border-amber-100",
  },
  EMOTIONAL_INTELLIGENCE: {
    image: "/EmotionalIntelligence.jpeg",
    borderColor: "border-pink-200",
    chipColor: "bg-pink-50 text-pink-700 border-pink-100",
  },
  LEARNING_STYLE: {
    image: "/LearningStyle.jpeg",
    borderColor: "border-emerald-200",
    chipColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  BEHAVIORAL_SOCIAL: {
    image: "/Behavioural.jpeg",
    borderColor: "border-blue-200",
    chipColor: "bg-blue-50 text-blue-700 border-blue-100",
  },
  STRESS_RESILIENCE: {
    image: "/Stress&Resilience.jpeg",
    borderColor: "border-teal-200",
    chipColor: "bg-teal-50 text-teal-700 border-teal-100",
  },
};

const getCareerDnaTestType = (question: AttemptQuestion): string => {
  if (question.sourceTestType) {
    return question.sourceTestType;
  }

  const match = String(question.category || "").match(/^(.*)_\d+$/);
  return match?.[1] || String(question.category || "");
};

const getCareerDnaPartNumber = (question: AttemptQuestion): number => {
  if (Number.isFinite(Number(question.partNumber))) {
    return Number(question.partNumber);
  }

  const match = String(question.category || "").match(/_(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

export default function StudentTakeAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = useParams<{ slug?: string; code?: string; rest?: string[] }>();
  const routeParts = (pathname || "").split("/").filter(Boolean);
  const slug = params?.slug || routeParts[1] || "";
  const fallbackCodeFromRest = Array.isArray(params?.rest) ? params.rest[2] : "";
  const fallbackCodeFromPath = routeParts[5] || "";
  const code = (params?.code || fallbackCodeFromRest || fallbackCodeFromPath || "").toUpperCase();
  const paymentSessionId = searchParams?.get("paymentSessionId") || undefined;
  const auth = useMemo(() => getStoredAuth(), []);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState("");
  const [assessmentName, setAssessmentName] = useState("");
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const [showInstructions, setShowInstructions] = useState(true);
  const [activeSectionCat, setActiveSectionCat] = useState<string | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const isSubmittingRef = useRef(false);
  const fullscreenExitedRef = useRef(false); // Track if fullscreen was exited (anti-cheat)

  useEffect(() => {
    if (!auth?.token || !slug || !code) {
      router.replace(`/whitelabel/${slug}/login`);
      return;
    }

    apiRequest<StartAttemptResponse>(
      `/platform/student/assessments/${code}/start`,
      { method: "POST", body: JSON.stringify({ paymentSessionId }) },
      auth.token
    )
      .then((response) => {
        const attempt = response.attempt;
        if (attempt.status === "COMPLETED") {
          alert("This assessment is already completed.");
          router.replace(`/whitelabel/${slug}/student/assessments`);
          return;
        }

        setAttemptId(attempt.id);
        setAssessmentName(attempt.assessmentName);
        setQuestions(attempt.questions);

        // Restore any already-saved answers
        const restored: Record<string, string> = {};
        attempt.questions.forEach((q) => {
          if (q.answer) restored[q.questionId] = q.answer;
        });
        setAnswers(restored);
      })
      .catch((error) => {
        alert(error instanceof Error ? error.message : "Unable to start assessment");
        router.replace(`/whitelabel/${slug}/student/assessments`);
      })
      .finally(() => setLoading(false));
  }, [auth?.token, code, paymentSessionId, router, slug]);

  // ── Fullscreen management ──────────────────────────────────────────────────
  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      // Not supported or failed; log for diagnostics
      // eslint-disable-next-line no-console
      console.warn("enterFullscreen: requestFullscreen failed", err);
    }
  }, []);

  useEffect(() => {
    if (!loading && questions.length > 0 && !showInstructions) {
      enterFullscreen();
    }
  }, [loading, questions.length, enterFullscreen, showInstructions]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      if (!isFull && !loading && questions.length > 0 && !isSubmittingRef.current && !showInstructions) {
        // Anti-cheat: Mark that fullscreen was exited
        fullscreenExitedRef.current = true;
        console.warn("handleFullscreenChange: Fullscreen exited - test paused for security");
        
        // Log event to backend asynchronously (non-blocking)
        if (attemptId && auth?.token) {
          apiRequest(
            `/platform/student/attempts/${attemptId}/anti-cheat-event`,
            { method: "POST", body: JSON.stringify({ eventType: "fullscreen_exit" }) },
            auth.token
          ).catch((err) => {
            console.warn("handleFullscreenChange: Failed to log anti-cheat event", err);
          });
        }
        
        setShowResumeModal(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [loading, questions.length, showInstructions, attemptId, auth?.token]);

  // ── Anti-cheat ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || questions.length === 0 || showInstructions) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["F5", "F11", "F12"].includes(e.key)) { e.preventDefault(); return; }
      if (e.key === "Escape") { e.preventDefault(); return; }
      if ((e.ctrlKey || e.metaKey) && ["c","v","a","u","s","p","f","g","h","j","r"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleContextMenu = (e: Event) => e.preventDefault();
    const handleVisibilityChange = () => {
      if (document.hidden) alert("Please do not switch tabs during the test!");
    };
    const blockCopyPaste = (e: Event) => e.preventDefault();

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", blockCopyPaste);
    document.addEventListener("cut", blockCopyPaste);
    document.addEventListener("paste", blockCopyPaste);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", blockCopyPaste);
      document.removeEventListener("cut", blockCopyPaste);
      document.removeEventListener("paste", blockCopyPaste);
    };
  }, [loading, questions.length, showInstructions]);

  // ── Answer handler ─────────────────────────────────────────────────────────
  const handleAnswer = async (questionId: string, label: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: label }));
    if (!attemptId || !auth?.token) return;
    try {
      await apiRequest(
        `/platform/student/attempts/${attemptId}/answers`,
        { method: "PATCH", body: JSON.stringify({ answers: [{ questionId, answer: label }] }) },
        auth.token
      );
    } catch (err) {
      // non-blocking but log for telemetry
      // eslint-disable-next-line no-console
      console.warn("handleAnswer: failed to persist answer", err, { attemptId, questionId, label });
    }
  };

  const goToQuestion = (idx: number) => {
    setCurrentIndex(idx);
    setVisited((prev) => new Set(prev).add(idx));
  };

  const ensureJohariDefaultAnswerForCurrent = async () => {
    if (assessmentVariant !== "johari" || !currentQuestion?.questionId) {
      return;
    }

    if (answers[currentQuestion.questionId]) {
      return;
    }

    const defaultAnswer = "3";
    setAnswers((prev) => ({ ...prev, [currentQuestion.questionId]: defaultAnswer }));

    if (!attemptId || !auth?.token) {
      return;
    }

    try {
      await apiRequest(
        `/platform/student/attempts/${attemptId}/answers`,
        { method: "PATCH", body: JSON.stringify({ answers: [{ questionId: currentQuestion.questionId, answer: defaultAnswer }] }) },
        auth.token
      );
    } catch (err) {
      // non-blocking - log error for analysis
      // eslint-disable-next-line no-console
      console.warn("ensureJohariDefaultAnswerForCurrent: failed to persist default answer", err, { attemptId, questionId: currentQuestion.questionId });
    }
  };

  const handleSubmit = async () => {
    // Prevent race condition: check ref before starting submission
    if (isSubmittingRef.current || submitting) {
      return;
    }

    // Anti-cheat: Block submission if fullscreen was exited
    if (fullscreenExitedRef.current) {
      alert("Assessment cannot be submitted. Fullscreen mode was exited during the test. Please contact support.");
      return;
    }

    const unanswered = questions.filter((q) => !answers[q.questionId]);
    if (unanswered.length > 0) {
      alert(`Please answer all questions. ${unanswered.length} remaining.`);
      const idx = questions.findIndex((q) => !answers[q.questionId]);
      if (idx >= 0) goToQuestion(idx);
      return;
    }

    setSubmitting(true);
    isSubmittingRef.current = true;
    try {
      if (attemptId && auth?.token) {
        const payload = questions
          .map((question) => ({ questionId: question.questionId, answer: answers[question.questionId] }))
          .filter((entry) => entry.answer);

        if (payload.length > 0) {
          await apiRequest(
            `/platform/student/attempts/${attemptId}/answers`,
            { method: "PATCH", body: JSON.stringify({ answers: payload }) },
            auth.token
          );
        }
      }

      const response = await apiRequest<{ attemptId: string }>(
        `/platform/student/attempts/${attemptId}/submit`,
        { method: "POST" },
        auth!.token
      );

      if (document.fullscreenElement) {
        await Promise.race([
          document.exitFullscreen().catch(() => undefined),
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]);
      }

      if (code === "CAREER_DNA") {
        router.replace(`/whitelabel/${slug}/student/dashboard`);
        return;
      }

      const submittedAttemptId = response?.attemptId || attemptId;
      router.replace(`/whitelabel/${slug}/student/assessments/${code}/result?attemptId=${submittedAttemptId}`);
    } catch (error) {
      // On error, keep isSubmittingRef true to prevent retry attempts
      console.warn("handleSubmit: submission failed", error);
      alert(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setSubmitting(false);
      // Note: isSubmittingRef stays true to prevent double submissions even after error
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalAnswered = Object.keys(answers).length;
  const allAnswered = totalAnswered === questions.length && questions.length > 0;
  const currentQuestion = questions[currentIndex];

  // Group questions by category for navigator
  const categoryMap = new Map<string, { label: string; questions: { q: AttemptQuestion; idx: number }[] }>();
  questions.forEach((q, idx) => {
    if (!categoryMap.has(q.category)) {
      categoryMap.set(q.category, { label: q.categoryLabel, questions: [] });
    }
    categoryMap.get(q.category)!.questions.push({ q, idx });
  });
  const categoryGroups = Array.from(categoryMap.entries()).map(([cat, val]) => ({ cat, ...val }));

  const getCircleColor = (idx: number, q: AttemptQuestion) => {
    if (idx === currentIndex) return "bg-blue-600 text-white ring-2 ring-blue-300";
    if (answers[q.questionId]) return "bg-green-500 text-white";
    if (visited.has(idx)) return "bg-red-400 text-white";
    return "bg-gray-200 text-gray-600";
  };

  const partColors = ["text-blue-600","text-green-600","text-purple-600","text-amber-600","text-rose-600","text-cyan-600","text-indigo-600","text-teal-600"];

  const assessmentVariant = (() => {
    if (code.includes("JOHARI")) return "johari" as const;
    if (code.includes("LITMUS")) return "litmus" as const;
    if (code.includes("METACOGNITION")) return "metacognition" as const;
    if (code.includes("DNA")) return "career-dna" as const;
    return "career-compass" as const;
  })();

  const isCareerDna = assessmentVariant === "career-dna";

  const headerGradient = {
    "career-compass": "from-blue-600 to-cyan-600",
    "career-dna": "from-violet-600 to-fuchsia-600",
    johari: "from-emerald-600 to-teal-600",
    litmus: "from-amber-500 to-orange-500",
    metacognition: "from-indigo-600 to-sky-600",
  }[assessmentVariant];

  const pageTone = {
    "career-compass": "bg-gray-50",
    "career-dna": "bg-violet-50/40",
    johari: "bg-emerald-50/40",
    litmus: "bg-amber-50/40",
    metacognition: "bg-sky-50/40",
  }[assessmentVariant];

  const sectionProgress = categoryGroups.map((group) => {
    const answeredCount = group.questions.reduce(
      (count, { q }) => (answers[q.questionId] ? count + 1 : count),
      0
    );

    return {
      ...group,
      answeredCount,
      totalCount: group.questions.length,
      completed: answeredCount === group.questions.length,
    };
  });

  const careerDnaSections = CAREER_DNA_SECTION_META.map((sectionMeta) => {
    const sectionQuestions = questions
      .map((question, index) => ({ question, index }))
      .filter(({ question }) => getCareerDnaTestType(question) === sectionMeta.type);

    const partMap = new Map<string, {
      cat: string;
      label: string;
      partNumber: number;
      totalCount: number;
      answeredCount: number;
    }>();

    sectionQuestions.forEach(({ question }) => {
      const key = question.category;
      const existing = partMap.get(key);
      const nextAnswered = answers[question.questionId] ? 1 : 0;
      if (existing) {
        existing.totalCount += 1;
        existing.answeredCount += nextAnswered;
        return;
      }

      partMap.set(key, {
        cat: key,
        label: question.categoryLabel,
        partNumber: getCareerDnaPartNumber(question),
        totalCount: 1,
        answeredCount: nextAnswered,
      });
    });

    const parts = Array.from(partMap.values()).sort((a, b) => a.partNumber - b.partNumber);
    const answeredCount = parts.reduce((sum, part) => sum + part.answeredCount, 0);
    const totalCount = parts.reduce((sum, part) => sum + part.totalCount, 0);

    return {
      cat: sectionMeta.type,
      label: sectionMeta.title,
      description: sectionMeta.description,
      questions: sectionQuestions,
      parts,
      answeredCount,
      totalCount,
      completed: totalCount > 0 && answeredCount === totalCount,
    };
  }).filter((section) => section.totalCount > 0).map((section, index, arr) => ({
    ...section,
    unlocked: index === 0 || arr[index - 1]?.completed,
  }));

  const visibleNavigatorGroups = isCareerDna && activeSectionCat
    ? categoryGroups.filter((group) => getCareerDnaTestType(group.questions[0]?.q) === activeSectionCat)
    : categoryGroups;

  const activeCareerDnaSection = isCareerDna
    ? careerDnaSections.find((section) => section.cat === activeSectionCat)
    : null;

  const visibleQuestionIndexes = isCareerDna && activeSectionCat
    ? questions
      .map((question, index) => (getCareerDnaTestType(question) === activeSectionCat ? index : -1))
      .filter((index) => index >= 0)
    : questions.map((_, index) => index);

  const currentVisibleIndex = visibleQuestionIndexes.indexOf(currentIndex);
  const displayQuestionNumber = currentVisibleIndex >= 0 ? currentVisibleIndex + 1 : currentIndex + 1;
  const displayQuestionTotal = visibleQuestionIndexes.length;

  const goToPreviousVisibleQuestion = () => {
    const targetIndex = visibleQuestionIndexes[Math.max(currentVisibleIndex - 1, 0)] ?? 0;
    void ensureJohariDefaultAnswerForCurrent().finally(() => {
      goToQuestion(targetIndex);
    });
  };

  const goToNextVisibleQuestion = () => {
    const targetIndex = visibleQuestionIndexes[Math.min(currentVisibleIndex + 1, visibleQuestionIndexes.length - 1)] ?? 0;
    void ensureJohariDefaultAnswerForCurrent().finally(() => {
      goToQuestion(targetIndex);
    });
  };

  const openCareerDnaSection = (sectionCat: string) => {
    const sectionIndexes = questions
      .map((question, index) => (getCareerDnaTestType(question) === sectionCat ? index : -1))
      .filter((index) => index >= 0);

    if (!sectionIndexes.length) {
      return;
    }

    const firstUnansweredInSection = sectionIndexes.find((index) => !answers[questions[index].questionId]);
    const targetIndex = firstUnansweredInSection ?? sectionIndexes[0];

    setActiveSectionCat(sectionCat);
    setShowInstructions(false);
    goToQuestion(targetIndex);
  };

  const returnToCareerDnaSections = async () => {
    setShowInstructions(true);
    setActiveSectionCat(null);
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
    }
  };

  const renderOptions = () => {
    const options = currentQuestion.options.length > 0
      ? currentQuestion.options
      : [1, 2, 3, 4, 5].map((value) => ({
          label: String(value),
          text: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"][value - 1],
        }));

    if (assessmentVariant === "litmus") {
      const emojiMap = ["😟", "🙁", "😐", "🙂", "😄"];
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {options.map((opt, index) => {
            const isSelected = answers[currentQuestion.questionId] === opt.label;
            return (
              <button
                key={opt.label}
                onClick={() => void handleAnswer(currentQuestion.questionId, opt.label)}
                className={`rounded-2xl border-2 px-4 py-5 text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-amber-500 bg-amber-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/60"
                }`}
              >
                <div className="text-3xl mb-2">{emojiMap[index] ?? "⭐"}</div>
                <div className={`text-lg font-bold ${isSelected ? "text-amber-700" : "text-gray-700"}`}>{opt.label}</div>
                <div className={`text-xs mt-1 ${isSelected ? "text-amber-700" : "text-gray-500"}`}>{opt.text}</div>
              </button>
            );
          })}
        </div>
      );
    }

    if (assessmentVariant === "johari") {
      const scoreA = Number(answers[currentQuestion.questionId] ?? "3");
      const safeScoreA = Number.isFinite(scoreA) ? Math.min(5, Math.max(0, scoreA)) : 3;
      const scoreB = 5 - safeScoreA;
      const optionA = options.find((option) => option.label === "A")?.text || "Option A";
      const optionB = options.find((option) => option.label === "B")?.text || "Option B";

      return (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-800 flex-1">
              <span className="font-bold text-emerald-700 mr-1">A)</span>
              {optionA}
            </p>
            <div className="w-12 h-10 flex items-center justify-center rounded-lg text-sm font-bold bg-emerald-600 text-white shadow-md">
              {safeScoreA}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-800 flex-1">
              <span className="font-bold text-amber-700 mr-1">B)</span>
              {optionB}
            </p>
            <div className="w-12 h-10 flex items-center justify-center rounded-lg text-sm font-bold bg-amber-500 text-white shadow-md">
              {scoreB}
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200" />

          <div className="px-1">
            <p className="text-xs font-semibold text-gray-500 mb-4 text-center tracking-wide uppercase">Distribute 5 points</p>

            <div className="flex justify-between text-xs font-bold text-gray-500 mb-1 px-0.5">
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <span key={value} className={value === safeScoreA ? "text-emerald-600" : ""}>{value}</span>
              ))}
            </div>

            <div className="relative h-10 flex items-center">
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-4 rounded-l-full transition-all duration-150"
                style={{
                  width: `${(safeScoreA / 5) * 100}%`,
                  background: "linear-gradient(to right, #059669, #10b981)",
                  borderRadius: safeScoreA === 0 ? "9999px" : safeScoreA === 5 ? "9999px" : "9999px 0 0 9999px",
                }}
              />
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 h-4 transition-all duration-150"
                style={{
                  width: `${(scoreB / 5) * 100}%`,
                  background: "linear-gradient(to right, #f59e0b, #f97316)",
                  borderRadius: scoreB === 0 ? "9999px" : scoreB === 5 ? "9999px" : "0 9999px 9999px 0",
                }}
              />
              <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-4 rounded-full -z-10 bg-gray-100" />

              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={safeScoreA}
                onChange={(e) => void handleAnswer(currentQuestion.questionId, String(Number(e.target.value)))}
                className="relative w-full h-4 rounded-full cursor-pointer appearance-none bg-transparent z-10"
              />
            </div>

            <div className="flex justify-between text-[11px] font-semibold mt-1 px-0.5">
              <span className="text-emerald-500">← More A</span>
              <span className="text-amber-500">More B →</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 py-2.5 bg-gray-50 rounded-xl text-sm">
            <span className="font-semibold text-emerald-700">A: {safeScoreA}</span>
            <span className="text-gray-400">+</span>
            <span className="font-semibold text-amber-700">B: {scoreB}</span>
            <span className="text-gray-400">=</span>
            <span className="font-bold text-gray-900">5</span>
          </div>
        </div>
      );
    }

    if (assessmentVariant === "metacognition") {
      return (
        <div className="space-y-3">
          {options.map((opt) => {
            const isSelected = answers[currentQuestion.questionId] === opt.label;
            return (
              <button
                key={opt.label}
                onClick={() => void handleAnswer(currentQuestion.questionId, opt.label)}
                className={`w-full grid grid-cols-[56px_1fr] items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-sky-600 bg-sky-50 shadow-sm"
                    : "border-sky-100 bg-white hover:border-sky-300 hover:bg-sky-50/60"
                }`}
              >
                <span className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold ${isSelected ? "bg-sky-600 text-white" : "bg-sky-100 text-sky-700"}`}>
                  {opt.label}
                </span>
                <span className={`font-medium ${isSelected ? "text-sky-900" : "text-gray-700"}`}>{opt.text}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (assessmentVariant === "career-dna") {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {options.map((opt) => {
            const isSelected = answers[currentQuestion.questionId] === opt.label;
            return (
              <button
                key={opt.label}
                onClick={() => void handleAnswer(currentQuestion.questionId, opt.label)}
                className={`rounded-2xl border-2 px-5 py-5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-violet-600 bg-violet-50 shadow-sm"
                    : "border-violet-100 bg-white hover:border-violet-300 hover:bg-violet-50/60"
                }`}
              >
                <div className={`mb-2 text-sm font-bold ${isSelected ? "text-violet-700" : "text-violet-500"}`}>{opt.label}</div>
                <div className={`text-sm leading-relaxed ${isSelected ? "text-violet-900" : "text-gray-700"}`}>{opt.text}</div>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = answers[currentQuestion.questionId] === opt.label;
          return (
            <button
              key={opt.label}
              onClick={() => void handleAnswer(currentQuestion.questionId, opt.label)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                isSelected
                  ? "border-blue-600 bg-blue-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {opt.label}
              </span>
              <span className={`text-sm font-medium ${isSelected ? "text-blue-800" : "text-gray-700"}`}>
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // ── Loading / Empty states ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-[9999]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-[9999]">
        <div className="text-center">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold text-lg">No questions available</p>
          <button
            onClick={() => router.replace(`/whitelabel/${slug}/student/assessments`)}
            className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  // ── Instructions page ──────────────────────────────────────────────────────
  if (showInstructions) {
    if (isCareerDna) {
      return (
        <div className={`fixed inset-0 z-[9999] ${pageTone} overflow-y-auto p-4 md:p-8`} style={{ fontFamily: "'Inter', sans-serif" }}>
          <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${headerGradient} px-8 py-6 text-white`}>
              <h1 className="text-2xl font-bold">{assessmentName || code}</h1>
              <p className="text-violet-100 text-sm mt-1">
                Continue section-wise. Fullscreen starts only after you open a subsection.
              </p>
            </div>

            <div className="px-8 py-6 space-y-4">
              {careerDnaSections.map((section, index) => (
                <div
                  key={section.cat}
                  className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${CAREER_DNA_SECTION_VISUALS[section.cat]?.borderColor || "border-gray-200"}`}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-36 md:h-auto md:w-44 shrink-0">
                      <Image
                        src={CAREER_DNA_SECTION_VISUALS[section.cat]?.image || "/next.svg"}
                        alt={section.label}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 w-7 h-7 rounded-md bg-black/45 text-white flex items-center justify-center text-xs font-bold backdrop-blur-sm">
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex-1 p-4 lg:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Section {index + 1}</p>
                      <p className="text-base font-bold text-gray-900 mt-1">{section.label}</p>
                      <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {section.answeredCount} / {section.totalCount} answered
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {section.parts.map((part) => (
                          <span
                            key={part.cat}
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${CAREER_DNA_SECTION_VISUALS[section.cat]?.chipColor || "border-violet-100 bg-violet-50 text-violet-700"}`}
                          >
                            Part {part.partNumber}: {part.label}
                          </span>
                        ))}
                      </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {section.completed && (
                            <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold">
                              Completed
                            </span>
                          )}
                          {!section.completed && section.unlocked && (
                            <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold">
                              In Progress
                            </span>
                          )}
                          {!section.unlocked && (
                            <span className="rounded-full bg-gray-100 text-gray-500 px-3 py-1 text-xs font-semibold">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        <button
                          onClick={() => openCareerDnaSection(section.cat)}
                          disabled={!section.unlocked}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                          {section.completed ? "Review Section" : section.answeredCount > 0 ? "Continue Section" : "Start Section"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {allAnswered && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center justify-between gap-4">
                  <p className="text-sm text-green-800 font-medium">All sections completed. You can now submit your test.</p>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60"
                  >
                    {submitting ? "Submitting..." : "Submit Test"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`fixed inset-0 z-[9999] ${pageTone} overflow-y-auto p-4 md:p-8`} style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${headerGradient} px-8 py-6 text-white`}>
            <h1 className="text-2xl font-bold">{assessmentName || code}</h1>
            <p className="text-blue-100 text-sm mt-1">{questions.length} questions total</p>
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Instructions</h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <span>
                    {assessmentVariant === "johari"
                      ? <>For each question, <strong>distribute 5 points</strong> between options A and B.</>
                      : <>For each question, choose the option that <strong>best describes you</strong> — answer honestly.</>}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <span>There are <strong>no right or wrong answers</strong> — every response is valid.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <span>The test has <strong>{questions.length} questions</strong>. Answering all questions is compulsory.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                  <span>There is <strong>no time limit</strong> — take your time and answer thoughtfully.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</span>
                  <span>The test runs in <strong>fullscreen mode</strong>. Do not switch tabs or exit fullscreen.</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 mb-2">Sections Overview</h3>
              <div className="space-y-1 text-sm text-blue-700">
                {categoryGroups.map((grp, i) => (
                  <p key={grp.cat}>
                    <strong>Section {i + 1}:</strong> {grp.label} ({grp.questions.length} questions)
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => router.replace(`/whitelabel/${slug}/student/assessments`)}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
            >
              ← Back
            </button>
            <button
              onClick={() => setShowInstructions(false)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md"
            >
              Start Assessment
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main test UI ───────────────────────────────────────────────────────────
  return (
    <div
      className={`fixed inset-0 z-[9999] ${pageTone} flex flex-col select-none`}
      style={{ userSelect: "none", fontFamily: "'Inter', sans-serif" }}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="border-r border-gray-200 pr-4">
            <h1 className="text-base font-bold text-gray-900">{assessmentName || code}</h1>
            <p className="text-xs text-gray-500">Answer all {questions.length} questions — every question is compulsory</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isCareerDna && activeSectionCat && (
            <button
              onClick={() => void ensureJohariDefaultAnswerForCurrent().finally(() => returnToCareerDnaSections())}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-violet-100 text-violet-700 hover:bg-violet-200 transition"
            >
              Save & Sections
            </button>
          )}

          {/* Progress */}
          <div className="text-sm font-medium text-gray-600">
            <span className="text-blue-600 font-bold">{totalAnswered}</span>
            <span className="text-gray-400"> / {questions.length}</span>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Question Area ── */}
        <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto min-w-0">
          <div className="w-full">
            {/* Breadcrumb */}
            <p className="text-sm text-gray-500 font-medium mb-6">
              {isCareerDna && activeCareerDnaSection
                ? `${activeCareerDnaSection.label} · ${currentQuestion.categoryLabel}`
                : currentQuestion.categoryLabel}
              <span className="text-gray-300 mx-2">·</span>
              Question {displayQuestionNumber} of {displayQuestionTotal}
            </p>

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              {currentQuestion.passage && (
                <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">Read the passage</p>
                  <p className="text-sm leading-relaxed text-slate-700">{currentQuestion.passage}</p>
                </div>
              )}

              <div className="flex items-start gap-4 mb-8">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {displayQuestionNumber}
                </span>
                <p className="text-lg text-gray-800 leading-relaxed font-medium pt-1.5">
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Options */}
              {renderOptions()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={goToPreviousVisibleQuestion}
                disabled={currentVisibleIndex <= 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="text-sm text-gray-400 font-medium">
                Question {displayQuestionNumber} of {displayQuestionTotal}
              </span>

              <button
                onClick={() => {
                  if (allAnswered && !submitting) {
                    void handleSubmit();
                    return;
                  }

                  const isLastVisible = currentVisibleIndex >= visibleQuestionIndexes.length - 1;
                  if (isCareerDna && isLastVisible) {
                    void ensureJohariDefaultAnswerForCurrent().finally(() => returnToCareerDnaSections());
                    return;
                  }
                  goToNextVisibleQuestion();
                }}
                disabled={submitting || (!allAnswered && !isCareerDna && currentVisibleIndex >= visibleQuestionIndexes.length - 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "Submitting..." : allAnswered ? "Submit Test" : isCareerDna && currentVisibleIndex >= visibleQuestionIndexes.length - 1 ? "Save Section" : "Next"}
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="mt-6 lg:hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Question Navigator</h3>
              <div className="space-y-5">
                {visibleNavigatorGroups.map((grp, grpIdx) => (
                  <div key={grp.cat}>
                    <p className={`text-xs font-bold mb-3 ${partColors[grpIdx % partColors.length]}`}>
                      {grp.label}
                    </p>
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                      {grp.questions.map(({ q, idx }) => {
                        const sectionQuestionNumber = visibleQuestionIndexes.indexOf(idx) + 1;
                        return (
                        <button
                          key={q.questionId}
                          onClick={() => void ensureJohariDefaultAnswerForCurrent().finally(() => goToQuestion(idx))}
                          className={`h-10 rounded-full text-xs font-bold transition-all cursor-pointer ${getCircleColor(idx, q)}`}
                        >
                          {sectionQuestionNumber > 0 ? sectionQuestionNumber : idx + 1}
                        </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* ── Question Navigator Sidebar ── */}
        <aside className="hidden lg:flex w-80 flex-shrink-0 bg-white border-l border-gray-200 flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Question Navigator</h3>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            {visibleNavigatorGroups.map((grp, grpIdx) => (
              <div key={grp.cat}>
                <p className={`text-xs font-bold mb-3 ${partColors[grpIdx % partColors.length]}`}>
                  {grp.label}
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {grp.questions.map(({ q, idx }) => {
                    const sectionQuestionNumber = visibleQuestionIndexes.indexOf(idx) + 1;
                    return (
                    <button
                      key={q.questionId}
                      onClick={() => void ensureJohariDefaultAnswerForCurrent().finally(() => goToQuestion(idx))}
                      className={`w-10 h-10 rounded-full text-xs font-bold transition-all cursor-pointer ${getCircleColor(idx, q)}`}
                      title={`Q${sectionQuestionNumber > 0 ? sectionQuestionNumber : idx + 1}`}
                    >
                      {sectionQuestionNumber > 0 ? sectionQuestionNumber : idx + 1}
                    </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="px-5 py-4 border-t border-gray-100 space-y-2">
            {[
              { color: "bg-gray-200", label: "Not visited" },
              { color: "bg-green-500", label: "Visited & answered" },
              { color: "bg-red-400", label: "Visited, not answered" },
              { color: "bg-blue-600", label: "Current" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full ${color} flex-shrink-0`} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ── Bottom warning bar ── */}
      {!allAnswered && (
        <div className="flex-shrink-0 bg-amber-50 border-t border-amber-200 px-6 py-2.5 flex items-center justify-center gap-2">
          <AlertTriangle size={14} className="text-amber-600" />
          <span className="text-xs font-medium text-amber-700">
            {questions.length - totalAnswered} question{questions.length - totalAnswered !== 1 ? "s" : ""} remaining
          </span>
        </div>
      )}

      {/* ── Resume Fullscreen Modal ── */}
      {showResumeModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Test Paused</h2>
            <p className="text-sm text-gray-500 mb-6">You exited fullscreen mode. Please resume to continue your test.</p>
            <button
              onClick={async () => { setShowResumeModal(false); await enterFullscreen(); }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition cursor-pointer"
            >
              <Maximize size={16} />
              Resume Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
