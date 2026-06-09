"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ChartCard } from "@/components/orgTestDashboard/adversity/ChartCard";
import { DashboardTable } from "@/components/orgTestDashboard/adversity/DashboardTable";
import { EmptyState } from "@/components/orgTestDashboard/adversity/EmptyState";
import { PieRiskChart } from "@/components/orgTestDashboard/adversity/PieRiskChart";
import {
  DonutChart,
  HorizontalBarChart,
  RadarChart,
  SectionScoreCards,
  TypeFrequencyGrid,
} from "@/components/orgTestDashboard/shared/OrgDashboardCharts";
import { ClearJohariOrgChart } from "@/components/orgTestDashboard/shared/ClearJohariOrgChart";
import { PersonalityAxisOverview } from "@/components/orgTestDashboard/shared/PersonalityAxisOverview";
import {
  formatCareerDnaResultLabel,
  formatCareerInterestCode,
  formatPersonalityType,
} from "@/lib/dashboard/displayLabels";
import {
  OrgDashboardEmpty,
  OrgDashboardLoading,
  StatCard,
} from "@/components/orgTestDashboard/shared/OrgDashboardLayout";
import { useAssessmentOrgDashboard } from "@/components/orgTestDashboard/useAssessmentOrgDashboard";
import {
  getTestDashboardUiConfig,
  type DashboardAudienceLabels,
} from "@/components/orgTestDashboard/testDashboardUiConfig";
import { bandFromPercentage, bandMeta } from "@/lib/studyAbroad/assessmentData";
import type { AssessmentAdminDashboardResponse } from "@/lib/dashboard/assessmentAdminDashboard";

type EnhancedOrgTestDashboardProps = {
  assessmentCode: string;
  studentsPath: string;
  loginPath: string;
  organizationSlug?: string;
};

type StudentRow = {
  id: string;
  name: string;
  grade: string;
  result: string;
  detail?: string;
};

function buildPieData(
  distributions: Array<{ label: string; count: number }>,
  colors: string[],
  formatLabel?: (label: string) => string,
) {
  return distributions
    .filter((d) => d.count > 0)
    .map((d, i) => ({
      name: formatLabel ? formatLabel(d.label) : d.label,
      value: d.count,
      fill: colors[i % colors.length],
    }));
}

function buildStudentRows(
  data: AssessmentAdminDashboardResponse,
  formatResult?: (label: string) => string,
): StudentRow[] {
  return data.students.slice(0, 8).map((row) => ({
    id: row.studentId,
    name: row.studentName,
    grade: row.grade || row.division || "—",
    result: formatResult ? formatResult(row.resultLabel) : row.resultLabel,
    detail: row.resultDetail,
  }));
}

function DistributionChart({
  distributions,
  colors,
  title,
  description,
  formatLabel,
}: {
  distributions: Array<{ label: string; count: number }>;
  colors: string[];
  title: string;
  description: string;
  formatLabel?: (label: string) => string;
}) {
  const pieData = buildPieData(distributions, colors, formatLabel);
  const hasData = pieData.length > 0;

  return (
    <ChartCard title={title} description={description}>
      {hasData ? (
        <PieRiskChart data={pieData} />
      ) : (
        <EmptyState
          variant="analytics"
          title="No distribution data"
          description="Charts will populate once assessments are completed."
          compact
        />
      )}
    </ChartCard>
  );
}

const DEFAULT_AUDIENCE: DashboardAudienceLabels = {
  singular: "Student",
  plural: "Students",
};

