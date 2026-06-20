"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { apiRequest, clearStoredAuth, getStoredAuth } from "@/lib/api";
import { PLATFORM_HOME_URL } from "@/lib/studentRegisterUrl";

type StudentPortalShellProps = {
  children: React.ReactNode;
  slug: string;
};

const navItems = [
  {
    label: "Dashboard",
    suffix: "/student/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Assessments",
    suffix: "/student/assessments",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Results",
    suffix: "/student/results",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Invoices",
    suffix: "/student/invoices",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function StudentPortalShell({ children, slug }: StudentPortalShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orgCompanyName, setOrgCompanyName] = useState("Organization");
  const [orgLogoUrl, setOrgLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      router.replace(`/whitelabel/${slug}/login`);
      return;
    }

    const isLearner = auth.user.role === "STUDENT" || auth.user.role === "PARENT";

    if (!isLearner) {
      if (auth.user.role === "ORG_ADMIN") {
        router.replace(`/whitelabel/${slug}/dashboard`);
        return;
      }
      router.replace("/dashboard");
      return;
    }

    if (auth.orgSlug && auth.orgSlug !== slug) {
      router.replace(`/whitelabel/${auth.orgSlug}/student/dashboard`);
      return;
    }

    setName(`${auth.user.firstName} ${auth.user.lastName}`.trim());
    setEmail(auth.user.email);
    setOrgCompanyName(auth.orgCompanyName || "Organization");
    setOrgLogoUrl(auth.orgLogoUrl || "");
    setLoading(false);
  }, [router, slug]);

  const basePath = `/whitelabel/${slug}`;
  const links = useMemo(() => navItems.map((item) => ({ ...item, href: `${basePath}${item.suffix}` })), [basePath]);

  const logout = () => {
    clearStoredAuth();
    router.replace(PLATFORM_HOME_URL);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center app-surface">
        <div className="w-10 h-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex app-surface">
      {/* ── Top Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[84px] sm:h-[96px] bg-white/95 backdrop-blur border-b border-gray-200 flex items-center pl-4 pr-3 sm:pl-7 sm:pr-4 md:pl-25 gap-3 sm:gap-4 shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="w-[140px] h-[56px] sm:w-[180px] sm:h-[72px] md:w-[200px] md:h-[84px] flex items-center justify-center text-white text-xs font-bold overflow-hidden rounded-xl">
          {orgLogoUrl ? (
            <Image
              src={orgLogoUrl}
              alt={`${orgCompanyName} logo`}
              width={200}
              height={84}
              className="h-full w-full object-contain"
            />
          ) : (
            <span>{orgCompanyName.substring(0, 2).toUpperCase()}</span>
          )}
        </div>
      </nav>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed left-0 top-[84px] sm:top-[96px] z-40 w-72 bg-white/95 backdrop-blur border-r border-gray-200 h-[calc(100vh-84px)] sm:h-[calc(100vh-96px)] flex flex-col shadow-sm transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-5 py-6">
          {links.map((item) => {
            const active = pathname === item.href || (pathname?.startsWith(`${item.href}/`) ?? false);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl py-3 pl-4 pr-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">{item.icon}</span>
                <span className="min-w-0">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3 pl-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white">
              <span className="text-sm font-bold text-white">
                {name ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "ST"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-gray-900">{name || "Student"}</p>
              <p className="truncate text-[11px] text-gray-400">{email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 inline-flex items-center gap-2 pl-1 text-xs font-semibold text-red-600 hover:text-red-700"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 md:ml-72 pt-[84px] sm:pt-[96px] min-w-0">
        <main className="p-3 sm:p-5 md:p-6">
          <div className="content-wrap app-panel p-3 sm:p-5 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
