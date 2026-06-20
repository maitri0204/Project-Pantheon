import { clearSessionCookie, syncSessionCookie } from "@/lib/sessionCookie";

const normalizeApiUrl = (value?: string): string => {
  const fallback = typeof window === "undefined" ? "http://localhost:5000/api" : "/api";
  const raw = (value || fallback).trim();

  if (!raw) {
    return fallback;
  }

  let normalized = raw.replace(/\/+$/, "");
  if (!normalized.endsWith("/api")) {
    normalized = `${normalized}/api`;
  }

  return normalized;
};

export const API_URL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

export type StoredAuth = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "SUPERADMIN" | "ORG_ADMIN" | "STUDENT" | "PARENT" | "REVIEWER";
    organizationId: string | null;
    isVerified: boolean;
    grade?: string;
    institutionName?: string;
    division?: string;
  };
  orgCompanyName?: string;
  orgSlug?: string;
  orgLogoUrl?: string;
  organizationSlug?: string;
};

type SetStoredAuthInput = StoredAuth & { token?: string };

const clearLegacyAuthStorage = (): void => {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
};

const stripLegacyTokenFromStorage = (): void => {
  const raw = window.localStorage.getItem("pantheon-auth");
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!("token" in parsed)) {
      return;
    }

    delete parsed.token;
    window.localStorage.setItem("pantheon-auth", JSON.stringify(parsed));
  } catch {
    window.localStorage.removeItem("pantheon-auth");
  }
};

export const getStoredAuth = (): StoredAuth | null => {
  if (typeof window === "undefined") {
    return null;
  }

  stripLegacyTokenFromStorage();

  const raw = window.localStorage.getItem("pantheon-auth");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("getStoredAuth: failed to parse stored auth", error);
    clearStoredAuth();
    return null;
  }
};

export const setStoredAuth = (value: SetStoredAuthInput): void => {
  if (typeof window === "undefined") {
    return;
  }

  const { token, ...profile } = value;
  clearLegacyAuthStorage();
  window.localStorage.setItem("pantheon-auth", JSON.stringify(profile));
  if (token?.trim()) {
    void syncSessionCookie(token.trim());
  }
};

export const clearStoredAuth = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("pantheon-auth");
  clearLegacyAuthStorage();
  void clearSessionCookie();
  void fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => undefined);
};

export const isAuthenticated = (): boolean => Boolean(getStoredAuth()?.user?.id);

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  const isJsonLike = contentType.includes("application/json") || rawText.trim().startsWith("{") || rawText.trim().startsWith("[");

  let data: any = {};
  if (isJsonLike && rawText) {
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("apiRequest: failed to parse JSON response", error, rawText);
      data = { message: "Invalid JSON response from server" };
    }
  } else if (rawText) {
    data = { message: rawText };
  }

  if (!response.ok) {
    const authFailureMessage = typeof data.message === "string" ? data.message : "";
    const shouldClearAuth =
      response.status === 401 &&
      typeof window !== "undefined" &&
      isAuthenticated() &&
      !path.includes("/email-report") &&
      (authFailureMessage === "Invalid or expired token"
        || authFailureMessage === "Invalid session"
        || authFailureMessage === "Authentication required");
    if (shouldClearAuth) {
      clearStoredAuth();
    }
    throw new Error(data.message || "Request failed");
  }

  return data as T;
};

/** Authenticated fetch for binary responses (PDF download, etc.). */
export const authenticatedFetch = async (
  path: string,
  options: RequestInit = {},
): Promise<Response> => {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
  });
};

/** Upload a generated report PDF for email delivery (multipart; avoids large JSON base64 payloads). */
export const uploadEmailReportPdf = async <T = { message: string }>(
  path: string,
  pdfBlob: Blob,
  fileName: string,
): Promise<T> => {
  if (!pdfBlob.size) {
    throw new Error("Report PDF was empty. Please try downloading the report first.");
  }

  const maxEmailPdfBytes = 25 * 1024 * 1024;
  if (pdfBlob.size > maxEmailPdfBytes) {
    throw new Error("Report file is too large to email. Please download the report instead.");
  }

  const formData = new FormData();
  formData.append("pdf", pdfBlob, fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`);
  formData.append("fileName", fileName);

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();
  const isJsonLike = contentType.includes("application/json")
    || rawText.trim().startsWith("{")
    || rawText.trim().startsWith("[");

  let data: { message?: string } = {};
  if (isJsonLike && rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { message: "Invalid JSON response from server" };
    }
  } else if (rawText) {
    data = { message: rawText };
  }

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error("Report file is too large to email. Try downloading the report instead.");
    }
    throw new Error(data.message || "Failed to email report");
  }

  return data as T;
};
