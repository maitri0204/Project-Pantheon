/** Resolve the correct login path for dashboard pages (main or whitelabel). */
export function getDashboardLoginPath(): string {
  if (typeof window === "undefined") {
    return "/login";
  }

  const match = window.location.pathname.match(/^\/whitelabel\/([^/]+)\/dashboard/);
  if (match?.[1]) {
    return `/whitelabel/${match[1]}/login`;
  }

  return "/login";
}
