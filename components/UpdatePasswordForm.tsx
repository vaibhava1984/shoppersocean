"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function UpdatePasswordForm() {
  const { user } = useUser();
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [error,setError]=useState<string|null>(null);
  const [done,setDone]=useState(false);
  const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){
    e.preventDefault(); setError(null);
    if(password.length<6){setError("Password must be at least 6 characters long");return;}
    if(password!==confirm){setError("Passwords do not match");return;}
    setBusy(true);
    try{
      const r=await fetch("/api/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(d.error||"Unable to update password");
      setDone(true); setPassword(""); setConfirm("");
      setTimeout(()=>{window.location.href="/";},2000);
    }catch(e){setError(e instanceof Error?e.message:"Unable to update password");}
    finally{setBusy(false);}
  }
  if(!user) return null;
  return <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Update Password</h2>
      <form onSubmit={submit} className="space-y-4">
        {error&&<div className="bg-red-400 text-white p-2 rounded">{error}</div>}
        {done&&<div className="bg-green-500 text-white p-2 rounded">Your password has been updated successfully.</div>}
        <input className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New Password" minLength={6} required />
        <input className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-900" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm New Password" minLength={6} required />
        <Button type="submit" disabled={busy} className="w-full bg-blue-600 text-white hover:bg-blue-700">{busy?"Updating...":"Update Password"}</Button>
      </form>
    </div>
  </div>;
}