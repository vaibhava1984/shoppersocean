"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

type Purchase = {
  id: string; order_date: string; product_id: string; email?: string; contact_number?: string;
  status?: string; razorpay_order_id?: string; book_title?: string; author_name?: string;
  amount_in_inr?: number; payment_method?: string; bank?: string; card_network?: string;
};
type ResponseData = { purchases: Purchase[]; totalCount: number; stats: { totalOrders:number; totalRevenue:number; successfulOrders:number; pendingOrders:number } };

export default function AdminPurchaseHistory() {
  const [data,setData]=useState<ResponseData>({purchases:[],totalCount:0,stats:{totalOrders:0,totalRevenue:0,successfulOrders:0,pendingOrders:0}});
  const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const [dateFilter,setDateFilter]=useState("all"); const [statusFilter,setStatusFilter]=useState("all");
  const [searchQuery,setSearchQuery]=useState(""); const [page,setPage]=useState(0);

  const load=async()=>{
    try{
      setLoading(true); setError(null);
      const qs=new URLSearchParams({date:dateFilter,status:statusFilter,page:String(page)});
      if(searchQuery.trim()) qs.set("search",searchQuery.trim());
      const response=await fetch("/api/admin/orders?"+qs.toString(),{cache:"no-store"});
      const json=await response.json(); if(!response.ok) throw new Error(json.error||"Failed to load orders");
      setData(json);
    }catch(e:any){setError(e?.message||"Failed to load orders");}finally{setLoading(false);}
  };
  useEffect(()=>{void load();},[dateFilter,statusFilter,page,searchQuery]);

  const totalPages=Math.max(1,Math.ceil(data.totalCount/100));
  return <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Orders</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.stats.totalOrders}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">₹{data.stats.totalRevenue.toFixed(2)}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Successful</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.stats.successfulOrders}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.stats.pendingOrders}</div></CardContent></Card>
    </div>
    <Card><CardContent className="pt-6"><div className="flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1"><div className="text-sm font-medium mb-2">Search</div><div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/><Input className="pl-8" placeholder="Search by book, email or order ID..." value={searchQuery} onChange={e=>{setPage(0);setSearchQuery(e.target.value)}}/></div></div>
      <div><div className="text-sm font-medium mb-2">Date</div><Select value={dateFilter} onValueChange={v=>{setPage(0);setDateFilter(v)}}><SelectTrigger className="w-[160px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Until Now</SelectItem><SelectItem value="today">Today</SelectItem><SelectItem value="month">This Month</SelectItem><SelectItem value="year">This Year</SelectItem></SelectContent></Select></div>
      <div><div className="text-sm font-medium mb-2">Status</div><Select value={statusFilter} onValueChange={v=>{setPage(0);setStatusFilter(v)}}><SelectTrigger className="w-[160px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent></Select></div>
      <Button variant="outline" onClick={()=>void load()}><RefreshCcw className="h-4 w-4 mr-2"/>Refresh</Button>
    </div></CardContent></Card>
    <Card><CardHeader><CardTitle>Orders</CardTitle></CardHeader><CardContent>
      {loading?<div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-8 w-8 animate-spin"/></div>:error?<div className="text-red-600">{error}</div>:
      <><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Order Date</TableHead><TableHead>Book</TableHead><TableHead>Customer</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead><TableHead>Order ID</TableHead></TableRow></TableHeader><TableBody>
      {data.purchases.map(p=><TableRow key={p.id}><TableCell>{format(new Date(p.order_date),"MMM d, yyyy HH:mm")}</TableCell><TableCell><Link className="font-medium" href={"/book/"+p.product_id}>{p.book_title||"Unknown Book"}</Link><div className="text-sm text-muted-foreground">{p.author_name}</div></TableCell><TableCell><div className="font-medium">{p.email||"—"}</div><div className="text-sm text-muted-foreground">{p.contact_number||""}</div></TableCell><TableCell>₹{Number(p.amount_in_inr||0).toFixed(2)}</TableCell><TableCell><Badge variant="secondary">{p.status||"unknown"}</Badge></TableCell><TableCell><div>{p.payment_method||"N/A"}</div><div className="text-sm text-muted-foreground">{p.bank||p.card_network||""}</div></TableCell><TableCell className="font-mono text-xs">{p.razorpay_order_id||"—"}</TableCell></TableRow>)}
      </TableBody></Table></div>
      {!data.purchases.length&&<div className="py-8 text-center text-muted-foreground">No orders found</div>}
      <div className="mt-4 flex items-center justify-between"><span className="text-sm text-muted-foreground">Page {page+1} of {totalPages}</span><div className="flex gap-2"><Button variant="outline" onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}>Previous</Button><Button variant="outline" onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1}>Next</Button></div></div></>}
    </CardContent></Card>
  </div>;
}
