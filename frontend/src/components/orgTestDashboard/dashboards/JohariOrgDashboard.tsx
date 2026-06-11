"use client";

import {
  HorizontalBarChart,
  JohariQuadrantGrid,
  PieChartVisual,
} from "@/components/orgTestDashboard/shared/OrgDashboardCharts";
import {
  OrgDashboardHeader,
  RecentAttemptsList,
  StatCard,
  type OrgDashboardProps,
} from "@/components/orgTestDashboard/shared/OrgDashboardLayout";

function getQuadrantValue(dimensionAverages: OrgDashboardProps["data"]["dimensionAverages"], key: string) {
  return dimensionAverages.find((d) => d.key === key)?.value ?? 0;
}

export default function JohariOrgDashboard({ data, studentsPath }: OrgDashboardProps) {
  const { summary, distributions, dimensionAverages, recentAttempts } = data;

  const open = getQuadrantValue(dimensionAverages, "open");
  const blind = getQuadrantValue(dimensionAverages, "blind");
  const hidden = getQuadrantValue(dimensionAverages, "hidden");
  const unknown = getQuadrantValue(dimensionAverages, "unknown");

  return (
    <div className="min-w-0 space-y-6">
      <OrgDashboardHeader
        title="CLEAR - Johari Window Self-Awareness Map"
        subtitle="Organization-wide view of open, blind, hidden, and unknown areas in student self-awareness."
        summaryLine={`${summary.uniqueStudents} students · Dominant quadrant: ${summary.metricValue ?? "-"}`}
        studentsPath={studentsPath}
        accentClass="from-indigo-600 to-blue-600"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Dominant Quadrant" value={summary.metricValue ?? "-"} />
        <StatCard label="Open Area (Avg)" value={`${open.toFixed(1)}%`} sub="Known to self & others" />
        <StatCard label="Blind Spot (Avg)" value={`${blind.toFixed(1)}%`} sub="Known to others only" />
        <StatCard label="Students" value={summary.uniqueStudents} sub={`${summary.totalAttempts} attempts`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-black mb-4">Quadrant Averages</h2>
          <JohariQuadrantGrid open={open} blind={blind} hidden={hidden} unknown={unknown} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <PieChartVisual
            title="Dominant Quadrant Distribution"
            slices={distributions.map((d) => ({ label: d.label, value: d.count }))}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <HorizontalBarChart
          title="Quadrant Comparison (Org Average %)"
          items={[
            { label: "Open Area", value: Math.round(open), color: "bg-emerald-500" },
            { label: "Blind Spot", value: Math.round(blind), color: "bg-amber-500" },
            { label: "Hidden Area", value: Math.round(hidden), color: "bg-sky-500" },
            { label: "Unknown", value: Math.round(unknown), color: "bg-violet-500" },
          ]}
        />
      </div>

      <RecentAttemptsList
        studentsPath={studentsPath}
        attempts={recentAttempts}
        renderMeta={(row) => `Quadrant: ${row.resultLabel}`}
      />
    </div>
  );
}
