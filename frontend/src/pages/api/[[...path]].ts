import type { NextApiRequest, NextApiResponse } from "next";

const normalizeApiUrl = (value?: string): string => {
  const fallback = "http://localhost:5000/api";
  const raw = String(value || fallback).trim();

  if (!raw) {
    return fallback;
  }

  let normalized = raw.replace(/\/+$/, "");
  if (!normalized.endsWith("/api")) {
    normalized = `${normalized}/api`;
  }

  return normalized;
};

const BACKEND_API_URL = normalizeApiUrl(
  process.env.BACKEND_API_URL || process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const segments = req.query.path;
  const pathParts = Array.isArray(segments) ? segments : typeof segments === "string" ? [segments] : [];
  const targetPath = pathParts.join("/");
  const targetUrl = new URL(`${targetPath}${req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`, BACKEND_API_URL);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "undefined") continue;
    if (Array.isArray(value)) {
      headers.set(key, value.join(","));
      continue;
    }
    headers.set(key, value);
  }

  headers.delete("host");
  headers.set("x-forwarded-host", req.headers.host || "");
  headers.set("x-forwarded-proto", req.headers["x-forwarded-proto"]?.toString() || "https");

  const body = req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.from(JSON.stringify(req.body ?? {}));

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  res.status(response.status);
  response.headers.forEach((value, key) => {
    if (["content-encoding", "content-length", "transfer-encoding", "connection"].includes(key.toLowerCase())) {
      return;
    }
    res.setHeader(key, value);
  });

  const responseText = await response.text();
  res.send(responseText);
}