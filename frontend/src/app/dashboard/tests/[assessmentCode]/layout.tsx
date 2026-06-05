"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { getTestDashboardMeta } from "@/lib/dashboard/testDashboard";

export default function SuperadminTestDashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const assessmentCode = typeof params?.assessmentCode === "string" ? params.assessmentCode : "";
  const meta = getTestDashboardMeta(assessmentCode);

  useEffect(() => {
    if (!meta) {
      router.replace("/dashboard");
    }
  }, [meta, router]);

  if (!meta) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
