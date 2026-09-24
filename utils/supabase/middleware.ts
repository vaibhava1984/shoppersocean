import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseConfig } from "./config"
import { getSupabaseConfig } from "./config"

const isPublicPath = (pathname: string) => pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/reset-password") || pathname.startsWith("/update-password") || pathname.startsWith("/auth") || pathname.startsWith("/bookShelf") || pathname.startsWith("/about") || pathname.startsWith("/contact") || pathname.startsWith("/api/contact-me") || pathname.startsWith("/services") || pathname.startsWith("/book/") || pathname.startsWith("/privacy-policy")

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (isPublicPath(pathname)) return NextResponse.next({ request })
  let supabaseResponse = NextResponse.next({ request })
  const { url, anonKey } = getSupabaseConfig()
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { const next = request.nextUrl.clone(); next.pathname = "/login"; return NextResponse.redirect(next) }
  if (pathname.startsWith("/admin_panel") && user.app_metadata?.userrole !== "ADMIN") { const next = request.nextUrl.clone(); next.pathname = "/"; return NextResponse.redirect(next) }
  return supabaseResponse
}
