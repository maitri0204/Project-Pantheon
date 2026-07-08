"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { getDashboardLoginPath } from "@/lib/dashboardAuth";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive?: boolean;
  testsTaken?: number;
  testsCompleted?: number;
  testsPending?: number;
  lastLoginAt?: string;
  createdAt?: string;
  organization?: { name: string; slug: string } | null;
};

type ParentsResponse = {
  parents: User[];
  summary?: {
    parentCount: number;
    testsCompleted: number;
    testsPending: number;
  };
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ParentsPage() {
  const router = useRouter();
  const [parents, setParents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("ALL");
  const [currentRole, setCurrentRole] = useState<string>("");
  const [showArchived, setShowArchived] = useState(false);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const pathname = usePathname();

  const auth = useMemo(() => getStoredAuth(), []);

  const loadParents = async (token: string, includeArchived = showArchived) => {
    const query = includeArchived ? "?archiveView=archived" : "";
    const res = await apiRequest<ParentsResponse>(`/platform/parents${query}`, {}, token);
    setParents(res.parents);
    setError(null);
  };

  const handleArchiveParent = async (parentId: string, archived: boolean) => {
    if (!auth?.token) return;
    const actionLabel = archived ? "archive" : "restore";
    if (!window.confirm(`Are you sure you want to ${actionLabel} this parent?`)) return;

    setArchivingId(parentId);
    try {
      await apiRequest(`/superadmin/parents/${parentId}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ archived }),
      }, auth.token);
      setSuccessMessage(archived ? "Parent archived successfully." : "Parent restored successfully.");
      await loadParents(auth.token, showArchived);
    } catch (err) {
      setSuccessMessage(null);
      window.alert(err instanceof Error ? err.message : `Failed to ${actionLabel} parent`);
    } finally {
      setArchivingId(null);
    }
  };

  useEffect(() => {
    if (!auth) { router.replace(getDashboardLoginPath()); return; }
    setCurrentRole(auth.user.role);
    loadParents(auth.token, showArchived)
      .catch((err) => {
        const errorMsg = err instanceof Error ? err.message : "Failed to load parents";
        if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
          router.replace(getDashboardLoginPath());
        } else {
          setError(errorMsg);
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const filtered = parents.filter((u) => {
    const matchSearch =
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchOrganization = organizationFilter === "ALL" || (u.organization?.slug || "") === organizationFilter;
    return matchSearch && matchOrganization;
  });

  const organizations = useMemo(
    () => Array.from(new Map(parents
      .filter((u) => u.organization?.slug && u.organization?.name)
      .map((u) => [u.organization!.slug, u.organization!.name])).entries()),
    [parents]
  );

  const stats = useMemo(() => {
    return filtered.reduce(
      (acc, user) => {
        acc.parentCount += 1;
        acc.testsCompleted += user.testsCompleted ?? user.testsTaken ?? 0;
        acc.testsPending += user.testsPending ?? 0;
        return acc;
      },
      { parentCount: 0, testsCompleted: 0, testsPending: 0 }
    );
  }, [filtered]);

  const detailsBasePath = pathname || "/dashboard/parents";

  return (
    <div className="mx-auto max-w-6xl space-y-5 min-w-0">
      <div>
        <h1 className="text-2xl font-bold text-black sm:text-3xl">Parents</h1>
        <p className="text-black mt-1 text-base">{currentRole === "ORG_ADMIN" ? "Parents from your organization." : "Parents registered across the platform."}</p>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <div className={`grid grid-cols-1 gap-3 ${currentRole === "SUPERADMIN" ? "lg:grid-cols-[minmax(0,1fr)_200px_180px]" : "lg:grid-cols-[minmax(0,1fr)]"}`}>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by parent name..."
            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        {currentRole === "SUPERADMIN" ? (
          <select
            value={organizationFilter}
            onChange={(e) => setOrganizationFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">All Organizations</option>
            {organizations.map(([slug, name]) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
          </select>
        ) : null}
        {currentRole === "SUPERADMIN" ? (
          <select
            value={showArchived ? "ARCHIVED" : "ACTIVE"}
            onChange={(e) => setShowArchived(e.target.value === "ARCHIVED")}
            className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="ACTIVE">Active Parents</option>
            <option value="ARCHIVED">Archived Parents</option>
          </select>
        ) : null}
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-black mb-1">Parents</p>
          <p className="text-3xl font-bold text-black">{stats.parentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-black mb-1">Tests Completed</p>
          <p className="text-3xl font-bold text-black">{stats.testsCompleted}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-black mb-1">Tests Pending</p>
          <p className="text-3xl font-bold text-black">{stats.testsPending}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center text-black text-base py-16">No parents found.</p>
          ) : (
            <>
              <div className="grid gap-4 p-4 xl:hidden">
                {filtered.map((user) => (
                  <div key={user._id} className="rounded-2xl border border-gray-100 bg-slate-50 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-black truncate">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-black break-all">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black">Organization</p>
                        <p className="mt-1 break-words text-black">{user.organization ? user.organization.name : "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black">Tests</p>
                        <p className="mt-1 text-black">{user.testsCompleted ?? user.testsTaken ?? 0} completed</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => router.push(`${detailsBasePath}/${user._id}`)}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-600"
                      >
                        View Detail
                      </button>
                      {currentRole === "SUPERADMIN" ? (
                        <button
                          onClick={() => void handleArchiveParent(user._id, user.isActive !== false)}
                          disabled={archivingId === user._id}
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {archivingId === user._id ? "Saving..." : user.isActive === false ? "Restore" : "Archive"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden xl:block">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    <col className="w-[18%]" />
                    <col className="w-[22%]" />
                    <col className="w-[18%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Name</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Email</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Organization</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Completed</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Pending</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Added On</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((user) => {
                      const fullName = `${user.firstName} ${user.lastName}`;
                      const orgName = user.organization?.name || "-";

                      return (
                        <tr key={user._id} className="transition-colors hover:bg-gray-50">
                          <td className="px-3 py-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </div>
                              <span className="truncate font-medium text-black" title={fullName}>{fullName}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="block truncate text-black" title={user.email}>{user.email}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="block truncate text-black" title={orgName}>{orgName}</span>
                          </td>
                          <td className="px-3 py-3 text-black">{user.testsCompleted ?? user.testsTaken ?? 0}</td>
                          <td className="px-3 py-3 text-black">{user.testsPending ?? 0}</td>
                          <td className="px-3 py-3 text-black">{formatDate(user.createdAt)}</td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => router.push(`${detailsBasePath}/${user._id}`)}
                                className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                View Detail
                              </button>
                              {currentRole === "SUPERADMIN" ? (
                                <button
                                  onClick={() => void handleArchiveParent(user._id, user.isActive !== false)}
                                  disabled={archivingId === user._id}
                                  className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                  {archivingId === user._id ? "..." : user.isActive === false ? "Restore" : "Archive"}
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
