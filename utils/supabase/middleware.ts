import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const isPublicPath = (pathname: string) =>
  pathname === "/" ||
  pathname.startsWith("/login") ||
  pathname.startsWith("/reset-password") ||
  pathname.startsWith("/update-password") ||
  pathname.startsWith("/auth") ||
  pathname.startsWith("/bookShelf") ||
  pathname.startsWith("/about") ||
  pathname.startsWith("/contact") ||
  pathname.startsWith("/api/contact-me") ||
  pathname.startsWith("/services") ||
  pathname.startsWith("/book/") ||
  pathname.startsWith("/privacy-policy")

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public pages do not need middleware session validation. Skipping the
  // Supabase round-trip here keeps ordinary navigation fast while protected
  // pages and API routes continue through the existing auth checks below.
  if (isPublicPath(pathname)) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/admin_panel") && user?.app_metadata?.userrole !== "ADMIN") {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so: const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so: myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing the cookies!
  // 4. Finally, return myNewResponse

  return supabaseResponse
}
