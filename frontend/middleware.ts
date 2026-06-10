import { NextRequest, NextResponse } from "next/server";

const normalizeApiUrl = (value?: string): string => {
  const fallback = "http://localhost:5014/api";
  const raw = (value || fallback).trim();
  if (!raw) return fallback;
  let normalized = raw.replace(/\/+$/, "");
  if (!normalized.endsWith("/api")) {
    normalized = `${normalized}/api`;
  }
  return normalized;
};

async function resolveWhitelabelSlug(hostname: string): Promise<string | null> {
  const apiUrl = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);
  try {
    const response = await fetch(
      `${apiUrl}/platform/whitelabel-by-host?host=${encodeURIComponent(hostname)}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as { organization?: { slug?: string } };
    return payload.organization?.slug?.trim().toLowerCase() || null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const exactMainHosts = ["localhost", "127.0.0.1", process.env.NEXT_PUBLIC_APP_HOST, "assessments.admitra.io"]
    .map((v) => String(v || "").trim().toLowerCase())
    .filter(Boolean);

  const mainDomain = String(process.env.NEXT_PUBLIC_MAIN_DOMAIN || "assessments.admitra.io")
    .trim()
    .toLowerCase();

  const isMainDomain =
    exactMainHosts.includes(hostname) ||
    hostname === mainDomain ||
    hostname === `www.${mainDomain}` ||
    hostname.endsWith(`.${mainDomain}`);

  if (isMainDomain) {
    return NextResponse.next();
  }

  const slug = await resolveWhitelabelSlug(hostname);
  if (slug) {
    const rewritePath = pathname === "/" ? "" : pathname;
    return NextResponse.rewrite(new URL(`/whitelabel/${slug}${rewritePath}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
