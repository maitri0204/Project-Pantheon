"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";

const ASSESSMENTS = [
  { code: "CAREER_COMPASS", name: "Career Compass", color: "emerald" },
  { code: "CAREER_DNA", name: "Career DNA", color: "purple" },
  { code: "JOHARI_WINDOW", name: "Johari Window", color: "amber" },
  { code: "LITMUS_TEST", name: "Litmus Test", color: "blue" },
  { code: "METACOGNITION_TEST", name: "Metacognition Test", color: "rose" },
] as const;

const COLOR_CLASSES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
};

type Assessment = { _id: string; code: string; name: string; basePrice: number; gstEnabled?: boolean };
type Coupon = {
  _id: string; code: string; discountType: "FLAT" | "PERCENT"; value: number;
  applicableAssessmentCodes: string[]; expiresAt?: string; isActive: boolean;
};
type PricingMap = Record<string, number>;
type GstMap = Record<string, boolean>;
const GST_RATE = 0.18;

function calcPrice(base: number, coupon: Coupon | null, gst: boolean) {
  let disc = 0;
  if (coupon) {
    if (coupon.discountType === "PERCENT") disc = (base * coupon.value) / 100;
    else disc = Math.min(coupon.value, base);
  }
  const discounted = base - disc;
  const gstAmt = gst ? discounted * GST_RATE : 0;
  return { base, disc, discounted, gstAmt, final: discounted + gstAmt };
}

