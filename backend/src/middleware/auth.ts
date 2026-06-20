import { NextFunction, Response } from "express";

import User, { UserRole } from "../models/User";
import { AuthRequest } from "../types/auth";
import { getAuthTokenFromRequest } from "../services/authCookie";
import { verifyToken } from "../services/token";

const loadAuthenticatedUser = async (req: AuthRequest, res: Response): Promise<boolean> => {
  const token = getAuthTokenFromRequest({
    authorizationHeader: req.headers.authorization,
    cookieHeader: req.headers.cookie,
  });

  if (!token) {
    res.status(401).json({ message: "Authentication required" });
    return false;
  }

  const payload = verifyToken(token);
  const user = await User.findById(payload.sub).populate("organization");

  if (!user || !user.isActive) {
    res.status(401).json({ message: "Invalid session" });
    return false;
  }

  req.user = user;
  return true;
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authenticated = await loadAuthenticatedUser(req, res);
    if (!authenticated) {
      return;
    }

    next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("requireAuth: token verification failed", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRoles = (...roles: UserRole[]) => (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (!roles.includes(req.user.role)) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  next();
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getAuthTokenFromRequest({
      authorizationHeader: req.headers.authorization,
      cookieHeader: req.headers.cookie,
    });

    if (!token) {
      next();
      return;
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).populate("organization");

    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("optionalAuth: invalid token", err);
  }

  next();
};
