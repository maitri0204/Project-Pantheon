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

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const auth = useMemo(() => getStoredAuth(), []);

  const load = async () => {
    if (!auth) { router.replace("/login"); return; }
    setLoading(true);
    try {
      const res = await apiRequest<SuperadminResponse>("/superadmin/dashboard", {}, auth.token);
      setAssessments(res.assessments);
      setPriceDrafts(
        Object.fromEntries(res.assessments.map((a) => [a.code, String(a.basePrice)]))
      );
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const updatePrice = async (code: string) => {
    if (!auth) return;
    setSaving(code);
    setMessage(null);
    setError(null);
    try {
      await apiRequest(`/superadmin/assessments/${code}/pricing`, {
        method: "PATCH",
        body: JSON.stringify({ basePrice: Number(priceDrafts[code] || 0) }),
      }, auth.token);
      setMessage(`Price updated for ${code}.`);
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
        <p className="text-black/80 mt-1 text-base">View all assessments and update their pricing.</p>
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
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((a) => (
            <div key={a._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm text-black/70 uppercase tracking-wide">{a.category}</p>
                  <h3 className="text-2xl font-bold text-black leading-tight">{a.name}</h3>
                  <p className="text-sm text-black/70 font-mono">{a.code}</p>
                </div>
                <span className={`flex-shrink-0 text-sm rounded-full px-3 py-1.5 font-semibold ${statusBadge(a.questionBankStatus)}`}>
                  {a.questionBankStatus}
                </span>
              </div>

              <p className="text-base text-black/80 min-h-[3.5rem] leading-relaxed">{a.summary}</p>

              <dl className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
                <div className="space-y-0.5">
                  <dt className="text-black/70">Source</dt>
                  <dd className="font-semibold text-black break-words">{a.sourceProject}</dd>
                </div>
                <div className="space-y-0.5 text-right">
                  <dt className="text-black/70">Questions</dt>
                  <dd className="font-semibold text-black">{a.questionCount || "—"}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-black/70">Currency</dt>
                  <dd className="font-semibold text-black">{a.currency}</dd>
                </div>
                <div className="space-y-0.5 text-right">
                  <dt className="text-black/70">Status</dt>
                  <dd className={`font-semibold ${a.active ? "text-green-700" : "text-black/60"}`}>{a.active ? "Active" : "Inactive"}</dd>
                </div>
              </dl>

              {/* Pricing */}
              <div className="pt-3 border-t border-gray-200">
                <label className="text-sm text-black/80 font-semibold mb-2 block">Base Price (₹)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={priceDrafts[a.code] ?? ""}
                    onChange={(e) =>
                      setPriceDrafts((prev) => ({ ...prev, [a.code]: e.target.value }))
                    }
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => void updatePrice(a.code)}
                    disabled={saving === a.code}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {saving === a.code ? "..." : "Save"}
                  </button>
                </div>
              </div>
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
