import { NextResponse } from 'next/server';
import { storage } from '@/lib/firebase/admin';
import { createClient } from '@/utils/supabase/server';

export async function GET(request:Request){
 try{
  const {data:{user}}=await createClient().auth.getUser();
  if(!user)return new NextResponse('Not authorized',{status:403});
  const bookId=new URL(request.url).searchParams.get('bookId');
  if(!bookId)return new NextResponse('Book ID is required',{status:400});
  const {data:purchase}=await createClient().from('orders').select().eq('user_id',user.id).eq('product_id',bookId).eq('status','completed').order('order_date',{ascending:false}).limit(1).maybeSingle();
  if(!purchase)return new NextResponse('Purchase required',{status:403});
  const {data:files,error}=await createClient().from('private_book_files').select('file_path,file_name,file_type').eq('book_id',bookId);
  if(error)throw error;
  const pdf=(files||[]).find((file:any)=>String(file.file_type||'').toLowerCase()==='pdf'||String(file.file_name||'').toLowerCase().endsWith('.pdf'));
  if(!pdf)return new NextResponse('No PDF book is available',{status:404});
  const [signedUrl]=await storage.bucket().file(pdf.file_path).getSignedUrl({version:'v4',action:'read',expires:Date.now()+5*60*1000});
  const range=request.headers.get('range');
  const upstream=await fetch(signedUrl,{headers:range?{Range:range}:undefined,cache:'no-store'});
  if(!upstream.ok&&upstream.status!==206)return new NextResponse('Unable to load book',{status:upstream.status});
  const headers=new Headers({'Content-Type':'application/pdf','Cache-Control':'private, no-store','Accept-Ranges':upstream.headers.get('accept-ranges')||'bytes'});
  for(const key of ['content-length','content-range']){const value=upstream.headers.get(key);if(value)headers.set(key,value)}
  return new NextResponse(upstream.body,{status:upstream.status,headers});
 }catch(error){console.error('Error proxying purchased book PDF:',error);return new NextResponse('Failed to load book',{status:500})}
}
