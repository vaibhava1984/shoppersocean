import { NextResponse } from "next/server";
import { getFirebaseUser } from "@/lib/firebase/session";
import { firestore } from "@/lib/firebase/admin";
import { getBookPdfUrl } from "@/lib/backblaze";

export async function GET(request: Request) {
  try {
    const user: any = await getFirebaseUser();
    if (!user) return new NextResponse("Not authorized", { status: 403 });
    const bookId = new URL(request.url).searchParams.get("bookId");
    if (!bookId) return new NextResponse("Book ID is required", { status: 400 });
    const orders = await firestore.collection("orders").where("user_id", "==", user.uid).where("product_id", "==", bookId).where("status", "==", "completed").limit(1).get();
    if (orders.empty) return new NextResponse("Purchase required", { status: 403 });
    const files = await firestore.collection("private_book_files").where("book_id", "==", bookId).get();
    const pdf = files.docs.map((doc) => doc.data() as any).find((file) => String(file.file_type || "").toLowerCase() === "pdf" || String(file.file_name || "").toLowerCase().endsWith(".pdf"));
    if (!pdf?.file_path) return new NextResponse("No PDF book is available", { status: 404 });
    const upstream = await fetch(await getBookPdfUrl(String(pdf.file_path)), { headers: request.headers.get("range") ? { Range: request.headers.get("range")! } : undefined, cache: "no-store" });
    if (!upstream.ok && upstream.status !== 206) return new NextResponse("Unable to load book", { status: upstream.status });
    const headers = new Headers({ "Content-Type": "application/pdf", "Cache-Control": "private, no-store", "Accept-Ranges": upstream.headers.get("accept-ranges") || "bytes" });
    for (const key of ["content-length", "content-range"]) { const value = upstream.headers.get(key); if (value) headers.set(key, value); }
    return new NextResponse(upstream.body, { status: upstream.status, headers });
  } catch (error) { console.error("Error proxying purchased book PDF:", error); return new NextResponse("Failed to load book", { status: 500 }); }
}