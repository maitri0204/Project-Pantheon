"use client";

import {
  HorizontalBarChart,
  PieChartVisual,
  TypeFrequencyGrid,
} from "@/components/orgTestDashboard/shared/OrgDashboardCharts";
import {
  OrgDashboardHeader,
  RecentAttemptsList,
  StatCard,
  type OrgDashboardProps,
} from "@/components/orgTestDashboard/shared/OrgDashboardLayout";

const MBTI_PAIRS = [
  { pair: "E / I", keys: ["E", "I"], labels: ["Extraversion", "Introversion"] },
  { pair: "S / N", keys: ["S", "N"], labels: ["Sensing", "Intuition"] },
  { pair: "T / F", keys: ["T", "F"], labels: ["Thinking", "Feeling"] },
  { pair: "J / P", keys: ["J", "P"], labels: ["Judging", "Perceiving"] },
];

export default function CareerCompassOrgDashboard({ data, studentsPath }: OrgDashboardProps) {
  const { summary, distributions, dimensionAverages, recentAttempts } = data;

  const dimensionBars = MBTI_PAIRS.map(({ pair, keys, labels }) => {
    const a = dimensionAverages.find((d) => d.key === keys[0])?.value ?? 50;
    const b = dimensionAverages.find((d) => d.key === keys[1])?.value ?? 50;
    return {
      label: `${labels[0]} vs ${labels[1]}`,
      value: Math.max(a, b),
      sub: `${keys[a >= b ? 0 : 1]} tendency ${Math.max(a, b)}%`,
      color: "bg-emerald-500",
    };
  });

  return (
    <div className="min-w-0 space-y-6">
      <OrgDashboardHeader
        title="Career Compass - Personality Type Analytics"
        subtitle="MBTI-style personality distribution and dimension tendencies across your student cohort."
        summaryLine={`${summary.uniqueStudents} students · Most common type: ${summary.metricValue ?? "-"}`}
        studentsPath={studentsPath}
        accentClass="from-emerald-600 to-teal-600"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Most Common Type" value={summary.metricValue ?? "-"} sub={summary.metricSub} />
        <StatCard label="Unique Types" value={distributions.length} sub="Observed in org" />
        <StatCard label="Students" value={summary.uniqueStudents} />
        <StatCard label="Assessments" value={summary.totalAttempts} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <PieChartVisual
            title="Personality Type Mix"
            slices={distributions.slice(0, 10).map((d) => ({ label: d.label, value: d.count }))}
          />
        </div>
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6">
          <TypeFrequencyGrid
            title="Type Frequency (16 Types)"
            items={distributions.map((d) => ({ label: d.label, count: d.count }))}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <HorizontalBarChart
          title="Dimension Tendencies (Org Average)"
          items={dimensionBars.map((d) => ({ label: d.label, value: d.value, color: d.color }))}
          barClass="bg-emerald-500"
        />
      </div>

      <RecentAttemptsList
        studentsPath={studentsPath}
        attempts={recentAttempts}
        renderMeta={(row) => `Type ${row.resultLabel}`}
      />
    </div>
  );
}
