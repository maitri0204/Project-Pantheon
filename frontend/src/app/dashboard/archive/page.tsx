"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { getDashboardLoginPath } from "@/lib/dashboardAuth";

type ArchivedUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade?: string;
  division?: string;
  isActive?: boolean;
  createdAt?: string;
  organization?: { name: string; slug: string } | null;
};

type StudentsResponse = {
  students: ArchivedUser[];
};

type ParentsResponse = {
  parents: ArchivedUser[];
};

type ArchiveTab = "students" | "parents";

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ArchivePage() {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useMemo(() => getStoredAuth(), []);

  const [activeTab, setActiveTab] = useState<ArchiveTab>("students");
  const [students, setStudents] = useState<ArchivedUser[]>([]);
  const [parents, setParents] = useState<ArchivedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("ALL");
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const studentDetailsBasePath = (pathname || "/dashboard/archive").replace(/\/archive$/, "/users");
  const parentDetailsBasePath = (pathname || "/dashboard/archive").replace(/\/archive$/, "/parents");

  const loadArchivedStudents = async (token: string) => {
    const res = await apiRequest<StudentsResponse>("/platform/students?archiveView=archived", {}, token);
    setStudents(res.students);
  };

  const loadArchivedParents = async (token: string) => {
    const res = await apiRequest<ParentsResponse>("/platform/parents?archiveView=archived", {}, token);
    setParents(res.parents);
  };

  const loadData = async (token: string) => {
    await Promise.all([loadArchivedStudents(token), loadArchivedParents(token)]);
  };

  useEffect(() => {
    if (!auth) {
      router.replace(getDashboardLoginPath());
      return;
    }
    if (auth.user.role !== "SUPERADMIN") {
      router.replace("/dashboard/users");
      return;
    }

    loadData(auth.token)
      .catch(() => router.replace(getDashboardLoginPath()))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleActivateStudent = async (studentId: string) => {
    if (!auth?.token) return;
    if (!window.confirm("Activate this student and restore access?")) return;

    setActivatingId(studentId);
    try {
      await apiRequest(`/superadmin/students/${studentId}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ archived: false }),
      }, auth.token);
      setMessage("Student activated successfully.");
      await loadArchivedStudents(auth.token);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to activate student");
    } finally {
      setActivatingId(null);
    }
  };

  const handleActivateParent = async (parentId: string) => {
    if (!auth?.token) return;
    if (!window.confirm("Activate this parent and restore access?")) return;

    setActivatingId(parentId);
    try {
      await apiRequest(`/superadmin/parents/${parentId}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ archived: false }),
      }, auth.token);
      setMessage("Parent activated successfully.");
      await loadArchivedParents(auth.token);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to activate parent");
    } finally {
      setActivatingId(null);
    }
  };

  const activeList = activeTab === "students" ? students : parents;

  const organizations = useMemo(
    () => Array.from(new Map(activeList
      .filter((user) => user.organization?.slug && user.organization?.name)
      .map((user) => [user.organization!.slug, user.organization!.name])).entries()),
    [activeList],
  );

  const filtered = activeList.filter((user) => {
    const matchSearch = `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase())
      || user.email.toLowerCase().includes(search.toLowerCase());
    const matchOrganization = organizationFilter === "ALL" || (user.organization?.slug || "") === organizationFilter;
    return matchSearch && matchOrganization;
  });

  const detailsBasePath = activeTab === "students" ? studentDetailsBasePath : parentDetailsBasePath;
  const entityLabel = activeTab === "students" ? "student" : "parent";

  return (
    <div className="mx-auto max-w-6xl space-y-5 min-w-0">
      <div>
        <h1 className="text-2xl font-bold text-black sm:text-3xl">Archive</h1>
        <p className="mt-1 text-base text-black">
          Archived students and parents are hidden from active lists and cannot log in until activated.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setActiveTab("students"); setSearch(""); setOrganizationFilter("ALL"); }}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeTab === "students" ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-black hover:bg-gray-50"}`}
        >
          Students ({students.length})
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("parents"); setSearch(""); setOrganizationFilter("ALL"); }}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeTab === "parents" ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-black hover:bg-gray-50"}`}
        >
          Parents ({parents.length})
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative flex-1 min-w-0">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search archived ${entityLabel}s...`}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={organizationFilter}
          onChange={(e) => setOrganizationFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Organizations</option>
          {organizations.map(([slug, name]) => (
            <option key={slug} value={slug}>{name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-base text-black">No archived {entityLabel}s found.</p>
          ) : (
            <>
              <div className="grid gap-4 p-4 lg:hidden">
                {filtered.map((user) => (
                  <div key={user._id} className="rounded-2xl border border-gray-100 bg-slate-50 p-4 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-400 text-xs font-bold text-white">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-black truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-black break-all">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black">Organization</p>
                        <p className="mt-1 break-words text-black">{user.organization?.name || "-"}</p>
                      </div>
                      {activeTab === "students" ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-black">Grade</p>
                          <p className="mt-1 text-black">{user.grade || "-"}</p>
                        </div>
                      ) : null}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black">Archived On</p>
                        <p className="mt-1 text-black">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => router.push(`${detailsBasePath}/${user._id}`)}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        View Detail
                      </button>
                      <button
                        onClick={() => void (activeTab === "students"
                          ? handleActivateStudent(user._id)
                          : handleActivateParent(user._id))}
                        disabled={activatingId === user._id}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {activatingId === user._id ? "Activating..." : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Organization</th>
                      {activeTab === "students" ? (
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Grade</th>
                      ) : null}
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Archived On</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-black">{user.firstName} {user.lastName}</td>
                        <td className="px-4 py-3 text-black">{user.email}</td>
                        <td className="px-4 py-3 text-black">{user.organization?.name || "-"}</td>
                        {activeTab === "students" ? (
                          <td className="px-4 py-3 text-black">{user.grade || "-"}</td>
                        ) : null}
                        <td className="px-4 py-3 text-black">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => router.push(`${detailsBasePath}/${user._id}`)}
                              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              View Detail
                            </button>
                            <button
                              onClick={() => void (activeTab === "students"
                                ? handleActivateStudent(user._id)
                                : handleActivateParent(user._id))}
                              disabled={activatingId === user._id}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              {activatingId === user._id ? "Activating..." : "Activate"}
                            </button>
                          </div>
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
