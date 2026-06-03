"use client";

import {
  HorizontalBarChart,
  PieChartVisual,
  VerticalBarChart,
} from "@/components/orgTestDashboard/shared/OrgDashboardCharts";
import {
  OrgDashboardHeader,
  RecentAttemptsList,
  StatCard,
  type OrgDashboardProps,
} from "@/components/orgTestDashboard/shared/OrgDashboardLayout";

const STYLE_COLORS: Record<string, string> = {
  K: "bg-rose-600",
  S: "bg-pink-500",
  E: "bg-fuchsia-500",
  P: "bg-violet-500",
  J: "bg-red-500",
};

const STYLE_NAMES: Record<string, string> = {
  K: "King",
  S: "Servant",
  E: "Elder",
  P: "Prince",
  J: "Joker",
};

export default function LitmusOrgDashboard({ data, studentsPath }: OrgDashboardProps) {
  const { summary, distributions, dimensionAverages, recentAttempts } = data;

  const styleBars = dimensionAverages.map((d) => ({
    label: STYLE_NAMES[d.key] || d.label,
    value: d.value,
    max: d.max ?? 100,
    suffix: "%",
    color: STYLE_COLORS[d.key] || "bg-rose-500",
  }));

  return (
    <div className="space-y-6">
      <OrgDashboardHeader
        title="Litmus Test — Parenting Style Profile"
        subtitle="Understand the dominant parenting styles (K/S/E/P/J) among parents in your organization."
        summaryLine={`${summary.uniqueStudents} parent respondents · Leading style: ${summary.metricValue ?? "—"}`}
        studentsPath={studentsPath}
        accentClass="from-rose-600 to-pink-600"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Dominant Style" value={summary.metricValue ?? "—"} />
        <StatCard label="Parents Assessed" value={summary.uniqueStudents} />
        <StatCard label="Completed Tests" value={summary.totalAttempts} />
        <StatCard label="Style Variants" value={distributions.length} sub="Observed in cohort" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6">
          <PieChartVisual
            title="Parenting Style Distribution"
            slices={distributions.map((d) => ({ label: d.label, value: d.count }))}
          />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <VerticalBarChart
            title="Average style strength (%)"
            items={styleBars.map((b) => ({
              label: b.label,
              value: b.value,
              max: b.max,
              suffix: b.suffix,
              color: b.color,
            }))}
            maxHeight={150}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <HorizontalBarChart
          title="Style Score Breakdown"
          items={styleBars}
          barClass="bg-rose-500"
        />
      </div>

      <RecentAttemptsList
        studentsPath={studentsPath}
        attempts={recentAttempts}
        renderMeta={(row) => `Style: ${row.resultLabel}${row.resultDetail ? ` · ${row.resultDetail}` : ""}`}
      />
    </div>
  );
}
