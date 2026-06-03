"use client";

import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  FileText,
  FlaskConical,
  ShieldAlert,
  Users,
} from "lucide-react";

type EmptyVariant =
  | "default"
  | "assessments"
  | "analytics"
  | "students"
  | "reports"
  | "notifications"
  | "activity"
  | "risk"
  | "journal"
  | "psychometric"
  | "questions";

const VARIANT_CONFIG: Record<EmptyVariant, { icon: React.ReactNode; bg: string; iconColor: string }> = {
  default: {
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
    bg: "bg-sky-50",
    iconColor: "text-sky-500",
  },
  assessments: { icon: <ClipboardList className="h-7 w-7" />, bg: "bg-indigo-50", iconColor: "text-indigo-500" },
  analytics: { icon: <BarChart3 className="h-7 w-7" />, bg: "bg-sky-50", iconColor: "text-sky-500" },
  students: { icon: <Users className="h-7 w-7" />, bg: "bg-violet-50", iconColor: "text-violet-500" },
  reports: { icon: <FileText className="h-7 w-7" />, bg: "bg-emerald-50", iconColor: "text-emerald-500" },
  notifications: { icon: <Bell className="h-7 w-7" />, bg: "bg-amber-50", iconColor: "text-amber-500" },
  activity: { icon: <Activity className="h-7 w-7" />, bg: "bg-teal-50", iconColor: "text-teal-500" },
  risk: { icon: <ShieldAlert className="h-7 w-7" />, bg: "bg-rose-50", iconColor: "text-rose-400" },
  journal: { icon: <BookOpen className="h-7 w-7" />, bg: "bg-cyan-50", iconColor: "text-cyan-500" },
  psychometric: { icon: <FlaskConical className="h-7 w-7" />, bg: "bg-purple-50", iconColor: "text-purple-500" },
  questions: { icon: <ClipboardList className="h-7 w-7" />, bg: "bg-indigo-50", iconColor: "text-indigo-500" },
};

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: EmptyVariant;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
  compact = false,
}: EmptyStateProps) {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 px-6 text-center ${
        compact ? "py-10" : "py-16"
      }`}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${cfg.bg} ${cfg.iconColor}`}
      >
        {cfg.icon}
      </motion.div>
      <h3 className="mt-5 text-base font-semibold text-black">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-black/70">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          {actionLabel}
        </button>
      ) : null}
    </motion.div>
  );
}
