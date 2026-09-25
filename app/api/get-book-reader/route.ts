import { NextResponse } from "next/server";
import { getFirebaseUser } from "@/lib/firebase/session";
import { firestore } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const user: any = await getFirebaseUser();
    if (!user) return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    const { bookId } = await request.json();
    if (!bookId) return NextResponse.json({ error: "Book ID is required" }, { status: 400 });

    const orders = await firestore.collection("orders")
      .where("user_id", "==", user.uid)
      .where("product_id", "==", bookId)
      .where("status", "==", "completed")
      .limit(1)
      .get();
    if (orders.empty) return NextResponse.json({ error: "Purchase required" }, { status: 403 });

    const files = await firestore.collection("private_book_files").where("book_id", "==", bookId).get();
    const pdf = files.docs.map((doc) => doc.data() as any)
      .find((file) => String(file.file_type || "").toLowerCase() === "pdf" || String(file.file_name || "").toLowerCase().endsWith(".pdf"));
    if (!pdf) return NextResponse.json({ error: "No PDF book is available" }, { status: 404 });

    return NextResponse.json({
      readerUrl: `/api/get-book-reader-pdf?bookId=${encodeURIComponent(bookId)}`,
      fileName: pdf.file_name,
    });
  } catch (error) {
    console.error("Error creating protected reader URL:", error);
    return NextResponse.json({ error: "Failed to open book" }, { status: 500 });
  }
}
