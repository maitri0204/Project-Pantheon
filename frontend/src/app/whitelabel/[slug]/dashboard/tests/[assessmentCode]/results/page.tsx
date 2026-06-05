"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WhitelabelTestDashboardResultsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const code = typeof params?.assessmentCode === "string" ? params.assessmentCode : "";
  const dashboardHref = `/whitelabel/${slug}/dashboard/tests/${code}`;

  useEffect(() => {
    router.replace(dashboardHref);
  }, [router, dashboardHref]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  );
}
