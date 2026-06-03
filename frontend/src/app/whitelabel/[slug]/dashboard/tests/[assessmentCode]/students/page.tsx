"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WhitelabelTestDashboardStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const usersHref = `/whitelabel/${slug}/dashboard/users`;

  useEffect(() => {
    router.replace(usersHref);
  }, [router, usersHref]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  );
}
