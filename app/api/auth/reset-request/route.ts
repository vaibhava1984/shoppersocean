import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/utils/auth/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") return NextResponse.json({ error: "Email is required" }, { status: 400 });
    await requestPasswordReset(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password reset request failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send password reset email." }, { status: 500 });
  }
}
