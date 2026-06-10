import { NextFunction, Request, Response } from "express";

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

  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message === "Not allowed by CORS" ? 403 : 500;

  // eslint-disable-next-line no-console
  console.error("Unhandled error:", error);
  res.status(status).json({ message: status === 403 ? message : "Internal server error" });
};
