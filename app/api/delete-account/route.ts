import { Resend } from "resend";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getLegacyProfileForClerkUser } from "@/utils/auth/clerkProfile";
import { getD1 } from "@/utils/cloudflare/d1";
function escapeHtml(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
export async function POST(){
 try{
  const identity=await getLegacyProfileForClerkUser();if(!identity)return NextResponse.json({error:"You must be signed in to delete your account."},{status:401});
  const {clerkUser,profile}=identity;const email=clerkUser.emailAddresses?.[0]?.emailAddress;if(!email)return NextResponse.json({error:"Your account does not have an email address."},{status:400});
  const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const uid=profile.id;
  const orders=await db.prepare("SELECT id FROM orders WHERE user_id=?").bind(uid).all<any>();
  const orderIds=orders.results.map(o=>o.id);
  for(const id of orderIds)await db.prepare("DELETE FROM payments WHERE order_id=?").bind(id).run();
  await db.prepare("DELETE FROM testimonials WHERE user_id=?").bind(uid).run();
  await db.prepare("DELETE FROM authors_interest_submission WHERE user_id=?").bind(uid).run();
  await db.prepare("DELETE FROM authors WHERE user_id=?").bind(uid).run();
  await db.prepare("DELETE FROM orders WHERE user_id=?").bind(uid).run();
  await db.prepare("DELETE FROM profiles WHERE id=?").bind(uid).run();
  try{const client=await clerkClient();await client.users.deleteUser(clerkUser.id);}catch(e){console.error(e);return NextResponse.json({error:"Your application data was removed, but the login account could not be deleted. Please try again."},{status:500})}
  let emailSent=false;try{const key=process.env.RESEND_API_KEY;if(key){const resend=new Resend(key);const name=escapeHtml(String(clerkUser.firstName||clerkUser.username||"there"));const {error}=await resend.emails.send({from:"no-reply@shoppersocean.com",to:email,subject:"Your Shoppers Ocean account has been deleted",html:`<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;"><p>Dear ${name},</p><p>Sorry to see you go ! ☹️☹️</p><p>Your account has been deleted successfully !</p><p>Regards,<br />Shoppers Ocean</p></div>`});emailSent=!error}}catch(e){console.error(e)}
  return NextResponse.json({success:true,emailSent});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to delete your account. Please try again."},{status:500})}
}