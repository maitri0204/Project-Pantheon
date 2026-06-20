"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { apiRequest, getStoredAuth } from "@/lib/api";

type PendingOrganization = {
  id: string;
  name: string;
  slug: string;
  contactEmail?: string;
  website?: string;
  createdAt: string;
  registration: {
    email: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    primaryMobile?: string;
    status: string;
    createdAt: string;
  } | null;
};

export default function PendingOrganizationsPage() {
  const router = useRouter();
  const auth = useMemo(() => getStoredAuth(), []);
  const [organizations, setOrganizations] = useState<PendingOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    if (!auth?.user) {
      router.replace("/login");
      return;
    }

    if (auth.user.role !== "SUPERADMIN") {
      router.replace("/dashboard");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<{ organizations: PendingOrganization[] }>(
        "/superadmin/organizations/pending",
        {}              );
      setOrganizations(response.organizations);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load pending organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (organizationId: string) => {
    if (!auth?.user) return;
    setActionId(organizationId);
    try {
      await apiRequest(`/superadmin/organizations/${organizationId}/approve`, { method: "POST" });
      await load();
    } catch (requestError) {
      window.alert(requestError instanceof Error ? requestError.message : "Unable to approve organization");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (organizationId: string) => {
    if (!auth?.user) return;
    if (!window.confirm("Reject and delete this organization registration?")) {
      return;
    }

    setActionId(organizationId);
    try {
      await apiRequest(`/superadmin/organizations/${organizationId}/reject`, { method: "POST" });
      await load();
    } catch (requestError) {
      window.alert(requestError instanceof Error ? requestError.message : "Unable to reject organization");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-black sm:text-3xl">Pending Organizations</h1>
          <p className="mt-1 text-sm text-black">Review whitelabel registrations waiting for approval.</p>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : organizations.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center text-base text-black">
            No pending organization registrations.
          </div>
        ) : (
          <div className="space-y-4">
            {organizations.map((organization) => (
              <div key={organization.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-black">{organization.name}</h2>
                    <p className="mt-1 text-sm text-black">Slug: {organization.slug}</p>
                    <p className="text-sm text-black">Contact: {organization.contactEmail || organization.registration?.email || "—"}</p>
                    {organization.registration ? (
                      <p className="mt-2 text-sm text-black">
                        Applicant: {[organization.registration.firstName, organization.registration.lastName].filter(Boolean).join(" ") || "—"}
                        {organization.registration.primaryMobile ? ` · ${organization.registration.primaryMobile}` : ""}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={actionId === organization.id}
                      onClick={() => void handleApprove(organization.id)}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={actionId === organization.id}
                      onClick={() => void handleReject(organization.id)}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
