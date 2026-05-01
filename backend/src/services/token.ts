import jwt from "jsonwebtoken";

import { IUser } from "../models/User";

const getJwtSecret = (): string => process.env.JWT_SECRET || "pantheon-local-dev-secret";

export const signToken = (user: IUser): string =>
  jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: user.organization?.toString() || null,
    },
    getJwtSecret(),
    { expiresIn: "8h" }
  );

export const verifyToken = (token: string): jwt.JwtPayload =>
  jwt.verify(token, getJwtSecret()) as jwt.JwtPayload;
