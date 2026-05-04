"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  testsTaken?: number;
  lastLoginAt?: string;
  createdAt?: string;
  organization?: { name: string; slug: string } | null;
};

type StudentsResponse = {
  students: User[];
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentRole, setCurrentRole] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<{ from?: string; to?: string }>({});

  const auth = useMemo(() => getStoredAuth(), []);

  useEffect(() => {
    if (!auth) { router.replace("/login"); return; }
    setCurrentRole(auth.user.role);
    apiRequest<StudentsResponse>("/platform/students", {}, auth.token)
      .then((res) => setUsers(res.students))
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const createdDate = u.createdAt ? new Date(u.createdAt) : null;
    const matchDate =
      (!dateFilter.from || !createdDate || new Date(dateFilter.from) <= createdDate) &&
      (!dateFilter.to || !createdDate || new Date(dateFilter.to) >= createdDate);
    return matchSearch && matchRole && matchDate;
  });

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      SUPERADMIN: "bg-red-50 text-red-700",
      ORG_ADMIN: "bg-purple-50 text-purple-700",
      STUDENT: "bg-blue-50 text-blue-700",
    };
    return map[role] ?? "bg-gray-100 text-gray-600";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-black">Students</h1>
        <p className="text-black/80 mt-1 text-base">{currentRole === "ORG_ADMIN" ? "Students from your organization." : "Students registered across the platform."}</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px] gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">All Roles</option>
          {currentRole !== "ORG_ADMIN" ? <option value="SUPERADMIN">Superadmin</option> : null}
          {currentRole !== "ORG_ADMIN" ? <option value="ORG_ADMIN">Org Admin</option> : null}
          <option value="STUDENT">Student</option>
        </select>
        <input
          type="date"
          value={dateFilter.from || ""}
          onChange={(e) => setDateFilter((f) => ({ ...f, from: e.target.value }))}
          className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <input
          type="date"
          value={dateFilter.to || ""}
          onChange={(e) => setDateFilter((f) => ({ ...f, to: e.target.value }))}
          className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Stats row */}
      <div className={`grid gap-4 ${currentRole === "ORG_ADMIN" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
        {(currentRole === "ORG_ADMIN" ? ["STUDENT"] : ["SUPERADMIN", "ORG_ADMIN", "STUDENT"]).map((role) => (
          <div key={role} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm text-black/80 mb-1">{role.replace("_", " ")}</p>
            <p className="text-3xl font-bold text-black">{users.filter((u) => u.role === role).length}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center text-black/70 text-base py-16">No students found.</p>
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
                          <p className="text-sm text-black/70 break-all">{user.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium whitespace-nowrap ${roleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Organization</p>
                        <p className="mt-1 text-black/80">{user.organization ? user.organization.name : "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Tests</p>
                        <p className="mt-1 text-black/80">{user.testsTaken ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Added On</p>
                        <p className="mt-1 text-black/80">{formatDate(user.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Status</p>
                        <span className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
                          user.isVerified ? "text-green-600" : "text-gray-400"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? "bg-green-500" : "bg-gray-300"}`} />
                          {user.isVerified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[980px] text-base">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Name</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Email</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Role</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Organization</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Tests</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Added On</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <span className="font-medium text-black">{user.firstName} {user.lastName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-black/80">{user.email}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs rounded-full px-2.5 py-0.5 font-medium ${roleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-black/80 text-sm">
                          {user.organization ? user.organization.name : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-black/80">{user.testsTaken ?? 0}</td>
                        <td className="px-5 py-3.5 text-black/80 text-sm">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                            user.isVerified ? "text-green-600" : "text-gray-400"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? "bg-green-500" : "bg-gray-300"}`} />
                            {user.isVerified ? "Verified" : "Pending"}
                          </span>
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
