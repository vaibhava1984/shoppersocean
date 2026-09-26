// Compatibility shim: legacy Supabase server imports now use the Cloudflare/D1 client.
// Keep getUser exported because several legacy server components still import it.
export { createClient, getUser } from "@/utils/db/server";
