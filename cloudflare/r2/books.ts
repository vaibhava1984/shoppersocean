import type { CloudflareEnv } from "../auth/types";

/** Stable private key used for a book file after migration to R2. */
export function bookR2Key(bookId: string, fileId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `books/${bookId}/${fileId}-${safeName}`;
}

export async function getPrivateBookObject(env: CloudflareEnv, r2Key: string) {
  return env.BOOKS_BUCKET.get(r2Key);
}

export async function putPrivateBookObject(
  env: CloudflareEnv,
  r2Key: string,
  body: ReadableStream | ArrayBuffer | ArrayBufferView | string,
  contentType?: string,
) {
  return env.BOOKS_BUCKET.put(r2Key, body, {
    httpMetadata: contentType ? { contentType } : undefined,
  });
}

export async function deletePrivateBookObject(env: CloudflareEnv, r2Key: string) {
  await env.BOOKS_BUCKET.delete(r2Key);
}
