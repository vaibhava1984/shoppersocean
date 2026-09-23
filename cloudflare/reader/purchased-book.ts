import type { CloudflareEnv } from "../auth/types";
import { getAuthContext } from "../auth/clerk";
import { getUserByClerkId } from "../db/users";
import { hasPurchasedBook } from "../db/purchases";
import { getPrivateBookObject } from "../r2/books";

export type ReaderResult =
  | { ok: true; response: Response }
  | { ok: false; response: Response };

export async function servePurchasedBook(
  request: Request,
  env: CloudflareEnv,
  verifyToken: Parameters<typeof getAuthContext>[2],
): Promise<ReaderResult> {
  let auth;
  try {
    auth = await getAuthContext(request, env, verifyToken);
  } catch {
    return { ok: false, response: new Response("Not authorized", { status: 403 }) };
  }

  const user = await getUserByClerkId(env, auth.user.clerkUserId);
  if (!user) return { ok: false, response: new Response("User profile required", { status: 403 }) };

  const url = new URL(request.url);
  const bookId = url.searchParams.get("bookId");
  if (!bookId) return { ok: false, response: new Response("Book ID is required", { status: 400 }) };

  const purchased = await hasPurchasedBook(env, user.id, bookId);
  if (!purchased) return { ok: false, response: new Response("Purchase required", { status: 403 }) };

  const file = await env.DB.prepare(
    `SELECT id, file_name, file_type, r2_key
     FROM private_book_files
     WHERE book_id = ?1 AND r2_key IS NOT NULL
     ORDER BY CASE WHEN lower(file_type) = 'pdf' THEN 0 ELSE 1 END, file_name
     LIMIT 1`,
  ).bind(bookId).first<{ id:string; file_name:string; file_type:string|null; r2_key:string }>();

  if (!file) return { ok: false, response: new Response("Book file is not migrated to R2", { status: 404 }) };

  const object = await getPrivateBookObject(env, file.r2_key);
  if (!object?.body) return { ok: false, response: new Response("Book file unavailable", { status: 404 }) };

  const headers = new Headers();
  headers.set("Cache-Control", "private, no-store");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Disposition", "inline");
  headers.set("Content-Type", object.httpMetadata?.contentType || "application/pdf");
  if (object.size != null) headers.set("Content-Length", String(object.size));

  return { ok: true, response: new Response(object.body, { status: 200, headers }) };
}
