import { NextResponse } from "next/server";
import { requireUser } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const identity = await requireUser();
    if (!identity) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const db = getD1();
    if (!db) throw new Error("Cloudflare D1 is not available");

    const { bookId } = await request.json();
    if (!bookId) return NextResponse.json({ error: "Book ID is required" }, { status: 400 });

    const purchase = await db
      .prepare("SELECT id FROM orders WHERE user_id=? AND book_id=? AND status='completed' LIMIT 1")
      .bind(identity.profile.id, String(bookId))
      .first();

    if (!purchase) return NextResponse.json({ error: "Purchase required" }, { status: 403 });

    const files = await db
      .prepare("SELECT file_path,file_name,file_type FROM private_book_files WHERE book_id=? ORDER BY created_at DESC LIMIT 20")
      .bind(String(bookId))
      .all<Record<string, any>>();

    const pdf = files.results.find(file =>
      String(file.file_type || "").toLowerCase() === "pdf" ||
      String(file.file_name || "").toLowerCase().endsWith(".pdf")
    );

    if (!pdf) return NextResponse.json({ error: "No book file is available" }, { status: 404 });

    return NextResponse.json({
      readerUrl: `/api/get-book-reader-pdf?bookId=${encodeURIComponent(String(bookId))}`,
      fileName: pdf.file_name,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to authorize book reader:", error);
    return NextResponse.json({ error: "Failed to open book" }, { status: 500 });
  }
}
