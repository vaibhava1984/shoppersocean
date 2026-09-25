import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get("session")?.value)
  if (!hasSession && !request.nextUrl.pathname.startsWith("/login") && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }
  return NextResponse.next({ request })
}
