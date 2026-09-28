import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth/session";
import { getD1 } from "@/utils/cloudflare/d1";

const normalizeIndianMobile=(value:string)=>{const digits=value.replace(/\D/g,"");if(digits.length===10&&/^[6-9]\d{9}$/.test(digits))return `+91${digits}`;if(digits.length===12&&digits.startsWith("91")&&/^[6-9]\d{9}$/.test(digits.slice(2)))return `+${digits}`;return "";};

export async function POST(request:Request){
 try{
  const user=await getCurrentUser(); if(!user)return NextResponse.json({error:"You must be signed in."},{status:401});
  const db=getD1(); if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const body=await request.json();
  const fullName=String(body.fullName??"").trim(),country=String(body.country??""),email=String(body.email??"").trim().toLowerCase(),address=String(body.address??"").trim(),mobile=String(body.mobile??"").trim();
  if(!fullName||!country||!email)return NextResponse.json({error:"Name, Country and Email are required."},{status:400});
  let phone="";
  if(mobile){if(country!=="IN")return NextResponse.json({error:"Mobile numbers are currently supported for Indian mobile numbers only."},{status:400});phone=normalizeIndianMobile(mobile);if(!phone)return NextResponse.json({error:"Please enter a valid 10-digit Indian mobile number starting with 6–9."},{status:400});}
  await db.prepare("UPDATE profiles SET email=?,full_name=?,country=?,mobile=?,address=?,updated_at=? WHERE id=?").bind(email,fullName,country,phone,address,new Date().toISOString(),user.id).run();
  return NextResponse.json({success:true,mobile:phone});
 }catch(error){console.error("Profile update error:",error);return NextResponse.json({error:"Unable to update your details right now."},{status:500});}
}
