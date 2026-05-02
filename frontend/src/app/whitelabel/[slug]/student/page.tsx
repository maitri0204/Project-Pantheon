"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StudentRootPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  useEffect(() => {
    const slug = params?.slug;
    if (!slug) return;
    router.replace(`/whitelabel/${slug}/student/dashboard`);
  }, [params?.slug, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  );
}
