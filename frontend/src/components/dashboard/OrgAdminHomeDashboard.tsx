"use client";

import { useState } from "react";
import Link from "next/link";
import { STUDENT_REGISTER_URL } from "@/lib/studentRegisterUrl";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Link2,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react";

import { getTestDashboardBasePath, getTestDashboardMeta } from "@/lib/dashboard/testDashboard";
import { normalizeAssessmentCode } from "@/lib/assessmentAccess";

type Stats = {
  assessments: number;
  students: number;
};

type AssessmentCard = {
  _id: string;
  code: string;
  name: string;
  category: string;
};

type OrgAdminHomeDashboardProps = {
  firstName: string;
  orgName?: string;
  orgSlug: string;
  stats: Stats | null;
  assessments: AssessmentCard[];
  dashboardBasePath: string;
  resolveDashboardHref: (href: string) => string;
};

const QUICK_ACTIONS = [
  {
    label: "Students",
    desc: "View profiles and completed reports",
    href: "/dashboard/users",
    icon: Users,
    gradient: "from-sky-500 to-blue-600",
    ring: "ring-sky-100",
  },
  {
    label: "Parents",
    desc: "Manage parent accounts and Litmus access",
    href: "/dashboard/parents",
    icon: UserPlus,
    gradient: "from-violet-500 to-purple-600",
    ring: "ring-violet-100",
  },
  {
    label: "Coupons",
    desc: "Discount codes for your portal",
    href: "/dashboard/coupons",
    icon: Ticket,
    gradient: "from-amber-500 to-orange-500",
    ring: "ring-amber-100",
  },
  {
    label: "Assessments",
    desc: "Pricing and catalog settings",
    href: "/dashboard/assessments",
    icon: ClipboardList,
    gradient: "from-emerald-500 to-teal-600",
    ring: "ring-emerald-100",
  },
] as const;

function displayCode(code: string) {
  const normalized = normalizeAssessmentCode(code);
  if (normalized === "JOHARI_WINDOW") return "CLEAR";
  if (normalized === "METACOGNITION_TEST") return "TEST";
  return normalized.replace(/_/g, " ");
}

function StudentRegistrationPanel({ orgSlug }: { orgSlug: string }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const regLink = orgSlug ? `${baseUrl}/whitelabel/${orgSlug}/student/register` : "";

  const copyLink = () => {
    if (!regLink) return;
    navigator.clipboard.writeText(regLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 shadow-sm">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-200/30 blur-2xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Link2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">Student registration link</h2>
            <p className="mt-1 max-w-xl text-sm text-black">
              Share this URL so new students join your organization automatically after email verification.
            </p>
          </div>
        </div>
        {orgSlug && (
          <a
            href={STUDENT_REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Preview page
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </div>
      <div className="relative mt-4 flex items-center gap-2">
        <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 font-mono text-xs text-black truncate select-all">
          {regLink || "Loading registration link…"}
        </div>
        <button
          type="button"
          onClick={copyLink}
          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            copied ? "bg-emerald-100 text-emerald-700" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function OrgAdminHomeDashboard({
  firstName,
  orgName,
  orgSlug,
  stats,
  assessments,
  dashboardBasePath,
  resolveDashboardHref,
}: OrgAdminHomeDashboardProps) {
  const dashboardReadyCount = assessments.filter((a) => getTestDashboardMeta(a.code)).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-7 text-white shadow-[0_24px_60px_-24px_rgba(37,99,235,0.55)] md:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative">
          {orgName && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">{orgName}</p>
          )}
          <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="mt-2 max-w-2xl text-base text-blue-100">
            Manage your assessments and students from one place.
          </p>
        </div>
      </section>

      {/* Stat shortcuts */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href={resolveDashboardHref("/dashboard/assessments")}
          className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-black">Assessment catalog</p>
              <p className="mt-1 text-4xl font-black text-black">{stats?.assessments ?? "-"}</p>
              <p className="mt-2 text-sm text-black">Published on your portal</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:scale-105">
              <ClipboardList className="h-7 w-7" />
            </div>
          </div>
        </Link>
        <Link
          href={resolveDashboardHref("/dashboard/users")}
          className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-black">Students</p>
              <p className="mt-1 text-4xl font-black text-black">{stats?.students ?? "-"}</p>
              <p className="mt-2 text-sm text-black">Profiles, grades, and reports</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105">
              <Users className="h-7 w-7" />
            </div>
          </div>
        </Link>
      </section>

      {/* Test analytics grid */}
      {assessments.length > 0 && (
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-black">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Assessment analytics
              </h2>
              <p className="mt-1 text-sm text-black">
                Open a dedicated dashboard for cohort insights, distributions, and student outcomes.
              </p>
            </div>
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
                    <h3 className="mt-3 text-base font-bold text-black group-hover:text-blue-700 transition-colors">
                      {meta?.title ?? assessment.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-black">
                      {meta?.subtitle ?? assessment.category}
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-blue-600">
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

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-black">Quick shortcuts</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                <p className="font-semibold text-black group-hover:text-blue-700">{action.label}</p>
                <p className="mt-1 text-sm text-black">{action.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <StudentRegistrationPanel orgSlug={orgSlug} />
    </div>
  );
}
