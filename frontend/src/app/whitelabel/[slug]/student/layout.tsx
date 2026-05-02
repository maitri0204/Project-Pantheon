"use client";

import { useParams, usePathname } from "next/navigation";

import StudentPortalShell from "@/components/student/StudentPortalShell";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ slug: string }>();
  const pathname = usePathname();
  const slug = params?.slug || "";

  const isTakeTestPage = pathname?.includes("/student/assessments/") && pathname.endsWith("/take");
  const isPublicStudentRegisterPage = pathname?.endsWith("/student/register");

  if (isTakeTestPage || isPublicStudentRegisterPage) {
    return <>{children}</>;
  }

  return <StudentPortalShell slug={slug}>{children}</StudentPortalShell>;
}
