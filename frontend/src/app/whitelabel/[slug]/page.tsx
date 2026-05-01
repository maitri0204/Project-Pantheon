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
                  className="h-14 w-14 rounded object-cover border border-gray-200"
                />
              ) : (
                <div className="h-14 w-14 rounded bg-gray-100 border border-gray-200" />
              )}
              <div>
                <h1 className="text-3xl font-bold text-black">{organization.branding.companyName || organization.name}</h1>
                <p className="text-black/80 text-base">Whitelabel Assessment Portal</p>
              </div>
            </div>
            <Link
              href={`/whitelabel/${organization.slug}/login`}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
              style={{
                backgroundColor: organization.branding.primaryColor,
              }}
            >
              Login
            </Link>
          </div>
        </div>

        {!canAccessAssessments ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">Login required</h2>
            <p className="mt-2 text-slate-700">
              {message || "Only users from this organization can view assessments and dashboard content."}
            </p>
            <div className="mt-4">
              <Link
                href={`/whitelabel/${organization.slug}/login`}
                className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Continue to Login
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-black mb-4">Available Assessments</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {assessments.map((assessment) => (
                <div
                  key={assessment._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-black">{assessment.name}</h3>
                  <p className="mt-2 text-sm text-black/80 min-h-[3rem]">{assessment.summary}</p>
                  <p className="mt-3 text-lg font-bold text-black">
                    {assessment.currency === "INR" ? "₹" : assessment.currency}
                    {assessment.basePrice}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-600 py-4">
          <p>© 2026 {organization.branding.companyName || organization.name}. Powered by Project Pantheon.</p>
        </div>
      </div>
    </div>
  );
}
