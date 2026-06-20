import { jwtVerify } from "jose";

export async function isValidAuthToken(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.JWT_SECRET?.trim();
  const normalized = token?.trim();

  if (!secret || !normalized) {
    return false;
  }

  try {
    await jwtVerify(normalized, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}
