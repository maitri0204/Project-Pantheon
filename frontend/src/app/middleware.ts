import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0]; // Remove port if present

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // If it's localhost or the main domain, allow it through
  const mainDomains = ["localhost", "127.0.0.1", process.env.NEXT_PUBLIC_MAIN_DOMAIN || "pantheon.local"];

  // Check if hostname matches a whitelabel domain
  const isMainDomain = mainDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));

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
