"use client";

import { useParams } from "next/navigation";

import StudentDetailView from "@/components/dashboard/StudentDetailView";

export default function DashboardStudentDetailPage() {
  const params = useParams<{ studentId: string }>();
  const studentId = params?.studentId || "";

  return <StudentDetailView studentId={studentId} basePath="/dashboard/users" loginPath="/login" />;
}
