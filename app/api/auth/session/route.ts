import { NextResponse } from "next/server";

import { hasAllowedOrigin } from "@/src/lib/auth/origin";
import { sessionCookieName, sessionDurationMilliseconds } from "@/src/lib/auth/session";
import { adminAuth } from "@/src/lib/firebase/admin";

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const body = (await request.json().catch(() => null)) as { idToken?: unknown } | null;
  if (typeof body?.idToken !== "string")
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  try {
    const decoded = await adminAuth.verifyIdToken(body.idToken, true);
    if (!decoded.email_verified)
      return NextResponse.json({ error: "Verify your email first" }, { status: 403 });
    const session = await adminAuth.createSessionCookie(body.idToken, {
      expiresIn: sessionDurationMilliseconds,
    });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieName, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionDurationMilliseconds / 1000,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  if (!hasAllowedOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
