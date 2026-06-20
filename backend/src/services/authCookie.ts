import { Response } from "express";

export const AUTH_COOKIE_NAME = "pantheon_token";
const AUTH_COOKIE_MAX_AGE_SECONDS = 8 * 60 * 60;

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) {
      return acc;
    }

    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (!key) {
      return acc;
    }

    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
};

export const getAuthTokenFromRequest = (args: {
  authorizationHeader?: string;
  cookieHeader?: string;
}): string | null => {
  const bearer = args.authorizationHeader?.startsWith("Bearer ")
    ? args.authorizationHeader.slice(7).trim()
    : "";

  if (bearer) {
    return bearer;
  }

  const cookies = parseCookies(args.cookieHeader);
  const cookieToken = cookies[AUTH_COOKIE_NAME]?.trim();
  return cookieToken || null;
};

export const setAuthCookie = (res: Response, token: string): void => {
  const isProduction = process.env.NODE_ENV === "production";
  const parts = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];

  if (isProduction) {
    parts.push("Secure");
  }

  res.append("Set-Cookie", parts.join("; "));
};

export const clearAuthCookie = (res: Response): void => {
  const isProduction = process.env.NODE_ENV === "production";
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "Max-Age=0",
    "SameSite=Lax",
  ];

  if (isProduction) {
    parts.push("Secure");
  }

  res.append("Set-Cookie", parts.join("; "));
};
