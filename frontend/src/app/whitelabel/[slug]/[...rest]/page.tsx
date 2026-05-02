"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardPage from "@/app/dashboard/page";
import AssessmentsPage from "@/app/dashboard/assessments/page";
import UsersPage from "@/app/dashboard/users/page";

export default function WhitelabelCatchAllPage() {
  const router = useRouter();
  const params = useParams() as { slug?: string; rest?: string[] };
  const slug = params?.slug ?? "";
  const rest = params?.rest ?? [];

  useEffect(() => {
    if (!slug || rest[0] !== "login") {
      return;
    }

    router.replace(`/login?organizationSlug=${encodeURIComponent(slug)}`);
  }, [rest, router, slug]);

  const content = useMemo(() => {
    if (rest[0] !== "dashboard") {
      return null;
    }

    if (rest.length === 1) {
      return <DashboardPage />;
    }

    if (rest.length === 2 && rest[1] === "assessments") {
      return <AssessmentsPage />;
    }

    if (rest.length === 2 && rest[1] === "users") {
      return <UsersPage />;
    }

    return null;
  }, [rest]);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Page not found.</p>
      </div>
    );
  }

  if (rest[0] === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Page not found.</p>
      </div>
    );
  }

  return (
    <DashboardShell
      basePath={`/whitelabel/${slug}/dashboard`}
      loginPath={`/whitelabel/${slug}/login`}
      expectedOrgSlug={slug}
    >
      {content}
    </DashboardShell>
  );
}
