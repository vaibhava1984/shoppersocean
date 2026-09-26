// Compatibility shim: legacy Supabase admin imports now use the Cloudflare/D1 client.
export { createAdminClient, createClient } from "@/utils/db/server";
