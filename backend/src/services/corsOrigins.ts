import Organization from "../models/Organization";

const allowedOrgHostnames = new Set<string>();

function addHostnameFromWebsite(website: string | undefined): void {
  const raw = String(website || "").trim();
  if (!raw) return;

  try {
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const hostname = new URL(candidate).hostname.toLowerCase();
    if (hostname) {
      allowedOrgHostnames.add(hostname);
      if (hostname.startsWith("www.")) {
        allowedOrgHostnames.add(hostname.slice(4));
      } else {
        allowedOrgHostnames.add(`www.${hostname}`);
      }
    }
  } catch {
    // ignore invalid website URLs
  }
}

export async function refreshOrganizationCorsOrigins(): Promise<void> {
  const orgs = await Organization.find({ isActive: true }).select({ website: 1 }).lean();
  allowedOrgHostnames.clear();
  for (const org of orgs) {
    addHostnameFromWebsite(org.website);
  }
}

export function isOrganizationWebsiteHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return allowedOrgHostnames.has(normalized);
}
