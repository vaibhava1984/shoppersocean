import { NextResponse } from "next/server";
import { createFirebaseSessionCookie, FIREBASE_SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/firebase/session";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken || typeof idToken !== "string") return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    const sessionCookie = await createFirebaseSessionCookie(idToken);
    const response = NextResponse.json({ success: true });
    response.cookies.set(FIREBASE_SESSION_COOKIE, sessionCookie, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/", maxAge: Math.floor(SESSION_MAX_AGE / 1000),
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to create session" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(FIREBASE_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
