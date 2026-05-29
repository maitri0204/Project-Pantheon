"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";

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
  sourceProject: string;
  active: boolean;
  tags: string[];
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

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [gstEnabledDrafts, setGstEnabledDrafts] = useState<Record<string, boolean>>({});
  const [gstRateDrafts, setGstRateDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const auth = useMemo(() => getStoredAuth(), []);
  const [isOrgAdmin, setIsOrgAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const a = getStoredAuth();
    if (!a) {
      router.replace("/login");
      return;
    }

    setIsOrgAdmin(a.user.role === "ORG_ADMIN");
  }, []);

  const load = async () => {
    const currentAuth = getStoredAuth();
    if (!currentAuth) {
      router.replace("/login");
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
      setGstEnabledDrafts(Object.fromEntries(list.map((a) => [a.code, Boolean(a.gstEnabled)])));
      setGstRateDrafts(Object.fromEntries(list.map((a) => [a.code, String(a.gstPercentage ?? 18)])));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("AssessmentsPage: failed to load assessments", err);
      router.replace("/login");
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

  const updatePrice = async (code: string) => {
    if (!auth) return;
    setSaving(code);
    setMessage(null);
    setError(null);
    try {
      await apiRequest(`/superadmin/assessments/${code}/pricing`, {
        method: "PATCH",
        body: JSON.stringify({
          basePrice: Number(priceDrafts[code] || 0),
          gstEnabled: Boolean(gstEnabledDrafts[code]),
          gstPercentage: Number(gstRateDrafts[code] || 0),
        }),
      }, auth.token);
      setMessage(`Pricing updated for ${normalizeAssessmentCodeForDisplay(code)}.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update price");
    } finally {
      setSaving(null);
    }
  };

  const filtered = assessments.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.code.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      imported: "bg-green-50 text-green-700",
      linked: "bg-blue-50 text-blue-700",
      "pending-import": "bg-yellow-50 text-yellow-700",
    };
    return map[status] ?? "bg-gray-100 text-gray-600";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Assessments</h1>
        <p className="text-black/80 mt-1 text-base">
          {isOrgAdmin === true
            ? "View all available assessments. Pricing and configuration are read-only for organization users."
            : "View all assessments and update their pricing."}
        </p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{message}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm text-black/70 uppercase tracking-wide">{normalizeAssessmentCategoryForDisplay(a.category, a.code)}</p>
                  <h3 className="text-2xl font-bold text-black leading-tight">{a.name}</h3>
                  <p className="text-sm text-black/70 font-mono">{normalizeAssessmentCodeForDisplay(a.code)}</p>
                </div>
                <span className={`flex-shrink-0 text-sm rounded-full px-3 py-1.5 font-semibold ${statusBadge(a.questionBankStatus)}`}>
                  {a.questionBankStatus}
                </span>
              </div>

              <p className="text-base text-black/80 min-h-[3.5rem] leading-relaxed">{a.summary}</p>

              <dl className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
                <div className="space-y-0.5">
                  <dt className="text-black/70">Questions</dt>
                  <dd className="font-bold text-black tabular-nums text-base">{Number.isFinite(a.questionCount) ? a.questionCount.toLocaleString() : "—"}</dd>
                </div>
                <div className="space-y-0.5 text-right">
                  <dt className="text-black/70">Currency</dt>
                  <dd className="font-semibold text-black">{a.currency}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-black/70">Status</dt>
                  <dd className={`font-semibold ${a.active ? "text-green-700" : "text-black/60"}`}>{a.active ? "Active" : "Inactive"}</dd>
                </div>
              </dl>

              {/* Pricing */}
              {isOrgAdmin === false && (
              <div className="pt-3 border-t border-gray-200">
                <label className="text-sm text-black/80 font-semibold mb-2 block">Base Price (₹)</label>
                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2 items-center">
                  <input
                    type="number"
                    min={0}
                    value={priceDrafts[a.code] ?? ""}
                    onChange={(e) =>
                      setPriceDrafts((prev) => ({ ...prev, [a.code]: e.target.value }))
                    }
                    className="w-full min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => void updatePrice(a.code)}
                    disabled={saving === a.code}
                    className="w-full sm:w-auto sm:min-w-[106px] px-5 py-2.5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl text-base font-semibold shadow-[0_8px_18px_-10px_rgba(37,99,235,0.75)] hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
                  >
                    {saving === a.code ? "..." : "Save"}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5">
                  <span className="text-sm font-semibold text-black/80">GST Enabled</span>
                  <button
                    type="button"
                    onClick={() => setGstEnabledDrafts((prev) => ({ ...prev, [a.code]: !prev[a.code] }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${gstEnabledDrafts[a.code] ? "bg-orange-500" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${gstEnabledDrafts[a.code] ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>

                <div className="mt-3">
                  <label className="text-sm text-black/80 font-semibold mb-2 block">GST Percentage (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={gstRateDrafts[a.code] ?? ""}
                    onChange={(e) => setGstRateDrafts((prev) => ({ ...prev, [a.code]: e.target.value }))}
                    className="w-full min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              )}
              {isOrgAdmin === true && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/80 font-semibold">Base Price</span>
                  <span className="text-lg font-bold text-black">₹{priceDrafts[a.code] ?? a.basePrice}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-black/70">GST</span>
                  <span className="text-sm font-semibold text-black">{a.gstEnabled ? `On (${a.gstPercentage ?? 18}%)` : "Off"}</span>
                </div>
              </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="col-span-full text-center text-black/70 text-base py-12">No assessments found.</p>
          )}
        </div>
      )}
    </div>
  );
}
