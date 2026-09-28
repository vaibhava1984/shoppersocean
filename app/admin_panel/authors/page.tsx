'use client';

import React,{useEffect,useState} from 'react';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogTrigger} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import AdminSidebar from "../adminSidebar";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {useToast} from "@/hooks/use-toast";
import {Toaster} from "@/components/ui/toaster";

type Author={created_at:string;name:string;bio:string;updated_at:string;author_id:string;user_id:string;email?:string};
type User={id:string;full_name:string;email:string};

export default function AuthorsManagement(){
 const {toast}=useToast();
 const [authors,setAuthors]=useState<Author[]>([]);
 const [users,setUsers]=useState<User[]>([]);
 const [editing,setEditing]=useState<Author|null>(null);
 const [addOpen,setAddOpen]=useState(false),[editOpen,setEditOpen]=useState(false);
 const [newAuthor,setNewAuthor]=useState({name:"",author_id:""});

 const fetchAuthors=async()=>{const r=await fetch("/api/admin/authors");const d=await r.json();if(r.ok)setAuthors(d.authors||[]);else toast({variant:"destructive",title:"Error",description:d.error||"Unable to load authors"});};
 const fetchUsers=async()=>{const r=await fetch("/api/all_users",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});const d=await r.json();if(r.ok)setUsers((d.users||[]).map((u:any)=>({id:u.id,full_name:u.full_name||"",email:u.email||""})));};
 useEffect(()=>{void fetchAuthors()},[]);
 useEffect(()=>{if(addOpen)void fetchUsers()},[addOpen]);

 const add=async()=>{if(!newAuthor.name||!newAuthor.author_id)return;const r=await fetch("/api/add_authors",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newAuthor.name,user_id:newAuthor.author_id})});const d=await r.json();if(!r.ok){toast({variant:"destructive",title:"Error",description:d.error||"Unable to add author"});return}setNewAuthor({name:"",author_id:""});setAddOpen(false);await fetchAuthors();};
 const update=async()=>{if(!editing)return;const r=await fetch("/api/admin/authors",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({author_id:editing.author_id,name:editing.name,bio:editing.bio})});const d=await r.json();if(!r.ok){toast({variant:"destructive",title:"Error",description:d.error||"Unable to update author"});return}setEditOpen(false);setEditing(null);await fetchAuthors();};
 const remove=async(a:Author)=>{const r=await fetch("/api/delete_author",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({author_id:a.author_id})});const d=await r.json();if(!r.ok){toast({variant:"destructive",title:"Error",description:d.error||"Unable to delete author"});return}await fetchAuthors();};

 return <div><Toaster/><div className="flex h-screen bg-gray-100"><AdminSidebar/><main className="flex-1 overflow-y-auto p-8">
 <div className="flex justify-between items-center mb-4"><h3 className="text-2xl font-semibold">Authors Management</h3>
 <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogTrigger asChild><Button>Add Author</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add New Author</DialogTitle></DialogHeader>
 <div className="grid gap-4 py-4"><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Name</Label><Input id="name" value={newAuthor.name} onChange={e=>setNewAuthor({...newAuthor,name:e.target.value})} className="col-span-3"/></div>
 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="author">Users <span className="text-red-500">*</span></Label><Select value={newAuthor.author_id} onValueChange={value=>setNewAuthor({...newAuthor,author_id:value})}><SelectTrigger><SelectValue placeholder="Select User"/></SelectTrigger><SelectContent>{users.map(u=><SelectItem key={u.id} value={u.id}>{u.full_name||u.email}</SelectItem>)}</SelectContent></Select></div></div>
 <Button onClick={add}>Save and Add</Button></DialogContent></Dialog></div>
 <Table><TableHeader><TableRow><TableHead>A_ID</TableHead><TableHead>Email</TableHead><TableHead>Name</TableHead><TableHead>Bio</TableHead><TableHead>Created At</TableHead><TableHead>Updated At</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
 {authors.map(a=><TableRow key={a.author_id} className="text-black"><TableCell>{a.author_id}</TableCell><TableCell>{a.email||"Email not available"}</TableCell><TableCell>{a.name}</TableCell><TableCell>{a.bio}</TableCell><TableCell>{new Date(a.created_at).toLocaleString()}</TableCell><TableCell>{new Date(a.updated_at).toLocaleString()}</TableCell><TableCell>
 <Dialog open={editOpen&&editing?.author_id===a.author_id} onOpenChange={open=>{setEditOpen(open);if(!open)setEditing(null)}}><DialogTrigger asChild><Button variant="outline" className="mr-2 text-black" onClick={()=>{setEditing(a);setEditOpen(true)}}>Edit</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Edit Author</DialogTitle></DialogHeader>
 <div className="grid gap-4 py-4"><Label htmlFor="edit-name">Name</Label><Input id="edit-name" value={editing?.name||""} onChange={e=>setEditing(x=>x?{...x,name:e.target.value}:x)}/><Label htmlFor="edit-bio">Bio</Label><Textarea id="edit-bio" value={editing?.bio||""} onChange={e=>setEditing(x=>x?{...x,bio:e.target.value}:x)}/></div><Button onClick={update}>Save and Update</Button></DialogContent></Dialog>
 <Button variant="destructive" onClick={()=>remove(a)}>Delete</Button></TableCell></TableRow>)}
 </TableBody></Table></main></div></div>;
}
