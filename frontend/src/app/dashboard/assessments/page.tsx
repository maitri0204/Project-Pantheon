"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { getDashboardLoginPath } from "@/lib/dashboardAuth";
import { formatReleaseDateForInput } from "@/lib/assessmentRelease";

type Assessment = {
  _id: string;
  code: string;
  name: string;
  slug: string;
  summary: string;
  category: string;
  basePrice: number;
  gstEnabled?: boolean;
  gstPercentage?: number;
  currency: string;
  questionBankStatus: "linked" | "pending-import" | "imported";
  questionCount: number;
  studentVisibleQuestionCount?: number;
  sourceProject: string;
  active: boolean;
  tags: string[];
  releaseDate?: string | null;
  isReleased?: boolean;
  releaseLabel?: string | null;
};

type SuperadminResponse = {
  assessments: Assessment[];
};

const normalizeAssessmentCodeForDisplay = (code: string) => {
  const normalized = String(code || "").toUpperCase().trim();
  if (normalized === "METACOGNITION" || normalized === "METACOGNITION_TEST") return "TEST";
  if (normalized === "JOHARI_WINDOW" || normalized === "JOHARI" || normalized === "CLEAR") return "CLEAR";
  return normalized;
};

const normalizeAssessmentCategoryForDisplay = (category: string, code: string) => {
  const normalizedCode = String(code || "").toUpperCase().trim();
  if (normalizedCode === "METACOGNITION" || normalizedCode === "METACOGNITION_TEST") return "TEST";
  if (normalizedCode === "JOHARI_WINDOW" || normalizedCode === "JOHARI" || normalizedCode === "CLEAR") return "CLEAR";
  return category;
};

