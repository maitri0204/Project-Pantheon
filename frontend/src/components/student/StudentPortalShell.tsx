"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { clearStoredAuth, getStoredAuth } from "@/lib/api";

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
];

export default function StudentPortalShell({ children, slug }: StudentPortalShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orgCompanyName, setOrgCompanyName] = useState("Organization");
  const [orgLogoUrl, setOrgLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      router.replace(`/whitelabel/${slug}/login`);
      return;
    }

    if (auth.user.role !== "STUDENT") {
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
    router.replace(`/whitelabel/${slug}/login`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Top Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[100px] bg-white border-b border-gray-200 flex items-center pl-7 pr-4 md:pl-25 gap-4 shadow-sm">
        <div className="w-40 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow overflow-hidden border border-blue-100">
          {orgLogoUrl ? (
            <Image
              src={orgLogoUrl}
              alt={`${orgCompanyName} logo`}
              width={160}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{orgCompanyName.substring(0, 2).toUpperCase()}</span>
          )}
        </div>
      </nav>

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-100px)] flex flex-col fixed left-0 top-[100px] z-30">
        {/* Navigation */}
        <nav className="flex-1 p-4 pt-6 space-y-1">
          {links.map((item) => {
            const active = pathname === item.href || (pathname?.startsWith(`${item.href}/`) ?? false);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 p-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {name ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() : "ST"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{name || "Student"}</p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 ml-64 pt-[100px] min-w-0">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
