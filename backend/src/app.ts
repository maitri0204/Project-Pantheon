import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import apiRoutes from "./routes";

const app = express();
const bodyLimit = process.env.REQUEST_BODY_LIMIT || "50mb";
const allowedOrigins = process.env.FRONTEND_URL?.split(",")
  .map((value) => value.trim())
  .filter(Boolean) ?? [];
const mainDomain = (process.env.MAIN_DOMAIN || "assessments.admitra.io")
  .trim()
  .toLowerCase()
  .replace(/^https?:\/\//, "")
  .replace(/^www\./, "");

const isAllowedOrigin = (origin: string): boolean => {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Always allow localhost for development
  if (origin?.includes("localhost") || origin?.includes("127.0.0.1")) {
    return true;
  }

  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    return hostname === mainDomain || hostname === `www.${mainDomain}` || hostname.endsWith(`.${mainDomain}`);
  } catch {
    return false;
  }
};

// Express is behind Nginx reverse proxy — required for express-rate-limit
// to correctly identify client IPs from X-Forwarded-For, and to prevent
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR validation errors.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "Assessment Centre backend is running" });
});

app.use("/api", apiRoutes);

export default app;
