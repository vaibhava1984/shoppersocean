import { NextResponse } from "next/server";
import { requireUser } from "@/utils/auth/requireUser";
import { getD1 } from "@/utils/cloudflare/d1";
import { getB2ObjectUrl } from "@/utils/cloudflare/b2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function resolveBookFile(bookId: string) {
  const db = getD1();
  if (!db) throw new Error("Cloudflare D1 is not available");

  const identity = await requireUser();
  if (!identity) return { error: NextResponse.json({ error: "Authentication required" }, { status: 401 }) };

  const purchase = await db
    .prepare(
      "SELECT o.id FROM orders o LEFT JOIN payments p ON p.order_id = o.id " +
      "WHERE o.user_id = ? AND o.book_id = ? " +
      "AND (o.status = 'completed' OR p.status = 'completed') LIMIT 1"
    )
    .bind(identity.profile.id, bookId)
    .first();

  if (!purchase) return { error: NextResponse.json({ error: "Purchase required" }, { status: 403 }) };

  const file = await db
    .prepare("SELECT storage_key,file_name,mime_type FROM private_book_files WHERE book_id=? ORDER BY created_at DESC LIMIT 20")
    .bind(bookId)
    .all<Record<string, any>>();

  const pdf = file.results.find((row) =>
    String(row.mime_type || "").toLowerCase() === "application/pdf" ||
    String(row.file_name || "").toLowerCase().endsWith(".pdf")
  );

  if (!pdf?.storage_key) {
    return { error: NextResponse.json({ error: "No book file is available" }, { status: 404 }) };
  }

  return { file: pdf };
}

export async function GET(request: Request) {
  try {
    const bookId = new URL(request.url).searchParams.get("bookId") || "";
    if (!bookId) return NextResponse.json({ error: "Book ID is required" }, { status: 400 });

    const resolved = await resolveBookFile(bookId);
    if ("error" in resolved) return resolved.error;

    const signedUrl = await getB2ObjectUrl(String(resolved.file.storage_key));
    const headers = new Headers();
    const range = request.headers.get("range");
    if (range) headers.set("Range", range);

    const upstream = await fetch(signedUrl, { headers });
    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json({ error: "Unable to read book file" }, { status: upstream.status || 502 });
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", upstream.headers.get("Content-Type") || "application/pdf");
    responseHeaders.set("Accept-Ranges", "bytes");
    responseHeaders.set("Cache-Control", "private, no-store");
    responseHeaders.set("Content-Disposition", "inline");

    for (const name of ["Content-Length", "Content-Range", "ETag", "Last-Modified"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (error) {
    console.error("Book reader proxy failed:", error);
    return NextResponse.json({ error: "Unable to open book" }, { status: 500 });
  }
}

export async function HEAD(request: Request) {
  const url = new URL(request.url);
  const bookId = url.searchParams.get("bookId") || "";
  if (!bookId) return new Response(null, { status: 400 });

  try {
    const resolved = await resolveBookFile(bookId);
    if ("error" in resolved) return resolved.error;

    const signedUrl = await getB2ObjectUrl(String(resolved.file.storage_key));
    const upstream = await fetch(signedUrl, { method: "HEAD" });
    if (!upstream.ok) return new Response(null, { status: upstream.status });

    const headers = new Headers({
      "Content-Type": upstream.headers.get("Content-Type") || "application/pdf",
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
    });

    for (const name of ["Content-Length", "ETag", "Last-Modified"]) {
      const value = upstream.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(null, { status: 200, headers });
  } catch {
    return new Response(null, { status: 500 });
  }
}
