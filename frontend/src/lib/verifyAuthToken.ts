import { jwtVerify } from "jose";

import { AUTH_COOKIE_NAME } from "@/lib/authCookieConfig";

let cachedSecretKey: Uint8Array | null | undefined;

const getSecretKey = (): Uint8Array | null => {
  if (cachedSecretKey !== undefined) {
    return cachedSecretKey;
  }

  const secret = process.env.JWT_SECRET?.trim();
  cachedSecretKey = secret ? new TextEncoder().encode(secret) : null;
  return cachedSecretKey;
};

export const getServerBackendApiUrl = (): string => {
  const proxyTarget = process.env.API_PROXY_TARGET?.trim();
  if (proxyTarget) {
    const base = proxyTarget.replace(/\/+$/, "");
    return base.endsWith("/api") ? base : `${base}/api`;
  }

  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicUrl?.startsWith("http")) {
    const base = publicUrl.replace(/\/+$/, "");
    return base.endsWith("/api") ? base : `${base}/api`;
  }

  return "http://localhost:5000/api";
};

export async function isValidAuthToken(token: string | undefined | null): Promise<boolean> {
  const secretKey = getSecretKey();
  const normalized = token?.trim();

  if (!secretKey || !normalized) {
    return false;
  }

  try {
    await jwtVerify(normalized, secretKey, {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

/** Validate locally first; fall back to backend when JWT_SECRET is missing or mismatched on the frontend host. */
export async function validateAuthToken(token: string | undefined | null): Promise<boolean> {
  const normalized = token?.trim();
  if (!normalized) {
    return false;
  }

  if (await isValidAuthToken(normalized)) {
    return true;
  }

  const apiUrl = getServerBackendApiUrl();
  try {
    const response = await fetch(`${apiUrl}/auth/validate-session`, {
      headers: {
        Cookie: `${AUTH_COOKIE_NAME}=${encodeURIComponent(normalized)}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as { valid?: boolean };
    return payload.valid === true;
  } catch {
    return false;
  }
}
