import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0]; // Remove port if present

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Never rewrite core platform routes — keep them on the main app
  const corePaths = ["/login", "/register", "/dashboard", "/api"];
  for (const p of corePaths) {
    if (pathname === p || pathname.startsWith(p + "/")) {
      return NextResponse.next();
    }
  }

  // Recognize exact app hosts (local dev, configured host, and production domain)
  const exactMainHosts = ["localhost", "127.0.0.1", process.env.NEXT_PUBLIC_APP_HOST, "assessments.admitra.io"]
    .map((v) => String(v || "").trim().toLowerCase())
    .filter(Boolean);

  const mainDomain = String(process.env.NEXT_PUBLIC_MAIN_DOMAIN || "assessments.admitra.io")
    .trim()
    .toLowerCase();

  // Check if hostname matches a whitelabel domain — if it is the main domain or an exact host, don't rewrite
  const isMainDomain =
    exactMainHosts.includes(hostname) || hostname === mainDomain || hostname === `www.${mainDomain}` || hostname.endsWith(`.${mainDomain}`);

  if (!isMainDomain) {
    // This is a whitelabel domain - extract the subdomain
    const parts = hostname.split(".");
    if (parts.length > 1 && parts[0] !== "www") {
      const subdomain = parts[0];
      // Rewrite to /whitelabel/[slug] route
      return NextResponse.rewrite(new URL(`/whitelabel/${subdomain}${pathname}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
