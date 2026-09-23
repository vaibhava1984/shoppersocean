const ACTIVE_SUPABASE_URL = "https://etqqiivljtybvynprlvf.supabase.co"
const ACTIVE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cXFpaXZsanR5YnZ5bnBybHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkyNDY3MjcsImV4cCI6MjA0NDgyMjcyN30.CEDedHHh6pLUK06daEwG8XL3wRLA6_pmoKFzRC6sSVo"

export function getSupabaseConfig() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isRestrictedProject = configuredUrl?.includes("pqtilyzqyssrujbsmtxn.supabase.co")
  if (isRestrictedProject || !configuredUrl || !configuredKey) return { url: ACTIVE_SUPABASE_URL, anonKey: ACTIVE_SUPABASE_ANON_KEY }
  return { url: configuredUrl, anonKey: configuredKey }
}
