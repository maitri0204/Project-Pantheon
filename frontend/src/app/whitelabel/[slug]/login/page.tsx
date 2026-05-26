"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";

import LoginPageContent from "@/components/auth/LoginPageContent";

export const dynamic = "force-dynamic";

function WhitelabelLoginPageInner() {
  const params = useParams<{ slug: string }>();
  const slug = (params?.slug || "").toLowerCase().trim();

  return <LoginPageContent forcedOrganizationSlug={slug} />;
}

export default function WhitelabelLoginPage() {
  return (
    <Suspense>
      <WhitelabelLoginPageInner />
    </Suspense>
  );
}

