import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import apiRoutes from "./routes";

const app = express();
const normalizeHost = (value: string): string => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return "";
  }

  const candidate = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(candidate).hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/:]/)[0];
  }
};

const allowedOriginHosts = [
  ...((process.env.FRONTEND_URL?.split(",") ?? []).map((value) => normalizeHost(value))),
  "localhost",
  "127.0.0.1",
  "assessments.admitra.io",
].filter(Boolean);
const mainDomain = (process.env.MAIN_DOMAIN || "careerstudio.net")
  .trim()
  .toLowerCase()
  .replace(/^https?:\/\//, "")
  .replace(/^www\./, "");

const isAllowedOrigin = (origin: string): boolean => {
  const normalizedOriginHost = normalizeHost(origin);

  if (allowedOriginHosts.includes(normalizedOriginHost)) {
    return true;
  }

  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    
    // Allow localhost and 127.0.0.1 in development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }
    
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
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "Assessment Centre backend is running" });
});

app.use("/api", apiRoutes);

export default app;
