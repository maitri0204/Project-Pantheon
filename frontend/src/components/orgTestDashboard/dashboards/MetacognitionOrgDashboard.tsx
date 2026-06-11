"use client";

import {
  HorizontalBarChart,
  VerticalBarChart,
} from "@/components/orgTestDashboard/shared/OrgDashboardCharts";
import {
  OrgDashboardHeader,
  RecentAttemptsList,
  StatCard,
  type OrgDashboardProps,
} from "@/components/orgTestDashboard/shared/OrgDashboardLayout";

export default function MetacognitionOrgDashboard({ data, studentsPath }: OrgDashboardProps) {
  const { summary, dimensionAverages, recentAttempts } = data;
  const avgTotal = data.allAttempts.filter((r) => r.score != null).length
    ? Math.round(
        data.allAttempts.reduce((s, r) => s + (r.score ?? 0), 0) /
          data.allAttempts.filter((r) => r.score != null).length,
      )
    : 0;

  const domainItems = dimensionAverages.map((d, i) => ({
    label: d.label.replace(/^Domain\s*/i, "D"),
    value: d.value,
    color: ["bg-cyan-600", "bg-sky-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500"][i % 5],
  }));

  return (
    <div className="min-w-0 space-y-6">
      <OrgDashboardHeader
        title="Thinking & Expression Skills - Domain Analytics"
        subtitle="Track thinking, learning, and expression domain scores across completed metacognition assessments."
        summaryLine={`${summary.uniqueStudents} students · Avg total score ${avgTotal} pts`}
        studentsPath={studentsPath}
        accentClass="from-cyan-600 to-blue-600"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avg Total Score" value={summary.metricValue ?? avgTotal} sub="Across all domains" />
        <StatCard label="Domains Tracked" value={dimensionAverages.length} />
        <StatCard label="Students" value={summary.uniqueStudents} />
        <StatCard label="Attempts" value={summary.totalAttempts} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-cyan-100 shadow-sm p-6">
          <VerticalBarChart
            title="Domain Scores (Org Average)"
            items={domainItems}
            maxHeight={180}
          />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <HorizontalBarChart
            title="Domain Performance Comparison"
            items={dimensionAverages.map((d, i) => ({
              label: d.label,
              value: d.value,
              color: domainItems[i]?.color || "bg-cyan-500",
            }))}
            barClass="bg-cyan-500"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...dimensionAverages].sort((a, b) => b.value - a.value).slice(0, 3).map((d, i) => (
          <div key={d.key} className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-5">
            <p className="text-xs font-semibold text-cyan-800 uppercase">Strongest Domain #{i + 1}</p>
            <p className="text-lg font-bold text-black mt-1">{d.label}</p>
            <p className="text-2xl font-black text-cyan-700 mt-2">{d.value} pts</p>
          </div>
        ))}
      </div>

      <RecentAttemptsList
        studentsPath={studentsPath}
        attempts={recentAttempts}
        renderMeta={(row) => row.resultLabel}
      />
    </div>
  );
}
