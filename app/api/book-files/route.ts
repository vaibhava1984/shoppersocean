import { NextResponse } from "next/server";
import { createClient } from "@/utils/db/server";
import { deleteBookFile, uploadBookFile } from "@/utils/storage";

async function requireAdmin() {
  const db = createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Not authorized" }, { status: 403 }) };
  if (String(user.role || "").toLowerCase() !== "admin") return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  return { db, user };
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const bookId = new URL(request.url).searchParams.get("bookId");
    if (!bookId) return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    const { data, error } = await auth.db.from("private_book_files").select("*").eq("book_id", bookId);
    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Error listing book files:", error);
    return NextResponse.json({ error: "Failed to load book files" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    const form = await request.formData();
    const bookId = String(form.get("bookId") || "");
    const file = form.get("file");
    if (!bookId || !(file instanceof File)) {
      return NextResponse.json({ error: "Book ID and PDF file are required." }, { status: 400 });
    }

    const name = file.name || "book.pdf";
    const isPdf = file.type === "application/pdf" || name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return NextResponse.json({ error: "Only PDF books can be uploaded." }, { status: 400 });

    const book = await auth.db.from("books").select("id").eq("id", bookId).maybeSingle();
    if (book.error || !book.data) return NextResponse.json({ error: "Book not found." }, { status: 404 });

    const key = `protected-books/${bookId}/${crypto.randomUUID()}.pdf`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    await uploadBookFile(key, bytes, "application/pdf");

    const fileId = crypto.randomUUID();
    const { error } = await auth.db.from("private_book_files").insert({
      id: fileId,
      book_id: bookId,
      storage_key: key,
      file_name: name,
      mime_type: "application/pdf",
      size_bytes: file.size,
    });
    if (error) {
      try { await deleteBookFile(key); } catch {}
      throw error;
    }

    await auth.db.from("books").update({
      book_file_key: key,
      isCompletelyFilled: 1,
      updated_at: new Date().toISOString(),
    }).eq("id", bookId);

    return NextResponse.json({
      data: { id: fileId, book_id: bookId, storage_key: key, file_name: name, mime_type: "application/pdf", size_bytes: file.size }
    });
  } catch (error) {
    console.error("Error uploading book PDF:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to upload PDF" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;
    const body = await request.json();
    const fileId = String(body.fileId || "");
    if (!fileId) return NextResponse.json({ error: "File ID is required." }, { status: 400 });

    const file = await auth.db.from("private_book_files").select("id, book_id, storage_key").eq("id", fileId).maybeSingle();
    if (file.error || !file.data) return NextResponse.json({ error: "Book file not found." }, { status: 404 });

    await deleteBookFile(String(file.data.storage_key));
    const { error } = await auth.db.from("private_book_files").delete().eq("id", fileId);
    if (error) throw error;

    const remaining = await auth.db.from("private_book_files").select("id").eq("book_id", String(file.data.book_id));
    if (!remaining.error && !(remaining.data || []).length) {
      await auth.db.from("books").update({ book_file_key: null, isCompletelyFilled: 0, updated_at: new Date().toISOString() }).eq("id", String(file.data.book_id));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error removing book PDF:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to remove PDF" }, { status: 500 });
  }
}
