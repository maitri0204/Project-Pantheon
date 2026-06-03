"use client";

import { motion } from "framer-motion";

interface AnalyticsCardProps {
  label: string;
  value: string;
  helper: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

export function AnalyticsCard({ label, value, helper, change, icon: Icon, accent }: AnalyticsCardProps) {
  const isPositive = change.startsWith("+") || change === "On track";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-[0_2px_16px_rgba(15,23,42,0.05)] transition-shadow hover:shadow-[0_16px_48px_rgba(14,165,233,0.11)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">{label}</p>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-[12px] leading-tight text-slate-600">{helper}</p>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isPositive ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-600"
          }`}
        >
          {change}
        </span>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-[3px] w-0 rounded-full bg-gradient-to-r transition-all duration-500 group-hover:w-full ${accent}`}
      />
    </motion.div>
  );
}
