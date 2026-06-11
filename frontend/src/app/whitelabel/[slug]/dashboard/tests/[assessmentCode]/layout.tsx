"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { getTestDashboardMeta } from "@/lib/dashboard/testDashboard";

/** Uses parent whitelabel dashboard layout (DashboardShell) - no alternate shell. */
export default function WhitelabelTestDashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const assessmentCode = typeof params?.assessmentCode === "string" ? params.assessmentCode : "";
  const meta = getTestDashboardMeta(assessmentCode);

  useEffect(() => {
    if (!slug) return;
    if (!meta) {
      router.replace(`/whitelabel/${slug}/dashboard`);
    }
  }, [meta, router, slug]);

  if (!meta) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
