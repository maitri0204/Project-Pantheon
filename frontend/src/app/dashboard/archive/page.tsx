"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest, getStoredAuth } from "@/lib/api";
import { getDashboardLoginPath } from "@/lib/dashboardAuth";

type ArchivedStudent = {
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
  students: ArchivedStudent[];
};

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

  const [students, setStudents] = useState<ArchivedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("ALL");
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const detailsBasePath = (pathname || "/dashboard/archive").replace(/\/archive$/, "/users");

  const loadArchivedStudents = async (token: string) => {
    const res = await apiRequest<StudentsResponse>("/platform/students?archiveView=archived", {}, token);
    setStudents(res.students);
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

    loadArchivedStudents(auth.token)
      .catch(() => router.replace(getDashboardLoginPath()))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleActivate = async (studentId: string) => {
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

  const organizations = useMemo(
    () => Array.from(new Map(students
      .filter((student) => student.organization?.slug && student.organization?.name)
      .map((student) => [student.organization!.slug, student.organization!.name])).entries()),
    [students],
  );

  const filtered = students.filter((student) => {
    const matchSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(search.toLowerCase())
      || student.email.toLowerCase().includes(search.toLowerCase());
    const matchOrganization = organizationFilter === "ALL" || (student.organization?.slug || "") === organizationFilter;
    return matchSearch && matchOrganization;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5 min-w-0">
      <div>
        <h1 className="text-2xl font-bold text-black sm:text-3xl">Archive</h1>
        <p className="mt-1 text-base text-black">Archived students are hidden from the active list and cannot log in until activated.</p>
      </div>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archived students..."
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
            <p className="py-16 text-center text-base text-black">No archived students found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Organization</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Archived On</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-black">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-black">{student.firstName} {student.lastName}</td>
                      <td className="px-4 py-3 text-black">{student.email}</td>
                      <td className="px-4 py-3 text-black">{student.organization?.name || "-"}</td>
                      <td className="px-4 py-3 text-black">{student.grade || "-"}</td>
                      <td className="px-4 py-3 text-black">{formatDate(student.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => router.push(`${detailsBasePath}/${student._id}`)}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            View Detail
                          </button>
                          <button
                            onClick={() => void handleActivate(student._id)}
                            disabled={activatingId === student._id}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            {activatingId === student._id ? "Activating..." : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
