"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { apiRequest, clearStoredAuth, getStoredAuth } from "@/lib/api";

type NavDefinition = {
  label: string;
  suffix: string;
  exact: boolean;
  icon: React.ReactNode;
};

type DashboardShellProps = {
  children: React.ReactNode;
  basePath: string;
  loginPath: string;
  expectedOrgSlug?: string;
  redirectOrgAdminToWhitelabel?: boolean;
};

type OrgBrandingResponse = {
  organization: {
    branding: {
      companyName: string;
      logoUrl?: string;
    };
  };
};

const navDefinitions: NavDefinition[] = [
  {
    label: "Dashboard",
    suffix: "",
    exact: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    label: "Organizations",
    suffix: "/organizations",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    label: "Students",
    suffix: "/users",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    label: "Parents",
    suffix: "/parents",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.856-1.487M7 20H2v-2a3 3 0 015.856-1.487M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    label: "Questions",
    suffix: "/questions",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: "Assessments",
    suffix: "/assessments",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    label: "Coupons",
    suffix: "/coupons",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
        />
      </svg>
    ),
  },
  {
    label: "Ledger",
    suffix: "/ledger",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    label: "Profile",
    suffix: "/profile",
    exact: false,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5.121 17.804A7.968 7.968 0 0112 14a7.968 7.968 0 016.879 3.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm7 2a10 10 0 11-20 0 10 10 0 0120 0z"
        />
      </svg>
    ),
  },
];

const orgAdminAllowedSuffixes = new Set([
  "",
  "/assessments",
  "/users",
  "/parents",
  "/coupons",
  "/ledger",
  "/profile",
  "/tests",
]);
const superadminHiddenSuffixes = new Set<string>(["/coupons"]);

