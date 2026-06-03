"use client";

import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

import { ChartCard } from "@/components/orgTestDashboard/adversity/ChartCard";
import { DashboardTable } from "@/components/orgTestDashboard/adversity/DashboardTable";
import { EmptyState } from "@/components/orgTestDashboard/adversity/EmptyState";
import { PieRiskChart } from "@/components/orgTestDashboard/adversity/PieRiskChart";
import { useAdversityAdminOverview } from "@/components/orgTestDashboard/dashboards/useAdversityAdminOverview";
import {
  OrgDashboardEmpty,
  OrgDashboardLoading,
  StatCard,
} from "@/components/orgTestDashboard/shared/OrgDashboardLayout";
import { getStoredAuth } from "@/lib/api";

type DashboardStudentRow = {
  id: string;
  name: string;
  className: string;
  aqScore: number;
  trend: "Improving" | "Stable" | "Declining";
};

type AdversityOrgDashboardProps = {
  studentsPath: string;
  loginPath: string;
};

export default function AdversityOrgDashboard({ studentsPath, loginPath }: AdversityOrgDashboardProps) {
  const { loading, overview, error } = useAdversityAdminOverview(loginPath);
  const auth = getStoredAuth();
  const adminFirstName = auth?.user?.firstName?.trim() || "Admin";

  const orgBase = studentsPath.replace(/\/users$/, "");
  const assessmentsPath = `${orgBase}/assessments`;

  if (loading) {
    return <OrgDashboardLoading />;
  }

  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>;
  }

  if (!overview || overview.overview.totalAttempts === 0) {
    return (
      <OrgDashboardEmpty
        title="Adversity Quotient (AQ) — Command Centre"
        subtitle="CORE dimension analytics appear after students complete the AQ assessment."
        assessmentName="Adversity Quotient Assessment"
        studentsPath={studentsPath}
        accentClass="from-sky-500 to-blue-500"
      />
    );
  }

  const adminDistribution = [
    { name: "Exceptional", value: overview.levelDistribution.Exceptional, fill: "#10b981" },
    { name: "Strong", value: overview.levelDistribution.Strong, fill: "#0ea5e9" },
    { name: "Moderate", value: overview.levelDistribution.Moderate, fill: "#f59e0b" },
    { name: "Developing", value: overview.levelDistribution.Developing, fill: "#f43f5e" },
  ];

  const studentsFull: DashboardStudentRow[] = overview.students.map((student) => {
    const trend =
      student.latestScore > student.avgScore
        ? "Improving"
        : student.latestScore < student.avgScore
          ? "Declining"
          : "Stable";

    return {
      id: student.studentId,
      name: student.name,
      className: "All cohorts",
      aqScore: student.latestScore,
      trend,
    };
  });

  const hasDistribution = adminDistribution.some((d) => d.value > 0);
  const hasStudents = studentsFull.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black">Adversity Quotient Dashboard</h1>
          <p className="text-sm text-black/70 mt-1">
            Good morning, {adminFirstName} — live AQ assessment activity for your organization.
          </p>
        </div>
        <div className="hidden sm:flex">
          <Link
            href={studentsPath}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-black shadow-sm transition hover:border-sky-200 hover:bg-sky-50"
          >
            <Download className="h-4 w-4" />
            Student Reports
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Unique Students"
          value={overview.overview.uniqueStudentCount}
          sub={`${overview.overview.totalAttempts} completed attempts`}
        />
        <StatCard
          label="Average AQ"
          value={overview.overview.avgScore}
          sub={`Best ${overview.overview.bestScore} · Lowest ${overview.overview.worstScore}`}
        />
        <StatCard
          label="Reports Ready"
          value={overview.reportsTotal}
          sub="Completed assessments with reports"
        />
        <StatCard
          label="Assessments Live"
          value={1}
          sub="Adversity Quotient published"
        />
      </div>

      <ChartCard title="AQ distribution" description="Current cohort split by resilience band.">
        {hasDistribution ? (
          <PieRiskChart data={adminDistribution} />
        ) : (
          <EmptyState
            variant="analytics"
            title="No distribution data"
            description="AQ band distribution will appear once students complete assessments."
            compact
          />
        )}
      </ChartCard>

      <ChartCard
        title="Recent students"
        description="Latest activity across cohorts."
        noPad
        action={
          <Link href={studentsPath} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {hasStudents ? (
          <DashboardTable
            columns={[
              {
                header: "Student",
                render: (row) => (
                  <Link href={`${studentsPath}/${row.id}`} className="group flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-bold text-white">
                      {row.name[0]}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-sky-600">{row.name}</p>
                  </Link>
                ),
              },
              { header: "Cohort", render: (row) => <span>{row.className}</span> },
              {
                header: "AQ Score",
                render: (row) => (
                  <span
                    className={`font-bold ${
                      row.aqScore >= 75 ? "text-emerald-600" : row.aqScore >= 60 ? "text-sky-600" : "text-rose-500"
                    }`}
                  >
                    {row.aqScore}
                  </span>
                ),
              },
              {
                header: "Trend",
                render: (row) => (
                  <span
                    className={`text-sm font-medium ${
                      row.trend === "Improving"
                        ? "text-emerald-600"
                        : row.trend === "Declining"
                          ? "text-rose-500"
                          : "text-slate-500"
                    }`}
                  >
                    {row.trend === "Improving" ? "↑" : row.trend === "Declining" ? "↓" : "→"} {row.trend}
                  </span>
                ),
              },
            ]}
            data={studentsFull.slice(0, 6)}
            emptyMessage="No students found."
          />
        ) : (
          <div className="px-5 pb-5">
            <EmptyState
              variant="students"
              title="No students yet"
              description="Student records will appear here once accounts complete the AQ assessment."
              compact
            />
          </div>
        )}
      </ChartCard>

      <ChartCard
        title="Active assessments"
        description="Published assessments at a glance."
        action={
          <Link href={assessmentsPath} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-black">Adversity Quotient Assessment</p>
              <p className="text-xs text-black/60">CORE resilience · Control, Ownership, Reach, Endurance</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                Published
              </span>
              <span className="text-xs font-medium text-black/60">
                {overview.overview.totalAttempts.toLocaleString()} attempts
              </span>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
