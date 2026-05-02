"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";

type Organization = {
  _id: string;
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
  contactEmail?: string;
  createdAt?: string;
  branding?: {
    companyName?: string;
    primaryColor?: string;
  };
};

type SuperadminResponse = {
  organizations: Organization[];
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const DEFAULT_FORM = { name: "", slug: "", contactEmail: "" };

export default function OrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<{ from?: string; to?: string }>({});

  const auth = useMemo(() => getStoredAuth(), []);

  const load = async () => {
    if (!auth) { router.replace("/login"); return; }
    setLoading(true);
    try {
      const res = await apiRequest<SuperadminResponse>("/superadmin/dashboard", {}, auth.token);
      setOrgs(res.organizations);
    } catch {
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      await apiRequest("/superadmin/organizations", {
        method: "POST",
        body: JSON.stringify(form),
      }, auth.token);
      setMessage("Organization created successfully.");
      setForm(DEFAULT_FORM);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = orgs.filter((o) =>
    (o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.slug.toLowerCase().includes(search.toLowerCase())) &&
    (!dateFilter.from || !o.createdAt || new Date(dateFilter.from) <= new Date(o.createdAt)) &&
    (!dateFilter.to || !o.createdAt || new Date(dateFilter.to) >= new Date(o.createdAt))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Organizations</h1>
          <p className="text-black/80 mt-1 text-base">Manage whitelabel organizations that can host the Pantheon platform.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 transition flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Organization
        </button>
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
          placeholder="Search organizations..."
          className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Date filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="date"
          value={dateFilter.from || ""}
          onChange={(e) => setDateFilter((f) => ({ ...f, from: e.target.value }))}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <input
          type="date"
          value={dateFilter.to || ""}
          onChange={(e) => setDateFilter((f) => ({ ...f, to: e.target.value }))}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
              </div>
              <p className="text-black/80 text-base">No organizations found.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-3 text-blue-600 text-base font-medium hover:underline"
              >
                Create your first organization
              </button>
            </div>
          ) : (
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Slug</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Contact</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Added On</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((org) => (
                  <tr key={org._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-black">{org.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-black/80 font-mono text-sm">{org.slug}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-purple-50 text-purple-700 text-xs rounded-full px-2.5 py-0.5 font-medium">
                        {org.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-black/80">{org.contactEmail || "—"}</td>
                    <td className="px-5 py-3.5 text-black/80 text-sm">{formatDate(org.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${
                        org.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {org.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Create Organization</h3>
              <button
                onClick={() => { setShowForm(false); setError(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Acme Corp"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug *</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  placeholder="acme-corp"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Used in URLs — lowercase, hyphenated.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
                  placeholder="contact@acme.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-xl">{error}</div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
