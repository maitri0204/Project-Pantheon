"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import AssessmentComingSoonCard from "@/components/assessment/AssessmentComingSoonCard";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { allowsMultipleAttempts, buildStudentResultPath, normalizeAssessmentCode } from "@/lib/assessmentAccess";
import { isAssessmentLocked, sortAssessmentsByAvailability } from "@/lib/assessmentRelease";

type StudentAssessmentsResponse = {
  assessments: Array<{
    _id: string;
    code: string;
    name: string;
    slug: string;
    summary: string;
    category: string;
    questionCount: number;
    sourceProject: string;
    active: boolean;
    isReleased?: boolean;
    releaseDate?: string | null;
    releaseLabel?: string | null;
    attempt: null | {
      id: string;
      status: "IN_PROGRESS" | "COMPLETED";
      answeredCount: number;
      totalQuestions: number;
      completedAt?: string;
    };
  }>;
};

type AssessmentPricingResponse = {
  assessment: {
    code: string;
    name: string;
    basePrice: number;
    gstEnabled: boolean;
    currency: string;
  };
  couponCode?: string;
  discountAmount: number;
  gstAmount: number;
  finalAmount: number;
};

type PaymentOrderResponse = {
  paymentRequired: boolean;
  paymentSessionId: string;
  keyId?: string;
  order?: { id: string; amount: number; currency: string };
  pricing: AssessmentPricingResponse;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const normalizeAssessmentCodeForDisplay = (code: string) => {
  const normalized = String(code || "").toUpperCase().trim();
  if (normalized === "METACOGNITION" || normalized === "METACOGNITION_TEST") return "TEST";
  if (normalized === "JOHARI_WINDOW" || normalized === "JOHARI" || normalized === "CLEAR") return "CLEAR";
  return normalized;
};

const normalizeAssessmentCategoryForDisplay = (category: string, code: string) => {
  const normalizedCode = String(code || "").toUpperCase().trim();
  if (normalizedCode === "METACOGNITION" || normalizedCode === "METACOGNITION_TEST") return "TEST";
  if (normalizedCode === "JOHARI_WINDOW" || normalizedCode === "JOHARI" || normalizedCode === "CLEAR") return "CLEAR";
  return category;
};

type AssessmentTheme = {
  emoji: string;
  accentClass: string;       // gradient top bar
  iconBg: string;            // icon circle bg
  iconText: string;          // icon circle text color
  cardHoverShadow: string;   // inline style shadow on hover
  cardHoverBorder: string;   // border color class on hover
  glowClass: string;         // bg glow blob color
};

const ASSESSMENT_THEMES: Record<string, AssessmentTheme> = {
  CAREER_COMPASS: {
    emoji: "🧭",
    accentClass: "from-blue-400 via-indigo-500 to-violet-500",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    cardHoverShadow: "0 20px 48px -16px rgba(99,102,241,0.30)",
    cardHoverBorder: "hover:border-indigo-200",
    glowClass: "bg-indigo-400",
  },
  LITMUS_TEST: {
    emoji: "⚗️",
    accentClass: "from-violet-400 via-purple-500 to-fuchsia-500",
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
    cardHoverShadow: "0 20px 48px -16px rgba(139,92,246,0.30)",
    cardHoverBorder: "hover:border-violet-200",
    glowClass: "bg-violet-400",
  },
  CAREER_DNA: {
    emoji: "🧬",
    accentClass: "from-teal-400 via-cyan-500 to-sky-500",
    iconBg: "bg-teal-50",
    iconText: "text-teal-600",
    cardHoverShadow: "0 20px 48px -16px rgba(20,184,166,0.28)",
    cardHoverBorder: "hover:border-teal-200",
    glowClass: "bg-teal-400",
  },
  METACOGNITION_TEST: {
    emoji: "🧠",
    accentClass: "from-amber-400 via-orange-400 to-rose-400",
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    cardHoverShadow: "0 20px 48px -16px rgba(251,191,36,0.28)",
    cardHoverBorder: "hover:border-amber-200",
    glowClass: "bg-amber-400",
  },
  JOHARI_WINDOW: {
    emoji: "🪟",
    accentClass: "from-rose-400 via-pink-500 to-fuchsia-400",
    iconBg: "bg-rose-50",
    iconText: "text-rose-500",
    cardHoverShadow: "0 20px 48px -16px rgba(244,63,94,0.25)",
    cardHoverBorder: "hover:border-rose-200",
    glowClass: "bg-rose-400",
  },
  RESILIENCE_TEST: {
    emoji: "💪",
    accentClass: "from-emerald-400 via-green-500 to-teal-500",
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    cardHoverShadow: "0 20px 48px -16px rgba(16,185,129,0.28)",
    cardHoverBorder: "hover:border-emerald-200",
    glowClass: "bg-emerald-400",
  },
  ACADEMIC_CAREER: {
    emoji: "🎓",
    accentClass: "from-sky-400 via-blue-500 to-cyan-500",
    iconBg: "bg-sky-50",
    iconText: "text-sky-600",
    cardHoverShadow: "0 20px 48px -16px rgba(14,165,233,0.28)",
    cardHoverBorder: "hover:border-sky-200",
    glowClass: "bg-sky-400",
  },
  STUDY_ABROAD: {
    emoji: "✈️",
    accentClass: "from-indigo-400 via-blue-500 to-sky-400",
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-600",
    cardHoverShadow: "0 20px 48px -16px rgba(99,102,241,0.28)",
    cardHoverBorder: "hover:border-indigo-200",
    glowClass: "bg-indigo-400",
  },
};

const DEFAULT_THEME: AssessmentTheme = {
  emoji: "📋",
  accentClass: "from-slate-400 via-slate-500 to-slate-600",
  iconBg: "bg-slate-50",
  iconText: "text-slate-600",
  cardHoverShadow: "0 20px 48px -16px rgba(100,116,139,0.25)",
  cardHoverBorder: "hover:border-slate-300",
  glowClass: "bg-slate-400",
};

function getAssessmentTheme(code: string): AssessmentTheme {
  const normalized = String(code || "").toUpperCase().trim();
  const aliasMap: Record<string, string> = {
    METACOGNITION: "METACOGNITION_TEST",
    JOHARI: "JOHARI_WINDOW",
    CLEAR: "JOHARI_WINDOW",
    LITMUS: "LITMUS_TEST",
    ADVERSITY_TEST: "RESILIENCE_TEST",
    RQ_TEST: "RESILIENCE_TEST",
  };
  const key = aliasMap[normalized] || normalized;
  return ASSESSMENT_THEMES[key] || DEFAULT_THEME;
}

export default function StudentAssessmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const auth = useMemo(() => getStoredAuth(), []);
  const retakeHandledRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [startingCode, setStartingCode] = useState<string | null>(null);
  const [data, setData] = useState<StudentAssessmentsResponse>({ assessments: [] });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checkoutAssessmentCode, setCheckoutAssessmentCode] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [pricing, setPricing] = useState<AssessmentPricingResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  const sortedAssessments = useMemo(
    () => sortAssessmentsByAvailability(data.assessments),
    [data.assessments],
  );

  const load = () => {
    if (!auth?.token) {
      router.replace(`/whitelabel/${slug}/login`);
      return;
    }

    setLoading(true);
    setLoadError(null);
    apiRequest<StudentAssessmentsResponse>("/platform/student/assessments", {}, auth.token)
      .then((res) => { setData(res); setLoadError(null); })
      .catch((err) => {
        if (!getStoredAuth()) {
          router.replace(`/whitelabel/${slug}/login`);
        } else {
          setLoadError(err instanceof Error ? err.message : "Failed to load assessments");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, slug]);

  useEffect(() => {
    if (loading || retakeHandledRef.current) return;

    const retakeCode = normalizeAssessmentCode(String(searchParams?.get("retake") || ""));
    if (!retakeCode || !allowsMultipleAttempts(retakeCode)) return;

    const assessment = data.assessments.find(
      (item) => normalizeAssessmentCode(item.code) === retakeCode,
    );
    if (!assessment || isAssessmentLocked(assessment)) return;

    retakeHandledRef.current = true;
    void openCheckout(assessment.code);
    router.replace(`/whitelabel/${slug}/student/assessments`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data.assessments, searchParams, slug]);

  const loadRazorpayScript = async () => {
    if (typeof window === "undefined") return false;
    if (window.Razorpay) return true;

    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchPricing = async (code: string, enteredCoupon?: string) => {
    if (!auth?.token) return;
    setPricingLoading(true);
    setPricingError(null);
    try {
      const query = enteredCoupon?.trim() ? `?couponCode=${encodeURIComponent(enteredCoupon.trim())}` : "";
      const response = await apiRequest<AssessmentPricingResponse>(
        `/platform/student/assessments/${code}/pricing${query}`,
        {},
        auth.token
      );
      setPricing(response);
    } catch (error) {
      setPricing(null);
      setPricingError(error instanceof Error ? error.message : "Unable to calculate price");
    } finally {
      setPricingLoading(false);
    }
  };

  const openCheckout = async (code: string) => {
    setCheckoutAssessmentCode(code);
    setCouponCode("");
    setPricing(null);
    setPricingError(null);
    await fetchPricing(code);
  };

  const closeCheckout = () => {
    if (checkoutLoading) return;
    setCheckoutAssessmentCode(null);
    setCouponCode("");
    setPricing(null);
  };

  const startTestWithPayment = async (code: string, paymentSessionId?: string) => {
    if (!auth?.token) return;
    setStartingCode(code);
    try {
      const response = await apiRequest<{ attempt: { id: string } }>(`/platform/student/assessments/${code}/start`, {
        method: "POST",
        body: JSON.stringify(paymentSessionId ? { paymentSessionId } : {}),
      }, auth.token);
      const paymentQuery = paymentSessionId ? `&paymentSessionId=${encodeURIComponent(paymentSessionId)}` : "";
      router.push(`/whitelabel/${slug}/student/assessments/${code}/take?attemptId=${response.attempt.id}${paymentQuery}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unable to start assessment";
      window.alert(msg);
    } finally {
      setStartingCode(null);
      load();
    }
  };

  const handleProceedToPay = async () => {
    if (!auth?.token || !checkoutAssessmentCode) return;
    setCheckoutLoading(true);
    try {
      const orderResponse = await apiRequest<PaymentOrderResponse>(
        `/platform/student/assessments/${checkoutAssessmentCode}/payment/order`,
        {
          method: "POST",
          body: JSON.stringify({ couponCode: couponCode.trim() || undefined }),
        },
        auth.token
      );

      if (!orderResponse.paymentRequired) {
        closeCheckout();
        await startTestWithPayment(checkoutAssessmentCode, orderResponse.paymentSessionId);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay || !orderResponse.order || !orderResponse.keyId) {
        window.alert("Unable to load payment gateway. Please try again.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderResponse.keyId,
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        name: "Assessment Centre",
        description: `${orderResponse.pricing.assessment.name} Assessment`,
        order_id: orderResponse.order.id,
        prefill: {
          name: `${auth.user.firstName} ${auth.user.lastName}`.trim(),
          email: auth.user.email,
        },
        handler: async (paymentResult: Record<string, string>) => {
          try {
            await apiRequest(
              `/platform/student/assessments/${checkoutAssessmentCode}/payment/verify`,
              {
                method: "POST",
                body: JSON.stringify({
                  paymentSessionId: orderResponse.paymentSessionId,
                  razorpay_payment_id: paymentResult.razorpay_payment_id,
                  razorpay_order_id: paymentResult.razorpay_order_id,
                  razorpay_signature: paymentResult.razorpay_signature,
                }),
              },
              auth.token
            );
            closeCheckout();
            await startTestWithPayment(checkoutAssessmentCode, orderResponse.paymentSessionId);
          } catch (error) {
            window.alert(error instanceof Error ? error.message : "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setCheckoutLoading(false);
          },
        },
      });

      razorpay.open();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to initialize payment");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const openReport = (assessmentCode: string, attemptId?: string) => {
    if (allowsMultipleAttempts(assessmentCode)) {
      router.push(buildStudentResultPath(slug, assessmentCode));
      return;
    }
    if (!attemptId) return;
    router.push(buildStudentResultPath(slug, assessmentCode, { attemptId }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">{loadError}</p>
        <button
          onClick={load}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assessments</h1>
        <p className="mt-1 text-sm text-slate-600">Choose an assessment and click Take Test to start in full-screen mode.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {sortedAssessments.map((assessment) => {
          const completed = assessment.attempt?.status === "COMPLETED";
          const inProgress = assessment.attempt?.status === "IN_PROGRESS";
          const locked = isAssessmentLocked(assessment);

          if (locked && assessment.releaseDate) {
            return (
              <AssessmentComingSoonCard
                key={assessment._id}
                name={assessment.name}
                categoryLabel={normalizeAssessmentCategoryForDisplay(assessment.category, assessment.code)}
                releaseDate={assessment.releaseDate}
              />
            );
          }

          const theme = getAssessmentTheme(assessment.code);
          const qCount = assessment.questionCount || assessment.attempt?.totalQuestions;

          return (
            <div
              key={assessment._id}
              style={
                startingCode !== assessment.code
                  ? { "--card-hover-shadow": theme.cardHoverShadow } as React.CSSProperties
                  : undefined
              }
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 ${theme.cardHoverBorder} hover:-translate-y-0.5 hover:shadow-[var(--card-hover-shadow)]`}
            >
              {/* Coloured top accent bar */}
              <div className={`h-1 w-full bg-gradient-to-r ${theme.accentClass}`} />

              {/* Faint decorative blob top-right */}
              <div className={`pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full ${theme.glowClass} opacity-[0.07] blur-2xl transition-opacity duration-500 group-hover:opacity-[0.13]`} />
              {/* Second blob bottom-left */}
              <div className={`pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full ${theme.glowClass} opacity-[0.05] blur-2xl transition-opacity duration-500 group-hover:opacity-[0.10]`} />

              {/* Large faded emoji watermark */}
              <div className="pointer-events-none absolute right-4 top-8 select-none text-[4.5rem] opacity-[0.06] transition-transform duration-500 group-hover:scale-110 group-hover:opacity-[0.10]">
                {theme.emoji}
              </div>

              <div className="relative flex flex-1 flex-col p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Icon circle */}
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${theme.iconBg} text-xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      {theme.emoji}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        {normalizeAssessmentCategoryForDisplay(assessment.category, assessment.code)}
                      </p>
                      <p className={`text-[10px] font-mono font-semibold ${theme.iconText}`}>
                        {normalizeAssessmentCodeForDisplay(assessment.code)}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    completed
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : inProgress
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                        : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      completed ? "bg-emerald-500" : inProgress ? "bg-amber-500 animate-pulse" : "bg-blue-500 animate-pulse"
                    }`} />
                    {completed ? "Completed" : inProgress ? "In Progress" : "Available"}
                  </span>
                </div>

                {/* Name */}
                <h3 className="mt-4 text-[1.125rem] font-black leading-snug text-slate-900 transition-colors duration-200 group-hover:text-slate-800">
                  {assessment.name}
                </h3>

                {/* Summary */}
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{assessment.summary}</p>

                {/* Divider */}
                <div className="my-4 h-px bg-slate-100" />

                {/* Meta row */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">📋</span>
                    <span><strong className="font-bold text-slate-700">{qCount || "—"}</strong> Questions</span>
                  </span>
                  {completed && assessment.attempt?.completedAt && (
                    <span className="text-[10px] text-slate-400">
                      Done {new Date(assessment.attempt.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  {inProgress && assessment.attempt && (
                    <span className="text-[10px] font-semibold text-amber-600">
                      {assessment.attempt.answeredCount}/{assessment.attempt.totalQuestions} answered
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div className="mt-4 flex gap-2.5">
                  {completed ? (
                    <>
                      <button
                        onClick={() => openReport(assessment.code, assessment.attempt?.id)}
                        className={`flex-1 rounded-xl bg-gradient-to-br ${theme.accentClass} px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-110 hover:shadow-md active:scale-95`}
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => void openCheckout(assessment.code)}
                        disabled={startingCode === assessment.code}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {startingCode === assessment.code ? "Starting…" : "Retake Test"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (inProgress) { void startTestWithPayment(assessment.code); return; }
                        void openCheckout(assessment.code);
                      }}
                      disabled={startingCode === assessment.code}
                      className="flex-1 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-600 hover:to-blue-800 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {inProgress ? "▶ Resume Test" : startingCode === assessment.code ? "Starting…" : "▶ Take Test"}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        const infoCode = normalizeAssessmentCodeForDisplay(assessment.code);
                        window.open(`/whitelabel/${slug}/student/assessments/${infoCode}/info`, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95"
                    title="Learn more"
                  >
                    Info ↗
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {data.assessments.length === 0 && (
          <p className="col-span-full rounded-xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-600">
            No assessments available at the moment.
          </p>
        )}
      </div>

      {checkoutAssessmentCode && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-900">Checkout before starting test</h3>
            <p className="mt-1 text-sm text-slate-600">Apply coupon if you have one, then complete payment to start the assessment.</p>

            <div className="mt-4 flex gap-2">
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={() => void fetchPricing(checkoutAssessmentCode, couponCode)}
                disabled={pricingLoading || checkoutLoading}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
              >
                {pricingLoading ? "Applying..." : "Apply"}
              </button>
            </div>

            {pricingError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {pricingError}
              </div>
            ) : null}

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">Base amount</span><span className="font-semibold">₹{(pricing?.assessment.basePrice ?? 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Discount</span><span className="font-semibold text-emerald-700">- ₹{(pricing?.discountAmount ?? 0).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">GST</span><span className="font-semibold">₹{(pricing?.gstAmount ?? 0).toFixed(2)}</span></div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-base">
                <span className="font-bold text-slate-900">Total payable</span>
                <span className="font-bold text-blue-700">₹{Math.round(pricing?.finalAmount ?? 0)}</span>
              </div>
              <p className="pt-1 text-xs text-slate-500">* Final amount is rounded off to nearest integer.</p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={closeCheckout}
                disabled={checkoutLoading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleProceedToPay()}
                disabled={checkoutLoading || pricingLoading || !pricing}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-700 disabled:opacity-60"
              >
                {checkoutLoading ? "Processing..." : (pricing?.finalAmount || 0) <= 0 ? "Start Test" : "Pay & Start"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
