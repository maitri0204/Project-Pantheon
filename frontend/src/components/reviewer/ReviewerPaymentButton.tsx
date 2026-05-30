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

  useEffect(() => {
    const auth = getStoredAuth();
    setVisible(Boolean(auth && auth.user.email === REVIEWER_EMAIL && auth.user.role === "REVIEWER"));
  }, []);

  if (!visible) return null;

  return (
    <div className="mt-8 rounded-3xl border border-blue-200 bg-white/90 p-5 shadow-lg backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Reviewer Access</p>
      <h3 className="mt-2 text-2xl font-black text-slate-950">Make a payment</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">Use the reviewer account to open the payment flow on the payment page.</p>

      <a
        href="/reviewer/payment"
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-700"
      >
        Make a Payment
      </a>
    </div>
  );
}