const formatQuestionCountLabel = (total: number, visible?: number) => {
  if (!Number.isFinite(total)) return "-";
  const studentVisible = Number.isFinite(visible) ? Number(visible) : total;
  if (studentVisible !== total) {
    return `${total.toLocaleString()} (${studentVisible.toLocaleString()})`;
  }
  return total.toLocaleString();
};

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [gstEnabledDrafts, setGstEnabledDrafts] = useState<Record<string, boolean>>({});
  const [gstRateDrafts, setGstRateDrafts] = useState<Record<string, string>>({});
  const [masterGstEnabled, setMasterGstEnabled] = useState(false);
  const [masterGstRate, setMasterGstRate] = useState("18");
  const [releaseDateDrafts, setReleaseDateDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const auth = useMemo(() => getStoredAuth(), []);
  const [isOrgAdmin, setIsOrgAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace(getDashboardLoginPath());
      return;
    }

    setIsOrgAdmin(a.user.role === "ORG_ADMIN");
  }, []);

  const load = async () => {
    const currentAuth = getStoredAuth();
    if (!currentAuth) {
      router.replace(getDashboardLoginPath());
      return;
    }

    const orgAdmin = currentAuth.user.role === "ORG_ADMIN";
    setLoading(true);
    try {
      let list: Assessment[];
      if (orgAdmin) {
        const res = await apiRequest<SuperadminResponse>("/platform/assessments", {}, currentAuth.token);
        list = res.assessments;
      } else {
        const res = await apiRequest<SuperadminResponse>("/superadmin/dashboard", {}, currentAuth.token);
        list = res.assessments;
      }
      setAssessments(list);
      setPriceDrafts(Object.fromEntries(list.map((a) => [a.code, String(a.basePrice)])));
      const gstEnabledMap = Object.fromEntries(list.map((a) => [a.code, Boolean(a.gstEnabled)]));
      const gstRateMap = Object.fromEntries(list.map((a) => [a.code, String(a.gstPercentage ?? 18)]));
      setGstEnabledDrafts(gstEnabledMap);
      setGstRateDrafts(gstRateMap);
      if (list.length > 0) {
        setMasterGstEnabled(Boolean(list[0].gstEnabled));
        setMasterGstRate(String(list[0].gstPercentage ?? 18));
      }
      setReleaseDateDrafts(Object.fromEntries(
        list.map((a) => [a.code, formatReleaseDateForInput(a.releaseDate)]),
      ));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("AssessmentsPage: failed to load assessments", err);
      router.replace(getDashboardLoginPath());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const updateReleaseDate = async (code: string, releaseDate: string | null) => {
    if (!auth) return;
    setSaving(code);
    setMessage(null);
    setError(null);
    try {
      await apiRequest(`/superadmin/assessments/${code}/release-date`, {
        method: "PATCH",
        body: JSON.stringify({ releaseDate }),
      }, auth.token);
      setMessage(
        releaseDate
          ? `Release date updated for ${normalizeAssessmentCodeForDisplay(code)}.`
          : `${normalizeAssessmentCodeForDisplay(code)} is available to students now.`,
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update release date");
    } finally {
      setSaving(null);
    }
  };

  const applyMasterGstToAll = (enabled: boolean, rate: string) => {
    setGstEnabledDrafts((prev) => {
      const next = { ...prev };
      assessments.forEach((assessment) => {
        next[assessment.code] = enabled;
      });
      return next;
    });
    setGstRateDrafts((prev) => {
      const next = { ...prev };
      assessments.forEach((assessment) => {
        next[assessment.code] = rate;
      });
      return next;
    });
  };

  const handleMasterGstEnabledChange = (enabled: boolean) => {
    setMasterGstEnabled(enabled);
    applyMasterGstToAll(enabled, masterGstRate);
  };

  const handleMasterGstRateChange = (rate: string) => {
    setMasterGstRate(rate);
    applyMasterGstToAll(masterGstEnabled, rate);
  };

  const saveAllPricing = async () => {
    if (!auth || assessments.length === 0) return;
    setSaving("all");
    setMessage(null);
    setError(null);

    try {
      for (const assessment of assessments) {
        const basePrice = Number(priceDrafts[assessment.code]);
        if (!Number.isFinite(basePrice) || basePrice < 0) {
          throw new Error(`Enter a valid base price for ${normalizeAssessmentCodeForDisplay(assessment.code)}.`);
        }

        await apiRequest(`/superadmin/assessments/${assessment.code}/pricing`, {
          method: "PATCH",
          body: JSON.stringify({
            basePrice,
            gstEnabled: Boolean(gstEnabledDrafts[assessment.code]),
            gstPercentage: Number(gstRateDrafts[assessment.code] || 0),
          }),
        }, auth.token);
      }

      setMessage("Pricing updated for all assessments.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update pricing");
    } finally {
      setSaving(null);
    }
  };

  const filtered = assessments.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5 min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black sm:text-3xl">{isOrgAdmin === true ? "Assessments" : "Admin"}</h1>
        <p className="text-black mt-1 text-base">
          {isOrgAdmin === true
            ? "View all available assessments. Pricing and configuration are read-only for organization users."
            : "View all assessments, manage release dates, and update pricing."}
        </p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{message}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {isOrgAdmin === false && (
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <span className="text-sm font-semibold text-black">Master GST Enabled</span>
                <button
                  type="button"
                  onClick={() => handleMasterGstEnabledChange(!masterGstEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${masterGstEnabled ? "bg-orange-500" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${masterGstEnabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div>
                <label className="text-sm text-black font-semibold mb-2 block">Master GST Percentage (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={masterGstRate}
                  onChange={(e) => handleMasterGstRateChange(e.target.value)}
                  className="w-full min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => void saveAllPricing()}
              disabled={saving === "all"}
              className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-3 text-base font-semibold text-white shadow-[0_8px_18px_-10px_rgba(37,99,235,0.75)] hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
            >
              {saving === "all" ? "Saving..." : "Save All Pricing"}
            </button>
          </div>
          <p className="mt-3 text-sm text-black/80">
            GST settings apply to all assessments. Update individual base prices below, then save once.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assessments..."
          className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {filtered.map((a) => (
            <div
              key={a._id}
              className="bg-white/95 rounded-2xl border border-blue-100 shadow-[0_10px_26px_-14px_rgba(37,99,235,0.45)] hover:shadow-[0_18px_35px_-18px_rgba(37,99,235,0.5)] transition-shadow p-6 flex flex-col gap-4"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-sm text-black uppercase tracking-wide">{normalizeAssessmentCategoryForDisplay(a.category, a.code)}</p>
                <h3 className="break-words text-xl font-bold leading-tight text-black sm:text-2xl">{a.name}</h3>
                <p className="text-sm text-black font-mono">{normalizeAssessmentCodeForDisplay(a.code)}</p>
              </div>

              <p className="text-base text-black min-h-[3.5rem] leading-relaxed">{a.summary}</p>

              <dl className="grid grid-cols-1 gap-x-5 gap-y-2 text-sm min-[400px]:grid-cols-2">
                <div className="space-y-0.5">
                  <dt className="text-black">Questions</dt>
                  <dd className="font-bold text-black tabular-nums text-base" title="Total in bank (visible per attempt)">
                    {formatQuestionCountLabel(a.questionCount, a.studentVisibleQuestionCount)}
                  </dd>
                </div>
                <div className="space-y-0.5 text-right">
                  <dt className="text-black">Currency</dt>
                  <dd className="font-semibold text-black">{a.currency}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-black">Status</dt>
                  <dd className={`font-semibold ${a.active ? "text-green-700" : "text-black"}`}>{a.active ? "Active" : "Inactive"}</dd>
                </div>
              </dl>

              {/* Release date */}
              {isOrgAdmin === false && (
              <div className="pt-3 border-t border-gray-200">
                <label className="text-sm text-black font-semibold mb-2 block">Student Release Date</label>
                <p className="mb-3 text-sm text-black/80 leading-relaxed">
                  Until this date (IST), students see a &quot;Releasing on …&quot; stamp and cannot start the test.
                  On the release date, the stamp is removed automatically.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    value={releaseDateDrafts[a.code] ?? ""}
                    onChange={(e) =>
                      setReleaseDateDrafts((prev) => ({ ...prev, [a.code]: e.target.value }))
                    }
                    className="min-w-0 flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={() => void updateReleaseDate(a.code, releaseDateDrafts[a.code] || null)}
                    disabled={saving === a.code}
                    className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition disabled:opacity-50"
                  >
                    {saving === a.code ? "..." : "Save Date"}
                  </button>
                  <button
                    onClick={() => void updateReleaseDate(a.code, null)}
                    disabled={saving === a.code}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-black hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Available Now
                  </button>
                </div>
                <p className="mt-2 text-sm font-semibold text-black">
                  {a.isReleased === false && a.releaseLabel
                    ? `Students currently see: ${a.releaseLabel}`
                    : "Students can take this assessment now."}
                </p>
              </div>
              )}
              {isOrgAdmin === true && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-black font-semibold">Release status</span>
                  <span className="text-sm font-semibold text-black">
                    {a.isReleased === false && a.releaseLabel ? a.releaseLabel : "Available now"}
                  </span>
                </div>
              </div>
              )}

              {/* Pricing */}
              {isOrgAdmin === false && (
              <div className="pt-3 border-t border-gray-200">
                <label className="text-sm text-black font-semibold mb-2 block">Base Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={priceDrafts[a.code] ?? ""}
                  onChange={(e) =>
                    setPriceDrafts((prev) => ({ ...prev, [a.code]: e.target.value }))
                  }
                  className="w-full min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-sm text-black/80">
                  GST: {gstEnabledDrafts[a.code] ? `On (${gstRateDrafts[a.code] ?? masterGstRate}%)` : "Off"}
                </p>
              </div>
              )}
              {isOrgAdmin === true && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black font-semibold">Base Price</span>
                  <span className="text-lg font-bold text-black">₹{priceDrafts[a.code] ?? a.basePrice}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-black">GST</span>
                  <span className="text-sm font-semibold text-black">{a.gstEnabled ? `On (${a.gstPercentage ?? 18}%)` : "Off"}</span>
                </div>
              </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="col-span-full text-center text-black text-base py-12">No assessments found.</p>
          )}
        </div>
      )}
    </div>
  );
}
