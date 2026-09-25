export function getFirebaseConfig() {
  const raw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG || process.env.FIREBASE_WEBAPP_CONFIG
  if (!raw) return null
  try { return typeof raw === "string" ? JSON.parse(raw) : raw } catch { return null }
}

// Legacy compatibility export. Shoppers Ocean no longer connects to Supabase.
export function getSupabaseConfig() {
  return getFirebaseConfig()
}
