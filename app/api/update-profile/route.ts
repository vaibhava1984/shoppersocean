import { NextResponse } from "next/server";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { getD1 } from "@/utils/cloudflare/d1";
const normalizeIndianMobile=(value:string)=>{const digits=value.replace(/\D/g,"");if(digits.length===10&&/^[6-9]\d{9}$/.test(digits))return `+91${digits}`;if(digits.length===12&&digits.startsWith("91")&&/^[6-9]\d{9}$/.test(digits.slice(2)))return `+${digits}`;return ""};
export async function POST(request:Request){
 try{
  const user=await currentUser();if(!user)return NextResponse.json({error:"You must be signed in."},{status:401});
  const db=getD1();if(!db)return NextResponse.json({error:"Cloudflare database is unavailable"},{status:503});
  const body=await request.json();const fullName=String(body.fullName??"").trim();const country=String(body.country??"");const email=String(body.email??"").trim();const address=String(body.address??"").trim();const mobile=String(body.mobile??"").trim();
  if(!fullName||!country||!email)return NextResponse.json({error:"Name, Country and Email are required."},{status:400});
  let phone="";if(mobile){if(country!=="IN")return NextResponse.json({error:"Mobile verification is currently available for Indian mobile numbers only."},{status:400});phone=normalizeIndianMobile(mobile);if(!phone)return NextResponse.json({error:"Please enter a valid 10-digit Indian mobile number starting with 6–9."},{status:400});}
  const clerk=await clerkClient();const currentEmail=user.emailAddresses?.[0]?.emailAddress??"";
  if(email!==currentEmail)return NextResponse.json({error:"Email changes must be verified through Clerk before the account email can be changed."},{status:422});
  await clerk.users.updateUser(user.id,{firstName:fullName});
  await clerk.users.updateUserMetadata(user.id,{publicMetadata:{country,address}});
  let verifiedPhone="";
  if(phone){const match=user.phoneNumbers.find(p=>p.phoneNumber===phone);if(match?.verification?.status==="verified")verifiedPhone=phone;}
  const now=new Date().toISOString();
  await db.prepare("INSERT INTO profiles(id,clerk_user_id,email,full_name,country,mobile,address,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET clerk_user_id=excluded.clerk_user_id,email=excluded.email,full_name=excluded.full_name,country=excluded.country,mobile=CASE WHEN excluded.mobile='' THEN profiles.mobile ELSE excluded.mobile END,address=excluded.address,updated_at=excluded.updated_at").bind(user.id,user.id,currentEmail,fullName,country,verifiedPhone,address,now,now).run();
  return NextResponse.json({success:true,otpRequired:Boolean(phone&&!verifiedPhone),mobile:verifiedPhone||""});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to update your details right now."},{status:500});}
}