import { getCloudflareContext } from "@opennextjs/cloudflare";

export type R2ObjectLike = {
  body: ReadableStream;
  size?: number;
  httpMetadata?: { contentType?: string; contentDisposition?: string; [key: string]: unknown };
  httpEtag?: string;
  etag?: string;
  range?: { offset: number; length: number };
};

type R2BucketLike = {
  get(key: string, options?: { range?: { offset: number; length?: number } }): Promise<R2ObjectLike | null>;
};

export function getBooksBucket(): R2BucketLike | null {
  try {
    const { env } = getCloudflareContext();
    return (env as any).BOOKS_BUCKET ?? null;
  } catch {
    return null;
  }
}
