"use client";

import { useParams } from "next/navigation";

import StudentDetailView from "@/components/dashboard/StudentDetailView";

export default function WhitelabelDashboardStudentDetailPage() {
  const params = useParams<{ slug: string; studentId: string }>();
  const slug = params?.slug || "";
  const studentId = params?.studentId || "";

  return <StudentDetailView studentId={studentId} basePath={`/whitelabel/${slug}/dashboard/users`} loginPath={`/whitelabel/${slug}/login`} />;
}
