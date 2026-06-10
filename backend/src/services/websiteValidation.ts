const normalizeHostname = (value: string): string => value.trim().toLowerCase();

export const getMainDomainHostname = (): string => {
  return (process.env.MAIN_DOMAIN || "assessments.admitra.io")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
};

export const isAllowedOrganizationWebsite = (website: string | undefined): boolean => {
  const raw = String(website || "").trim();
  if (!raw) {
    return true;
  }

  try {
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const hostname = normalizeHostname(new URL(candidate).hostname);
    if (!hostname || hostname.includes("localhost") || hostname === "127.0.0.1") {
      return true;
    }

    const mainDomain = getMainDomainHostname();
    if (hostname === mainDomain || hostname === `www.${mainDomain}` || hostname.endsWith(`.${mainDomain}`)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

export const parseWebsiteHostname = (website: string | undefined): string | null => {
  const raw = String(website || "").trim();
  if (!raw) {
    return null;
  }

  try {
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return normalizeHostname(new URL(candidate).hostname);
  } catch {
    return null;
  }
};
