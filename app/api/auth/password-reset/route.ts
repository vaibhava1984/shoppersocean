import { NextResponse } from "next/server";
import { firebaseAdminAuth } from "@/lib/firebase/admin";
import { Resend } from "resend";

export async function POST(request:Request){
 try{
  const {email}=await request.json();const address=String(email||"").trim();
  if(!address)return NextResponse.json({error:"Email is required."},{status:400});
  const origin=request.headers.get("origin")||"https://www.shoppersocean.com";
  const link=await firebaseAdminAuth.generatePasswordResetLink(address,{url:`${origin}/update-password`,handleCodeInApp:true});
  const key=process.env.RESEND_API_KEY;if(!key)throw new Error("RESEND_API_KEY is not configured");
  await new Resend(key).emails.send({from:"no-reply@shoppersocean.com",to:address,subject:"Reset your Shoppers Ocean password",html:`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1e293b;"><p>Hello,</p><p>Use the button below to reset your Shoppers Ocean password.</p><p><a href="${link}" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Reset Password</a></p><p>If you did not request this, you can ignore this email.</p><p>Regards,<br/>Shoppers Ocean</p></div>`});
  return NextResponse.json({success:true});
 }catch(error:any){console.error("Password reset request failed:",error);return NextResponse.json({error:error?.message||"Unable to send password reset email."},{status:500})}
}
