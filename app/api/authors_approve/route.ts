import { NextResponse } from "next/server";
import { firebaseAdminAuth, firestore } from "@/lib/firebase/admin";
import { getFirebaseUser } from "@/lib/firebase/session";

export async function POST(request: Request) {
  try {
    const currentUser = await getFirebaseUser();
    if (!currentUser) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    let role = (currentUser as any).userrole || (currentUser as any).role;
    if (role !== "ADMIN") {
      const profile = await firestore.collection("profiles").doc(currentUser.uid).get();
      role = profile.exists ? profile.data()?.userrole : role;
    }
    if (role !== "ADMIN") return NextResponse.json({ error: "Not allowed" }, { status: 403 });

    const { author_id } = await request.json();
    if (!author_id || typeof author_id !== "string") {
      return NextResponse.json({ error: "Author ID is required" }, { status: 400 });
    }

    const authorUser = await firebaseAdminAuth.getUser(author_id);
    if (!authorUser) return NextResponse.json({ error: "Failed to get user data" }, { status: 404 });

    await firebaseAdminAuth.setCustomUserClaims(author_id, {
      ...(authorUser.customClaims || {}),
      userrole: "USER",
      isAuthor: true,
    });

    await firestore.collection("profiles").doc(author_id).set(
      { isAuthor: true, updated_at: new Date().toISOString() },
      { merge: true }
    );

    const authorRef = firestore.collection("authors").doc(author_id);
    await authorRef.set(
      { id: author_id, name: "-", bio: "-", user_id: author_id, updated_at: new Date().toISOString() },
      { merge: true }
    );

    const pending = await firestore.collection("authors_interest_submission")
      .where("user_id", "==", author_id).get();
    const batch = firestore.batch();
    pending.docs.forEach((doc: any) => batch.delete(doc.ref));
    if (pending.size) await batch.commit();

    return NextResponse.json({ message: "Author approved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
