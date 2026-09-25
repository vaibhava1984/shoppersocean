import { type NextRequest } from "next/server"
import { updateSession as updateFirebaseSession } from "@/utils/supabase/middleware"

export async function updateSession(request: NextRequest) {
  return updateFirebaseSession(request)
}
