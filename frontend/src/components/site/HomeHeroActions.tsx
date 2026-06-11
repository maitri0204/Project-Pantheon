"use client";

import { useEffect, useState } from "react";
import { getStoredAuth } from "@/lib/api";
import { STUDENT_REGISTER_URL } from "@/lib/studentRegisterUrl";

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
        href={STUDENT_REGISTER_URL}
        className="shine glow-pulse inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5"
      >
        Register free
        <span aria-hidden>→</span>
      </a>
      <a
        href="/login"
        className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-white/90 px-7 py-3.5 text-base font-semibold text-blue-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50"
      >
        Login
      </a>
    </div>
  );
}
