import { NextResponse } from "next/server";
import { firebaseAdminAuth, firestore } from "@/lib/firebase/admin";
import { getFirebaseUser } from "@/lib/firebase/session";

async function requireAdmin() {
  const user:any = await getFirebaseUser();
  if (!user) return null;
  let role = user.userrole || user.role;
  if (role !== "ADMIN") {
    const p = await firestore.collection("profiles").doc(user.uid).get();
    role = p.exists ? p.data()?.userrole : role;
  }
  return role === "ADMIN" ? user : null;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    const snap = await firestore.collection("authors").where("is_deleted", "==", false).get();
    const rows = await Promise.all(snap.docs.map(async d => {
      const a:any = d.data();
      let email = "";
      if (a.user_id) {
        try { email = (await firebaseAdminAuth.getUser(String(a.user_id))).email || ""; } catch {}
      }
      return { id: d.id, author_id: String(a.author_id || a.id || d.id), user_id: String(a.user_id || d.id), name: String(a.name || ""), bio: String(a.bio || ""), created_at: a.created_at || "", updated_at: a.updated_at || "", email };
    }));
    return NextResponse.json({ authors: rows.sort((a,b)=>a.name.localeCompare(b.name)) });
  } catch { return NextResponse.json({ error: "Unable to load authors" }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    const { author_id, name, bio } = await request.json();
    if (!author_id || !String(name || "").trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    await firestore.collection("authors").doc(String(author_id)).set({ name: String(name).trim(), bio: String(bio || ""), updated_at: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Unable to update author" }, { status: 500 }); }
}