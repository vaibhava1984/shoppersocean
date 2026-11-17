import { getD1 } from "@/utils/cloudflare/d1";

export const dynamic = "force-dynamic";

function parseImages(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string; imageIndex: string }> }
) {
  try {
    const { bookId, imageIndex } = await params;
    const index = Number(imageIndex);
    if (!Number.isInteger(index) || index < 0 || index > 4) {
      return new Response("Not found", { status: 404 });
    }

    const db = getD1();
    if (!db) return new Response("Image unavailable", { status: 503 });

    const book = await db.prepare(
      "SELECT cover_images FROM books WHERE id = ? AND COALESCE(is_deleted, 0) = 0 LIMIT 1"
    ).bind(bookId).first<{ cover_images: unknown }>();
    if (!book) return new Response("Not found", { status: 404 });

    const image = parseImages(book.cover_images)[index] || "";
    const match = image.match(/^data:(image\/(?:png|jpeg|jpg|webp|gif|avif));base64,([a-z0-9+/=\s]+)$/i);
    if (!match) return new Response("Not found", { status: 404 });

    const contentType = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
    const binary = atob(match[2].replace(/\s/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Public book cover response failed:", error);
    return new Response("Image unavailable", { status: 500 });
  }
}
