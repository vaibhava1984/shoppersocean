import { NextResponse } from "next/server";
import { firebaseAdminAuth, firestore } from "@/lib/firebase/admin";
import { getFirebaseUser } from "@/lib/firebase/session";

export async function POST(request: Request) {
  try {
    const current = await getFirebaseUser();
    if (!current) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    let role = (current as any).userrole || (current as any).role;
    if (role !== "ADMIN") {
      const p = await firestore.collection("profiles").doc(current.uid).get();
      role = p.exists ? p.data()?.userrole : role;
    }
    if (role !== "ADMIN") return NextResponse.json({ error: "Not allowed" }, { status: 403 });

    const { name, user_id } = await request.json();
    if (!name || !user_id) return NextResponse.json({ error: "Some Form fields are missing" }, { status: 400 });

    const target = await firebaseAdminAuth.getUser(user_id);
    await firebaseAdminAuth.setCustomUserClaims(user_id, { ...(target.customClaims || {}), userrole: "USER", isAuthor: true });
    await firestore.collection("profiles").doc(user_id).set({ isAuthor: true, updated_at: new Date().toISOString() }, { merge: true });
    await firestore.collection("authors").doc(user_id).set(
      { id: user_id, name: String(name).trim(), user_id, is_deleted: false, updated_at: new Date().toISOString() },
      { merge: true }
    );
    return NextResponse.json({ message: "Author approved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
