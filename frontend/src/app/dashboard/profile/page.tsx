"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";
import { apiRequest, getStoredAuth, setStoredAuth } from "@/lib/api";

type OrgProfile = {
  _id: string;
  name: string;
  slug: string;
  type: "PLATFORM" | "WHITELABEL";
  website?: string;
  contactEmail?: string;
  settings?: {
    contactPhone?: string;
    representativeName?: string;
  };
  branding: {
    companyName: string;
    logoUrl?: string;
  };
};

type UpdateOrgResponse = {
  organization: OrgProfile;
};

export default function OrganizationProfilePage() {
  const router = useRouter();
  const auth = useMemo(() => getStoredAuth(), []);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [organization, setOrganization] = useState<OrgProfile | null>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    contactEmail: "",
    contactPhone: "",
    representativeName: "",
  });

  useEffect(() => {
    if (!auth?.token || auth.user.role !== "ORG_ADMIN") {
      router.replace("/login");
      return;
    }

    apiRequest<{ organization: OrgProfile }>(`/platform/organization/profile`, {}, auth.token)
      .then((res) => {
        setOrganization(res.organization);
        setFormData({
          companyName: res.organization.branding.companyName || "",
          website: res.organization.website || "",
          contactEmail: res.organization.contactEmail || "",
          contactPhone: res.organization.settings?.contactPhone || "",
          representativeName: res.organization.settings?.representativeName || "",
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load organization profile");
      })
      .finally(() => setLoading(false));
  }, [auth, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;

        const response = await apiRequest<UpdateOrgResponse>(
          `/platform/organization/logo`,
          {
            method: "PATCH",
            body: JSON.stringify({ logoUrl: base64String }),
          },
          auth!.token
        );

        setOrganization(response.organization);
        setSuccess("Logo updated successfully!");
        
        // Update stored auth with new org logo
        if (auth) {
          setStoredAuth({
            ...auth,
            orgLogoUrl: response.organization.branding.logoUrl,
          });
        }

        setTimeout(() => setSuccess(""), 3000);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.companyName.trim()) {
      setError("Company name is required");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiRequest<UpdateOrgResponse>(
        `/platform/organization/profile`,
        {
          method: "PATCH",
          body: JSON.stringify(formData),
        },
        auth!.token
      );

      setOrganization(response.organization);
      setSuccess("Profile updated successfully!");

      // Update stored auth
      if (auth) {
        setStoredAuth({
          ...auth,
          orgCompanyName: response.organization.branding.companyName,
        });
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          Failed to load organization profile
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Organization Profile</h1>
          <p className="mt-2 text-slate-600">Manage your organization's branding and contact information</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        {/* Logo Section */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Organization Logo</h2>
          
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Current Logo */}
            <div className="flex flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4" style={{ width: "150px", height: "150px" }}>
              {organization.branding.logoUrl ? (
                <Image
                  src={organization.branding.logoUrl}
                  alt="Organization Logo"
                  width={140}
                  height={140}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                  <p className="text-xs text-slate-500">No logo</p>
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="flex-1">
              <label className="block">
                <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-100 transition-colors">
                  <Upload className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">Click to upload logo</p>
                  <p className="text-xs text-blue-700 mt-1">PNG, JPG, GIF or WebP • Max 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              </label>
              {uploading && <p className="mt-2 text-sm text-blue-600">Uploading...</p>}
            </div>
          </div>
        </div>

        {/* Profile Details Section - Read Only */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-900">Organization Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-slate-50 p-4 border border-blue-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Company Name</p>
              <p className="text-lg font-semibold text-slate-900">{formData.companyName || "—"}</p>
            </div>

            {/* Website */}
            <div className="rounded-lg bg-gradient-to-br from-cyan-50 to-slate-50 p-4 border border-cyan-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Website</p>
              {formData.website ? (
                <a
                  href={formData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-blue-600 hover:text-blue-700 break-all"
                >
                  {formData.website}
                </a>
              ) : (
                <p className="text-lg font-semibold text-slate-400">—</p>
              )}
            </div>

            {/* Contact Email */}
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-slate-50 p-4 border border-purple-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Contact Email</p>
              {formData.contactEmail ? (
                <a
                  href={`mailto:${formData.contactEmail}`}
                  className="text-lg font-semibold text-blue-600 hover:text-blue-700 break-all"
                >
                  {formData.contactEmail}
                </a>
              ) : (
                <p className="text-lg font-semibold text-slate-400">—</p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-slate-50 p-4 border border-emerald-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Contact Phone</p>
              {formData.contactPhone ? (
                <a
                  href={`tel:${formData.contactPhone}`}
                  className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                >
                  {formData.contactPhone}
                </a>
              ) : (
                <p className="text-lg font-semibold text-slate-400">—</p>
              )}
            </div>

            {/* Representative Name */}
            <div className="rounded-lg bg-gradient-to-br from-rose-50 to-slate-50 p-4 border border-rose-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Representative Name</p>
              <p className="text-lg font-semibold text-slate-900">{formData.representativeName || "—"}</p>
            </div>

            {/* Organization Type */}
            <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-slate-50 p-4 border border-indigo-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Organization Type</p>
              <p className="text-lg font-semibold text-slate-900">
                {organization.type === "WHITELABEL" ? "White Label" : "Platform"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
