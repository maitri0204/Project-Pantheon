"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import StudentPortalShell from "@/components/student/StudentPortalShell";
import DashboardPage from "@/app/dashboard/page";
import AssessmentsPage from "@/app/dashboard/assessments/page";
import UsersPage from "@/app/dashboard/users/page";
import ParentsPage from "@/app/dashboard/parents/page";
import CouponsPage from "@/app/dashboard/coupons/page";
import LedgerPage from "@/app/dashboard/ledger/page";
import ProfilePage from "@/app/dashboard/profile/page";
import WhitelabelTestDashboardPage from "@/app/whitelabel/[slug]/dashboard/tests/[assessmentCode]/page";
import StudentDashboardPage from "@/app/whitelabel/[slug]/student/dashboard/page";
import StudentAssessmentsPage from "@/app/whitelabel/[slug]/student/assessments/page";
import StudentResultsPage from "@/app/whitelabel/[slug]/student/results/page";
import StudentInvoicesPage from "@/app/whitelabel/[slug]/student/invoices/page";
import StudentRegisterPage from "@/app/whitelabel/[slug]/student/register/page";
import StudentTakeAssessmentPage from "@/app/whitelabel/[slug]/student/assessments/[code]/take/page";
import StudentAssessmentResultPage from "@/app/whitelabel/[slug]/student/assessments/[code]/result/page";
import StudentAssessmentInfoPage from "@/app/whitelabel/[slug]/student/assessments/[code]/info/page";
import StudentAssessmentAttemptListPage from "@/app/whitelabel/[slug]/student/assessments/[code]/page";
import StudentDetailView from "@/components/dashboard/StudentDetailView";
import ParentDetailView from "@/components/dashboard/ParentDetailView";
import AssessmentReportView from "@/components/reports/AssessmentReportView";
import AssessmentAttemptHistoryView from "@/components/dashboard/AssessmentAttemptHistoryView";
import LoginPageContent from "@/components/auth/LoginPageContent";
import { buildOrgReportPath, normalizeAssessmentCode } from "@/lib/assessmentAccess";

type CatchAllContent = {
  type: "student-shell" | "student-fullscreen" | "dashboard-shell";
  element: React.ReactNode;
};