export default function CouponsPage() {
  const router = useRouter();
  const auth = useMemo(() => getStoredAuth(), []);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pricing, setPricing] = useState<PricingMap>({});
  const [gst, setGst] = useState<GstMap>({});
  const [priceDrafts, setPriceDrafts] = useState<PricingMap>({});
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [form, setForm] = useState({
    code: "", discountType: "PERCENT" as "PERCENT" | "FLAT", value: "10",
    expiryDate: "", expiryTime: "23:59", assessmentCode: "CAREER_COMPASS",
  });
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [editForm, setEditForm] = useState({ discountType: "PERCENT" as "PERCENT" | "FLAT", value: "10", expiryDate: "", expiryTime: "23:59" });

  const previewCode = form.assessmentCode;
  const previewBase = pricing[previewCode] ?? 0;
  const previewGst = gst[previewCode] ?? false;
  const previewCoupon: Coupon | null = form.code
    ? { _id: "p", code: form.code, discountType: form.discountType, value: Number(form.value) || 0, applicableAssessmentCodes: [], isActive: true }
    : null;
  const preview = calcPrice(previewBase, previewCoupon, previewGst);

  async function load() {
    if (!auth) {
      router.replace("/login");
      return;
    }

    if (auth.user.role !== "SUPERADMIN") {
      router.replace("/dashboard/users");
      return;
    }

    const [asmRes, cpRes] = await Promise.all([
      apiRequest<{ assessments: Assessment[] }>("/superadmin/dashboard", {}, auth.token),
      apiRequest<{ coupons: Coupon[] }>("/superadmin/coupons", {}, auth.token),
    ]);
    setAssessments(asmRes.assessments ?? []);
    setCoupons(cpRes.coupons ?? []);
    const pm: PricingMap = {}; const gm: GstMap = {}; const pd: PricingMap = {};
    (asmRes.assessments ?? []).forEach((a) => { pm[a.code] = a.basePrice; pd[a.code] = a.basePrice; gm[a.code] = a.gstEnabled ?? false; });
    if ((asmRes.assessments ?? []).length > 0) {
      const available = new Set((asmRes.assessments ?? []).map((a) => a.code));
      setForm((f) => ({
        ...f,
        assessmentCode: available.has(f.assessmentCode) ? f.assessmentCode : (asmRes.assessments?.[0]?.code ?? "CAREER_COMPASS"),
      }));
    }
    setPricing(pm); setPriceDrafts(pd); setGst(gm); setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []);

  function flash(type: "ok" | "err", text: string) { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); }

  async function savePrice(code: string) {
    if (!auth) return; setSaving(code);
    try {
      await apiRequest(`/superadmin/assessments/${code}/pricing`, { method: "PATCH", body: JSON.stringify({ basePrice: Number(priceDrafts[code]) }) }, auth.token);
      setPricing((p) => ({ ...p, [code]: Number(priceDrafts[code]) })); setEditingPrice(null); flash("ok", "Price updated.");
    } catch { flash("err", "Failed to update price."); } finally { setSaving(null); }
  }

  async function toggleGst(code: string) {
    if (!auth) return;
    const next = !gst[code]; setGst((g) => ({ ...g, [code]: next }));
    try {
      await apiRequest(`/superadmin/assessments/${code}/pricing`, { method: "PATCH", body: JSON.stringify({ gstEnabled: next }) }, auth.token);
      flash("ok", `GST ${next ? "enabled" : "disabled"}`);
    } catch { setGst((g) => ({ ...g, [code]: !next })); flash("err", "Failed to toggle GST."); }
  }

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault(); if (!auth) return; setSaving("create");
    try {
      const expiresAt = form.expiryDate ? new Date(`${form.expiryDate}T${form.expiryTime}:00`).toISOString() : undefined;
      await apiRequest("/superadmin/coupons", { method: "POST", body: JSON.stringify({
        code: form.code.toUpperCase().trim(), discountType: form.discountType, value: Number(form.value),
        applicableAssessmentCodes: [form.assessmentCode], expiresAt,
      })}, auth.token);
      flash("ok", "Coupon created!");
      setForm((f) => ({ ...f, code: "", discountType: "PERCENT", value: "10", expiryDate: "", expiryTime: "23:59" }));
      await load();
    } catch (err) { flash("err", err instanceof Error ? err.message : "Failed."); } finally { setSaving(null); }
  }

  async function deleteCoupon(id: string) {
    if (!auth || !confirm("Delete this coupon?")) return;
    try { await apiRequest(`/superadmin/coupons/${id}`, { method: "DELETE" }, auth.token); flash("ok", "Deleted."); await load(); }
    catch { flash("err", "Failed to delete."); }
  }

  function openEdit(c: Coupon) {
    setEditCoupon(c);
    const d = c.expiresAt ? new Date(c.expiresAt) : null;
    setEditForm({ discountType: c.discountType, value: String(c.value), expiryDate: d ? d.toISOString().split("T")[0] : "", expiryTime: d ? d.toTimeString().slice(0, 5) : "23:59" });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault(); if (!auth || !editCoupon) return; setSaving("edit");
    try {
      const expiresAt = editForm.expiryDate ? new Date(`${editForm.expiryDate}T${editForm.expiryTime}:00`).toISOString() : undefined;
      await apiRequest(`/superadmin/coupons/${editCoupon._id}`, { method: "PATCH", body: JSON.stringify({ discountType: editForm.discountType, value: Number(editForm.value), expiresAt }) }, auth.token);
      flash("ok", "Coupon updated."); setEditCoupon(null); await load();
    } catch { flash("err", "Failed to update."); } finally { setSaving(null); }
  }

  function isExpired(c: Coupon) { return c.expiresAt ? new Date(c.expiresAt) < new Date() : false; }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {msg && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${msg.type === "ok" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>{msg.text}</div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-black">Coupons &amp; Pricing</h1>
        <p className="text-base text-black/80 mt-1">Manage assessment prices, GST settings, and discount coupons.</p>
      </div>

      {/* Assessment pricing */}
      <div>
        <h2 className="text-xl font-semibold text-black mb-3">Assessment Pricing</h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ASSESSMENTS.map(({ code, name, color }) => {
            const a = assessments.find((x) => x.code === code);
            const price = pricing[code] ?? 0;
            const isGst = gst[code] ?? false;
            const isEditing = editingPrice === code;
            return (
              <div key={code} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${COLOR_CLASSES[color]}`}>{code.replace(/_/g, " ")}</span>
                    <p className="mt-1.5 text-base font-semibold text-black">{a?.name ?? name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm text-black/70 font-medium">GST 18%</span>
                    <button
                      onClick={() => void toggleGst(code)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isGst ? "bg-orange-500" : "bg-gray-300"}`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${isGst ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-base text-black/80">&#8377;</span>
                    <input
                      type="number"
                      value={priceDrafts[code] ?? price}
                      onChange={(e) => setPriceDrafts((p) => ({ ...p, [code]: Number(e.target.value) }))}
                      className="w-28 border border-blue-300 rounded-lg px-2 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button onClick={() => void savePrice(code)} disabled={saving === code} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-60">
                      {saving === code ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => setEditingPrice(null)} className="text-sm text-black/80 hover:text-black">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="text-3xl font-bold text-black">&#8377;{price}</span>
                      {isGst && <span className="ml-2 text-sm text-black/70">+ &#8377;{Math.round(price * GST_RATE)} GST = &#8377;{Math.round(price * (1 + GST_RATE))}</span>}
                    </div>
                    <button onClick={() => setEditingPrice(code)} className="text-sm text-blue-600 hover:underline font-medium">Edit</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create + preview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Create Coupon</h2>
          <form onSubmit={(e) => void createCoupon(e)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black/80 mb-1">Coupon Code</label>
                <input
                  required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SAVE20"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/80 mb-1">Discount Type</label>
                <select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as "PERCENT" | "FLAT" }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (&#8377;)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black/80 mb-1">Value {form.discountType === "PERCENT" ? "(%)" : "(&#8377;)"}</label>
                <input required type="number" min={0} max={form.discountType === "PERCENT" ? 100 : undefined}
                  value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-black/80 mb-1">Expiry Date (optional)</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              {form.expiryDate && (
                <div>
                  <label className="block text-sm font-medium text-black/80 mb-1">Expiry Time</label>
                  <input type="time" value={form.expiryTime} onChange={(e) => setForm((f) => ({ ...f, expiryTime: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-black/80 mb-1">Assessment</label>
              <select value={form.assessmentCode} onChange={(e) => setForm((f) => ({ ...f, assessmentCode: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400">
                {ASSESSMENTS.map(({ code, name }) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={saving === "create"}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {saving === "create" ? "Creating..." : "Create Coupon"}
            </button>
          </form>
        </div>

        {/* Live preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-black mb-1">Discount Preview</h2>
          <p className="text-sm text-black/70 mb-4">Based on: {ASSESSMENTS.find((a) => a.code === previewCode)?.name}</p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base Price</span>
              <span className="font-medium text-gray-900">&#8377;{preview.base.toFixed(2)}</span>
            </div>
            {previewCoupon && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Discount ({form.discountType === "PERCENT" ? `${form.value}%` : `\u20b9${form.value}`})</span>
                <span>- &#8377;{preview.disc.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t border-dashed border-gray-200 pt-2">
              <span className="text-gray-500">After Discount</span>
              <span className="font-medium text-gray-900">&#8377;{preview.discounted.toFixed(2)}</span>
            </div>
            {previewGst && (
              <div className="flex justify-between text-sm text-orange-600">
                <span>GST (18%)</span>
                <span>+ &#8377;{preview.gstAmt.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-gray-200 pt-2">
              <span className="text-gray-900 text-sm">Student Pays</span>
              <span className="text-blue-700 text-lg">&#8377;{preview.final.toFixed(2)}</span>
            </div>
          </div>
          {!previewGst && <p className="mt-4 text-sm text-black/70">* GST is off for this assessment.</p>}
        </div>
      </div>

      {/* Coupons list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-black">All Coupons ({coupons.length})</h2>
        </div>
        {coupons.length === 0 ? (
          <p className="px-5 py-10 text-sm text-gray-400 text-center">No coupons yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Code</th>
                  <th className="px-5 py-3 text-left">Discount</th>
                  <th className="px-5 py-3 text-left">Assessments</th>
                  <th className="px-5 py-3 text-left">Valid Until</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((c) => {
                  const expired = isExpired(c);
                  return (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-gray-900 tracking-wider">{c.code}</td>
                      <td className="px-5 py-3 text-gray-700">{c.discountType === "PERCENT" ? `${c.value}%` : `\u20b9${c.value}`}</td>
                      <td className="px-5 py-3">
                        {c.applicableAssessmentCodes.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">All</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {c.applicableAssessmentCodes.map((code) => {
                              const a = ASSESSMENTS.find((x) => x.code === code);
                              return (
                                <span key={code} className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${a ? COLOR_CLASSES[a.color] : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                  {a?.name ?? code}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "No expiry"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${!c.isActive ? "bg-gray-100 text-gray-500" : expired ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                          {!c.isActive ? "Disabled" : expired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEdit(c)} className="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                          <button onClick={() => void deleteCoupon(c._id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Edit Coupon</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{editCoupon.code}</p>
              </div>
              <button onClick={() => setEditCoupon(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => void saveEdit(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
                <select value={editForm.discountType} onChange={(e) => setEditForm((f) => ({ ...f, discountType: e.target.value as "PERCENT" | "FLAT" }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (&#8377;)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Value</label>
                <input type="number" required min={0} max={editForm.discountType === "PERCENT" ? 100 : undefined}
                  value={editForm.value} onChange={(e) => setEditForm((f) => ({ ...f, value: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" value={editForm.expiryDate} onChange={(e) => setEditForm((f) => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={editForm.expiryTime} onChange={(e) => setEditForm((f) => ({ ...f, expiryTime: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditCoupon(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving === "edit"} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                  {saving === "edit" ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
