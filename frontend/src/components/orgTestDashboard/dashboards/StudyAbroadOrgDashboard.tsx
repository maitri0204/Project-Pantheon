"use client";

import { bandFromPercentage, bandMeta } from "@/lib/studyAbroad/assessmentData";
import {
  DonutChart,
  HorizontalBarChart,
  PieChartVisual,
} from "@/components/orgTestDashboard/shared/OrgDashboardCharts";
import {
  OrgDashboardHeader,
  RecentAttemptsList,
  StatCard,
  type OrgDashboardProps,
} from "@/components/orgTestDashboard/shared/OrgDashboardLayout";

export default function StudyAbroadOrgDashboard({ data, studentsPath }: OrgDashboardProps) {
  const { summary, distributions, dimensionAverages, recentAttempts } = data;
  const withPct = data.allAttempts.filter((r) => Number.isFinite(r.percentage));
  const avgPct = withPct.length
    ? Math.round(withPct.reduce((s, r) => s + (r.percentage ?? 0), 0) / withPct.length)
    : 0;
  const band = bandFromPercentage(avgPct);
  const meta = bandMeta(band);

  const sortedDims = [...dimensionAverages].sort((a, b) => b.value - a.value);
  const strengths = sortedDims.slice(0, 3);
  const gaps = [...dimensionAverages].sort((a, b) => a.value - b.value).slice(0, 3);

  return (
    <div className="min-w-0 space-y-6">
      <OrgDashboardHeader
        title="Study Abroad Readiness - Organization Overview"
        subtitle="Track 12-dimension readiness across your cohort: language, academics, finances, visa, culture, and more."
        summaryLine={`${summary.uniqueStudents} students · ${summary.totalAttempts} completed attempts · Org avg ${summary.metricValue ?? "-"}`}
        studentsPath={studentsPath}
        accentClass="from-sky-600 to-indigo-600"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avg Readiness Score" value={summary.metricValue ?? "-"} sub={summary.metricSub} />
        <StatCard label="Avg Readiness %" value={`${avgPct}%`} sub={band} />
        <StatCard label="Students Assessed" value={summary.uniqueStudents} sub="Unique learners" />
        <StatCard label="Total Attempts" value={summary.totalAttempts} sub="Completed assessments" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6 flex flex-col items-center">
          <h2 className="text-base font-semibold text-black mb-4 w-full text-left">Org Avg Readiness</h2>
          <DonutChart percentage={avgPct} stroke="#0ea5e9" centerLabel="Avg Ready" />
          <div className={`mt-4 text-center px-4 py-2 rounded-xl border ${meta.border} ${meta.bg}`}>
            <p className={`text-sm font-bold ${meta.colorClass}`}>{band}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
          <HorizontalBarChart
            title="12 Readiness Dimensions (Org Average)"
            items={dimensionAverages.map((d) => ({
              label: d.label,
              value: d.value,
              color: "bg-sky-400",
            }))}
            barClass="bg-sky-400"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <PieChartVisual
            title="Readiness Band Distribution"
            slices={distributions.map((d) => ({ label: d.label, value: d.count }))}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-emerald-800 mb-3">Top Strengths (Avg)</h3>
            {strengths.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-black truncate">{s.label}</p>
                  <p className="text-xs text-emerald-600 font-bold">{s.value}%</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-rose-800 mb-3">Needs Attention (Avg)</h3>
            {gaps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-black truncate">{s.label}</p>
                  <p className="text-xs text-rose-600 font-bold">{s.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RecentAttemptsList
        studentsPath={studentsPath}
        attempts={recentAttempts}
        renderMeta={(row) => `${row.resultLabel} · ${row.resultDetail ?? ""}`}
      />
    </div>
  );
}
