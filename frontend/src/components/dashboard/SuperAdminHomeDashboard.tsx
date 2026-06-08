"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  ClipboardList,
  FileText,
  Layers3,
  Sparkles,
  Ticket,
  Users,
  Wallet,
} from "lucide-react";

import { normalizeAssessmentCode } from "@/lib/assessmentAccess";
import { getTestDashboardBasePath, getTestDashboardMeta } from "@/lib/dashboard/testDashboard";

type Stats = {
  assessments: number;
  organizations: number;
  students: number;
  coupons: number;
  invoices: number;
};

type AssessmentCard = {
  _id: string;
  code: string;
  name: string;
  category: string;
  questionBankStatus: string;
  basePrice: number;
};

type OrgCard = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type InvoiceSnippet = {
  _id: string;
  invoiceNumber: string;
  assessmentCode: string;
  finalAmount: number;
  status: string;
  createdAt: string;
};

type SuperAdminHomeDashboardProps = {
  firstName: string;
  stats: Stats | null;
  assessments: AssessmentCard[];
  organizations: OrgCard[];
  invoices?: InvoiceSnippet[];
  dashboardBasePath: string;
  resolveDashboardHref: (href: string) => string;
};

const QUICK_ACTIONS = [
  {
    label: "Question Banks",
    desc: "Add and edit assessment questions",
    href: "/dashboard/questions",
    icon: Layers3,
    gradient: "from-violet-500 to-purple-600",
    ring: "ring-violet-100",
  },
  {
    label: "Coupons & Pricing",
    desc: "Discounts, GST, and base prices",
    href: "/dashboard/coupons",
    icon: Ticket,
    gradient: "from-amber-500 to-orange-500",
    ring: "ring-amber-100",
  },
  {
    label: "Organizations",
    desc: "Whitelabel portals and branding",
    href: "/dashboard/organizations",
    icon: Building2,
    gradient: "from-blue-500 to-indigo-600",
    ring: "ring-blue-100",
  },
  {
    label: "Payment Ledger",
    desc: "Invoices and transaction history",
    href: "/dashboard/ledger",
    icon: Wallet,
    gradient: "from-emerald-500 to-teal-600",
    ring: "ring-emerald-100",
  },
  {
    label: "Students",
    desc: "Profiles across all organizations",
    href: "/dashboard/users",
    icon: Users,
    gradient: "from-cyan-500 to-sky-600",
    ring: "ring-cyan-100",
  },
  {
    label: "Assessments",
    desc: "Catalog, pricing, and availability",
    href: "/dashboard/assessments",
    icon: ClipboardList,
    gradient: "from-rose-500 to-pink-600",
    ring: "ring-rose-100",
  },
] as const;

function displayCode(code: string) {
  const normalized = normalizeAssessmentCode(code);
  if (normalized === "JOHARI_WINDOW") return "CLEAR";
  if (normalized === "METACOGNITION_TEST") return "TEST";
  return normalized.replace(/_/g, " ");
}

