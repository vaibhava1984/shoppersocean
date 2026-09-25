import { NextResponse } from "next/server";
import { getFirebaseUser } from "@/lib/firebase/session";
import { firestore } from "@/lib/firebase/admin";

export async function GET() {
  const user:any = await getFirebaseUser();
  if (!user) return NextResponse.json({ user: null });
  let profile:any = null;
  try { const snap = await firestore.collection("profiles").doc(user.uid).get(); profile = snap.exists ? snap.data() : null; } catch {}
  return NextResponse.json({
    user: {
      id: user.uid,
      email: user.email || profile?.email || null,
      phone: user.phone_number || profile?.mobile || null,
      app_metadata: { userrole: user.userrole || user.role || profile?.userrole || "USER", isAuthor: Boolean(user.isAuthor || profile?.isAuthor) },
      user_metadata: { full_name: profile?.full_name || user.name || "", country: profile?.country || "", address: profile?.address || "", mobile: profile?.mobile || user.phone_number || "" },
    },
  });
}
