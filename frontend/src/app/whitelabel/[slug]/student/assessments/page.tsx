"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { apiRequest, getStoredAuth } from "@/lib/api";

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

export default function StudentAssessmentsPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const auth = useMemo(() => getStoredAuth(), []);

  const [loading, setLoading] = useState(true);
  const [startingCode, setStartingCode] = useState<string | null>(null);
  const [data, setData] = useState<StudentAssessmentsResponse>({ assessments: [] });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checkoutAssessmentCode, setCheckoutAssessmentCode] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [pricing, setPricing] = useState<AssessmentPricingResponse | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
    try {
      const query = enteredCoupon?.trim() ? `?couponCode=${encodeURIComponent(enteredCoupon.trim())}` : "";
      const response = await apiRequest<AssessmentPricingResponse>(
        `/platform/student/assessments/${code}/pricing${query}`,
        {},
        auth.token
      );
      setPricing(response);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to calculate price");
    } finally {
      setPricingLoading(false);
    }
  };

  const openCheckout = async (code: string) => {
    setCheckoutAssessmentCode(code);
    setCouponCode("");
    setPricing(null);
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
    if (!attemptId) return;
    router.push(`/whitelabel/${slug}/student/assessments/${assessmentCode}/result?attemptId=${attemptId}`);
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
        {data.assessments.map((assessment) => {
          const completed = assessment.attempt?.status === "COMPLETED";
          const inProgress = assessment.attempt?.status === "IN_PROGRESS";
          const canViewReport = completed;

          return (
            <div key={assessment._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{normalizeAssessmentCategoryForDisplay(assessment.category, assessment.code)}</p>
                  <h3 className="text-xl font-bold text-slate-900">{assessment.name}</h3>
                  <p className="mt-1 text-xs font-mono text-slate-500">{normalizeAssessmentCodeForDisplay(assessment.code)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${completed ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                  {completed ? "Completed" : "Available"}
                </span>
              </div>

              <p className="mt-3 min-h-[42px] text-sm text-slate-600">{assessment.summary}</p>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Questions</span>
                <span className="font-bold text-slate-900">{assessment.questionCount || assessment.attempt?.totalQuestions || "—"}</span>
              </div>

              <div className="mt-4 flex gap-3">
                {assessment.code === "ADVERSITY_TEST" && completed ? (
                  <>
                    <button
                      onClick={() => openReport(assessment.code, assessment.attempt?.id)}
                      className="flex-1 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(37,99,235,0.75)] transition hover:from-blue-700 hover:to-blue-800"
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => void openCheckout(assessment.code)}
                      disabled={startingCode === assessment.code}
                      className="flex-1 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {startingCode === assessment.code ? "Starting…" : "Retake Test"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (canViewReport) {
                        openReport(assessment.code, assessment.attempt?.id);
                        return;
                      }
                      if (inProgress) {
                        void startTestWithPayment(assessment.code);
                        return;
                      }
                      void openCheckout(assessment.code);
                    }}
                    disabled={(!canViewReport && completed) || startingCode === assessment.code}
                    className="flex-1 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_-10px_rgba(37,99,235,0.75)] transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {canViewReport ? "View Report" : completed ? "Already Completed" : inProgress ? "Resume Test" : startingCode === assessment.code ? "Starting…" : "Take Test"}
                  </button>
                )}

                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const infoCode = normalizeAssessmentCodeForDisplay(assessment.code);
                      window.open(`/whitelabel/${slug}/student/assessments/${infoCode}/info`, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Know More
                </button>
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
