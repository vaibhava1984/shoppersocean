import type { CloudflareEnv } from "../auth/types";

export type BookRow = {
  id:string; title:string; description:string|null; price:number|null; cover_images:string|null;
  author_id:string|null; author_name:string|null; published_date:string|null; is_completely_filled:number|null;
  binding:string|null; language:string|null; publisher:string|null; pages:number|null; is_deleted:number|null;
  genre:string|null; ratings:number|null; published_by:string|null; isbn:string|null; created_at:string|null;
  updated_at:string|null; available_formats:string|null;
};

export async function getBook(env:CloudflareEnv, id:string) {
  return env.DB.prepare("SELECT * FROM books WHERE id = ?1 LIMIT 1").bind(id).first<BookRow>();
}
export async function listBooks(env:CloudflareEnv, limit=100) {
  return env.DB.prepare("SELECT * FROM books WHERE COALESCE(is_deleted,0)=0 ORDER BY created_at DESC LIMIT ?1").bind(limit).all<BookRow>();
}
export async function searchBooks(env:CloudflareEnv, q:string, limit=12) {
  const like = `%${q}%`;
  return env.DB.prepare(
    "SELECT id,title,author_name FROM books WHERE COALESCE(is_deleted,0)=0 AND (title LIKE ?1 COLLATE NOCASE OR author_name LIKE ?1 COLLATE NOCASE) ORDER BY title LIMIT ?2"
  ).bind(like,limit).all<{id:string;title:string;author_name:string|null}>();
}
export async function getBooksByIds(env:CloudflareEnv, ids:string[]) {
  if (!ids.length) return [];
  const placeholders=ids.map((_,i)=>`?${i+1}`).join(",");
  return env.DB.prepare(`SELECT * FROM books WHERE id IN (${placeholders})`).bind(...ids).all<BookRow>();
}