function resolveCatchAllContent(rest: string[], slug: string): CatchAllContent | null {
  if (rest[0] === "student") {
    if (rest.length === 2 && rest[1] === "dashboard") {
      return { type: "student-shell", element: <StudentDashboardPage /> };
    }
    if (rest.length === 2 && rest[1] === "assessments") {
      return { type: "student-shell", element: <StudentAssessmentsPage /> };
    }
    if (rest.length === 2 && rest[1] === "results") {
      return { type: "student-shell", element: <StudentResultsPage /> };
    }
    if (rest.length === 2 && rest[1] === "invoices") {
      return { type: "student-shell", element: <StudentInvoicesPage /> };
    }
    if (rest.length === 2 && rest[1] === "register") {
      return { type: "student-shell", element: <StudentRegisterPage /> };
    }
    if (rest.length === 4 && rest[1] === "assessments" && rest[2] && rest[3] === "take") {
      return { type: "student-fullscreen", element: <StudentTakeAssessmentPage /> };
    }
    if (rest.length === 4 && rest[1] === "assessments" && rest[2] && rest[3] === "result") {
      return { type: "student-shell", element: <StudentAssessmentResultPage /> };
    }
    if (rest.length === 4 && rest[1] === "assessments" && rest[2] && rest[3] === "info") {
      return { type: "student-shell", element: <StudentAssessmentInfoPage /> };
    }
    if (rest.length === 3 && rest[1] === "assessments" && rest[2]) {
      return { type: "student-shell", element: <StudentAssessmentAttemptListPage /> };
    }
    return null;
  }

  if (rest[0] !== "dashboard") {
    return null;
  }

  if (rest.length === 1) {
    return { type: "dashboard-shell", element: <DashboardPage /> };
  }

  if (rest.length === 2) {
    if (rest[1] === "assessments") return { type: "dashboard-shell", element: <AssessmentsPage /> };
    if (rest[1] === "users") return { type: "dashboard-shell", element: <UsersPage /> };
    if (rest[1] === "parents") return { type: "dashboard-shell", element: <ParentsPage /> };
    if (rest[1] === "coupons") return { type: "dashboard-shell", element: <CouponsPage /> };
    if (rest[1] === "ledger") return { type: "dashboard-shell", element: <LedgerPage /> };
    if (rest[1] === "profile") return { type: "dashboard-shell", element: <ProfilePage /> };
  }

  if (rest.length === 3 && rest[1] === "tests") {
    return { type: "dashboard-shell", element: <WhitelabelTestDashboardPage /> };
  }

  if (rest.length === 3 && rest[1] === "users" && rest[2]) {
    return {
      type: "dashboard-shell",
      element: (
        <StudentDetailView
          studentId={rest[2]}
          basePath={`/whitelabel/${slug}/dashboard/users`}
          loginPath={`/whitelabel/${slug}/login`}
        />
      ),
    };
  }

  if (rest.length === 3 && rest[1] === "parents" && rest[2]) {
    return {
      type: "dashboard-shell",
      element: (
        <ParentDetailView
          parentId={rest[2]}
          basePath={`/whitelabel/${slug}/dashboard/parents`}
          loginPath={`/whitelabel/${slug}/login`}
        />
      ),
    };
  }

  if (rest.length === 5 && rest[1] === "users" && rest[3] === "reports" && rest[2] && rest[4]) {
    const usersBasePath = `/whitelabel/${slug}/dashboard/users`;
    const studentId = rest[2];
    const attemptId = rest[4];
    return {
      type: "dashboard-shell",
      element: (
        <AssessmentReportView
          fetchPath={`/platform/students/${studentId}/attempts/${attemptId}/report`}
          loginHref={`/whitelabel/${slug}/login`}
          topBackHref={`${usersBasePath}/${studentId}`}
          topBackLabel="Back to Student Details"
          bottomBackHref={`${usersBasePath}/${studentId}`}
          bottomBackLabel="Back to Student Details"
        />
      ),
    };
  }

  if (rest.length === 5 && rest[1] === "parents" && rest[3] === "reports" && rest[2] && rest[4]) {
    const parentsBasePath = `/whitelabel/${slug}/dashboard/parents`;
    const parentId = rest[2];
    const attemptId = rest[4];
    return {
      type: "dashboard-shell",
      element: (
        <AssessmentReportView
          fetchPath={`/platform/parents/${parentId}/attempts/${attemptId}/report`}
          loginHref={`/whitelabel/${slug}/login`}
          topBackHref={`${parentsBasePath}/${parentId}`}
          topBackLabel="Back to Parent Details"
          bottomBackHref={`${parentsBasePath}/${parentId}`}
          bottomBackLabel="Back to Parent Details"
        />
      ),
    };
  }

  if (
    rest.length === 6 &&
    rest[1] === "users" &&
    rest[3] === "assessments" &&
    rest[5] === "attempts" &&
    rest[2] &&
    rest[4]
  ) {
    const usersBasePath = `/whitelabel/${slug}/dashboard/users`;
    const studentId = rest[2];
    const code = normalizeAssessmentCode(rest[4]);
    return {
      type: "dashboard-shell",
      element: (
        <AssessmentAttemptHistoryView
          fetchPath={`/platform/students/${studentId}/assessments/${code}/attempts`}
          loginHref={`/whitelabel/${slug}/login`}
          assessmentCode={code}
          assessmentName={code}
          topBackHref={`${usersBasePath}/${studentId}`}
          topBackLabel="Back to Student Details"
          bottomBackHref={`${usersBasePath}/${studentId}`}
          bottomBackLabel="Back to Student Details"
          buildReportHref={(attemptId) => buildOrgReportPath(usersBasePath, studentId, attemptId, code)}
        />
      ),
    };
  }

  return null;
}

export default function WhitelabelCatchAllPage() {
  const params = useParams() as { slug?: string; rest?: string[] };
  const slug = params?.slug ?? "";
  const rest = params?.rest ?? [];

  const content = useMemo(() => resolveCatchAllContent(rest, slug), [rest, slug]);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Page not found.</p>
      </div>
    );
  }

  if (rest[0] === "login") {
    return <LoginPageContent forcedOrganizationSlug={slug} />;
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
