import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
import { requireAdmin } from "@/utils/auth/requireUser";
import { deleteB2Object, putB2Object } from "@/utils/cloudflare/b2";

export async function GET(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });

    const bookId = new URL(request.url).searchParams.get("bookId");
    if (!bookId) return NextResponse.json({ error: "Book ID is required" }, { status: 400 });

    const { results = [] } = await db.prepare(
      "SELECT id,storage_key,file_name,mime_type,size_bytes,created_at FROM private_book_files WHERE book_id=? ORDER BY created_at DESC"
    ).bind(bookId).all<any>();

    return NextResponse.json({
      files: results.map((f) => ({
        ...f,
        file_path: f.storage_key,
        file_type: f.mime_type || "application/pdf",
        file_name: f.file_name || f.storage_key.split("/").pop() || "file",
      }))
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Admin book-files GET:", e);
    return NextResponse.json({ error: "Unable to load book files" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });

    const form = await request.formData();
    const bookId = String(form.get("bookId") ?? "").trim();
    const book = await db.prepare("SELECT id FROM books WHERE id=? AND COALESCE(is_deleted,0)=0 LIMIT 1").bind(bookId).first();
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const files = form.getAll("file").filter((v): v is File => v instanceof File);
    if (!files.length) return NextResponse.json({ error: "No PDF file selected" }, { status: 400 });
    const file = files[0];
    const originalName = file.name || "book.pdf";
    if (!originalName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "PDF files only" }, { status: 400 });
    }

    // Upload the replacement first, keeping the existing PDF intact if this fails.
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const storageKey = `books/${bookId}/${crypto.randomUUID()}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") {
      return NextResponse.json({ error: "The selected file is not a valid PDF" }, { status: 400 });
    }
    await putB2Object(storageKey, bytes, "application/pdf");

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.prepare(
      "INSERT INTO private_book_files(id,book_id,storage_key,file_name,mime_type,size_bytes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)"
    ).bind(id,bookId,storageKey,originalName,"application/pdf",bytes.byteLength,now,now).run();

    // Keep only the newly uploaded PDF for this book.
    const { results: previousFiles = [] } = await db.prepare(
      "SELECT id,storage_key FROM private_book_files WHERE book_id=? AND id<>?"
    ).bind(bookId,id).all<any>();
    for (const previous of previousFiles) {
      try { await deleteB2Object(String(previous.storage_key)); } catch (error) {
        console.error("Could not delete replaced book PDF from storage:", error);
      }
      await db.prepare("DELETE FROM private_book_files WHERE id=?").bind(previous.id).run();
    }

    return NextResponse.json({
      files: [{ id, file_path: storageKey, file_name: originalName, file_type: "application/pdf" }],
      message: "The new book uploaded"
    }, { status: 201 });
  } catch (e) {
    console.error("Admin book-files POST:", e);
    return NextResponse.json({ error: "Unable to upload book files" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    const db = getD1();
    if (!db) return NextResponse.json({ error: "Cloudflare database unavailable" }, { status: 503 });

    const body = await request.json();
    const id = String(body.id ?? "").trim();
    if (!id) return NextResponse.json({ error: "File ID is required" }, { status: 400 });

    const file = await db.prepare("SELECT storage_key FROM private_book_files WHERE id=? LIMIT 1").bind(id).first<any>();
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

    await deleteB2Object(String(file.storage_key));
    await db.prepare("DELETE FROM private_book_files WHERE id=?").bind(id).run();

    return NextResponse.json({ message: "File removed successfully" });
  } catch (e) {
    console.error("Admin book-files DELETE:", e);
    return NextResponse.json({ error: "Unable to remove book file" }, { status: 500 });
  }
}
