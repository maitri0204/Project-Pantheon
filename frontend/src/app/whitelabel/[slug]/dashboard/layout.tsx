import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function WhitelabelDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug = "" } = await params;

  return (
    <DashboardShell
      basePath={`/whitelabel/${slug}/dashboard`}
      loginPath={`/whitelabel/${slug}/login`}
      expectedOrgSlug={slug || undefined}
    >
      {children}
    </DashboardShell>
  );
}
