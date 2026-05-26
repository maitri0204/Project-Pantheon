import LoginPageContent from "@/components/auth/LoginPageContent";

export const dynamic = "force-dynamic";

type Props = {
  params: { slug?: string };
};

export default function WhitelabelLoginPage({ params }: Props) {
  const slug = (params?.slug || "").toLowerCase().trim();
  return <LoginPageContent forcedOrganizationSlug={slug} />;
}

