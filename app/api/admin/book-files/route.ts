import { NextResponse } from "next/server";
import { requireAdmin } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";

const CHUNK_SIZE = 512 * 1024;

async function ensureChunkTable(db: any) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS private_book_file_chunks (
    file_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    data BLOB NOT NULL,
    PRIMARY KEY (file_id, chunk_index),
    FOREIGN KEY(file_id) REFERENCES private_book_files(id) ON DELETE CASCADE
  )`).run();
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const bookId = new URL(req.url).searchParams.get("bookId");
  if (!bookId) return NextResponse.json({ files: [] });
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
  await ensureChunkTable(db);
  const { results = [] } = await db.prepare(
    "SELECT id,file_path,file_name,file_type,created_at FROM private_book_files WHERE book_id=? ORDER BY created_at DESC"
  ).bind(bookId).all<any>();
  return NextResponse.json({ files: results });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
  await ensureChunkTable(db);

  const form = await req.formData();
  const bookId = String(form.get("bookId") || "");
  const files = form.getAll("file").filter((v): v is File => v instanceof File);
  if (!bookId || !files.length) return NextResponse.json({ error: "Book and file are required" }, { status: 400 });

  const created: any[] = [];
  for (const file of files) {
    const id = crypto.randomUUID();
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    await db.prepare(
      "INSERT INTO private_book_files (id,book_id,file_path,file_name,file_type,created_at,updated_at) VALUES (?,?,?,?,?,datetime('now'),datetime('now'))"
    ).bind(id, bookId, id, file.name, (file.name.split(".").pop() || "").toLowerCase()).run();

    for (let offset = 0, chunkIndex = 0; offset < bytes.byteLength; offset += CHUNK_SIZE, chunkIndex++) {
      const chunk = bytes.slice(offset, Math.min(offset + CHUNK_SIZE, bytes.byteLength));
      await db.prepare(
        "INSERT INTO private_book_file_chunks (file_id,chunk_index,data) VALUES (?,?,?)"
      ).bind(id, chunkIndex, chunk).run();
    }

    created.push({
      id,
      file_path: id,
      file_name: file.name,
      file_type: (file.name.split(".").pop() || "").toLowerCase()
    });
  }

  await db.prepare("UPDATE books SET isCompletelyFilled=1,updated_at=datetime('now') WHERE id=?").bind(bookId).run();
  return NextResponse.json({ files: created });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const db = getD1();
  if (!db) return NextResponse.json({ error: "Cloudflare database is unavailable" }, { status: 503 });
  await ensureChunkTable(db);

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "File ID is required" }, { status: 400 });
  await db.prepare("DELETE FROM private_book_file_chunks WHERE file_id=?").bind(String(id)).run();
  await db.prepare("DELETE FROM private_book_files WHERE id=?").bind(String(id)).run();
  return NextResponse.json({ success: true });
}
