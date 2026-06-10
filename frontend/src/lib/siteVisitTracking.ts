import { API_URL } from "@/lib/api";

export type MainSiteVisitPage = "home" | "login";

const SESSION_KEY_PREFIX = "pantheon-main-site-visit:";

/** Record one landing per browser session for the main site home or login page. */
export function trackMainSiteVisit(page: MainSiteVisitPage): void {
  if (typeof window === "undefined") {
    return;
  }

  const sessionKey = `${SESSION_KEY_PREFIX}${page}`;
  if (sessionStorage.getItem(sessionKey)) {
    return;
  }

  sessionStorage.setItem(sessionKey, "1");

  void fetch(`${API_URL}/platform/site-visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page }),
    keepalive: true,
  }).catch(() => {
    sessionStorage.removeItem(sessionKey);
  });
}
