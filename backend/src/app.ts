import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import apiRoutes from "./routes";

const app = express();

// Express is behind Nginx reverse proxy — required for express-rate-limit
// to correctly identify client IPs from X-Forwarded-For, and to prevent
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR validation errors.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL?.split(",").map((value) => value.trim()) || true,
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
