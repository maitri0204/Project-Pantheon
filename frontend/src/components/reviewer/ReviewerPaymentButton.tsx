"use client";

import { useEffect, useState } from "react";

import { apiRequest, getStoredAuth } from "@/lib/api";

type ReviewerOrderResponse = {
  keyId: string;
  order: { id: string; amount: number; currency: string };
  amount: number;
  currency: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const REVIEWER_EMAIL = "reviewer@admitra.io";

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

export default function ReviewerPaymentButton() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getStoredAuth();
    setVisible(Boolean(auth && auth.user.email === REVIEWER_EMAIL && auth.user.role === "REVIEWER"));
  }, []);

  const handleClick = async () => {
    const auth = getStoredAuth();
    if (!auth || auth.user.email !== REVIEWER_EMAIL || auth.user.role !== "REVIEWER") {
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest<ReviewerOrderResponse>(
        "/platform/reviewer/payment/order",
        { method: "POST" },
        auth.token
      );

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        window.alert("Unable to load payment gateway. Please try again.");
        return;
      }

      const razorpay = new window.Razorpay({
        key: response.keyId,
        amount: response.order.amount,
        currency: response.order.currency,
        name: "Assessment Center",
        description: "Reviewer payment",
        order_id: response.order.id,
        prefill: {
          name: `${auth.user.firstName} ${auth.user.lastName}`.trim(),
          email: auth.user.email,
        },
        handler: async (paymentResult: Record<string, string>) => {
          try {
            await apiRequest(
              "/platform/reviewer/payment/verify",
              {
                method: "POST",
                body: JSON.stringify({
                  razorpay_payment_id: paymentResult.razorpay_payment_id,
                  razorpay_order_id: paymentResult.razorpay_order_id,
                  razorpay_signature: paymentResult.razorpay_signature,
                }),
              },
              auth.token
            );
            window.alert("Payment completed successfully.");
          } catch (error) {
            window.alert(error instanceof Error ? error.message : "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      razorpay.open();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="mt-8 rounded-3xl border border-blue-200 bg-white/90 p-5 shadow-lg backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Reviewer Access</p>
      <h3 className="mt-2 text-2xl font-black text-slate-950">Make a payment</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Use the reviewer account payment button to open Razorpay and complete the transaction.
      </p>

      <button
        onClick={handleClick}
        disabled={loading}
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Opening..." : "Make a Payment"}
      </button>
    </div>
  );
}
