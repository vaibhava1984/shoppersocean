'use client';
import React,{useEffect,useState} from 'react';
import {Button} from "@/components/ui/button";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";
import AdminSidebar from "../adminSidebar";
import {useToast} from "@/hooks/use-toast";
import {Toaster} from "@/components/ui/toaster";

type AuthorApprovalsType={user_id:string;created_at:string;profiles?:{email?:string}};
export default function AuthorsApproval(){
 const {toast}=useToast();const [authors,setAuthors]=useState<AuthorApprovalsType[]>([]);
 const fetchAuthors=async()=>{try{const r=await fetch('/api/admin/author-approvals');const d=await r.json();if(!r.ok)throw new Error(d.error);setAuthors(d.authors||[])}catch(e){toast({variant:"destructive",title:"Error",description:e instanceof Error?e.message:"Unable to load author approvals."})}};
 useEffect(()=>{fetchAuthors()},[]);
 const approveAuthor=async(authorId:string)=>{try{const r=await fetch("/api/authors_approve",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({author_id:authorId})});const d=await r.json();if(!r.ok){toast({variant:"destructive",title:"Error",description:d.error||"Something went wrong"});return}toast({title:"Success!",description:"Approval success."});fetchAuthors()}catch{toast({variant:"destructive",title:"Error",description:"Failed to approve author"})}};
 return <div><Toaster/><div className="flex h-screen bg-gray-100"><AdminSidebar/><main className="flex-1 overflow-y-auto p-8"><div className="flex justify-between items-center mb-4"><h3 className="text-2xl font-semibold text-black">Authors Approvals</h3></div><Table><TableHeader><TableRow><TableHead>User ID</TableHead><TableHead>Email</TableHead><TableHead>Created At</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{authors.filter(Boolean).map(a=><TableRow key={a.user_id} className="text-black"><TableCell>{a.user_id}</TableCell><TableCell>{a.profiles?.email||"—"}</TableCell><TableCell>{a.created_at?new Date(a.created_at).toLocaleString():"—"}</TableCell><TableCell><Button variant="default" onClick={()=>approveAuthor(a.user_id)}>Approve</Button></TableCell></TableRow>)}</TableBody></Table></main></div></div>
}