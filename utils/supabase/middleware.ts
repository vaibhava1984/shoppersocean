import { NextResponse, type NextRequest } from "next/server"
import { getFirebaseUser } from "@/lib/firebase/session"

const isPublicPath=(pathname:string)=>pathname===" /" || pathname==="/" || pathname.startsWith("/login") || pathname.startsWith("/reset-password") || pathname.startsWith("/update-password") || pathname.startsWith("/auth") || pathname.startsWith("/bookShelf") || pathname.startsWith("/about") || pathname.startsWith("/contact") || pathname.startsWith("/api/contact-me") || pathname.startsWith("/services") || pathname.startsWith("/book/") || pathname.startsWith("/privacy-policy") || pathname.startsWith("/api/auth/session")

export async function updateSession(request:NextRequest){
 const pathname=request.nextUrl.pathname
 if(isPublicPath(pathname))return NextResponse.next()
 const user=await getFirebaseUser()
 if(!user){const next=request.nextUrl.clone();next.pathname="/login";return NextResponse.redirect(next)}
 const role=(user as any).userrole || (user as any).role
 if(pathname.startsWith("/admin_panel") && role!=="ADMIN"){const next=request.nextUrl.clone();next.pathname="/";return NextResponse.redirect(next)}
 return NextResponse.next()
}
