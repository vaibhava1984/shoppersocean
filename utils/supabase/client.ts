"use client";

export function createClient() {
  return {
    auth: {
      async getUser() {
        try {
          const response = await fetch("/api/auth/session", { cache: "no-store" });
          if (!response.ok) return { data: { user: null }, error: null };
          const data = await response.json();
          return { data: { user: data.user ?? null }, error: null };
        } catch {
          return { data: { user: null }, error: null };
        }
      }
    }
  };
}
