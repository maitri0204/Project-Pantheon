import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isValidAuthToken } from "@/lib/verifyAuthToken";

const AUTH_COOKIE_NAME = "pantheon_token";
const MAX_AUTH_TOKEN_LENGTH = 8192;
const AUTH_COOKIE_MAX_AGE = 8 * 60 * 60;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const ok = await isValidAuthToken(token);

  return NextResponse.json({ ok });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as { token?: string };
  const token = typeof payload.token === "string" ? payload.token.trim() : "";

  if (!token || token.length > MAX_AUTH_TOKEN_LENGTH) {
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
