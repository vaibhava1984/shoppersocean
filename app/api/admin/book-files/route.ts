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
    if (!files.length) return NextResponse.json({ error: "No files selected" }, { status: 400 });

    const uploaded: any[] = [];
    for (const file of files) {
      const originalName = file.name || "book-file";
      const safeName = originalName.replace(/[^a-zA-Z0-9._-]+/g, "_");
      const storageKey = `books/${bookId}/${crypto.randomUUID()}-${safeName}`;
      const bytes = new Uint8Array(await file.arrayBuffer());
      await putB2Object(storageKey, bytes, file.type || "application/octet-stream");

      const id = crypto.randomUUID();
      await db.prepare(
        "INSERT INTO private_book_files(id,book_id,storage_key,file_name,mime_type,size_bytes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)"
      ).bind(id,bookId,storageKey,originalName,file.type || "application/octet-stream",bytes.byteLength,new Date().toISOString(),new Date().toISOString()).run();

      uploaded.push({ id, file_path: storageKey, file_name: originalName, file_type: file.type || "application/octet-stream" });
    }

    return NextResponse.json({ files: uploaded, message: "Files uploaded successfully" }, { status: 201 });
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
