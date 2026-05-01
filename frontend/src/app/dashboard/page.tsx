"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest, clearStoredAuth, getStoredAuth } from "@/lib/api";

type Assessment = {
  _id: string;
  code: string;
  name: string;
  slug: string;
  summary: string;
  basePrice: number;
  category: string;
  questionBankStatus: string;
  questionCount: number;
  sourceProject: string;
  seedCommands: string[];
};

type Organization = {
  _id: string;
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
};

type Coupon = {
  _id: string;
  code: string;
  discountType: string;
  value: number;
  applicableAssessmentCodes: string[];
};

type Invoice = {
  _id: string;
  invoiceNumber: string;
  assessmentCode: string;
  finalAmount: number;
  status: string;
};

type DashboardResponse = {
  role: "SUPERADMIN" | "ORG_ADMIN" | "STUDENT";
  stats: {
    assessments: number;
    organizations: number;
    students: number;
    coupons: number;
    invoices: number;
  };
  assessments: Assessment[];
  organizations: Organization[];
  coupons: Coupon[];
  invoices: Invoice[];
};

type SuperadminResponse = {
  assessments: Assessment[];
  organizations: Organization[];
  users: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }>;
  coupons: Coupon[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [superadmin, setSuperadmin] = useState<SuperadminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [orgForm, setOrgForm] = useState({ name: "", slug: "", contactEmail: "" });
  const [couponForm, setCouponForm] = useState({ code: "", discountType: "PERCENT", value: "10", applicableAssessmentCodes: "" });
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});

  const auth = useMemo(() => getStoredAuth(), []);

  const load = async () => {
    if (!auth) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dashboardResponse = await apiRequest<DashboardResponse>("/platform/dashboard", {}, auth.token);
      setDashboard(dashboardResponse);
      setPriceDrafts(
        Object.fromEntries(dashboardResponse.assessments.map((assessment) => [assessment.code, String(assessment.basePrice)]))
      );

      if (dashboardResponse.role === "SUPERADMIN") {
        const superadminResponse = await apiRequest<SuperadminResponse>("/superadmin/dashboard", {}, auth.token);
        setSuperadmin(superadminResponse);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load dashboard");
      clearStoredAuth();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!auth) {
    return null;
  }

  const submitOrganization = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await apiRequest<{ organization: Organization }>("/superadmin/organizations", {
        method: "POST",
        body: JSON.stringify(orgForm),
      }, auth.token);
      setMessage("Organization created.");
      setOrgForm({ name: "", slug: "", contactEmail: "" });
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create organization");
    }
  };

  const submitCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await apiRequest<{ coupon: Coupon }>("/superadmin/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: couponForm.code,
          discountType: couponForm.discountType,
          value: Number(couponForm.value),
          applicableAssessmentCodes: couponForm.applicableAssessmentCodes
            .split(",")
            .map((value) => value.trim().toUpperCase())
            .filter(Boolean),
        }),
      }, auth.token);
      setMessage("Coupon created.");
      setCouponForm({ code: "", discountType: "PERCENT", value: "10", applicableAssessmentCodes: "" });
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create coupon");
    }
  };

  const updatePrice = async (code: string) => {
    try {
      await apiRequest<{ assessment: Assessment }>(`/superadmin/assessments/${code}/pricing`, {
        method: "PATCH",
        body: JSON.stringify({ basePrice: Number(priceDrafts[code] || 0) }),
      }, auth.token);
      setMessage(`Updated price for ${code}.`);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update price");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Project Pantheon</p>
            <h1 className="mt-2 text-3xl font-bold">Unified assessment dashboard</h1>
            <p className="mt-2 text-sm text-slate-300">Role: {auth.user.role} · Email: {auth.user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearStoredAuth();
              router.push("/login");
            }}
            className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Sign out
          </button>
        </div>

        {loading ? <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">Loading dashboard...</div> : null}
        {error ? <div className="rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div> : null}
        {message ? <div className="rounded-[28px] border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</div> : null}

        {dashboard ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {Object.entries(dashboard.stats).map(([label, value]) => (
                <div key={label} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Assessment catalog</h2>
                  <p className="mt-1 text-sm text-slate-300">All assessments are registered in Pantheon and visible from one login.</p>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {dashboard.assessments.map((assessment) => (
                  <article key={assessment._id} className="rounded-[24px] border border-white/10 bg-slate-900/70 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{assessment.category}</p>
                        <h3 className="mt-2 text-lg font-semibold">{assessment.name}</h3>
                      </div>
                      <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                        {assessment.questionBankStatus}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{assessment.summary}</p>
                    <dl className="mt-4 space-y-2 text-sm text-slate-300">
                      <div className="flex justify-between gap-3"><dt>Source</dt><dd>{assessment.sourceProject}</dd></div>
                      <div className="flex justify-between gap-3"><dt>Price</dt><dd>₹{assessment.basePrice}</dd></div>
                      <div className="flex justify-between gap-3"><dt>Questions</dt><dd>{assessment.questionCount || "Linked to source seed"}</dd></div>
                    </dl>
                    {auth.user.role === "SUPERADMIN" ? (
                      <div className="mt-4 flex gap-3">
                        <input
                          value={priceDrafts[assessment.code] || ""}
                          onChange={(event) => setPriceDrafts((current) => ({ ...current, [assessment.code]: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => void updatePrice(assessment.code)}
                          className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5">
                        View assessment
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {auth.user.role === "SUPERADMIN" && superadmin ? (
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                  <h2 className="text-xl font-semibold">Whitelabel organizations</h2>
                  <p className="mt-1 text-sm text-slate-300">Create organizations that will later see all Pantheon tests inside their branded environment.</p>
                  <form className="mt-5 grid gap-3 md:grid-cols-3" onSubmit={submitOrganization}>
                    <input value={orgForm.name} onChange={(event) => setOrgForm((current) => ({ ...current, name: event.target.value }))} placeholder="Organization name" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
                    <input value={orgForm.slug} onChange={(event) => setOrgForm((current) => ({ ...current, slug: event.target.value }))} placeholder="organization-slug" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
                    <input value={orgForm.contactEmail} onChange={(event) => setOrgForm((current) => ({ ...current, contactEmail: event.target.value }))} placeholder="contact@example.com" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
                    <button type="submit" className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 md:col-span-3">Create organization</button>
                  </form>
                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                    <table className="min-w-full divide-y divide-white/10 text-sm">
                      <thead className="bg-white/5 text-left text-slate-300"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Type</th></tr></thead>
                      <tbody className="divide-y divide-white/10">
                        {superadmin.organizations.map((organization) => (
                          <tr key={organization._id}>
                            <td className="px-4 py-3">{organization.name}</td>
                            <td className="px-4 py-3">{organization.slug}</td>
                            <td className="px-4 py-3">{organization.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                  <h2 className="text-xl font-semibold">Coupons and pricing</h2>
                  <p className="mt-1 text-sm text-slate-300">Superadmin can set prices and generate coupons across the entire catalog.</p>
                  <form className="mt-5 space-y-3" onSubmit={submitCoupon}>
                    <input value={couponForm.code} onChange={(event) => setCouponForm((current) => ({ ...current, code: event.target.value }))} placeholder="WELCOME10" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select value={couponForm.discountType} onChange={(event) => setCouponForm((current) => ({ ...current, discountType: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400">
                        <option value="PERCENT">Percent</option>
                        <option value="FLAT">Flat</option>
                      </select>
                      <input value={couponForm.value} onChange={(event) => setCouponForm((current) => ({ ...current, value: event.target.value }))} placeholder="10" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
                    </div>
                    <input value={couponForm.applicableAssessmentCodes} onChange={(event) => setCouponForm((current) => ({ ...current, applicableAssessmentCodes: event.target.value }))} placeholder="CAREER_COMPASS, JOHARI_WINDOW" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
                    <button type="submit" className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950">Generate coupon</button>
                  </form>
                  <div className="mt-5 space-y-3">
                    {superadmin.coupons.map((coupon) => (
                      <div key={coupon._id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200">
                        <div className="flex items-center justify-between gap-3">
                          <strong>{coupon.code}</strong>
                          <span>{coupon.discountType} · {coupon.value}</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-400">{coupon.applicableAssessmentCodes.length ? coupon.applicableAssessmentCodes.join(", ") : "Applies to all assessments"}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
