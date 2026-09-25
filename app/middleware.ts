import { type NextRequest } from "next/server"
import { updateSession as updateFirebaseSession } from "@/lib/firebase/middleware"

export async function updateSession(request: NextRequest) {
  return updateFirebaseSession(request)
}
