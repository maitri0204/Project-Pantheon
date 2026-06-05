"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuperadminTestDashboardStudentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/users");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    </div>
  );
}
