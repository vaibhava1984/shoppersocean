import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { firebaseAdminAuth, firestore } from "@/lib/firebase/admin"

export async function POST(request:Request){
 try{
  const {data:{user}}=await createClient().auth.getUser();
  if(!user)return NextResponse.json({error:"You must be signed in."},{status:401});
  const body=await request.json();
  const fullName=String(body.fullName??"").trim(),country=String(body.country??"").trim(),email=String(body.email??"").trim(),address=String(body.address??"").trim(),mobile=String(body.mobile??"").trim();
  if(!fullName||!country||!email)return NextResponse.json({error:"Name, Country and Email are required."},{status:400});
  let phone="";
  if(mobile){if(country!=="IN")return NextResponse.json({error:"Mobile verification is currently available for Indian mobile numbers only."},{status:400});phone=mobile;if(!phone)return NextResponse.json({error:"Please enter a valid 10-digit Indian mobile number starting with 6–9."},{status:400})}
  const update:any={displayName:fullName,email};
  if(phone)update.phoneNumber=phone;
  await firebaseAdminAuth.updateUser(user.id,update);
  await firestore.collection("profiles").doc(user.id).set({id:user.id,email,full_name:fullName,country,address,mobile,updated_at:new Date().toISOString()},{merge:true});
  return NextResponse.json({success:true,otpRequired:false,user:{id:user.id,email,displayName:fullName},mobile});
 }catch(error:any){console.error("Profile update request failed:",error);return NextResponse.json({error:error?.message||"Unable to update your details right now."},{status:500})}
}
