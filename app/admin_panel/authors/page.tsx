'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import AdminSidebar from "../adminSidebar";

type Author={author_id:string;user_id:string;name:string;bio:string;email:string;created_at:string;updated_at:string};

export default function AuthorsManagement(){
  const {toast}=useToast();
  const [authors,setAuthors]=useState<Author[]>([]);
  const [users,setUsers]=useState<{id:string;name:string;email:string}[]>([]);
  const [name,setName]=useState(""); const [userId,setUserId]=useState(""); const [bio,setBio]=useState("");
  const [editing,setEditing]=useState<Author|null>(null);

  async function load(){
    const r=await fetch("/api/admin/authors",{cache:"no-store"}); const d=await r.json();
    if(!r.ok) return toast({variant:"destructive",title:"Error",description:d.error||"Unable to load authors"});
    setAuthors(d.authors||[]);
  }
  async function loadUsers(){
    const r=await fetch("/api/admin/users",{cache:"no-store"}); const d=await r.json();
    if(r.ok) setUsers((d.users||[]).map((u:any)=>({id:String(u.id||u.uid),name:String(u.full_name||u.displayName||""),email:String(u.email||"")})));
  }
  useEffect(()=>{void load();void loadUsers()},[]);

  async function add(){
    if(!name.trim()||!userId) return toast({variant:"destructive",title:"Error",description:"Name and user are required"});
    const r=await fetch("/api/add_authors",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:name.trim(),user_id:userId})});
    const d=await r.json(); if(!r.ok) return toast({variant:"destructive",title:"Error",description:d.error||"Unable to add author"});
    setName("");setUserId("");setBio("");await load();toast({title:"Success",description:"Author added successfully"});
  }
  async function save(){
    if(!editing)return;
    const r=await fetch("/api/admin/authors",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({author_id:editing.author_id,name:editing.name,bio:editing.bio})});
    const d=await r.json();if(!r.ok)return toast({variant:"destructive",title:"Error",description:d.error||"Unable to update author"});
    setEditing(null);await load();toast({title:"Success",description:"Author updated successfully"});
  }
  async function remove(a:Author){
    const r=await fetch("/api/delete_author",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({author_id:a.author_id,user_id:a.user_id})});
    const d=await r.json();if(!r.ok)return toast({variant:"destructive",title:"Error",description:d.error||"Unable to delete author"});
    await load();toast({title:"Deleted",description:"Author deleted successfully"});
  }

  return <div><Toaster/><div className="flex min-h-screen bg-gray-100"><AdminSidebar/><main className="flex-1 overflow-y-auto p-4 md:p-8">
    <h1 className="mb-6 text-2xl font-semibold">Authors Management</h1>
    <section className="mb-8 rounded-lg bg-white p-4 shadow"><h2 className="mb-4 text-lg font-semibold">Add Author</h2>
      <div className="grid gap-3 md:grid-cols-3"><Input placeholder="Author name" value={name} onChange={e=>setName(e.target.value)}/>
      <select className="h-10 rounded-md border bg-white px-3" value={userId} onChange={e=>setUserId(e.target.value)}><option value="">Select user</option>{users.map(u=><option key={u.id} value={u.id}>{u.name||u.email}</option>)}</select>
      <Input placeholder="Bio (optional)" value={bio} onChange={e=>setBio(e.target.value)}/></div>
      <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700" onClick={add}>Add Author</Button>
    </section>
    <div className="overflow-x-auto rounded-lg bg-white shadow"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-3">A_ID</th><th className="p-3">Email</th><th className="p-3">Name</th><th className="p-3">Bio</th><th className="p-3">Actions</th></tr></thead><tbody>
      {authors.map(a=><tr key={a.author_id} className="border-b"><td className="p-3">{a.author_id}</td><td className="p-3">{a.email}</td><td className="p-3">{a.name}</td><td className="p-3">{a.bio}</td><td className="p-3 whitespace-nowrap"><Button className="mr-2 bg-blue-600 text-white hover:bg-blue-700" onClick={()=>setEditing(a)}>Edit</Button><Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={()=>remove(a)}>Delete</Button></td></tr>)}
      {!authors.length&&<tr><td colSpan={5} className="p-6 text-center text-slate-500">No authors found.</td></tr>}
    </tbody></table></div>
    {editing&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-lg rounded-lg bg-white p-5"><h2 className="mb-4 text-xl font-semibold">Edit Author</h2><Input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})}/><Textarea className="mt-3" value={editing.bio} onChange={e=>setEditing({...editing,bio:e.target.value})}/><div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={()=>setEditing(null)}>Cancel</Button><Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={save}>Save</Button></div></div></div>}
  </main></div></div>