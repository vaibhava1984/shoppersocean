"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GameQuotaPopup({open,resetKey,isSubscribed=false,isPrivileged}:{open:boolean;resetKey:string;isSubscribed?:boolean;isPrivileged?:boolean}){
 const [visible,setVisible]=useState(false);
 const privileged=Boolean(isPrivileged??isSubscribed);
 useEffect(()=>{
  if(!open){setVisible(false);return;}
  setVisible(true);
  const timer=window.setTimeout(()=>setVisible(false),5000);
  return()=>window.clearTimeout(timer);
 },[open,resetKey]);
 if(!visible)return null;

 if(privileged) return (
  <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-label="Today's game quota exhausted">
   <div className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-sky-200 bg-white shadow-2xl">
    <div className="h-2 bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-700"/>
    <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-7 py-8 text-center text-white">
     <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-200/30 bg-sky-300/15 text-3xl shadow-lg">⏰</div>
     <h3 className="mt-5 text-xl font-black leading-8">Your quota for this section today has been exhausted. Please visit tomorrow to play again.</h3>
     <p className="mt-3 text-sm font-semibold text-sky-100">Your daily allowance will be available again tomorrow.</p>
    </div>
   </div>
  </div>
 );

 return (
  <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-fuchsia-950/60 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-label="Free game quota exhausted">
   <div className="w-full max-w-md overflow-hidden rounded-[2rem] border-2 border-white bg-white shadow-2xl">
    <div className="h-2.5 bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600"/>
    <div className="bg-gradient-to-br from-rose-500 via-fuchsia-600 to-violet-700 px-7 py-8 text-center text-white">
     <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/20 text-3xl shadow-lg">✨</div>
     <h3 className="mt-5 text-xl font-black leading-8">Your free quota for this section has been exhausted. Please subscribe to enjoy further.</h3>
     <Link href="/subscribe-now" className="mt-6 inline-flex rounded-full bg-white px-7 py-3 text-sm font-black text-fuchsia-700 shadow-lg transition hover:scale-105">Subscribe Now →</Link>
    </div>
   </div>
  </div>
 );
}