function RecentStudentsSection({
  data,
  studentsPath,
  resultLabel,
  hideResultColumn,
  formatResult,
  audience,
}: {
  data: AssessmentAdminDashboardResponse;
  studentsPath: string;
  resultLabel: string;
  hideResultColumn?: boolean;
  formatResult?: (label: string) => string;
  audience?: DashboardAudienceLabels;
}) {
  const labels = { ...DEFAULT_AUDIENCE, ...audience };
  const rows = buildStudentRows(data, formatResult);

  const columns = [
    {
      header: labels.singular,
      render: (row: StudentRow) => (
        <Link href={`${studentsPath}/${row.id}`} className="group flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-xs font-bold text-white">
            {row.name[0]}
          </span>
          <p className="text-sm font-semibold text-black group-hover:text-sky-600">{row.name}</p>
        </Link>
      ),
    },
    ...(labels.hideGradeColumn
      ? []
      : [{ header: "Grade", render: (row: StudentRow) => <span>{row.grade}</span> }]),
    ...(hideResultColumn
      ? []
      : [{ header: resultLabel, render: (row: StudentRow) => <span className="font-semibold text-black">{row.result}</span> }]),
    {
      header: "Details",
      render: (row: StudentRow) => <span className="text-black">{row.detail ?? "—"}</span>,
    },
  ];

  return (
    <ChartCard
      title={labels.recentSectionTitle ?? `Recent ${labels.plural.toLowerCase()}`}
      description={labels.recentSectionDescription ?? "Latest completed assessments in your organization."}
      noPad
      action={
        <Link href={studentsPath} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
          {labels.viewAllLabel ?? `View all ${labels.plural.toLowerCase()}`}{" "}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {rows.length > 0 ? (
        <DashboardTable
          columns={columns}
          data={rows}
          emptyMessage={labels.emptyTableMessage ?? `No ${labels.plural.toLowerCase()} found.`}
        />
      ) : (
        <div className="px-5 pb-5">
          <EmptyState
            variant="students"
            title={labels.emptySectionTitle ?? `No ${labels.plural.toLowerCase()} yet`}
            description={
              labels.emptySectionDescription
              ?? `${labels.singular} activity will appear here after assessments are completed.`
            }
            compact
          />
        </div>
      )}
    </ChartCard>
  );
}

function StudyAbroadLayout({
  data,
  config,
}: {
  data: AssessmentAdminDashboardResponse;
  config: NonNullable<ReturnType<typeof getTestDashboardUiConfig>>;
}) {
  const withPct = data.allAttempts.filter((r) => Number.isFinite(r.percentage));
  const avgPct = withPct.length
    ? Math.round(withPct.reduce((s, r) => s + (r.percentage ?? 0), 0) / withPct.length)
    : 0;
  const band = bandFromPercentage(avgPct);
  const meta = bandMeta(band);
  const sortedDims = [...data.dimensionAverages].sort((a, b) => b.value - a.value);
  const strengths = sortedDims.slice(0, 3);
  const gaps = [...data.dimensionAverages].sort((a, b) => a.value - b.value).slice(0, 3);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Org average readiness" description="Overall readiness percentage across cohort.">
          <div className="flex flex-col items-center py-2">
            <DonutChart percentage={avgPct} stroke="#0ea5e9" centerLabel="Avg ready" />
            <div className={`mt-4 w-full text-center rounded-xl border px-4 py-2 ${meta.border} ${meta.bg}`}>
              <p className={`text-sm font-bold ${meta.colorClass}`}>{band}</p>
            </div>
          </div>
        </ChartCard>
        <div className="lg:col-span-2">
          <ChartCard title={config.dimensionsTitle} description={config.dimensionsDescription}>
            <HorizontalBarChart
              items={data.dimensionAverages.map((d) => ({
                label: d.label,
                value: d.value,
                color: "bg-sky-400",
              }))}
              barClass="bg-sky-400"
            />
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionChart
          distributions={data.distributions}
          colors={config.chartColors}
          title={config.distributionTitle}
          description={config.distributionDescription}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ChartCard title="Top strengths" description="Highest readiness dimensions (org avg).">
            <div className="space-y-2">
              {strengths.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-black truncate">{s.label}</p>
                    <p className="text-xs text-emerald-700 font-bold">{s.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
          <ChartCard title="Needs attention" description="Lowest readiness dimensions (org avg).">
            <div className="space-y-2">
              {gaps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-black truncate">{s.label}</p>
                    <p className="text-xs text-rose-700 font-bold">{s.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </>
  );
}

function JohariLayout({ data }: { data: AssessmentAdminDashboardResponse }) {
  const summary = data.johariSummary;
  const open = summary?.quadrants.open ?? data.dimensionAverages.find((d) => d.key === "open")?.value ?? 0;
  const blind = summary?.quadrants.blind ?? data.dimensionAverages.find((d) => d.key === "blind")?.value ?? 0;
  const hidden = summary?.quadrants.hidden ?? data.dimensionAverages.find((d) => d.key === "hidden")?.value ?? 0;
  const unknown = summary?.quadrants.unknown ?? data.dimensionAverages.find((d) => d.key === "unknown")?.value ?? 0;
  const avgSf = summary?.avgSolicitsFeedback ?? 25;
  const avgSd = summary?.avgSelfDisclosure ?? 25;

  return (
    <ChartCard
      title="CLEAR self-awareness visualisation"
      description="Org-average position and how quadrant area is distributed."
    >
      <ClearJohariOrgChart
        avgSolicitsFeedback={avgSf}
        avgSelfDisclosure={avgSd}
        open={open}
        blind={blind}
        hidden={hidden}
        unknown={unknown}
      />
    </ChartCard>
  );
}

function CareerCompassLayout({
  data,
  config,
}: {
  data: AssessmentAdminDashboardResponse;
  config: NonNullable<ReturnType<typeof getTestDashboardUiConfig>>;
}) {
  const pairs = data.careerCompassPairs ?? [];
  const typeItems = data.distributions.map((d) => ({
    label: formatPersonalityType(d.label),
    count: d.count,
  }));

  return (
    <>
      <ChartCard title={config.dimensionsTitle} description={config.dimensionsDescription}>
        <PersonalityAxisOverview pairs={pairs} />
      </ChartCard>
      <div className="grid gap-6 lg:grid-cols-2">
        <DistributionChart
          distributions={data.distributions}
          colors={config.chartColors}
          title={config.distributionTitle}
          description={config.distributionDescription}
          formatLabel={formatPersonalityType}
        />
        <ChartCard title="Personality profile frequency" description="How many students align with each profile.">
          <TypeFrequencyGrid items={typeItems} />
        </ChartCard>
      </div>
    </>
  );
}

function LitmusLayout({
  data,
  config,
}: {
  data: AssessmentAdminDashboardResponse;
  config: NonNullable<ReturnType<typeof getTestDashboardUiConfig>>;
}) {
  const styleOrder = ["King", "Servant", "Elder", "Prince", "Joker"];
  const styleBars = [...data.dimensionAverages]
    .sort((a, b) => styleOrder.indexOf(a.label) - styleOrder.indexOf(b.label))
    .map((d) => ({
      label: d.label,
      value: d.value,
      max: d.max ?? 100,
      suffix: "%",
      color: config.barClass,
    }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DistributionChart
        distributions={data.distributions}
        colors={config.chartColors}
        title={config.distributionTitle}
        description={config.distributionDescription}
      />
      <ChartCard title={config.dimensionsTitle} description={config.dimensionsDescription}>
        <HorizontalBarChart items={styleBars} barClass={config.barClass} />
      </ChartCard>
    </div>
  );
}

function MetacognitionLayout({
  data,
  config,
}: {
  data: AssessmentAdminDashboardResponse;
  config: NonNullable<ReturnType<typeof getTestDashboardUiConfig>>;
}) {
  const meta = data.metacognitionSummary;
  const domains = meta?.avgDomainScores ?? data.dimensionAverages;
  const radarItems = domains.map((d) => ({
    label: d.label,
    value: d.value,
    max: d.max ?? 50,
  }));
  const topDomains = [...domains].sort((a, b) => b.value - a.value).slice(0, 3);

  return (
    <>
      {/* <div className="grid gap-4 sm:grid-cols-3">
        {topDomains.map((d, i) => (
          <div key={d.key} className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-5">
            <p className="text-xs font-semibold uppercase text-cyan-800">Strongest area #{i + 1}</p>
            <p className="text-sm font-bold text-black mt-1">{d.label}</p>
            <p className="text-2xl font-bold text-cyan-700 mt-2">
              {d.value}
              <span className="text-sm font-medium text-cyan-600"> / {d.max ?? 50} pts</span>
            </p>
          </div>
        ))}
      </div> */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="TEST profile (radar)" description={config.dimensionsDescription}>
          {radarItems.length >= 3 ? (
            <RadarChart items={radarItems} stroke="#0891b2" fill="rgba(8, 145, 178, 0.15)" size={280} />
          ) : (
            <p className="text-sm text-black text-center py-8">Domain data not available yet.</p>
          )}
        </ChartCard>
        <DistributionChart
          distributions={meta?.quadrantDistribution ?? data.distributions}
          colors={config.chartColors}
          title={config.distributionTitle}
          description={config.distributionDescription}
        />
      </div>
    </>
  );
}

function CombinationDistributionGrid({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{ label: string; count: number }>;
}) {
  if (!items.length) return null;
  return (
    <ChartCard title={title} description={description}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.slice(0, 12).map((item) => (
          <div
            key={`${item.label}-${item.count}`}
            className="rounded-xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 to-white p-4"
          >
            <p className="text-sm font-bold text-fuchsia-900 leading-snug">{item.label}</p>
            <p className="text-xs text-black mt-2">
              {item.count} student{item.count !== 1 ? "s" : ""}
            </p>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function CareerDnaLayout({
  data,
  config,
}: {
  data: AssessmentAdminDashboardResponse;
  config: NonNullable<ReturnType<typeof getTestDashboardUiConfig>>;
}) {
  const combos = data.careerDnaCombinations;
  const scoreSections = [...data.dimensionAverages].sort((a, b) => b.value - a.value);
  const topSection = scoreSections[0];

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <CombinationDistributionGrid
          title="Personality profile combinations"
          description="Full personality profiles from the Personality section (not a percentage score)."
          items={(combos?.personalityTypes ?? []).map((d) => ({
            label: formatPersonalityType(d.label),
            count: d.count,
          }))}
        />
        <CombinationDistributionGrid
          title="Career interest combinations"
          description="Top interest themes from the Career Interest section."
          items={(combos?.careerInterestCodes ?? []).map((d) => ({
            label: formatCareerInterestCode(d.label),
            count: d.count,
          }))}
        />
      </div>
      {scoreSections.length > 0 && (
        <>
          <ChartCard title="Scored section overview" description="Sections measured by completion percentage.">
            <SectionScoreCards items={scoreSections.map((d) => ({ label: d.label, value: d.value }))} />
          </ChartCard>
          <ChartCard title={config.dimensionsTitle} description={config.dimensionsDescription}>
            <HorizontalBarChart
              items={scoreSections.map((d) => ({
                label: d.label,
                value: d.value,
                color: config.barClass,
              }))}
              barClass={config.barClass}
            />
            {topSection && (
              <p className="mt-4 text-sm text-black">
                Strongest scored section:{" "}
                <span className="font-semibold text-fuchsia-700">{topSection.label}</span> at {topSection.value}%.
              </p>
            )}
          </ChartCard>
        </>
      )}
    </>
  );
}

function StandardLayout({
  data,
  config,
}: {
  data: AssessmentAdminDashboardResponse;
  config: NonNullable<ReturnType<typeof getTestDashboardUiConfig>>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DistributionChart
        distributions={data.distributions}
        colors={config.chartColors}
        title={config.distributionTitle}
        description={config.distributionDescription}
      />
      {data.dimensionAverages.length > 0 && (
        <ChartCard title={config.dimensionsTitle} description={config.dimensionsDescription}>
          <HorizontalBarChart
            items={data.dimensionAverages.map((d) => ({
              label: d.label,
              value: d.value,
              color: config.barClass,
            }))}
            barClass={config.barClass}
          />
        </ChartCard>
      )}
    </div>
  );
}

function resultLabelFormatter(
  assessmentCode: string,
): ((label: string) => string) | undefined {
  if (assessmentCode === "CAREER_COMPASS") return formatPersonalityType;
  if (assessmentCode === "CAREER_DNA") return formatCareerDnaResultLabel;
  return undefined;
}

function AnalyticsBody({
  data,
  config,
  studentsPath,
  assessmentCode,
}: {
  data: AssessmentAdminDashboardResponse;
  config: NonNullable<ReturnType<typeof getTestDashboardUiConfig>>;
  studentsPath: string;
  assessmentCode: string;
}) {
  const formatResult = resultLabelFormatter(assessmentCode);

  return (
    <>
      {config.layout === "study-abroad" && <StudyAbroadLayout data={data} config={config} />}
      {config.layout === "johari" && <JohariLayout data={data} />}
      {config.layout === "career-compass" && <CareerCompassLayout data={data} config={config} />}
      {config.layout === "litmus" && <LitmusLayout data={data} config={config} />}
      {config.layout === "metacognition" && <MetacognitionLayout data={data} config={config} />}
      {config.layout === "career-dna" && <CareerDnaLayout data={data} config={config} />}
      {config.layout === "standard" && <StandardLayout data={data} config={config} />}

      <RecentStudentsSection
        data={data}
        studentsPath={studentsPath}
        resultLabel={config.resultColumnLabel ?? "Result"}
        hideResultColumn={config.hideResultColumn}
        formatResult={formatResult}
        audience={config.audience}
      />

      <ChartCard title="Active assessment" description="Published test on your portal.">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-black">{data.assessment.name}</p>
            <p className="text-xs text-black">{data.assessment.category}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">Published</span>
            <span className="text-xs font-medium text-black">
              {data.summary.totalAttempts.toLocaleString()} attempts
            </span>
          </div>
        </div>
      </ChartCard>
    </>
  );
}

export default function EnhancedOrgTestDashboard({
  assessmentCode,
  studentsPath,
  loginPath,
  organizationSlug,
}: EnhancedOrgTestDashboardProps) {
  const config = getTestDashboardUiConfig(assessmentCode);
  const { loading, data, error } = useAssessmentOrgDashboard(loginPath, assessmentCode, organizationSlug);

  if (!config) {
    return <p className="text-sm text-rose-600">Dashboard not configured for this assessment.</p>;
  }

  if (loading) {
    return <OrgDashboardLoading />;
  }

  if (error || !data) {
    return <p className="text-sm text-rose-600">{error || "Unable to load dashboard"}</p>;
  }

  if (data.summary.totalAttempts === 0) {
    return (
      <OrgDashboardEmpty
        title={config.emptyTitle}
        subtitle={config.emptySubtitle}
        assessmentName={data.assessment.name}
        studentsPath={studentsPath}
        accentClass={config.accentClass}
      />
    );
  }

  const statCards = config.buildStatCards(data);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="break-words text-xl font-bold text-black sm:text-2xl">{config.title}</h1>
          <p className="text-sm text-black mt-1">{config.subtitle}</p>
        </div>
        <Link href={studentsPath} className="text-sm font-medium text-blue-600 hover:underline">
          {config.audience?.viewAllLabel
            ? `${config.audience.viewAllLabel} →`
            : "View all students →"}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} sub={card.sub} />
        ))}
      </div>

      <AnalyticsBody data={data} config={config} studentsPath={studentsPath} assessmentCode={assessmentCode} />
    </div>
  );
}
