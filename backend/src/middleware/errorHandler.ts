import { NextFunction, Request, Response } from "express";

import { toSafeClientErrorMessage } from "../services/safeErrorMessage";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (
    error
    && typeof error === "object"
    && "code" in error
    && (error as { code?: string }).code === "LIMIT_FILE_SIZE"
  ) {
    res.status(413).json({ message: "Report file is too large to email" });
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message === "Not allowed by CORS" ? 403 : 500;

  // eslint-disable-next-line no-console
  console.error("Unhandled error:", error);
  res.status(status).json({
    message: status === 403 ? message : toSafeClientErrorMessage(error),
  });
};
