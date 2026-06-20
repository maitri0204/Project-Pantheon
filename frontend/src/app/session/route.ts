import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/authCookieConfig";
import { validateAuthToken } from "@/lib/verifyAuthToken";

const MAX_AUTH_TOKEN_LENGTH = 8192;

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const ok = await validateAuthToken(token);

  return NextResponse.json({ ok });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as { token?: string };
  const token = typeof payload.token === "string" ? payload.token.trim() : "";

  if (!token || token.length > MAX_AUTH_TOKEN_LENGTH) {
    return NextResponse.json({ message: "Invalid token" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  });
  return response;
}
