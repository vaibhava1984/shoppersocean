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
  const runtime = globalThis as typeof globalThis & { DB?: D1DatabaseLike };
  return runtime.DB ?? null;
}
