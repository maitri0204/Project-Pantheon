"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  grade?: string;
  division?: string;
  testsTaken?: number;
  testsCompleted?: number;
  testsPending?: number;
  lastLoginAt?: string;
  createdAt?: string;
  organization?: { name: string; slug: string } | null;
};

type StudentsResponse = {
  students: User[];
  summary?: {
    studentCount: number;
    testsCompleted: number;
    testsPending: number;
  };
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
  const [organizationFilter, setOrganizationFilter] = useState("ALL");
  const [gradeFilter, setGradeFilter] = useState("ALL");
  const [divisionFilter, setDivisionFilter] = useState("ALL");
  const [currentRole, setCurrentRole] = useState<string>("");
  const pathname = usePathname();

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
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchOrganization = organizationFilter === "ALL" || (u.organization?.slug || "") === organizationFilter;
    const matchGrade = gradeFilter === "ALL" || (u.grade || "") === gradeFilter;
    const matchDivision = divisionFilter === "ALL" || (u.division || "") === divisionFilter;
    return matchSearch && matchOrganization && matchGrade && matchDivision;
  });

  const organizations = useMemo(
    () => Array.from(new Map(users
      .filter((u) => u.organization?.slug && u.organization?.name)
      .map((u) => [u.organization!.slug, u.organization!.name])).entries()),
    [users]
  );

  const grades = useMemo(
    () => Array.from(new Set(users.map((u) => u.grade).filter((grade): grade is string => Boolean(grade)))).sort(),
    [users]
  );

  const divisions = useMemo(
    () => Array.from(new Set(users.map((u) => u.division).filter((division): division is string => Boolean(division)))).sort(),
    [users]
  );

  const stats = useMemo(() => {
    return filtered.reduce(
      (acc, user) => {
        acc.studentCount += 1;
        acc.testsCompleted += user.testsCompleted ?? user.testsTaken ?? 0;
        acc.testsPending += user.testsPending ?? 0;
        return acc;
      },
      { studentCount: 0, testsCompleted: 0, testsPending: 0 }
    );
  }, [filtered]);

  const detailsBasePath = pathname || "/dashboard/users";

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-black">Students</h1>
        <p className="text-black/80 mt-1 text-base">{currentRole === "ORG_ADMIN" ? "Students from your organization." : "Students registered across the platform."}</p>
      </div>

      {/* Filters */}
      <div className={`grid grid-cols-1 gap-3 ${currentRole === "SUPERADMIN" ? "lg:grid-cols-[minmax(0,1fr)_200px_180px_180px]" : "lg:grid-cols-[minmax(0,1fr)_180px_180px]"}`}>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name..."
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
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">All Grades</option>
          {grades.map((grade) => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>
        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">All Divisions</option>
          {divisions.map((division) => (
            <option key={division} value={division}>{division}</option>
          ))}
        </select>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-black/80 mb-1">Students</p>
          <p className="text-3xl font-bold text-black">{stats.studentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-black/80 mb-1">Tests Completed</p>
          <p className="text-3xl font-bold text-black">{stats.testsCompleted}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-black/80 mb-1">Tests Pending</p>
          <p className="text-3xl font-bold text-black">{stats.testsPending}</p>
        </div>
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
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Organization</p>
                        <p className="mt-1 text-black/80">{user.organization ? user.organization.name : "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Grade</p>
                        <p className="mt-1 text-black/80">{user.grade || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Division</p>
                        <p className="mt-1 text-black/80">{user.division || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Tests</p>
                        <p className="mt-1 text-black/80">{user.testsCompleted ?? user.testsTaken ?? 0} completed</p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => router.push(`${detailsBasePath}/${user._id}`)}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-600"
                      >
                        View Detail
                      </button>
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
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Organization</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Grade</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Division</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Tests Completed</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Tests Pending</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Added On</th>
                      <th className="text-left px-5 py-3 text-sm font-semibold text-black/80 uppercase tracking-wide">Action</th>
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
                        <td className="px-5 py-3.5 text-black/80 text-sm">
                          {user.organization ? user.organization.name : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-black/80">{user.grade || "—"}</td>
                        <td className="px-5 py-3.5 text-black/80">{user.division || "—"}</td>
                        <td className="px-5 py-3.5 text-black/80">{user.testsCompleted ?? user.testsTaken ?? 0}</td>
                        <td className="px-5 py-3.5 text-black/80">{user.testsPending ?? 0}</td>
                        <td className="px-5 py-3.5 text-black/80 text-sm">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => router.push(`${detailsBasePath}/${user._id}`)}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            View Detail
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
