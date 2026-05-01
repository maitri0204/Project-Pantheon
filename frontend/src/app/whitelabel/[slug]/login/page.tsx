"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WhitelabelLoginRedirectPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  useEffect(() => {
    const slug = params?.slug;
    if (!slug) {
      router.replace("/login");
      return;
    }

    router.replace(`/login?organizationSlug=${encodeURIComponent(slug)}`);
  }, [params?.slug, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  );
}
