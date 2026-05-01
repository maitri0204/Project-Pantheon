import { NextFunction, Response } from "express";

import User, { UserRole } from "../models/User";
import { AuthRequest } from "../types/auth";
import { verifyToken } from "../services/token";

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).populate("organization");

    if (!user || !user.isActive) {
      res.status(401).json({ message: "Invalid session" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
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
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      next();
      return;
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).populate("organization");

    if (user && user.isActive) {
      req.user = user;
    }
  } catch {
    // Continue without authenticated user when token is invalid.
  }

  next();
};
