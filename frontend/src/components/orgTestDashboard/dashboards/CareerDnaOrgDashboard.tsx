"use client";

import {
  HorizontalBarChart,
  PieChartVisual,
  SectionScoreCards,
} from "@/components/orgTestDashboard/shared/OrgDashboardCharts";
import {
  OrgDashboardHeader,
  RecentAttemptsList,
  StatCard,
  type OrgDashboardProps,
} from "@/components/orgTestDashboard/shared/OrgDashboardLayout";

export default function CareerDnaOrgDashboard({ data, studentsPath }: OrgDashboardProps) {
  const { summary, distributions, dimensionAverages, recentAttempts } = data;
  const topSection = [...dimensionAverages].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="min-w-0 space-y-6">
      <OrgDashboardHeader
        title="Career DNA Profiler - Multi-Section Overview"
        subtitle="Section-by-section completion and strength across personality, interests, aptitude, EQ, learning style, and more."
        summaryLine={`${summary.uniqueStudents} profiles · Leading section/type: ${summary.metricValue ?? "-"}`}
        studentsPath={studentsPath}
        accentClass="from-fuchsia-600 to-violet-600"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Top Profile Signal" value={summary.metricValue ?? "-"} sub={summary.metricSub} />
        <StatCard label="Sections Measured" value={dimensionAverages.length} />
        <StatCard label="Students" value={summary.uniqueStudents} />
        <StatCard label="Profiles Completed" value={summary.totalAttempts} />
      </div>

      <div className="bg-white rounded-2xl border border-fuchsia-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-black mb-4">Section Strength Cards</h2>
        <SectionScoreCards
          items={dimensionAverages.map((d) => ({ label: d.label, value: d.value }))}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <PieChartVisual
            title="Profile Type / Section Headlines"
            slices={distributions.slice(0, 8).map((d) => ({ label: d.label, value: d.count }))}
          />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <HorizontalBarChart
            title="Section Averages Ranked"
            items={dimensionAverages.map((d) => ({
              label: d.label,
              value: d.value,
              color: "bg-fuchsia-500",
            }))}
            barClass="bg-fuchsia-500"
          />
          {topSection && (
            <p className="mt-4 text-sm text-black">
              Strongest org-wide section: <span className="font-semibold text-fuchsia-700">{topSection.label}</span> at {topSection.value}%.
            </p>
          )}
        </div>
      </div>

      <RecentAttemptsList
        studentsPath={studentsPath}
        attempts={recentAttempts}
        renderMeta={(row) => `${row.resultLabel}${row.resultDetail ? ` · ${row.resultDetail}` : ""}`}
      />
    </div>
  );
}
