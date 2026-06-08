"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import type { AssessmentAdminDashboardResponse } from "@/lib/dashboard/assessmentAdminDashboard";

export type OrgDashboardProps = {
  data: AssessmentAdminDashboardResponse;
  studentsPath: string;
};

export function OrgDashboardLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  );
}

export function OrgDashboardEmpty({
  title,
  subtitle,
  assessmentName,
  studentsPath,
  accentClass = "from-blue-600 to-cyan-500",
}: {
  title: string;
  subtitle: string;
  assessmentName: string;
  studentsPath: string;
  accentClass?: string;
}) {
  return (
    <div className="space-y-6">
      <OrgDashboardHeader title={title} subtitle={subtitle} accentClass={accentClass} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <div className={`mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br ${accentClass} flex items-center justify-center mb-4`}>
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-black">No assessment data yet</h2>
        <p className="text-sm text-black mt-2 max-w-xl mx-auto">
          When students complete {assessmentName}, organization analytics will appear here.
        </p>
        <Link href={studentsPath} className="inline-block mt-4 text-sm font-medium text-blue-600 hover:underline">
          Go to Students →
        </Link>
      </div>
    </div>
  );
}

export function OrgDashboardHeader({
  title,
  subtitle,
  studentsPath,
  summaryLine,
  accentClass = "from-blue-600 to-cyan-500",
}: {
  title: string;
  subtitle: string;
  studentsPath?: string;
  summaryLine?: string;
  accentClass?: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-r ${accentClass} p-6 text-white shadow-md`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-white/90 mt-1 max-w-2xl">{subtitle}</p>
          {summaryLine && <p className="text-sm text-white/80 mt-2">{summaryLine}</p>}
        </div>
        {studentsPath && (
          <Link
            href={studentsPath}
            className="inline-flex items-center self-start rounded-xl bg-white/15 border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25 transition-colors"
          >
            View all students →
          </Link>
        )}
      </div>
    </div>
  );
}

export function RecentAttemptsList({
  studentsPath,
  attempts,
  renderMeta,
}: {
  studentsPath: string;
  attempts: OrgDashboardProps["data"]["recentAttempts"];
  renderMeta?: (row: OrgDashboardProps["data"]["recentAttempts"][number]) => string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-black">Recent Completions</h2>
        <Link href={studentsPath} className="text-sm text-blue-600 font-medium hover:underline">
          All students
        </Link>
      </div>
      <div className="space-y-2">
        {attempts.length === 0 ? (
          <p className="text-sm text-black text-center py-6">No attempts yet.</p>
        ) : (
          attempts.slice(0, 8).map((row) => (
            <div key={row.attemptId} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">{row.studentName}</p>
                <p className="text-xs text-black">
                  {renderMeta ? renderMeta(row) : `${row.resultLabel}${row.resultDetail ? ` · ${row.resultDetail}` : ""}`}
                  {row.completedAt ? ` · ${new Date(row.completedAt).toLocaleDateString()}` : ""}
                </p>
              </div>
              <Link href={`${studentsPath}/${row.studentId}`} className="text-xs font-semibold text-blue-600 shrink-0 hover:underline">
                View Detail
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  className = "",
}: {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
      <p className="text-sm text-black">{label}</p>
      <p className="text-2xl font-bold text-black mt-1">{value}</p>
      {sub && <p className="text-xs text-black mt-1">{sub}</p>}
    </div>
  );
}
