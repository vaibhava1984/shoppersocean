import { NextResponse } from 'next/server';
import { firebaseAdminAuth, storage } from '@/lib/firebase/admin';
import { createClient } from '@/utils/supabase/server';

export const dynamic='force-dynamic';
export const revalidate=0;

export async function POST(req:Request){
 try{
  const body=await req.json();
  const {productId,productIds}=body;
  const bearer=req.headers.get('authorization')?.startsWith('Bearer ')?req.headers.get('authorization')!.slice(7).trim():'';
  let userId:string|undefined;
  if(bearer){try{userId=(await firebaseAdminAuth.verifyIdToken(bearer)).uid}catch{}}
  if(!userId){const {data}=await createClient().auth.getUser();userId=data.user?.id}
  if(!userId)return NextResponse.json({error:'Authentication required'},{status:401,headers:{'Cache-Control':'no-store'}});

  if(productId){
   const {data,error}=await createClient().from('orders').select('id, order_date, status').eq('user_id',userId).eq('product_id',productId).eq('status','completed');
   if(error)throw error;
   return NextResponse.json({hasPurchased:Boolean(data?.length),orderDetails:(data||[]).map((o:any)=>({order_id:o.id,purchase_date:o.order_date,status:o.status}))},{headers:{'Cache-Control':'no-store'}});
  }
  if(Array.isArray(productIds)){
   const {data,error}=await createClient().from('orders').select('id, product_id, order_date, status').eq('user_id',userId).in('product_id',productIds).eq('status','completed');
   if(error)throw error;
   const result:any={}; productIds.forEach((id:string)=>result[id]={hasPurchased:false,orderDetails:[]});
   (data||[]).forEach((o:any)=>{if(result[o.product_id]){result[o.product_id].hasPurchased=true;result[o.product_id].orderDetails.push({order_id:o.id,purchase_date:o.order_date,status:o.status})}});
   return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
  }
  return NextResponse.json({error:'Product ID or Product IDs are required'},{status:400});
 }catch(error){console.error('Error checking purchase:',error);return NextResponse.json({error:'Error checking purchase'},{status:500})}
}
