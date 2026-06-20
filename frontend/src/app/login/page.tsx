"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from "react";

import LoginPageContent from "@/components/auth/LoginPageContent";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const organizationSlug = searchParams?.get("organizationSlug")?.toLowerCase().trim();
    if (organizationSlug) {
      router.replace(`/whitelabel/${organizationSlug}/login`);
    }
  }, [router, searchParams]);

  const organizationSlug = searchParams?.get("organizationSlug")?.toLowerCase().trim();
  if (organizationSlug) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return <LoginPageContent />;
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
