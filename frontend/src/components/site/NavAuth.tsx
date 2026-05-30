"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredAuth } from "@/lib/api";

export default function NavAuth() {
  const [mounted, setMounted] = useState(false);
  const [isReviewer, setIsReviewer] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = getStoredAuth();
    setIsReviewer(Boolean(auth && auth.user?.role === "REVIEWER" && auth.user?.email === "reviewer@admitra.io"));
  }, []);

  if (mounted && isReviewer) return null;

  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/login" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
        Login
      </Link>
      <Link href="/register" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50">
        Register Organization
      </Link>
    </div>
  );
}
