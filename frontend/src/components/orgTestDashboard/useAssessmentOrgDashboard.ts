"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getStoredAuth } from "@/lib/api";
import {
  fetchAssessmentAdminDashboard,
  type AssessmentAdminDashboardResponse,
} from "@/lib/dashboard/assessmentAdminDashboard";

export function useAssessmentOrgDashboard(
  loginPath: string,
  assessmentCode: string,
  organizationSlug?: string,
) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AssessmentAdminDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.token) {
      router.replace(loginPath);
      return;
    }

    fetchAssessmentAdminDashboard(auth.token, assessmentCode, {
      organizationSlug,
    })
      .then((res) => setData(res))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [assessmentCode, loginPath, organizationSlug, router]);

  return { loading, data, error };
}
