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
};

const MAX_AUTH_TOKEN_LENGTH = 8192;

const isTokenTooLarge = (token?: string): boolean => {
  return Boolean(token && token.length > MAX_AUTH_TOKEN_LENGTH);
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
    const auth = JSON.parse(raw) as StoredAuth;
    if (isTokenTooLarge(auth?.token)) {
      clearStoredAuth();
      return null;
    }
    return auth;
  } catch (error) {
    // Log parse errors to aid debugging and clear invalid stored state
    // Keep behavior of clearing stored auth to avoid infinite parse loops
    // eslint-disable-next-line no-console
    console.error("getStoredAuth: failed to parse stored auth", error, raw);
    clearStoredAuth();
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
  if (isTokenTooLarge(token)) {
    clearStoredAuth();
    throw new Error("Authentication token is invalid or too large. Please log in again.");
  }

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
    } catch (error) {
      // Log malformed JSON responses for easier debugging
      // eslint-disable-next-line no-console
      console.error("apiRequest: failed to parse JSON response", error, rawText);
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
