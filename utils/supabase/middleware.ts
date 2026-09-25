import { NextResponse, type NextRequest } from "next/server"
import { firebaseAdminAuth } from "@/lib/firebase/admin"

const isPublicPath=(pathname:string)=>pathname===" /" || pathname==="/" || pathname.startsWith("/login") || pathname.startsWith("/reset-password") || pathname.startsWith("/update-password") || pathname.startsWith("/auth") || pathname.startsWith("/bookShelf") || pathname.startsWith("/about") || pathname.startsWith("/contact") || pathname.startsWith("/api/contact-me") || pathname.startsWith("/services") || pathname.startsWith("/book/") || pathname.startsWith("/privacy-policy") || pathname.startsWith("/api/auth/session")

export async function updateSession(request:NextRequest){
 const pathname=request.nextUrl.pathname
 if(isPublicPath(pathname)) return NextResponse.next()
 const token=request.cookies.get("__session")?.value
 if(!token){const next=request.nextUrl.clone();next.pathname="/login";return NextResponse.redirect(next)}
 try{
   const user=await firebaseAdminAuth.verifySessionCookie(token,true)
   let role=(user as any).userrole || (user as any).role
   if(pathname.startsWith("/admin_panel") && role!=="ADMIN") {
     try { const snap=await (await import("@/lib/firebase/admin")).firestore.collection("profiles").doc(user.uid).get(); role=snap.exists?snap.data()?.userrole:role } catch {}
   }
   if(pathname.startsWith("/admin_panel") && role!=="ADMIN"){const next=request.nextUrl.clone();next.pathname="/";return NextResponse.redirect(next)}
   return NextResponse.next()
 }catch{
   const next=request.nextUrl.clone();next.pathname="/login";return NextResponse.redirect(next)
 }
}
