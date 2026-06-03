"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getStoredAuth } from "@/lib/api";
import {
  fetchAcademicCareerAdminOverview,
  type AcademicCareerAdminOverview,
} from "@/lib/dashboard/academicCareerAdminOverview";

export function useAcademicCareerAdminOverview(loginPath: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AcademicCareerAdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.token) {
      router.replace(loginPath);
      return;
    }

    fetchAcademicCareerAdminOverview(auth.token)
      .then((res) => setOverview(res))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [loginPath, router]);

  return { loading, overview, error };
}
