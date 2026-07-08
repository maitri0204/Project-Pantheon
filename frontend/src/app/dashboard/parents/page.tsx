"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { getDashboardLoginPath } from "@/lib/dashboardAuth";
import AddParentModal from "@/components/parents/AddParentModal";
import ImportParentsModal from "@/components/parents/ImportParentsModal";

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
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddParent, setShowAddParent] = useState(false);
  const [showImportParents, setShowImportParents] = useState(false);
  const pathname = usePathname();

  const auth = useMemo(() => getStoredAuth(), []);

  const loadParents = async (token: string) => {
    const res = await apiRequest<ParentsResponse>("/platform/parents", {}, token);
    setParents(res.parents);
    setError(null);
  };

  const handleArchiveParent = async (parentId: string) => {
    if (!auth?.token) return;
    if (!window.confirm("Are you sure you want to archive this parent?")) return;

    setArchivingId(parentId);
    try {
      await apiRequest(`/superadmin/parents/${parentId}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ archived: true }),
      }, auth.token);
      setSuccessMessage("Parent archived successfully.");
      await loadParents(auth.token);
    } catch (err) {
      setSuccessMessage(null);
      window.alert(err instanceof Error ? err.message : "Failed to archive parent");
    } finally {
      setArchivingId(null);
    }
  };

  useEffect(() => {
    if (!auth) { router.replace(getDashboardLoginPath()); return; }
    setCurrentRole(auth.user.role);
    loadParents(auth.token)
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
  }, []);

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
    return parents.reduce(
      (acc, user) => {
        acc.parentCount += 1;
        acc.testsCompleted += user.testsCompleted ?? user.testsTaken ?? 0;
        acc.testsPending += user.testsPending ?? 0;
        return acc;
      },
      { parentCount: 0, testsCompleted: 0, testsPending: 0 }
    );
  }, [parents]);

  const detailsBasePath = pathname || "/dashboard/parents";

  return (
    <div className="w-full min-w-0 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black sm:text-3xl">Parents</h1>
          <p className="text-black mt-1 text-base">{currentRole === "ORG_ADMIN" ? "Parents from your organization." : "Parents registered across the platform."}</p>
        </div>
        {currentRole === "SUPERADMIN" && auth?.token ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowImportParents(true)}
              className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              Import from Excel
            </button>
            <button
              type="button"
              onClick={() => setShowAddParent(true)}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Add Parent
            </button>
          </div>
        ) : null}
      </div>

      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div className={`grid grid-cols-1 gap-3 ${currentRole === "SUPERADMIN" ? "sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_200px]" : "lg:grid-cols-[minmax(0,1fr)]"}`}>
        <div className="relative flex-1 min-w-0">
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
      </div>

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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {filtered.length === 0 ? (
            <p className="text-center text-black text-base py-16">No parents found.</p>
          ) : (
            <>
              <div className="grid gap-4 p-4 lg:hidden">
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
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black">Pending</p>
                        <p className="mt-1 text-black">{user.testsPending ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black">Added On</p>
                        <p className="mt-1 text-black">{formatDate(user.createdAt)}</p>
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
                          onClick={() => void handleArchiveParent(user._id)}
                          disabled={archivingId === user._id}
                          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {archivingId === user._id ? "Saving..." : "Archive"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden lg:block">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    <col className="w-[16%]" />
                    <col className="w-[20%]" />
                    <col className="w-[16%]" />
                    <col className="w-[9%]" />
                    <col className="w-[9%]" />
                    <col className="w-[12%]" />
                    <col className="w-[18%]" />
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
                            <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap">
                              <button
                                onClick={() => router.push(`${detailsBasePath}/${user._id}`)}
                                className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 xl:px-3 xl:py-2 xl:text-sm"
                              >
                                View Detail
                              </button>
                              {currentRole === "SUPERADMIN" ? (
                                <button
                                  onClick={() => void handleArchiveParent(user._id)}
                                  disabled={archivingId === user._id}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 xl:px-3 xl:py-2 xl:text-sm"
                                >
                                  {archivingId === user._id ? "..." : "Archive"}
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
      {auth?.token ? (
        <>
          <AddParentModal
            open={showAddParent}
            token={auth.token}
            onClose={() => setShowAddParent(false)}
            onSuccess={async () => {
              setSuccessMessage("Parent added successfully under Kareer Studio.");
              await loadParents(auth.token);
            }}
          />
          <ImportParentsModal
            open={showImportParents}
            token={auth.token}
            onClose={() => setShowImportParents(false)}
            onSuccess={async (message) => {
              setSuccessMessage(message);
              await loadParents(auth.token);
            }}
          />
        </>
      ) : null}
    </div>
  );
}
