"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Users, ClipboardCheck, FileText, Activity, GraduationCap, TrendingUp } from "lucide-react";

import { useAcademicCareerAdminOverview } from "@/components/orgTestDashboard/dashboards/useAcademicCareerAdminOverview";
import { OrgDashboardEmpty, OrgDashboardLoading } from "@/components/orgTestDashboard/shared/OrgDashboardLayout";

const STREAM_COLORS: Record<string, string> = {
  Science: "#0ea5e9",
  Commerce: "#f59e0b",
  Arts: "#6366f1",
  Hybrid: "#10b981",
};

/** True when the chart container is wide enough for single-line axis labels. */
function useChartWideLayout(
  containerRef: React.RefObject<HTMLElement | null>,
  wideAtOrAbovePx = 620,
) {
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const update = (width: number) => setIsWide(width >= wideAtOrAbovePx);
    update(element.getBoundingClientRect().width);

    const observer = new ResizeObserver(([entry]) => {
      update(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef, wideAtOrAbovePx]);

  return isWide;
}

/** Split long domain names into two balanced lines for compact chart layouts. */
function splitRadarLabel(label: string): string[] {
  const ampersandSep = " & ";
  const ampersandIdx = label.lastIndexOf(ampersandSep);
  if (ampersandIdx > 0 && ampersandIdx < label.length - ampersandSep.length) {
    return [
      label.slice(0, ampersandIdx + 1).trim(),
      label.slice(ampersandIdx + ampersandSep.length).trim(),
    ];
  }

  const commaSep = ", ";
  const commaIdx = label.indexOf(commaSep);
  if (commaIdx > 0) {
    const nextComma = label.indexOf(commaSep, commaIdx + commaSep.length);
    if (nextComma > 0) {
      return [
        label.slice(0, nextComma + 1).trim(),
        label.slice(nextComma + commaSep.length).trim(),
      ];
    }
    return [label.slice(0, commaIdx + 1).trim(), label.slice(commaIdx + commaSep.length).trim()];
  }

  const words = label.split(/\s+/).filter(Boolean);
  if (words.length <= 3) return [label];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

type PolarTickProps = {
  x?: number;
  y?: number;
  payload?: { value: string };
  textAnchor?: string;
  isWide: boolean;
};

function RadarPolarAngleTick({ x, y, payload, textAnchor, isWide }: PolarTickProps) {
  if (typeof x !== "number" || typeof y !== "number" || !payload?.value) return null;

  const lines = isWide ? [payload.value] : splitRadarLabel(payload.value);
  const fontSize = isWide ? 12 : 10;
  const lineHeight = fontSize + 4;

  return (
    <text
      x={x}
      y={y}
      fill="#000000"
      fontSize={fontSize}
      fontWeight={600}
      textAnchor={textAnchor as "start" | "middle" | "end" | "inherit" | undefined}
    >
      {lines.map((line, index) => (
        <tspan key={`${payload.value}-${index}`} x={x} dy={index === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

type CategoryTickProps = {
  x?: number;
  y?: number;
  payload?: { value: string };
  isWide: boolean;
  axisWidth: number;
};

function DomainCategoryTick({ x, y, payload, isWide, axisWidth }: CategoryTickProps) {
  if (typeof y !== "number" || !payload?.value) return null;

  const labelX = Math.max((x ?? axisWidth) - axisWidth + 4, 0);

  return (
    <foreignObject x={labelX} y={y - 14} width={axisWidth - 8} height={36}>
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className={`text-[10px] leading-snug text-black text-right pr-1 ${
          isWide ? "whitespace-nowrap" : "whitespace-normal break-words line-clamp-2"
        }`}
      >
        {payload.value}
      </div>
    </foreignObject>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderStreamLabel = (props: any) => {
  const { x, y, value, payload } = props;
  if (typeof x !== "number" || typeof y !== "number") return null;

  return (
    <text x={x} y={y} fill="#000000" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${payload.stream} (${value})`}
    </text>
  );
};

const STAT_CONFIGS = [
  { accent: "from-sky-500 to-blue-500", chip: "text-sky-600", ring: "ring-sky-200/80" },
  { accent: "from-violet-500 to-purple-500", chip: "text-violet-600", ring: "ring-violet-200/80" },
  { accent: "from-emerald-500 to-teal-500", chip: "text-emerald-600", ring: "ring-emerald-200/80" },
  { accent: "from-amber-500 to-orange-500", chip: "text-amber-600", ring: "ring-amber-200/80" },
  { accent: "from-rose-500 to-pink-500", chip: "text-rose-600", ring: "ring-rose-200/80" },
];

function StatCard({
  title,
  value,
  subtitle,
  icon,
  index,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  index: number;
}) {
  const cfg = STAT_CONFIGS[index % STAT_CONFIGS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md ${cfg.ring}`}
    >
      <div className={`pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r ${cfg.accent} opacity-70 transition-all duration-300 group-hover:h-0.5`} />
      <div className="relative mb-3 flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-black">{title}</p>
        <div className={`rounded-xl border border-slate-200 bg-slate-50 p-2 ${cfg.chip}`}>{icon}</div>
      </div>
      <p className="relative text-2xl font-bold text-black">{value}</p>
      <p className="relative mt-1 text-xs text-black">{subtitle}</p>
    </motion.div>
  );
}

type AcademicCareerOrgDashboardProps = {
  studentsPath: string;
  loginPath: string;
  organizationSlug?: string;
};

export default function AcademicCareerOrgDashboard({
  studentsPath,
  loginPath,
  organizationSlug,
}: AcademicCareerOrgDashboardProps) {
  const radarChartRef = useRef<HTMLDivElement>(null);
  const domainChartRef = useRef<HTMLDivElement>(null);
  const isRadarWide = useChartWideLayout(radarChartRef, 620);
  const isDomainChartWide = useChartWideLayout(domainChartRef, 560);
  const domainAxisWidth = isDomainChartWide ? 190 : 220;
  const radarMargin = isRadarWide
    ? { top: 36, right: 40, bottom: 36, left: 40 }
    : { top: 40, right: 80, bottom: 40, left: 80 };
  const radarOuterRadius = isRadarWide ? "68%" : "54%";

  const { loading, overview, error } = useAcademicCareerAdminOverview(loginPath, organizationSlug);

  const participationRate = useMemo(() => {
    if (!overview) return 0;
    const totalStudents = overview.totalRegisteredStudents || 1;
    const studentsWithReports = new Set(overview.recentReportsGenerated.map((item) => item.studentId)).size;
    return Math.round((studentsWithReports / totalStudents) * 100);
  }, [overview]);

  const streamDistribution = useMemo(
    () => overview?.streamRecommendationDistribution.filter((entry) => entry.count > 0) ?? [],
    [overview],
  );

  if (loading) {
    return <OrgDashboardLoading />;
  }

  if (error || !overview) {
    return (
      <div className="p-2">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          {error || "No analytics available."}
        </div>
      </div>
    );
  }

  if (overview.totalCompletedAssessments === 0) {
    return (
      <OrgDashboardEmpty
        title="Academic Career & Interest — Dashboard"
        subtitle="Real-time educational CRM analytics from student assessments (grades 8–10)."
        assessmentName="Academic Career & Interest Test"
        studentsPath={studentsPath}
        accentClass="from-violet-600 to-purple-600"
      />
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            AIM Dashboard
          </h1>
          <p className="text-sm text-black">Real-time educational CRM analytics from student assessments</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={studentsPath}
            className="text-sm font-medium text-violet-600 hover:underline"
          >
            View students →
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-emerald-500"
            />
            Live Data
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard index={0} title="Total Registered Students" value={overview.totalRegisteredStudents} subtitle="Active student records" icon={<Users size={16} />} />
        <StatCard index={1} title="Completed Assessments" value={overview.totalCompletedAssessments} subtitle="Total submitted attempts" icon={<ClipboardCheck size={16} />} />
        <StatCard index={2} title="Recent Reports" value={overview.recentReportsGenerated.length} subtitle="Latest generated reports" icon={<FileText size={16} />} />
        <StatCard index={3} title="Participation Rate" value={`${participationRate}%`} subtitle="Students with reports" icon={<Activity size={16} />} />
        <StatCard index={4} title="Top Domain" value={overview.topInterestDomains[0]?.domain ?? "N/A"} subtitle="Most common strongest domain" icon={<TrendingUp size={16} />} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="group relative xl:col-span-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-black">Assessment Participation Trends</h2>
              <p className="text-xs text-black">Students vs completed attempts</p>
            </div>
            <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-600">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={overview.assessmentParticipationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#000000" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#000000" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="registeredStudents" name="Registered Students" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }}>
                <LabelList dataKey="registeredStudents" position="top" fontSize={10} fill="#000000" />
              </Line>
              <Line type="monotone" dataKey="completedAssessments" name="Completed Assessments" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }}>
                <LabelList dataKey="completedAssessments" position="top" fontSize={10} fill="#000000" />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
          className="group relative xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="mb-4">
            <h2 className="text-sm font-bold text-black">Stream Distribution</h2>
            <p className="text-xs text-black">All attempts</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={streamDistribution}
                dataKey="count"
                nameKey="stream"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={3}
                label={renderStreamLabel}
                labelLine={false}
              >
                {streamDistribution.map((entry) => (
                  <Cell key={entry.stream} fill={STREAM_COLORS[entry.stream] ?? "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-black">Grade-wise Student Count</h2>
            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-500"><GraduationCap size={15} /></div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={overview.gradeWiseStudents}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="grade" tick={{ fontSize: 11, fill: "#000000" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#000000" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="count" fill="url(#gradeGrad)" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="count" position="top" fontSize={10} fill="#000000" />
              </Bar>
              <defs>
                <linearGradient id="gradeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          ref={domainChartRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-black">Top Interest Domains</h2>
            <span className="text-xs text-black">Strongest-domain counts</span>
          </div>
          <ResponsiveContainer width="100%" height={isDomainChartWide ? 260 : 300}>
            <BarChart
              data={overview.topInterestDomains}
              layout="vertical"
              margin={{ left: 8, right: 20, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#000000" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="domain"
                width={domainAxisWidth}
                axisLine={false}
                tickLine={false}
                tick={(props) => (
                  <DomainCategoryTick {...props} isWide={isDomainChartWide} axisWidth={domainAxisWidth} />
                )}
              />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="count" fill="url(#domainGrad)" radius={[0, 8, 8, 0]}>
                <LabelList dataKey="count" position="right" fontSize={10} />
              </Bar>
              <defs>
                <linearGradient id="domainGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <motion.div
          ref={radarChartRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-black">Grade Comparison Radar</h2>
            <span className="text-xs text-black">Domain intensity by grade</span>
          </div>
          <ResponsiveContainer width="100%" height={isRadarWide ? 380 : 420}>
            <RadarChart
              data={overview.gradeComparisonDomains.slice(0, 8)}
              margin={radarMargin}
              outerRadius={radarOuterRadius}
            >
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="domain"
                tick={(props) => <RadarPolarAngleTick {...props} isWide={isRadarWide} />}
              />
              <Radar name="Grade 8" dataKey="grade8" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.18} />
              <Radar name="Grade 9" dataKey="grade9" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.18} />
              <Radar name="Grade 10" dataKey="grade10" stroke="#6366f1" fill="#6366f1" fillOpacity={0.18} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-black">Stream Analytics by Grade</h2>
            <span className="text-xs text-black">Latest reports only</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={overview.streamAnalyticsByGrade}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="grade" tick={{ fontSize: 11, fill: "#000000" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#000000" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Science" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Commerce" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Arts" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Hybrid" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-3.5">
          <h2 className="text-sm font-bold text-black">Recent Assessment Activity</h2>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-black">Latest 10</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {["Student", "Grade", "Completed", "Top 3 Interests", "Strongest Domain", "Stream"].map((head) => (
                  <th key={head} className="whitespace-nowrap px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-black">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overview.recentAssessmentActivity.slice(0, 10).map((row, i) => {
                const streamColors: Record<string, string> = {
                  Science: "bg-sky-50 text-sky-700 border-sky-200",
                  Commerce: "bg-amber-50 text-amber-700 border-amber-200",
                  Arts: "bg-violet-50 text-violet-700 border-violet-200",
                  Hybrid: "bg-emerald-50 text-emerald-700 border-emerald-200",
                };
                const streamClass = streamColors[row.streamRecommendation] ?? "bg-slate-50 text-black border-slate-200";
                return (
                  <motion.tr
                    key={row.resultId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.85 + i * 0.04 }}
                    className="border-b border-slate-50 hover:bg-sky-50/40"
                  >
                    <td className="px-4 py-2.5">
                      <Link href={`${studentsPath}/${row.studentId}`} className="flex items-center gap-2.5 group">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-[10px] font-bold text-white">
                          {row.studentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-black group-hover:text-violet-700">{row.studentName}</p>
                          <p className="text-[11px] text-black">{row.studentEmail}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">{row.gradeLabel}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-black">{new Date(row.completedAt).toLocaleString()}</td>
                    <td className="px-4 py-2.5 min-w-[10rem] max-w-[14rem]">
                      <div className="flex flex-wrap gap-1">
                        {row.topInterests.slice(0, 3).map((interest) => (
                          <span
                            key={interest.code}
                            className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] leading-snug text-sky-700 xl:whitespace-nowrap whitespace-normal text-center"
                          >
                            {interest.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 min-w-[9rem] max-w-[12rem] text-[12px] font-medium text-black leading-snug xl:whitespace-nowrap whitespace-normal">
                      {row.strongestDomain}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${streamClass}`}>
                        {row.streamRecommendation}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
