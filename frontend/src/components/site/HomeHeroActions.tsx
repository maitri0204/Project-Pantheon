"use client";

import { useEffect, useState } from "react";
import { getStoredAuth } from "@/lib/api";

export default function HomeHeroActions() {
  const [mounted, setMounted] = useState(false);
  const [isReviewer, setIsReviewer] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = getStoredAuth();
    setIsReviewer(Boolean(auth && auth.user?.role === "REVIEWER" && auth.user?.email === "reviewer@admitra.io"));
  }, []);

  // Do not render the hero CTA when reviewer is logged in (prevents duplicate Make a Payment)
  if (mounted && isReviewer) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href="/login"
        className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:translate-y-[-1px]"
      >
        Enter dashboard
      </a>
      <a
        href="/signup"
        className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
      >
        Create account
      </a>
    </div>
  );
}
