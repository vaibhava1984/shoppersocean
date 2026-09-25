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

    const { author_id, user_id } = await request.json();
    if (!author_id || !user_id) return NextResponse.json({ error: "Some Form fields are missing" }, { status: 400 });

    const books = await firestore.collection("books").where("author_id", "==", author_id).get();
    const activeBooks = books.docs.filter((d:any) => d.data()?.is_deleted !== true);
    if (activeBooks.length) return NextResponse.json({ error: "Please delete the books associated with this author." }, { status: 500 });

    await firestore.collection("authors").doc(String(author_id)).delete();
    const target = await firebaseAdminAuth.getUser(user_id);
    await firebaseAdminAuth.setCustomUserClaims(user_id, { ...(target.customClaims || {}), isAuthor: false });
    await firestore.collection("profiles").doc(user_id).set({ isAuthor: false, updated_at: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ message: "Author deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