function questionBankBadge(status: string) {
  if (status === "imported") return "bg-emerald-50 text-emerald-700";
  if (status === "linked") return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-700";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function PlatformHealthBar({
  imported,
  linked,
  pending,
}: {
  imported: number;
  linked: number;
  pending: number;
}) {
  const total = imported + linked + pending || 1;
  const segments = [
    { label: "Imported", value: imported, color: "#10b981" },
    { label: "Linked", value: linked, color: "#3b82f6" },
    { label: "Pending", value: pending, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
        {segments.map((seg) =>
          seg.value > 0 ? (
            <div
              key={seg.label}
              className="h-full transition-all"
              style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
              title={`${seg.label}: ${seg.value}`}
            />
          ) : null,
        )}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-black">
        {segments.map((seg) => (
          <span key={seg.label} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
            {seg.label}: <strong className="text-black">{seg.value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SuperAdminHomeDashboard({
  firstName,
  stats,
  assessments,
  organizations,
  invoices = [],
  dashboardBasePath,
  resolveDashboardHref,
}: SuperAdminHomeDashboardProps) {
  const activeOrgs = organizations.filter((o) => o.isActive).length;
  const dashboardReadyCount = assessments.filter((a) => getTestDashboardMeta(a.code)).length;
  const importedBanks = assessments.filter((a) => a.questionBankStatus === "imported").length;
  const linkedBanks = assessments.filter((a) => a.questionBankStatus === "linked").length;
  const pendingBanks = assessments.length - importedBanks - linkedBanks;

  const statCards = [
    {
      label: "Assessments",
      value: stats?.assessments ?? 0,
      sub: "Live in catalog",
      icon: Layers3,
      href: resolveDashboardHref("/dashboard/assessments"),
      accent: "from-blue-500 to-cyan-400",
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "Organizations",
      value: stats?.organizations ?? 0,
      sub: `${activeOrgs} active portals`,
      icon: Building2,
      href: resolveDashboardHref("/dashboard/organizations"),
      accent: "from-violet-500 to-fuchsia-400",
      iconBg: "bg-violet-50 text-violet-600",
    },
    {
      label: "Students",
      value: stats?.students ?? 0,
      sub: "Across all orgs",
      icon: Users,
      href: resolveDashboardHref("/dashboard/users"),
      accent: "from-emerald-500 to-teal-400",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Coupons",
      value: stats?.coupons ?? 0,
      sub: "Active discount codes",
      icon: Ticket,
      href: resolveDashboardHref("/dashboard/coupons"),
      accent: "from-amber-500 to-orange-400",
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      label: "Invoices",
      value: stats?.invoices ?? 0,
      sub: "Recent transactions",
      icon: FileText,
      href: resolveDashboardHref("/dashboard/ledger"),
      accent: "from-indigo-500 to-blue-400",
      iconBg: "bg-indigo-50 text-indigo-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-7 text-white shadow-[0_24px_60px_-24px_rgba(30,27,75,0.65)] md:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-indigo-100/90">
              Operate the full assessment network - organizations, question banks, pricing, and per-test analytics from one place.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                {dashboardReadyCount} live test dashboards
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                {activeOrgs} active organizations
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                {stats?.students ?? 0} students platform-wide
              </span>
            </div>
          </div>
          {/* <Link
            href={resolveDashboardHref("/dashboard/assessments")}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-900 shadow-lg transition hover:bg-indigo-50"
          >
            <ClipboardList className="h-4 w-4" />
            Manage catalog
            <ArrowRight className="h-4 w-4" />
          </Link> */}
        </div>
      </section>

      {/* KPI row */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-black">{item.label}</p>
                  <p className="mt-1 text-3xl font-black text-black">{item.value}</p>
                  <p className="mt-1 text-xs text-black">{item.sub}</p>
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${item.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {/* Platform health + recent activity */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-black">Question bank health</h2>
          <p className="mt-1 text-sm text-black">Import and linkage status across the assessment catalog.</p>
          <div className="mt-5">
            <PlatformHealthBar imported={importedBanks} linked={linkedBanks} pending={pendingBanks} />
          </div>
          <Link
            href={resolveDashboardHref("/dashboard/questions")}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Open question banks
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-black">Recent transactions</h2>
            <Link href={resolveDashboardHref("/dashboard/ledger")} className="text-sm font-medium text-blue-600 hover:underline">
              View ledger
            </Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <p className="py-6 text-sm text-black">No invoices recorded yet.</p>
            ) : (
              invoices.slice(0, 5).map((inv) => (
                <div key={inv._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-black">{inv.invoiceNumber}</p>
                    <p className="text-xs text-black">{displayCode(inv.assessmentCode)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-black">{formatCurrency(inv.finalAmount)}</p>
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        inv.status === "PAID" ? "text-emerald-600" : inv.status === "VOID" ? "text-black" : "text-amber-600"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Assessment analytics */}
      {assessments.length > 0 && (
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-black">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Assessment analytics
              </h2>
              <p className="mt-1 text-sm text-black">
                Platform-wide cohort insights — open a dedicated dashboard for each test.
              </p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {dashboardReadyCount} dashboards live
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {assessments.map((assessment) => {
              const meta = getTestDashboardMeta(assessment.code);
              const enabled = Boolean(meta);
              const href = enabled
                ? getTestDashboardBasePath(dashboardBasePath, assessment.code)
                : resolveDashboardHref("/dashboard/assessments");

              return (
                <Link
                  key={assessment._id}
                  href={href}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`h-2 bg-gradient-to-r ${meta?.gradient ?? "from-slate-400 to-slate-500"}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          meta?.accent ?? "bg-slate-50 text-black border-slate-100"
                        }`}
                      >
                        {displayCode(assessment.code)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-black"
                        }`}
                      >
                        {enabled ? "Live" : "Soon"}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-black transition-colors group-hover:text-indigo-700">
                      {meta?.title ?? assessment.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-black">
                      {meta?.subtitle ?? assessment.category}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-black">
                      <span className={`rounded-full px-2 py-0.5 font-medium ${questionBankBadge(assessment.questionBankStatus)}`}>
                        {assessment.questionBankStatus}
                      </span>
                      <span className="font-semibold text-black">₹{assessment.basePrice}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
                      Open dashboard
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick shortcuts */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-black">Quick shortcuts</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={resolveDashboardHref(action.href)}
                className={`group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-transparent transition hover:shadow-md ${action.ring} hover:ring-opacity-100`}
              >
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-sm`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-black group-hover:text-indigo-700">{action.label}</p>
                <p className="mt-1 text-sm text-black">{action.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Catalog + organizations */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-black">Assessment catalog</h2>
            <Link href={resolveDashboardHref("/dashboard/assessments")} className="text-sm font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {assessments.slice(0, 6).map((a) => (
              <div key={a._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-black">{a.name}</p>
                  <p className="text-xs text-black">{a.category}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${questionBankBadge(a.questionBankStatus)}`}>
                    {a.questionBankStatus}
                  </span>
                  <span className="text-sm font-semibold text-black">₹{a.basePrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-black">Organizations ({organizations.length})</h2>
            <Link href={resolveDashboardHref("/dashboard/organizations")} className="text-sm font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {organizations.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-black">No organizations yet.</p>
            ) : (
              organizations.slice(0, 6).map((org) => (
                <Link
                  key={org._id}
                  href={resolveDashboardHref(`/dashboard/organizations/${org._id}`)}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-black">{org.name}</p>
                    <p className="truncate text-xs text-black">{org.slug}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      org.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-black"
                    }`}
                  >
                    {org.isActive ? "Active" : "Inactive"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
