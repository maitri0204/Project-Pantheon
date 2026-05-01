"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  { key: "students",     label: "Users",        color: "green",  href: "/dashboard/users" },
  { key: "coupons",      label: "Coupons",      color: "yellow", href: "/dashboard/coupons" },
  { key: "invoices",     label: "Invoices",     color: "indigo", href: "/dashboard/ledger" },
] as const;

const colorMap: Record<string, { card: string; icon: string }> = {
  blue:   { card: "hover:border-blue-200",   icon: "bg-blue-50 text-blue-600" },
  purple: { card: "hover:border-purple-200", icon: "bg-purple-50 text-purple-600" },
  green:  { card: "hover:border-green-200",  icon: "bg-green-50 text-green-600" },
  yellow: { card: "hover:border-yellow-200", icon: "bg-yellow-50 text-yellow-600" },
  indigo: { card: "hover:border-indigo-200", icon: "bg-indigo-50 text-indigo-600" },
};

const quickLinks = [
  { label: "Manage Assessments", desc: "Update pricing and details",        href: "/dashboard/assessments" },
  { label: "Question Banks",     desc: "Add & edit questions per assessment", href: "/dashboard/questions" },
  { label: "Organizations",      desc: "Create and manage whitelabel orgs",  href: "/dashboard/organizations" },
  { label: "Coupons & Pricing",  desc: "Generate discount coupons with GST", href: "/dashboard/coupons" },
  { label: "Payment Ledger",     desc: "View all transactions and invoices", href: "/dashboard/ledger" },
  { label: "Users",              desc: "Manage all platform users",          href: "/dashboard/users" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [assessments, setAssessments] = useState<AssessmentCard[]>([]);
  const [organizations, setOrganizations] = useState<OrgCard[]>([]);
  const [loading, setLoading] = useState(true);

  const auth = useMemo(() => getStoredAuth(), []);

  useEffect(() => {
    if (!auth) { router.replace("/login"); return; }
    apiRequest<DashboardResponse>("/platform/dashboard", {}, auth.token)
      .then((res) => {
        setStats(res.stats);
        setAssessments(res.assessments);
        setOrganizations(res.organizations);
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
        <p className="text-blue-100 text-base font-medium mb-1">Project Pantheon · Superadmin Console</p>
        <h1 className="text-3xl font-bold mb-1">Welcome back, {auth?.user.firstName}! 👋</h1>
        <p className="text-blue-100 text-base">Manage all assessments, organizations, and whitelabel configurations from one place.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statConfig.map(({ key, label, color, href }) => (
          <Link key={key} href={href}
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
          {quickLinks.map((ql) => (
            <Link key={ql.href} href={ql.href}
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

      {/* Two column: assessments + orgs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-black">Assessment Catalog ({assessments.length})</h2>
            <Link href="/dashboard/assessments" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
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

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-black">Organizations ({organizations.length})</h2>
            <Link href="/dashboard/organizations" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
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
      </div>
    </div>
  );
}
