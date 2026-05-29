"use client";

import { useParams } from "next/navigation";

import ParentDetailView from "@/components/dashboard/ParentDetailView";

export default function DashboardParentDetailPage() {
  const params = useParams<{ parentId: string }>();
  const parentId = params?.parentId || "";

  return <ParentDetailView parentId={parentId} basePath="/dashboard/parents" loginPath="/login" />;
}
