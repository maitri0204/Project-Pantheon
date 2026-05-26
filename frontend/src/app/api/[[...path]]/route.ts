import { NextRequest, NextResponse } from "next/server";

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

const forwardRequest = async (request: NextRequest, pathSegments: string[] = []) => {
  const targetPath = pathSegments.join("/");
  const targetUrl = new URL(`${targetPath}${request.nextUrl.search}`, BACKEND_API_URL);

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", request.nextUrl.host);
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");
  responseHeaders.delete("connection");

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return forwardRequest(request, params.path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return forwardRequest(request, params.path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return forwardRequest(request, params.path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return forwardRequest(request, params.path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return forwardRequest(request, params.path);
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  return forwardRequest(request, params.path);
}