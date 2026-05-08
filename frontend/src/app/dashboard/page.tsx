"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function StudentRegistrationLinkCard({ orgSlug }: { orgSlug: string }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const regLink = orgSlug ? `${baseUrl}/whitelabel/${orgSlug}/student/register` : "";

  const copyLink = () => {
    if (!regLink) return;
    navigator.clipboard.writeText(regLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-blue-100 bg-blue-50">
        <h2 className="text-base font-semibold text-blue-900">Student Registration Link</h2>
        <p className="text-sm text-blue-700 mt-0.5">Share this link with students to let them register on your portal.</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-mono truncate select-all">
            {regLink || "Loading..."}
          </div>
          <button
            onClick={copyLink}
            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              copied ? "bg-green-100 text-green-700" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium text-gray-700">Students registering via this link will:</p>
          <ul className="list-disc list-inside space-y-0.5 text-gray-600">
            <li>Be automatically linked to your organization</li>
            <li>Receive OTP verification on their email</li>
            <li>Be able to log in via your portal and access all assessments</li>
          </ul>
        </div>
        {orgSlug && (
          <Link
            href={`/whitelabel/${orgSlug}/student/register`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium"
          >
            Preview registration page →
          </Link>
        )}
      </div>
    </div>
  );
}

import { apiRequest, getStoredAuth } from "@/lib/api";

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
  type: string;
  isActive: boolean;
};

type DashboardResponse = {
  role: string;
  stats: Stats;
  assessments: AssessmentCard[];
  organizations: OrgCard[];
};

const statConfig = [
  { key: "assessments", label: "Assessments",  color: "blue",   href: "/dashboard/assessments" },
  { key: "organizations", label: "Organizations", color: "purple", href: "/dashboard/organizations" },
  { key: "students",     label: "Students",      color: "green",  href: "/dashboard/users" },
  { key: "coupons",      label: "Coupons",       color: "yellow", href: "/dashboard/coupons" },
  { key: "invoices",     label: "Invoices",      color: "indigo", href: "/dashboard/ledger" },
] as const;

const colorMap: Record<string, { card: string; icon: string }> = {
  blue:   { card: "hover:border-blue-200",   icon: "bg-blue-50 text-blue-600" },
  purple: { card: "hover:border-purple-200", icon: "bg-purple-50 text-purple-600" },
  green:  { card: "hover:border-green-200",  icon: "bg-green-50 text-green-600" },
  yellow: { card: "hover:border-yellow-200", icon: "bg-yellow-50 text-yellow-600" },
  indigo: { card: "hover:border-indigo-200", icon: "bg-indigo-50 text-indigo-600" },
};

const quickLinks = [
  { label: "Manage Assessments", desc: "Update pricing and details",          href: "/dashboard/assessments", superadminOnly: false },
  { label: "Question Banks",     desc: "Add & edit questions per assessment",  href: "/dashboard/questions",    superadminOnly: true },
  { label: "Organizations",      desc: "Create and manage whitelabel orgs",    href: "/dashboard/organizations", superadminOnly: true },
  { label: "Coupons & Pricing",  desc: "Generate discount coupons with GST",  href: "/dashboard/coupons",       superadminOnly: true },
  { label: "Payment Ledger",     desc: "View all transactions and invoices",   href: "/dashboard/ledger",        superadminOnly: true },
  { label: "Students",           desc: "Manage all students in your portal",   href: "/dashboard/users",         superadminOnly: false },
];

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [assessments, setAssessments] = useState<AssessmentCard[]>([]);
  const [organizations, setOrganizations] = useState<OrgCard[]>([]);
  const [orgSlug, setOrgSlug] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const auth = useMemo(() => getStoredAuth(), []);
  const dashboardBasePath = auth?.user.role === "ORG_ADMIN" && auth.orgSlug
    ? `/whitelabel/${auth.orgSlug}/dashboard`
    : "/dashboard";

  const resolveDashboardHref = (href: string) => {
    if (dashboardBasePath === "/dashboard") {
      return href;
    }

    return href === "/dashboard"
      ? dashboardBasePath
      : `${dashboardBasePath}${href.replace("/dashboard", "")}`;
  };

  useEffect(() => {
    if (!auth) { router.replace("/login"); return; }
    if (auth.user.role === "ORG_ADMIN" && auth.orgSlug) {
      setOrgSlug(auth.orgSlug);
    }
    apiRequest<DashboardResponse>("/platform/dashboard", {}, auth.token)
      .then((res) => {
        setRole(res.role);
        setStats(res.stats);
        setAssessments(res.assessments);
        setOrganizations(res.organizations);
        if (res.organizations?.length > 0) {
          setOrgSlug(res.organizations[0].slug);
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-7 text-white shadow-md">
        {role === "SUPERADMIN" && (
          <p className="text-blue-100 text-base font-medium mb-1">Assessment Centre</p>
        )}
        <h1 className="text-3xl font-bold mb-1">Welcome back, {auth?.user.firstName}! 👋</h1>
        <p className="text-blue-100 text-base">{role === "ORG_ADMIN" ? "Manage your assessments and students from one place." : "Manage all assessments, organizations, and whitelabel configurations from one place."}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statConfig.filter((item) => (
          role === "ORG_ADMIN"
            ? item.key === "assessments" || item.key === "students"
            : true
        )).map(({ key, label, color, href }) => (
          <Link key={key} href={resolveDashboardHref(href)}
            className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 transition-all ${colorMap[color].card}`}
          >
            <div>
              <p className="text-base text-black/80">{label}</p>
              <p className="text-3xl font-bold text-black">{stats ? stats[key as keyof Stats] : "—"}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-xl font-semibold text-black mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickLinks.filter((ql) => role === "ORG_ADMIN" ? !ql.superadminOnly : true).map((ql) => (
            <Link key={ql.href} href={resolveDashboardHref(ql.href)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
            >
              <p className="text-base font-semibold text-black group-hover:text-blue-700 transition-colors">{ql.label}</p>
              <p className="mt-1 text-sm text-black/80">{ql.desc}</p>
              <div className="mt-3 text-blue-600 text-sm font-medium flex items-center gap-1">
                Go →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Two column: assessments + orgs/student-link */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-black">Assessment Catalog ({assessments.length})</h2>
            {role === "SUPERADMIN" && (
              <Link href={resolveDashboardHref("/dashboard/assessments")} className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {assessments.slice(0, 6).map((a) => (
              <div key={a._id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-medium text-black truncate">{a.name}</p>
                  <p className="text-sm text-black/70">{a.category}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${
                    a.questionBankStatus === "imported" ? "bg-green-50 text-green-700" :
                    a.questionBankStatus === "linked" ? "bg-blue-50 text-blue-700" : "bg-yellow-50 text-yellow-700"
                  }`}>{a.questionBankStatus}</span>
                  <span className="text-sm text-black/80 font-medium">₹{a.basePrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {role === "SUPERADMIN" ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-black">Organizations ({organizations.length})</h2>
              <Link href={resolveDashboardHref("/dashboard/organizations")} className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {organizations.length === 0 ? (
                <p className="px-5 py-8 text-base text-black/70 text-center">No organizations yet.</p>
              ) : (
                organizations.slice(0, 6).map((org) => (
                  <div key={org._id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-medium text-black truncate">{org.name}</p>
                      <p className="text-sm text-black/70">{org.slug}</p>
                    </div>
                    <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${
                      org.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>{org.isActive ? "Active" : "Inactive"}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <StudentRegistrationLinkCard orgSlug={orgSlug} />
        )}
      </div>
    </div>
  );
}
