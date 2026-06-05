import jwt from "jsonwebtoken";

import { IUser } from "../models/User";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }

  return "pantheon-local-dev-secret";
};

const getOrganizationId = (organization: unknown): string | null => {
  if (!organization) {
    return null;
  }

  if (typeof organization === "string") {
    const trimmed = organization.trim();
    return trimmed || null;
  }

  if (typeof organization === "object" && organization !== null) {
    const candidate = organization as {
      _id?: { toString?: () => string };
      id?: string;
      toString?: () => string;
    };

    if (candidate._id && typeof candidate._id.toString === "function") {
      const id = candidate._id.toString().trim();
      return id || null;
    }

    if (typeof candidate.id === "string" && candidate.id.trim()) {
      return candidate.id.trim();
    }

    if (typeof candidate.toString === "function") {
      const maybeId = candidate.toString().trim();
      // Guard against stringified documents like "{ name: ..., branding: ... }".
      if (maybeId && !maybeId.startsWith("{")) {
        return maybeId;
      }
    }
  }

  return null;
};

export const signToken = (user: IUser): string =>
  jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: getOrganizationId(user.organization),
    },
    getJwtSecret(),
    { expiresIn: "8h" }
  );

export const verifyToken = (token: string): jwt.JwtPayload =>
  jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
