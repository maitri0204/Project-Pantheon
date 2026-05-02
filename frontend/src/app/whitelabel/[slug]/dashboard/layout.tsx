"use client";

import { useParams } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";

export default function WhitelabelDashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  return (
    <DashboardShell
      basePath={`/whitelabel/${slug}/dashboard`}
      loginPath={slug ? `/whitelabel/${slug}/login` : "/login"}
      expectedOrgSlug={slug || undefined}
    >
      {children}
    </DashboardShell>
  );
}
