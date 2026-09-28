import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";

const CHUNK_SIZE = 512 * 1024;

async function ensureChunkTable(db: any) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS private_book_file_chunks (
    file_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    data BLOB NOT NULL,
    PRIMARY KEY (file_id, chunk_index)
  `).run();
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse("Not authorized", { status: 403 });
    const db = getD1();
    if (!db) throw new Error("Cloudflare D1 is not available");
    await ensureChunkTable(db);

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    if (!bookId) return new NextResponse("Book ID is required", { status: 400 });

    const purchase = await db.prepare(
      "SELECT id FROM orders WHERE user_id=? AND product_id=? AND status='completed' LIMIT 1"
    ).bind(user.id, bookId).first();
    if (!purchase) return new NextResponse("Purchase required", { status: 403 });

    const file = await db.prepare(
      "SELECT id,file_name,file_type FROM private_book_files WHERE book_id=? ORDER BY created_at DESC LIMIT 20"
    ).bind(bookId).all<Record<string, any>>();
    const pdf = file.results.find((item) => {
      const type = String(item.file_type || "").toLowerCase();
      const name = String(item.file_name || "").toLowerCase();
      return type === "pdf" || name.endsWith(".pdf");
    });
    if (!pdf) return new NextResponse("No PDF book is available", { status: 404 });

    const chunks = await db.prepare(
      "SELECT chunk_index,data FROM private_book_file_chunks WHERE file_id=? ORDER BY chunk_index ASC"
    ).bind(pdf.id).all<Record<string, any>>();
    if (!chunks.results.length) return new NextResponse("Book file not found", { status: 404 });

    const totalSize = chunks.results.reduce((sum, row) => {
      const data = row.data as ArrayBuffer | Uint8Array;
      return sum + (data?.byteLength ?? 0);
    }, 0);

    const rangeHeader = request.headers.get("range");
    let start = 0;
    let end = totalSize - 1;
    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        start = Number(match[1]);
        end = match[2] ? Math.min(Number(match[2]), totalSize - 1) : totalSize - 1;
      }
    }
    if (start < 0 || start >= totalSize || end < start) return new NextResponse("Invalid range", { status: 416 });

    const firstChunk = Math.floor(start / CHUNK_SIZE);
    const lastChunk = Math.floor(end / CHUNK_SIZE);
    const output = new Uint8Array(end - start + 1);
    let written = 0;

    for (let i = firstChunk; i <= lastChunk; i++) {
      const row = chunks.results.find((item) => Number(item.chunk_index) === i);
      if (!row?.data) return new NextResponse("Book file is incomplete", { status: 500 });
      const bytes = row.data instanceof Uint8Array ? row.data : new Uint8Array(row.data);
      const chunkStart = i * CHUNK_SIZE;
      const from = Math.max(start - chunkStart, 0);
      const to = Math.min(end - chunkStart + 1, bytes.byteLength);
      output.set(bytes.slice(from, to), written);
      written += Math.max(0, to - from);
    }

    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Cache-Control": "private, no-store",
      "Accept-Ranges": "bytes",
      "Content-Length": String(output.byteLength),
    });
    if (rangeHeader) {
      headers.set("Content-Range", `bytes ${start}-${end}/${totalSize}`);
      return new NextResponse(output, { status: 206, headers });
    }
    return new NextResponse(output, { status: 200, headers });
  } catch (error) {
    console.error("Error serving purchased book:", error);
    return new NextResponse("Failed to load book", { status: 500 });
  }
}
