import { type NextRequest, NextResponse } from "next/server"

export async function GET(request:NextRequest){
 const {searchParams}=new URL(request.url)
 const next=searchParams.get("next")||"/"
 if(searchParams.get("oobCode")||searchParams.get("token_hash"))return NextResponse.redirect(new URL(next,request.url))
 return NextResponse.redirect(new URL("/error",request.url))
}
