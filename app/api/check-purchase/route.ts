import { NextResponse } from 'next/server';
import { firebaseAdminAuth, firestore } from '@/lib/firebase/admin';

export const dynamic='force-dynamic';
export const revalidate=0;

export async function POST(req:Request){
 try{
  const body=await req.json();
  const {productId,productIds}=body;
  const bearer=req.headers.get('authorization')?.startsWith('Bearer ')?req.headers.get('authorization')!.slice(7).trim():'';
  let userId:string|undefined;
  if(bearer){try{userId=(await firebaseAdminAuth.verifyIdToken(bearer)).uid}catch{}}
  if(!userId){
   const { getFirebaseUser } = await import('@/lib/firebase/session-user');
   userId=(await getFirebaseUser())?.uid;
  }
  if(!userId)return NextResponse.json({error:'Authentication required'},{status:401,headers:{'Cache-Control':'no-store'}});

  const ids=Array.isArray(productIds)?productIds:(productId?[productId]:[]);
  if(!ids.length)return NextResponse.json({error:'Product ID or Product IDs are required'},{status:400});

  const snap=await firestore.collection('orders').where('user_id','==',userId).where('status','==','completed').get();
  const rows=snap.docs.map((d:any)=>({id:d.id,...d.data()})).filter((o:any)=>ids.includes(o.product_id));
  const result:any={};
  ids.forEach((id:string)=>result[id]={hasPurchased:false,orderDetails:[]});
  rows.forEach((o:any)=>{
   const item=result[o.product_id];
   if(item){item.hasPurchased=true;item.orderDetails.push({order_id:o.id,purchase_date:o.order_date,status:o.status})}
  });
  if(productId)return NextResponse.json(result[productId],{headers:{'Cache-Control':'no-store'}});
  return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(error){console.error('Error checking purchase:',error);return NextResponse.json({error:'Error checking purchase'},{status:500})}
}
