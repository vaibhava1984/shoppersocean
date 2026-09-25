import { NextResponse } from 'next/server'
import { firestore } from '@/lib/firebase/admin'
export async function GET() {
  try {
    const layoutSnap=await firestore.collection('layout_settings').get()
    const layoutData=layoutSnap.docs.map(d=>d.data() as any).filter(x=>x.page_section==='HOMEPAGE_TRENDING'||x.page_section==='HOMEPAGE_COLLECTION').sort((a,b)=>String(a.created_at??'').localeCompare(String(b.created_at??'')))
    const ids=[...new Set(layoutData.map(x=>String(x.value??'').trim()).filter(Boolean))]
    if(!ids.length)return NextResponse.json({books:[]})
    const bookDocs=await Promise.all(ids.map(id=>firestore.collection('books').doc(id).get()))
    const byId=new Map(bookDocs.filter(d=>d.exists&&d.data()?.is_deleted!==true).map(d=>{const b:any=d.data();return [d.id,{id:d.id,title:b.title??'',description:b.description??'',coverImage:Array.isArray(b.cover_images)?b.cover_images[0]:b.cover_image,images:Array.isArray(b.cover_images)?b.cover_images:undefined,author:b.author_name??b.author??'',price:Number(b.price??0)}]}))
    const books=layoutData.map(x=>{const b=byId.get(String(x.value??'').trim());return b?{...b,pageSection:x.page_section}:null}).filter(Boolean)
    return NextResponse.json({books},{headers:{'Cache-Control':'public, max-age=30, s-maxage=30'}})
  } catch(e) { console.error(e); return NextResponse.json({error:'Unable to fetch homepage books.'},{status:500}) }
}