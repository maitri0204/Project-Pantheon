"use client";

import { useParams } from "next/navigation";

import ParentDetailView from "@/components/dashboard/ParentDetailView";

export default function WhitelabelDashboardParentDetailPage() {
  const params = useParams<{ slug: string; parentId: string }>();
  const slug = params?.slug || "";
  const parentId = params?.parentId || "";

  return (
    <ParentDetailView
      parentId={parentId}
      basePath={`/whitelabel/${slug}/dashboard/parents`}
      loginPath={`/whitelabel/${slug}/login`}
    />
  );
}
