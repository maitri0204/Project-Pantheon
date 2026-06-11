"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { getDashboardLoginPath } from "@/lib/dashboardAuth";

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
  if (!dateString) return "-";
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
    if (!auth) { router.replace(getDashboardLoginPath()); return; }
    setLoading(true);
    try {
      const res = await apiRequest<SuperadminResponse>("/superadmin/dashboard", {}, auth.token);
      setOrgs(res.organizations);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("OrganizationsPage: failed to load organizations", err);
      router.replace(getDashboardLoginPath());
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
    <div className="mx-auto max-w-6xl space-y-5 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black sm:text-3xl">Organizations</h1>
          <p className="text-black mt-1 text-base">Manage whitelabel organizations that can host the Pantheon platform.</p>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">{message}</div>
      )}
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
              </div>
              <p className="text-black text-base">No organizations found.</p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="grid gap-4 p-4 xl:hidden">
                {filtered.map((org) => (
                  <div key={org._id} className="rounded-2xl border border-gray-100 bg-slate-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-black truncate">{org.name}</p>
                          <p className="text-xs text-black font-mono truncate">{org.slug}</p>
                        </div>
                      </div>
                      <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium whitespace-nowrap ${
                        org.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-black"
                      }`}>
                        {org.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black">Type</p>
                        <span className="mt-1 inline-flex bg-purple-50 text-purple-700 text-xs rounded-full px-2.5 py-0.5 font-medium">
                          {org.type}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black">Contact</p>
                        <p className="mt-1 text-black break-all">{org.contactEmail || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black">Added On</p>
                        <p className="mt-1 text-black">{formatDate(org.createdAt)}</p>
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
              <div className="hidden xl:block">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    <col className="w-[20%]" />
                    <col className="w-[14%]" />
                    <col className="w-[10%]" />
                    <col className="w-[20%]" />
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                    <col className="w-[14%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Name</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Slug</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Type</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Contact</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Added On</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Status</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((org) => (
                      <tr key={org._id} className="transition-colors hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-600">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate font-medium text-black" title={org.name}>{org.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="block truncate font-mono text-black" title={org.slug}>{org.slug}</span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                            {org.type}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="block truncate text-black" title={org.contactEmail || "-"}>{org.contactEmail || "-"}</span>
                        </td>
                        <td className="px-3 py-3 text-black">{formatDate(org.createdAt)}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            org.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-black"
                          }`}>
                            {org.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => router.push(`/dashboard/organizations/${org._id}`)}
                            className="whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
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
