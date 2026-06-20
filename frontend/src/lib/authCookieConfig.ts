export const AUTH_COOKIE_NAME = "pantheon_token";
export const AUTH_COOKIE_MAX_AGE = 8 * 60 * 60;

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: AUTH_COOKIE_MAX_AGE,
});
