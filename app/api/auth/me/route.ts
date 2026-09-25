import { NextResponse } from "next/server";
import { getFirebaseUser } from "@/lib/firebase/session";

export async function GET() {
  const user:any = await getFirebaseUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.uid,
      email: user.email || null,
      phone: user.phone_number || null,
      app_metadata: {
        userrole: user.userrole || user.role || "USER",
        isAuthor: Boolean(user.isAuthor),
      },
      user_metadata: user.name ? { full_name: user.name } : {},
    },
  });
}
