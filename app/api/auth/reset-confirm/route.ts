import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/utils/auth/server";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    const result = await resetPasswordWithToken(String(token || ""), String(password || ""));
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password reset confirmation failed:", error);
    return NextResponse.json({ error: "Unable to reset password. Please try again." }, { status: 500 });
  }
}
