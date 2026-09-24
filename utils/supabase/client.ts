// @ts-nocheck
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

export function createClient() {
  const { url, anonKey } = getSupabaseConfig();

  return createBrowserClient(url, anonKey, {
    accessToken: async () => {
      try {
        const response = await fetch("/api/auth/token", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data?.token ?? null;
      } catch {
        return null;
      }
    },
  });
}
