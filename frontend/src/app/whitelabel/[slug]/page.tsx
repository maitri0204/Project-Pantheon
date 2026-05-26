export const dynamic = "force-dynamic";

import Link from "next/link";

type Props = { params: { slug?: string } };

export default async function WhitelabelPortalPage({ params }: Props) {
  const slug = (params?.slug || "").toLowerCase().trim();
  const reserved = slug === "register" || slug === "dashboard";

  if (reserved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Reserved route</p>
      </div>
    );
  }

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Portal not found.</p>
      </div>
    );
  }

  const backendBase =
    process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || process.env.FRONTEND_URL || "http://127.0.0.1:5013";
  const normalized = backendBase.replace(/\/+$/, "");
  const apiUrl = normalized.includes("/api") ? normalized : `${normalized.replace(/\/+$/, "")}/api`;

  try {
    const res = await fetch(`${apiUrl}/platform/whitelabel/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Portal not found.</p>
        </div>
      );
    }

    const data = await res.json();
    const organization = data.organization;

    const primaryCtaHref = `/whitelabel/${organization.slug}/login`;

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {organization.branding?.logoUrl ? (
                  <img src={organization.branding.logoUrl} alt={`${organization.name} logo`} className="h-18 w-18 object-contain" />
                ) : (
                  <div className="h-18 w-18 bg-gray-100 border border-gray-200" />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-black">{organization.branding?.companyName || organization.name}</h1>
                  <p className="text-black/80 text-base">Whitelabel Assessment Portal</p>
                </div>
              </div>
              <Link href={primaryCtaHref} className="px-6 py-2 rounded-lg font-medium text-white" style={{ backgroundColor: organization.branding?.primaryColor || "#2563eb" }}>
                Login
              </Link>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600 py-4">
            <p>© 2026 {organization.branding?.companyName || organization.name}</p>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">Portal not found.</p>
      </div>
    );
  }
}
