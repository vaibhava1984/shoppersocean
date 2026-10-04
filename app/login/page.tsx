"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { SubmitButton } from "./submit-button";
import { COUNTRIES } from "@/utils/countries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function Login({ searchParams }: { searchParams?: { type?: string } }) {
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(searchParams?.type === "signup" ? false : true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) { setError("Email and password are required"); return; }
    if (!isSignIn && !username.trim()) { setError("Name is required"); return; }
    if (!isSignIn && !country) { setError("Country is required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setIsSubmitting(true);
    try {
      const endpoint = isSignIn ? "/api/auth/login" : "/api/auth/signup";
      const body = isSignIn ? { email: email.trim(), password } : { email: email.trim(), password, full_name: username.trim(), country, mobile, address };
      const res = await fetch(endpoint, { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"same-origin", cache:"no-store", body:JSON.stringify(body) });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) {
        setError(data?.resetRequired || data?.code === "password_reset_required"
          ? "This account needs a password reset before you can sign in. Please use \"Forgot your password?\" below."
          : data?.error || (isSignIn ? "Invalid credentials" : "Unable to create your account."));
        return;
      }
      router.replace("/");
      router.refresh();
    } catch { setError("Unable to reach the sign-in service."); }
    finally { setIsSubmitting(false); }
  };

  return <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center p-4 pt-28">
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-md"><div className="container mx-auto px-2 sm:px-4 py-2"><div className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
      {[["/","Home"],["/bookShelf","Bookshelf"],["/about","About"],["/contact","Have a question"]].map(([href,label])=><Link key={href} href={href} className="flex-1 min-w-0 text-center px-2 py-2 rounded-md text-xs sm:text-sm font-medium text-white hover:bg-white/15 transition-colors whitespace-nowrap">{label}</Link>)}
    </div></div></nav>
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"/>
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">{isSignIn ? "Sign In" : "Create Account"}</h2>
      {error && <div className="bg-red-400 text-white p-2 rounded mb-4">{error}</div>}
      <div className="space-y-4">
        {!isSignIn && <><div><label className="text-sm font-medium text-gray-700">Name *</label><input value={username} onChange={e=>setUsername(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900" placeholder="Your full name"/></div>
        <div><label className="text-sm font-medium text-gray-700">Country *</label><Select value={country} onValueChange={setCountry}><SelectTrigger className="w-full text-black mt-1"><SelectValue placeholder="Select your country"/></SelectTrigger><SelectContent>{COUNTRIES.map(c=><SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent></Select></div></>}
        <div><label className="text-sm font-medium text-gray-700">Email *</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900" placeholder="you@example.com"/></div>
        <div><label className="text-sm font-medium text-gray-700">Choose any password (minimum six letters/digits) *</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900" placeholder="Minimum 6 characters"/></div>
        {!isSignIn && <><div><label className="text-sm font-medium text-gray-700">Mobile</label><input type="tel" value={mobile} onChange={e=>setMobile(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900" placeholder="+91XXXXXXXXXX"/></div>
        <div><label className="text-sm font-medium text-gray-700">Complete Address</label><textarea value={address} onChange={e=>setAddress(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900 min-h-24" placeholder="Complete address (optional)"/></div></>}
        <SubmitButton onClick={submit} disabled={isSubmitting} className="w-full bg-blue-600 text-white rounded-md px-4 py-3 font-medium" pendingText={isSignIn?"Signing In...":"Creating Account..."}>{isSubmitting&&<Loader2Icon className="mr-2 animate-spin"/>}<span>{isSubmitting?"Processing...":isSignIn?"Sign In":"Create Account"}</span></SubmitButton>
      </div>
      <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"/></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div></div>
      <button type="button" onClick={()=>{setIsSignIn(!isSignIn);setError("")}} className="w-full text-blue-600 text-sm font-medium text-center">{isSignIn?"Need an account? Sign up":"Already have an account? Sign in"}</button>
      <div className="text-sm text-center mt-3"><Link href="/forgot-password" className="text-blue-600 font-medium">Forgot your password?</Link></div>
    </div>
  </div>;
}
