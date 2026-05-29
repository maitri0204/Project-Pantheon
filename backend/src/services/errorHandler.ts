/**
 * Centralized error response utility for consistent error handling across controllers.
 */

import { Response } from "express";

export interface AppError {
  status: number;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export const sendErrorResponse = (
  res: Response,
  error: unknown,
  context: string
): void => {
  let status = 500;
  let message = "Internal server error";
  let code = "INTERNAL_ERROR";

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  console.warn(`${context}: [${code}] ${message}`, { status });
  res.status(status).json({ message, code });
};

export const createError = (
  message: string,
  status: number = 500,
  code?: string
): AppError => ({
  message,
  status,
  code: code || `ERROR_${status}`,
});

export const createValidationError = (message: string): AppError =>
  createError(message, 400, "VALIDATION_ERROR");

export const createNotFoundError = (resource: string): AppError =>
  createError(`${resource} not found`, 404, "NOT_FOUND");

export const createUnauthorizedError = (message?: string): AppError =>
  createError(message || "Authentication required", 401, "UNAUTHORIZED");

export const createForbiddenError = (message?: string): AppError =>
  createError(message || "Access denied", 403, "FORBIDDEN");

export const createConflictError = (message: string): AppError =>
  createError(message, 409, "CONFLICT");
