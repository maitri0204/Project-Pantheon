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
  assessments: Array<{ code: string; name: string }>;
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

export default function OrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const auth = useMemo(() => getStoredAuth(), []);

  const load = async () => {
    if (!auth) { router.replace("/login"); return; }
    setLoading(true);
    try {
      const res = await apiRequest<SuperadminResponse>("/superadmin/dashboard", {}, auth.token);
      setOrgs(res.organizations);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("OrganizationsPage: failed to load organizations", err);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const filtered = orgs.filter((o) =>
    (o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.slug.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Organizations</h1>
          <p className="text-black/80 mt-1 text-base">Manage whitelabel organizations that can host the Pantheon platform.</p>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{message}</div>
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
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="grid gap-4 p-4 md:hidden">
                {filtered.map((org) => (
                  <div key={org._id} className="rounded-2xl border border-gray-100 bg-slate-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-black truncate">{org.name}</p>
                          <p className="text-xs text-black/60 font-mono truncate">{org.slug}</p>
                        </div>
                      </div>
                      <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium whitespace-nowrap ${
                        org.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {org.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Type</p>
                        <span className="mt-1 inline-flex bg-purple-50 text-purple-700 text-xs rounded-full px-2.5 py-0.5 font-medium">
                          {org.type}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Contact</p>
                        <p className="mt-1 text-black/80 break-all">{org.contactEmail || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Added On</p>
                        <p className="mt-1 text-black/80">{formatDate(org.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => router.push(`/dashboard/organizations/${org._id}`)}
                        className="w-full px-3 py-2 rounded-xl border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-sm font-semibold"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[760px] text-base">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Name</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Slug</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Type</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Contact</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Added On</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Status</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Actions</th>
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
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => router.push(`/dashboard/organizations/${org._id}`)}
                            className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-semibold"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
