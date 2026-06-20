import { NextRequest, NextResponse } from "next/server";

import { isValidAuthToken } from "@/lib/verifyAuthToken";

const AUTH_COOKIE_NAME = "pantheon_token";

const normalizeApiUrl = (value?: string): string => {
  const fallback = process.env.API_PROXY_TARGET
    ? `${process.env.API_PROXY_TARGET.replace(/\/+$/, "")}/api`
    : "http://localhost:5000/api";
  const raw = (value || process.env.NEXT_PUBLIC_API_URL || fallback).trim();
  if (!raw) return fallback;
  let normalized = raw.replace(/\/+$/, "");
  if (!normalized.endsWith("/api")) {
    normalized = `${normalized}/api`;
  }
  return normalized;
};

async function resolveWhitelabelSlug(hostname: string): Promise<string | null> {
  const apiUrl = normalizeApiUrl();
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

function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/reviewer/")) {
    return true;
  }

  const whitelabelProtected = pathname.match(/^\/whitelabel\/[^/]+\/(student|dashboard)(\/|$)/);
  if (whitelabelProtected) {
    if (pathname.includes("/student/login") || pathname.includes("/student/register")) {
      return false;
    }
    if (/^\/whitelabel\/[^/]+\/login\/?$/.test(pathname)) {
      return false;
    }
    return true;
  }

  if (pathname.startsWith("/student")) {
    if (pathname.startsWith("/student/login") || pathname.startsWith("/student/register")) {
      return false;
    }
    return true;
  }

  return false;
}

function getLoginRedirect(pathname: string, request: NextRequest, tenantSlug?: string | null): URL {
  const slugFromPath = pathname.match(/^\/whitelabel\/([^/]+)/)?.[1];
  const slug = slugFromPath || tenantSlug;

  if (slug && (pathname.includes("/student") || pathname.startsWith("/student"))) {
    return new URL(`/whitelabel/${slug}/student/login`, request.url);
  }

  if (slug) {
    return new URL(`/whitelabel/${slug}/login`, request.url);
  }

  return new URL("/login", request.url);
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase();
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

  let tenantSlug: string | null = null;
  let response: NextResponse;

  if (isMainDomain) {
    response = NextResponse.next();
  } else {
    tenantSlug = await resolveWhitelabelSlug(hostname);
    if (tenantSlug) {
      const rewritePath = pathname === "/" ? "" : pathname;
      response = NextResponse.rewrite(new URL(`/whitelabel/${tenantSlug}${rewritePath}`, request.url));
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ message: "Unknown host" }, { status: 404 });
    } else {
      response = NextResponse.next();
    }
  }

  if (isProtectedPath(pathname)) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!(await isValidAuthToken(token))) {
      return NextResponse.redirect(getLoginRedirect(pathname, request, tenantSlug));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
