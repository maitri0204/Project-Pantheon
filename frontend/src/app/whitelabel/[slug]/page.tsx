"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiRequest, getStoredAuth } from "@/lib/api";

type PortalResponse = {
  organization: {
    id: string;
    name: string;
    slug: string;
    website?: string;
    branding: {
      companyName: string;
      logoUrl?: string;
      primaryColor: string;
      accentColor: string;
    };
  };
  canAccessAssessments: boolean;
  message?: string;
  assessments: Array<{
    _id: string;
    code: string;
    name: string;
    summary: string;
    basePrice: number;
    currency: string;
  }>;
};

export default function WhitelabelPortalPage() {
  const params = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortalResponse | null>(null);
  const auth = getStoredAuth();

  useEffect(() => {
    const resolvedSlug = params?.slug;

    if (!resolvedSlug) {
      setError("No organization slug provided");
      setLoading(false);
      return;
    }

    const auth = getStoredAuth();

    apiRequest<PortalResponse>(`/platform/whitelabel/${resolvedSlug}`)
      .then((res) => setData(res))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Failed to load portal"))
      .finally(() => setLoading(false));

    if (auth?.token) {
      apiRequest<PortalResponse>(`/platform/whitelabel/${resolvedSlug}`, {}, auth.token)
        .then((res) => setData(res))
        .catch(() => {
          // keep public branding response if authenticated request fails
        });
    }
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error || "Portal not found"}</p>
      </div>
    );
  }

  const { organization, assessments, canAccessAssessments, message } = data;
  const isOrgAdminForPortal = auth?.user.role === "ORG_ADMIN" && auth.orgSlug === organization.slug;
  const isLearnerForPortal =
    (auth?.user.role === "STUDENT" || auth?.user.role === "PARENT") &&
    auth.orgSlug === organization.slug;
  const primaryCtaHref = isOrgAdminForPortal
    ? `/whitelabel/${organization.slug}/dashboard`
    : isLearnerForPortal
      ? `/whitelabel/${organization.slug}/student/dashboard`
      : `/whitelabel/${organization.slug}/login`;
  const primaryCtaLabel = isOrgAdminForPortal || isLearnerForPortal ? "Dashboard" : "Login";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {organization.branding.logoUrl ? (
                <img
                  src={organization.branding.logoUrl}
                  alt={`${organization.name} logo`}
                  className="h-18 w-18 object-contain"
                />
              ) : (
                <div className="h-18 w-18 bg-gray-100 border border-gray-200" />
              )}
              <div>
                <h1 className="text-3xl font-bold text-black">{organization.branding.companyName || organization.name}</h1>
                <p className="text-black/80 text-base">Whitelabel Assessment Portal</p>
              </div>
            </div>
            <Link
              href={primaryCtaHref}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
              style={{
                backgroundColor: organization.branding.primaryColor,
              }}
            >
              {primaryCtaLabel}
            </Link>
          </div>
        </div>

        {!canAccessAssessments ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Login required</h2>
            <p className="text-slate-600 mb-6 max-w-sm mx-auto">
              {message || "Only users from this organization can view assessments and dashboard content."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={primaryCtaHref}
                className="inline-flex justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {isOrgAdminForPortal ? "Open Dashboard" : "Login to Portal"}
              </Link>
              <Link
                href={`/whitelabel/${organization.slug}/student/register`}
                className="inline-flex justify-center rounded-xl border border-blue-300 bg-white px-6 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Register as Parent/Student
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Course-style header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Assessments</h2>
              <p className="text-gray-500 text-sm mt-1">{assessments.length} assessment{assessments.length !== 1 ? "s" : ""} available in your portal</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {assessments.map((assessment) => (
                <div
                  key={assessment._id}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all group overflow-hidden"
                >
                  {/* Course thumbnail placeholder */}
                  <div
                    className="h-36 flex items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${organization.branding.primaryColor}22 0%, ${organization.branding.accentColor}33 100%)`,
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: organization.branding.primaryColor }}
                    >
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="absolute top-3 right-3 text-xs font-medium bg-white/90 text-gray-700 rounded-full px-2.5 py-0.5 border border-gray-200">
                      {assessment.code || "ASSESS"}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors">
                      {assessment.name}
                    </h3>
                    {assessment.summary && (
                      <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">{assessment.summary}</p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {assessment.currency === "INR" ? "₹" : assessment.currency}{assessment.basePrice}
                      </span>
                      <Link
                        href={isLearnerForPortal ? `/whitelabel/${organization.slug}/student/assessments` : primaryCtaHref}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: organization.branding.primaryColor }}
                      >
                        {isLearnerForPortal ? "Take Test →" : "Start Test →"}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {assessments.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <p className="text-gray-500">No assessments available at the moment. Check back soon!</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center text-sm text-gray-600 py-4">
          <p>© 2026 {organization.branding.companyName || organization.name}</p>
        </div>
      </div>
    </div>
  );
}