export default function DashboardShell({
  children,
  basePath,
  loginPath,
  expectedOrgSlug,
  redirectOrgAdminToWhitelabel = false,
}: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<"SUPERADMIN" | "ORG_ADMIN" | "STUDENT" | "">("");
  const [orgCompanyName, setOrgCompanyName] = useState("");
  const [orgLogoUrl, setOrgLogoUrl] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  const toHref = (suffix: string) => `${basePath}${suffix}`;

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      router.replace(loginPath);
      return;
    }

    if (auth.user.role !== "SUPERADMIN" && auth.user.role !== "ORG_ADMIN") {
      router.replace(loginPath);
      return;
    }

    const orgBasePath = auth.user.role === "ORG_ADMIN" && auth.orgSlug
      ? `/whitelabel/${auth.orgSlug}/dashboard`
      : "/dashboard";

    if (auth.user.role === "ORG_ADMIN" && redirectOrgAdminToWhitelabel && auth.orgSlug && pathname?.startsWith("/dashboard")) {
      const suffix = pathname.slice("/dashboard".length);
      router.replace(`${orgBasePath}${suffix}`);
      return;
    }

    if (auth.user.role === "ORG_ADMIN" && expectedOrgSlug && auth.orgSlug && auth.orgSlug !== expectedOrgSlug) {
      router.replace(orgBasePath);
      return;
    }

    setUserName(`${auth.user.firstName} ${auth.user.lastName}`.trim());
    setUserEmail(auth.user.email);
    setUserRole(auth.user.role);
    setOrgCompanyName(auth.orgCompanyName || "");
    setOrgLogoUrl(auth.orgLogoUrl || "");
    setAuthResolved(true);

    if (auth.user.role === "ORG_ADMIN" && auth.orgSlug && (!auth.orgLogoUrl || !auth.orgCompanyName)) {
      void apiRequest<OrgBrandingResponse>(`/platform/whitelabel/${auth.orgSlug}`, {}, auth.token)
        .then((res) => {
          const fetchedCompanyName = res.organization?.branding?.companyName || "";
          const fetchedLogoUrl = res.organization?.branding?.logoUrl || "";
          if (fetchedCompanyName) {
            setOrgCompanyName(fetchedCompanyName);
          }
          if (fetchedLogoUrl) {
            setOrgLogoUrl(fetchedLogoUrl);
          }
        })
        .catch(() => {
          // keep existing auth-based fallback values
        });
    }
  }, [expectedOrgSlug, loginPath, pathname, redirectOrgAdminToWhitelabel, router]);

  const navItems = useMemo(() => {
    const filtered = userRole === "ORG_ADMIN"
      ? navDefinitions.filter((item) => orgAdminAllowedSuffixes.has(item.suffix))
      : navDefinitions.filter((item) => !superadminHiddenSuffixes.has(item.suffix));

    return filtered.map((item) => ({
      ...item,
      href: toHref(item.suffix),
    }));
  }, [basePath, userRole]);

  useEffect(() => {
    if (userRole !== "ORG_ADMIN" || !pathname) {
      return;
    }

    const allowedPaths = [
      toHref(""),
      toHref("/assessments"),
      toHref("/users"),
      toHref("/parents"),
      toHref("/coupons"),
      toHref("/ledger"),
      toHref("/profile"),
      toHref("/tests"),
    ];
    const isAllowed = allowedPaths.some((allowedPath) => (
      pathname === allowedPath || pathname.startsWith(`${allowedPath}/`)
    ));

    if (!isAllowed) {
      router.replace(toHref("/users"));
    }
  }, [pathname, router, userRole, basePath]);

  if (!authResolved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <div>
            <p className="text-base font-semibold text-black">Loading dashboard...</p>
            <p className="text-sm text-black">Preparing the correct workspace for your account.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearStoredAuth();
    router.replace("/");
  };

  const isActive = (href: string, exact: boolean) => {
    if (!pathname) {
      return false;
    }

    if (exact) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isSuperAdmin = userRole === "SUPERADMIN";
  const headerHeightClass = isSuperAdmin ? "h-[80px] sm:h-[100px]" : "h-[72px] sm:h-[88px]";
  const headerOffsetClass = isSuperAdmin ? "top-[80px] sm:top-[100px]" : "top-[72px] sm:top-[88px]";
  const contentOffsetClass = isSuperAdmin ? "pt-[80px] sm:pt-[100px]" : "pt-[72px] sm:pt-[88px]";
  const sidebarHeightClass = isSuperAdmin
    ? "h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)]"
    : "h-[calc(100vh-72px)] sm:h-[calc(100vh-88px)]";
  const logoSizeClass = isSuperAdmin
    ? "w-[200px] h-[64px] sm:w-[300px] sm:h-[88px] md:w-[340px] md:h-[96px]"
    : "w-[110px] h-[42px] sm:w-[160px] sm:h-[64px] md:w-[200px] md:h-[76px]";

  return (
    <div className="min-h-screen app-surface">
      <header className={`fixed top-0 left-0 right-0 z-50 ${headerHeightClass} bg-white/95 backdrop-blur border-b border-gray-200 flex items-center pl-3 pr-3 sm:pl-5 sm:pr-4 md:pl-8 gap-2 sm:gap-4 shadow-sm`}>
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-black"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 md:ml-1 min-w-0 max-w-[45vw] sm:max-w-none">
          <div className={`${logoSizeClass} flex items-center justify-center text-white text-xs font-bold overflow-hidden rounded-xl flex-shrink-0`}>
            {userRole === "ORG_ADMIN" && orgLogoUrl ? (
              <img
                src={orgLogoUrl}
                alt={`${orgCompanyName || "Organization"} logo`}
                className="h-full w-full object-contain"
              />
            ) : userRole === "SUPERADMIN" ? (
              <img src="/logo.png" alt="Assessment Center" className="h-full w-full object-contain" />
            ) : (
              <span>{userName ? userName.charAt(0).toUpperCase() : "PP"}</span>
            )}
          </div>
        </div>

        <div className="flex-1" />

        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-base font-bold shadow flex-shrink-0 mr-1 sm:mr-4">
          {userName.charAt(0).toUpperCase() || "S"}
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed ${headerOffsetClass} left-0 z-40 ${sidebarHeightClass} w-[min(18rem,85vw)] bg-white/95 backdrop-blur border-r border-gray-200 flex flex-col shadow-sm transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-black hover:bg-gray-100 hover:text-black"
                }`}
              >
                <span className={active ? "text-blue-600" : "text-gray-400"}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {userName.charAt(0).toUpperCase() || "S"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-black truncate">{userName}</p>
              <p className="text-[11px] text-black truncate">{userEmail}</p>
              <button
                onClick={handleLogout}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className={`md:ml-72 ${contentOffsetClass} min-h-screen overflow-x-hidden`}>
        <main className="p-2 sm:p-4 md:p-6">
          <div className="content-wrap app-panel w-full max-w-full overflow-x-hidden p-3 sm:p-5 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
