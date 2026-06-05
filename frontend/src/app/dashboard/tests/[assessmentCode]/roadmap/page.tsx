"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SuperadminTestDashboardRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const code = typeof params?.assessmentCode === "string" ? params.assessmentCode : "";

  useEffect(() => {
    if (code) {
      router.replace(`/dashboard/tests/${code}`);
    }
  }, [router, code]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  );
}
