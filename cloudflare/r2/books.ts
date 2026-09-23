import type { CloudflareEnv } from "../auth/types"

export async function getPrivateBookObject(
  env: CloudflareEnv,
  r2Key: string,
): Promise<R2Object | null> {
  return env.BOOKS_BUCKET.get(r2Key)
}

export async function putPrivateBookObject(
  env: CloudflareEnv,
  r2Key: string,
  body: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
  contentType: string,
): Promise<void> {
  await env.BOOKS_BUCKET.put(r2Key, body, {
    httpMetadata: { contentType },
  })
}
