"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getStoredAuth } from "@/lib/api";
import {
  fetchAdversityAdminOverview,
  type AdversityAdminOverview,
} from "@/lib/dashboard/adversityAdminOverview";

export function useAdversityAdminOverview(loginPath: string, organizationSlug?: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AdversityAdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.user) {
      router.replace(loginPath);
      return;
    }

    fetchAdversityAdminOverview({ organizationSlug })
      .then((res) => setOverview(res))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [loginPath, organizationSlug, router]);

  return { loading, overview, error };
}
