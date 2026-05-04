const normalizeApiUrl = (value?: string): string => {
  const fallback = "http://localhost:5000/api";
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
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "SUPERADMIN" | "ORG_ADMIN" | "STUDENT";
    organizationId: string | null;
    isVerified: boolean;
    grade?: string;
    institutionName?: string;
  };
  orgCompanyName?: string;
  orgSlug?: string;
  orgLogoUrl?: string;
};

export const getStoredAuth = (): StoredAuth | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem("pantheon-auth");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
};

export const setStoredAuth = (value: StoredAuth): void => {
  window.localStorage.setItem("pantheon-auth", JSON.stringify(value));
};

export const clearStoredAuth = (): void => {
  window.localStorage.removeItem("pantheon-auth");
};

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    } catch {
      data = { message: "Invalid JSON response from server" };
    }
  } else if (rawText) {
    data = { message: rawText };
  }

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      clearStoredAuth();
    }
    throw new Error(data.message || "Request failed");
  }

  return data as T;
};
