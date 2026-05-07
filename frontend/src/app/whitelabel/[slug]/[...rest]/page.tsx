"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import StudentPortalShell from "@/components/student/StudentPortalShell";
import DashboardPage from "@/app/dashboard/page";
import AssessmentsPage from "@/app/dashboard/assessments/page";
import UsersPage from "@/app/dashboard/users/page";
import StudentDashboardPage from "@/app/whitelabel/[slug]/student/dashboard/page";
import StudentAssessmentsPage from "@/app/whitelabel/[slug]/student/assessments/page";
import StudentResultsPage from "@/app/whitelabel/[slug]/student/results/page";
import StudentTakeAssessmentPage from "@/app/whitelabel/[slug]/student/assessments/[code]/take/page";
import StudentAssessmentResultPage from "@/app/whitelabel/[slug]/student/assessments/[code]/result/page";

export default function WhitelabelCatchAllPage() {
  const params = useParams() as { slug?: string; rest?: string[] };
  const slug = params?.slug ?? "";
  const rest = params?.rest ?? [];

  const content = useMemo(() => {
    if (rest[0] === "student") {
      if (rest.length === 2 && rest[1] === "dashboard") {
        return {
          type: "student-shell" as const,
          element: <StudentDashboardPage />,
        };
      }

      if (rest.length === 2 && rest[1] === "assessments") {
        return {
          type: "student-shell" as const,
          element: <StudentAssessmentsPage />,
        };
      }

      if (rest.length === 2 && rest[1] === "results") {
        return {
          type: "student-shell" as const,
          element: <StudentResultsPage />,
        };
      }

      if (rest.length === 4 && rest[1] === "assessments" && rest[3] === "take") {
        return {
          type: "student-fullscreen" as const,
          element: <StudentTakeAssessmentPage />,
        };
      }

      if (rest.length === 4 && rest[1] === "assessments" && rest[3] === "result") {
        return {
          type: "student-shell" as const,
          element: <StudentAssessmentResultPage />,
        };
      }

      return null;
    }

    if (rest[0] !== "dashboard") {
      return null;
    }

    if (rest.length === 1) {
      return {
        type: "dashboard-shell" as const,
        element: <DashboardPage />,
      };
    }

    if (rest.length === 2 && rest[1] === "assessments") {
      return {
        type: "dashboard-shell" as const,
        element: <AssessmentsPage />,
      };
    }

    if (rest.length === 2 && rest[1] === "users") {
      return {
        type: "dashboard-shell" as const,
        element: <UsersPage />,
      };
    }

    return null;
  }, [rest]);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Page not found.</p>
      </div>
    );
  }

  if (rest[0] === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Page not found.</p>
      </div>
    );
  }

  if (content.type === "student-fullscreen") {
    return content.element;
  }

  if (content.type === "student-shell") {
    return <StudentPortalShell slug={slug}>{content.element}</StudentPortalShell>;
  }

  return (
    <DashboardShell
      basePath={`/whitelabel/${slug}/dashboard`}
      loginPath={`/whitelabel/${slug}/login`}
      expectedOrgSlug={slug}
    >
      {content.element}
    </DashboardShell>
  );
}
