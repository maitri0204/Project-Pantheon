"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StudentAssessmentAttemptListPage() {
  const params = useParams<{ slug?: string; code?: string }>();
  const router = useRouter();
  const slug = params?.slug || "";
  const code = String(params?.code || "").toUpperCase();

  useEffect(() => {
    if (slug && code) {
      router.replace(`/whitelabel/${slug}/student/assessments/${code}/result`);
    }
  }, [slug, code, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  );
}
