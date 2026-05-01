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

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentRole, setCurrentRole] = useState<string>("");

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
    return matchSearch && matchRole;
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
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
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
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
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
            <p className="text-center text-black/70 text-base py-16">No users found.</p>
          ) : (
            <table className="w-full text-base">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Organization</th>
                  <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Tests</th>
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
          )}
        </div>
      )}
    </div>
  );
}
