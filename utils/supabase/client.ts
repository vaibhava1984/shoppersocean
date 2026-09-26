// Compatibility shim for legacy imports during the Cloudflare/D1 migration.
// The implementation is no longer Supabase; it is the D1-backed client.
export { createClient } from "@/utils/db/client";
