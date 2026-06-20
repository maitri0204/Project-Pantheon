import { jwtVerify } from "jose";

let cachedSecretKey: Uint8Array | null | undefined;

const getSecretKey = (): Uint8Array | null => {
  if (cachedSecretKey !== undefined) {
    return cachedSecretKey;
  }

  const secret = process.env.JWT_SECRET?.trim();
  cachedSecretKey = secret ? new TextEncoder().encode(secret) : null;
  return cachedSecretKey;
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
