"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { getDashboardLoginPath } from "@/lib/dashboardAuth";

type Organization = {
  _id: string;
  name: string;
  slug: string;
  website?: string;
  type: string;
  isActive: boolean;
  contactEmail?: string;
  phoneNumber?: string;
  contactPersonName?: string;
  companyName?: string;
  createdAt?: string;
};

type OrganizationCouponSummaryItem = {
  assessmentCode: string;
  assessmentName: string;
  configId?: string;
  prefix: string;
  totalCoupons: number;
  usedCoupons: number;
  remainingCoupons: number;
  discountAmount: number;
  isConfigured: boolean;
  isActive: boolean;
};

type OrganizationCouponDetailsResponse = {
  organization: Organization;
  couponSummary: OrganizationCouponSummaryItem[];
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getWebsiteHref = (website?: string) => {
  if (!website?.trim()) return "";
  const trimmed = website.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const formatPhoneNumber = (value?: string) => {
  if (!value?.trim()) return "-";
  const trimmed = value.trim().replace(/\s+/g, "");
  const indiaMatch = trimmed.match(/^\+91(\d{10})$/);
  if (indiaMatch) {
    const local = indiaMatch[1];
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  const match = trimmed.match(/^(\+\d{1,4})(\d+)$/);
  if (match) return `${match[1]} ${match[2]}`;
  return value;
};

const getAssessmentDisplayName = (code: string, fallbackName: string): string => {
  const normalized = code.toUpperCase().trim();
  if (normalized === "METACOGNITION_TEST") return "TEST - Thinking & Expression Skills Test";
  if (normalized === "JOHARI_WINDOW") return "CLEAR - Cognitive Lens for Emotional Awareness & Reflection";
  if (normalized === "RESILIENCE_TEST" || normalized === "ADVERSITY_TEST") return "Resilience Quotient (RQ) Assessment";
  if (normalized === "EMPLOYABILITY_QUOTIENT") return "Employability Quotient";
  return fallbackName;
};

export default function OrganizationDetailsPage() {
  const router = useRouter();
  const params = useParams() as Record<string, string | string[]>;
  const organizationId = typeof params.organizationId === "string" ? params.organizationId : "";

  const auth = useMemo(() => getStoredAuth(), []);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [couponSummary, setCouponSummary] = useState<OrganizationCouponSummaryItem[]>([]);
  const [couponDrafts, setCouponDrafts] = useState<Record<string, { prefix: string; totalCoupons: string; discountAmount: string; isActive: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!auth) { router.replace(getDashboardLoginPath()); return; }
    setLoading(true);
    try {
      const res = await apiRequest<OrganizationCouponDetailsResponse>(
        `/superadmin/organizations/${organizationId}/coupons`,
        {},
        auth.token
      );
      setOrganization(res.organization);
      setCouponSummary(res.couponSummary || []);
      const drafts: Record<string, { prefix: string; totalCoupons: string; discountAmount: string; isActive: boolean }> = {};
      (res.couponSummary || []).forEach((item) => {
        drafts[item.assessmentCode] = {
          prefix: item.prefix || item.assessmentCode.replace(/_TEST$|_WINDOW$/g, "").replace(/[^A-Z]/g, "").slice(0, 10),
          totalCoupons: String(item.totalCoupons || ""),
          discountAmount: String(item.discountAmount ?? ""),
          isActive: item.isActive,
        };
      });
      setCouponDrafts(drafts);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("OrganizationDetailsPage: failed to load organization details", err, organizationId);
      router.replace("/dashboard/organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [organizationId]);

  const saveCouponConfig = async (item: OrganizationCouponSummaryItem) => {
    if (!auth || !organization) return;
    const draft = couponDrafts[item.assessmentCode];
    if (!draft?.prefix?.trim() || !draft?.totalCoupons?.trim()) {
      setError("Prefix and total coupons are required");
      return;
    }

    setSaving(item.assessmentCode);
    setError(null);
    setMessage(null);
    try {
      if (item.configId) {
        await apiRequest(`/superadmin/organizations/${organization._id}/coupons/${item.configId}`, {
          method: "PATCH",
          body: JSON.stringify({
            prefix: draft.prefix.trim().toUpperCase(),
            totalCoupons: Number(draft.totalCoupons),
            discountAmount: draft.discountAmount.trim() !== "" ? Number(draft.discountAmount) : 0,
            isActive: draft.isActive,
          }),
        }, auth.token);
      } else {
        await apiRequest(`/superadmin/organizations/${organization._id}/coupons`, {
          method: "POST",
          body: JSON.stringify({
            assessmentCode: item.assessmentCode,
            prefix: draft.prefix.trim().toUpperCase(),
            totalCoupons: Number(draft.totalCoupons),
            discountAmount: draft.discountAmount.trim() !== "" ? Number(draft.discountAmount) : 0,
            isActive: draft.isActive,
          }),
        }, auth.token);
      }

      const res = await apiRequest<OrganizationCouponDetailsResponse>(
        `/superadmin/organizations/${organization._id}/coupons`,
        {},
        auth.token
      );
      setCouponSummary(res.couponSummary || []);
      setMessage(`Coupon settings saved for ${item.assessmentName}`);
      setTimeout(() => setMessage(null), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save coupon configuration");
    } finally {
      setSaving(null);
    }
  };

  const totalCoupons = couponSummary.reduce((s, i) => s + i.totalCoupons, 0);
  const totalUsed = couponSummary.reduce((s, i) => s + i.usedCoupons, 0);
  const totalRemaining = couponSummary.reduce((s, i) => s + i.remainingCoupons, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!organization) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 min-w-0">
      {/* Back + Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Link
          href="/dashboard/organizations"
          className="flex items-center gap-1.5 text-sm text-black hover:text-black font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Organizations
        </Link>
        <span className="text-black">/</span>
        <span className="min-w-0 truncate text-sm font-semibold text-black">{organization.name}</span>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="break-words text-2xl font-bold text-black sm:text-3xl">{organization.name}</h1>
          <p className="text-black mt-1 text-base">Organization details and coupon configuration.</p>
          {organization.slug && (
            <Link
              href={`/whitelabel/${organization.slug}/dashboard`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Open organization analytics dashboard →
            </Link>
          )}
        </div>
        <span className={`mt-1 text-sm px-3 py-1 rounded-full font-semibold ${organization.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-black"}`}>
          {organization.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Toast */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{message}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Organization Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h2 className="text-xl font-bold text-black mb-4">Organization Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-black font-semibold">Website Link</p>
            {organization.website ? (
              <a
                href={getWebsiteHref(organization.website)}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 block text-base font-semibold text-blue-700 hover:text-blue-800 underline break-all"
              >
                {getWebsiteHref(organization.website)}
              </a>
            ) : (
              <p className="mt-1.5 text-base font-semibold text-black">-</p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-black font-semibold">Name</p>
            <p className="mt-1.5 text-base font-semibold text-black">{organization.contactPersonName || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-black font-semibold">Phone Number</p>
            <p className="mt-1.5 text-base font-semibold text-black">{formatPhoneNumber(organization.phoneNumber)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-black font-semibold">Institute / Company Name</p>
            <p className="mt-1.5 text-base font-semibold text-black break-words">{organization.companyName || organization.name || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-black font-semibold">Contact Email</p>
            <p className="mt-1.5 text-base font-semibold text-black break-all">{organization.contactEmail || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-black font-semibold">Created On</p>
            <p className="mt-1.5 text-base font-semibold text-black">{formatDate(organization.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Coupon Summary Boxes */}
      <div>
        <h2 className="text-xl font-bold text-black mb-3">Coupon Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-1">
            <p className="text-sm text-black font-medium">Total Coupons</p>
            <p className="text-4xl font-bold text-black mt-1">{totalCoupons}</p>
            <p className="text-xs text-black mt-1">Across all assessments</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-1">
            <p className="text-sm text-black font-medium">Total Used</p>
            <p className="text-4xl font-bold text-emerald-600 mt-1">{totalUsed}</p>
            <p className="text-xs text-black mt-1">Allocated to students</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-1">
            <p className="text-sm text-black font-medium">Total Remaining</p>
            <p className="text-4xl font-bold text-blue-600 mt-1">{totalRemaining}</p>
            <p className="text-xs text-black mt-1">Available to allocate</p>
          </div>
        </div>
      </div>

      {/* Test-wise Coupon Configuration */}
      <div>
        <h2 className="text-xl font-bold text-black mb-3">Assessment Configuration</h2>
        <div className="space-y-4">
          {couponSummary.map((item) => {
            const draft = couponDrafts[item.assessmentCode] || {
              prefix: item.prefix || item.assessmentCode,
              totalCoupons: String(item.totalCoupons || ""),
              discountAmount: String(item.discountAmount ?? ""),
              isActive: item.isActive,
            };
            const usedPct = item.totalCoupons > 0 ? Math.round((item.usedCoupons / item.totalCoupons) * 100) : 0;
            const displayName = getAssessmentDisplayName(item.assessmentCode, item.assessmentName);
            const shortName = displayName.split(" - ")[0];
            const colorMap: Record<string, { bg: string; ring: string; text: string; accent: string }> = {
              CAREER_COMPASS: { bg: "from-emerald-50 to-emerald-100", ring: "ring-emerald-200", text: "text-emerald-700", accent: "bg-emerald-500" },
              CAREER_DNA: { bg: "from-purple-50 to-purple-100", ring: "ring-purple-200", text: "text-purple-700", accent: "bg-purple-500" },
              JOHARI_WINDOW: { bg: "from-amber-50 to-amber-100", ring: "ring-amber-200", text: "text-amber-700", accent: "bg-amber-500" },
              LITMUS_TEST: { bg: "from-blue-50 to-blue-100", ring: "ring-blue-200", text: "text-blue-700", accent: "bg-blue-500" },
              METACOGNITION_TEST: { bg: "from-rose-50 to-rose-100", ring: "ring-rose-200", text: "text-rose-700", accent: "bg-rose-500" },
            };
            const colors = colorMap[item.assessmentCode] || colorMap.CAREER_COMPASS;

            return (
              <div
                key={item.assessmentCode}
                className={`bg-gradient-to-br ${colors.bg} rounded-3xl border-2 ${colors.ring} p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-2xl sm:p-6`}
              >
                {/* Header with badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`w-12 h-12 rounded-2xl ${colors.accent} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {shortName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold text-lg ${colors.text}`}>{shortName}</p>
                        <p className={`text-xs ${colors.text} opacity-70 font-medium mt-0.5`}>Configuration</p>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap shadow-md ${
                    item.isConfigured && item.isActive
                      ? "bg-green-500 text-white"
                      : item.isConfigured
                      ? "bg-amber-500 text-white"
                      : "bg-gray-400 text-white"
                  }`}>
                    {item.isConfigured ? (item.isActive ? "●  Active" : "◯  Disabled") : "Not Set"}
                  </span>
                </div>

                {/* Stats cards in row */}
                <div className="mb-5 grid grid-cols-1 gap-3 min-[360px]:grid-cols-3">
                  <div className="bg-white/70 backdrop-blur rounded-2xl p-3 text-center shadow-md border border-white/50">
                    <p className={`text-2xl font-bold ${colors.text}`}>{item.totalCoupons}</p>
                    <p className="text-xs text-black font-medium mt-0.5">Total</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur rounded-2xl p-3 text-center shadow-md border border-white/50">
                    <p className="text-2xl font-bold text-emerald-600">{item.usedCoupons}</p>
                    <p className="text-xs text-black font-medium mt-0.5">Used</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur rounded-2xl p-3 text-center shadow-md border border-white/50">
                    <p className="text-2xl font-bold text-blue-600">{item.remainingCoupons}</p>
                    <p className="text-xs text-black font-medium mt-0.5">Remaining</p>
                  </div>
                </div>

                {/* Progress bar */}
                {item.isConfigured && item.totalCoupons > 0 && (
                  <div className="mb-5">
                    <div className="flex justify-between text-xs font-semibold text-black mb-2">
                      <span>Allocation Progress</span>
                      <span>{usedPct}%</span>
                    </div>
                    <div className="h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-300 shadow-lg ${
                          usedPct >= 90
                            ? "bg-gradient-to-r from-red-400 to-red-500"
                            : usedPct >= 60
                            ? "bg-gradient-to-r from-amber-400 to-amber-500"
                            : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        }`}
                        style={{ width: `${usedPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Configuration inputs */}
                <div className="bg-white/50 backdrop-blur rounded-2xl p-4 shadow-md border border-white/60">
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide">Prefix</label>
                      <input
                        value={draft.prefix}
                        onChange={(e) => setCouponDrafts((prev) => ({
                          ...prev,
                          [item.assessmentCode]: { ...draft, prefix: e.target.value.toUpperCase() },
                        }))}
                        placeholder="e.g. CC"
                        className={`w-full border-2 ${colors.ring} rounded-xl px-3 py-2.5 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${colors.text}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide">Coupon Limit</label>
                      <input
                        type="number"
                        min={1}
                        value={draft.totalCoupons}
                        onChange={(e) => setCouponDrafts((prev) => ({
                          ...prev,
                          [item.assessmentCode]: { ...draft, totalCoupons: e.target.value },
                        }))}
                        placeholder="100"
                        className="w-full border-2 border-gray-300 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide">Discount (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={draft.discountAmount}
                        onChange={(e) => setCouponDrafts((prev) => ({
                          ...prev,
                          [item.assessmentCode]: { ...draft, discountAmount: e.target.value },
                        }))}
                        placeholder="0 = free"
                        className="w-full border-2 border-gray-300 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide">Status</label>
                      <button
                        onClick={() => setCouponDrafts((prev) => ({
                          ...prev,
                          [item.assessmentCode]: { ...draft, isActive: !draft.isActive },
                        }))}
                        className={`w-full py-2.5 px-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                          draft.isActive
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-300 text-black hover:bg-gray-400"
                        }`}
                      >
                        {draft.isActive ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                    <button
                      onClick={() => void saveCouponConfig(item)}
                      disabled={saving === item.assessmentCode}
                      className="col-span-2 sm:col-span-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {saving === item.assessmentCode ? "Saving..." : item.configId ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {couponSummary.length === 0 && (
            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 shadow-sm px-8 py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-black font-semibold">No assessments available</p>
              <p className="text-sm text-black mt-1">Configure assessments when they become available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
