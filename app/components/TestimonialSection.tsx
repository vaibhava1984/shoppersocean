"use client"
import React,{useEffect,useState} from 'react';
import { Card,CardContent } from "@/components/ui/card";
import { Star } from 'lucide-react';
import { getAuth,signOut } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";

const TestimonialSection:React.FC<{user:any}>=({user})=>{
 const [testimonials,setTestimonials]=useState<any[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null),[isDeleting,setIsDeleting]=useState(false);
 useEffect(()=>{fetch('/api/book-review?homepage=true').then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error);setTestimonials((d.reviews||[]).filter((x:any)=>!x.book_id))}).catch(()=>setError('Failed to fetch testimonials')).finally(()=>setLoading(false))},[]);
 const handleDeleteAccount=async()=>{if(isDeleting||!window.confirm('Are you sure you want to permanently delete your Shoppers Ocean account? This action cannot be undone.'))return;setIsDeleting(true);try{const response=await fetch('/api/delete-account',{method:'POST'});const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||'Unable to delete your account. Please try again.');try{await signOut(getAuth(getFirebaseApp()))}catch{};try{await fetch('/api/auth/session',{method:'DELETE'})}catch{};window.alert('Your account has been deleted successfully !');window.location.href='/'}catch(err){window.alert(err instanceof Error?err.message:'Unable to delete your account. Please try again.');setIsDeleting(false)}};
 if(loading)return <div>Loading...</div>; if(error)return <div>{error}</div>;
 return <><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{testimonials.map((t,i)=><Card key={i} className="bg-white border-blue-100"><CardContent className="p-6"><div className="flex items-center mb-4">{[...Array(5)].map((_,j)=><Star key={j} className={`h-5 w-5 ${j<t.rating?"text-yellow-400":"text-gray-400"}`} fill="currentColor"/>)}</div><p className="italic mb-4 text-slate-600">"{t.description}"</p><p className="font-semibold text-slate-800">- {t.users}</p></CardContent></Card>)}</div>{user&&<div className="mt-12 flex justify-center"><button type="button" onClick={handleDeleteAccount} disabled={isDeleting} className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white shadow-sm transition-all duration-200 hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">{isDeleting?'Deleting account...':'delete my account'}</button></div>}</>
}