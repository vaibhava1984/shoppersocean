// Compatibility shim: legacy Supabase server imports now use the Cloudflare/D1 client.
export { createClient } from "@/utils/db/server";
