import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { firebaseAdminAuth, firestore } from '@/lib/firebase/admin';

function escapeHtml(value:string){return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}

async function deleteByUser(collectionName:string,userId:string,field='user_id'){
 const snap=await firestore.collection(collectionName).where(field,'==',userId).get();
 const batch=firestore.batch();snap.docs.forEach((d:any)=>batch.delete(d.ref));if(snap.size)await batch.commit();
}

export async function POST(){
 try{
  const {data:{user}}=await createClient().auth.getUser();
  if(!user)return NextResponse.json({error:'You must be signed in to delete your account.'},{status:401});
  const email=user.email;if(!email)return NextResponse.json({error:'Your account does not have an email address.'},{status:400});
  const profileSnap=await firestore.collection('profiles').doc(user.id).get();
  const profile:any=profileSnap.exists?profileSnap.data():null;
  const name=String(profile?.full_name||'there').trim()||'there';
  await deleteByUser('testimonials',user.id);
  await deleteByUser('authors_interest_submission',user.id);
  await deleteByUser('authors',user.id);
  await deleteByUser('orders',user.id);
  await firestore.collection('profiles').doc(user.id).delete();
  await firebaseAdminAuth.deleteUser(user.id);

  let emailSent=false;
  try{
   const key=process.env.RESEND_API_KEY;
   if(key){
    const result=await new Resend(key).emails.send({from:'no-reply@shoppersocean.com',to:email,subject:'Your Shoppers Ocean account has been deleted',html:`<div style="font-family:Arial,sans-serif;line-height:1.7;color:#1e293b;"><p>Dear ${escapeHtml(name)},</p><p>Sorry to see you go ! ☹️☹️</p><p>Your account has been deleted successfully !</p><p>Regards,<br />Shoppers Ocean</p></div>`});
    emailSent=!result.error;
   }
  }catch(error){console.error('Account deletion email error:',error)}
  const response=NextResponse.json({success:true,emailSent});
  response.cookies.set('__session','',{httpOnly:true,path:'/',maxAge:0});
  return response;
 }catch(error){console.error('Unexpected account deletion error:',error);return NextResponse.json({error:'Unable to delete your account. Please try again.'},{status:500})}
}
