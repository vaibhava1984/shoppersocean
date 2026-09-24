import { getCloudflareContext } from "@opennextjs/cloudflare";

type D1DatabaseLike = {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T = Record<string, unknown>>(): Promise<T | null>;
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
      run(): Promise<unknown>;
    };
  };
};

export function getD1(): D1DatabaseLike | null {
  try {
    const { env } = getCloudflareContext();
    return (env as any).DB ?? null;
  } catch {
    return null;
  }
}
