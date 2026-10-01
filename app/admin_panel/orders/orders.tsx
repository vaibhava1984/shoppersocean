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

const ITEMS_PER_PAGE = 100;
type Purchase = { id:string; order_date?:string; status?:string; contact_number?:string; razorpay_order_id?:string; profiles?:{full_name?:string;email?:string}; product?:{id:string;title?:string;author?:string}; payment?:{amount_in_inr?:number;payment_method?:string;bank?:string;card_network?:string} };
type Stats = { totalOrders:number; totalRevenue:number; successfulOrders:number; pendingOrders:number };

export default function AdminPurchaseHistory() {
  const [purchases,setPurchases]=useState<Purchase[]>([]), [loading,setLoading]=useState(true), [error,setError]=useState<string|null>(null);
  const [dateFilter,setDateFilter]=useState("all"), [searchQuery,setSearchQuery]=useState(""), [statusFilter,setStatusFilter]=useState("all");
  const [currentPage,setCurrentPage]=useState(0), [totalCount,setTotalCount]=useState(0);
  const [stats,setStats]=useState<Stats>({totalOrders:0,totalRevenue:0,successfulOrders:0,pendingOrders:0});

  const fetchOrders=async()=>{
    try{
      setLoading(true); setError(null);
      const params=new URLSearchParams({dateFilter,statusFilter,search:searchQuery,page:String(currentPage),limit:String(ITEMS_PER_PAGE)});
      const response=await fetch("/api/admin/orders?"+params.toString(),{cache:"no-store"});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Unable to load orders");
      setPurchases(data.purchases||[]); setTotalCount(Number(data.totalCount||0));
      setStats(data.stats||{totalOrders:0,totalRevenue:0,successfulOrders:0,pendingOrders:0});
    }catch(err){setError(err instanceof Error?err.message:"Unable to load orders")}
    finally{setLoading(false)}
  };

  useEffect(()=>{setCurrentPage(0)},[dateFilter,statusFilter,searchQuery]);
  useEffect(()=>{const timer=setTimeout(fetchOrders,250);return()=>clearTimeout(timer)},[dateFilter,statusFilter,searchQuery,currentPage]);

  const totalPages=Math.ceil(totalCount/ITEMS_PER_PAGE);
  return <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalOrders}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div></CardContent></Card>
    </div>
    <Card><CardContent className="pt-6"><div className="flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1"><div className="text-sm font-medium mb-2">Search</div><div className="relative"><Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/><Input placeholder="Search by book title, customer email, or order ID..." className="pl-8" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></div></div>
      <div><div className="text-sm font-medium mb-2">Date Filter</div><Select value={dateFilter} onValueChange={setDateFilter}><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="today">Today</SelectItem><SelectItem value="month">This Month</SelectItem><SelectItem value="year">This Year</SelectItem><SelectItem value="all">Until Now</SelectItem></SelectContent></Select></div>
      <div><div className="text-sm font-medium mb-2">Status</div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="authorized">Authorized</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="failed">Failed</SelectItem><SelectItem value="refunded">Refunded</SelectItem></SelectContent></Select></div>
      <Button variant="outline" onClick={fetchOrders}><RefreshCcw className="h-4 w-4 mr-2"/>Refresh</Button>
    </div></CardContent></Card>
    <Card><CardHeader><CardTitle>Orders</CardTitle></CardHeader><CardContent>
      {loading?<div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin"/></div>:error?<div className="text-red-600">Error loading orders: {error}</div>:
      <><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Order Date</TableHead><TableHead>Book Title</TableHead><TableHead>Customer</TableHead><TableHead>Amount(INR)</TableHead><TableHead>Status</TableHead><TableHead>Payment</TableHead><TableHead>Order ID</TableHead></TableRow></TableHeader><TableBody>
      {purchases.map(p=><TableRow key={p.id}><TableCell>{p.order_date?format(new Date(p.order_date),"MMM d, yyyy HH:mm"):"—"}</TableCell><TableCell><div className="font-medium">{p.product?.id?<Link href={"/book/"+p.product.id}>{p.product.title}</Link>:"—"}</div><div className="text-sm text-muted-foreground">{p.product?.author||""}</div></TableCell><TableCell><div className="font-medium">{p.profiles?.full_name||"—"} ({p.profiles?.email||"—"})</div><div className="text-sm text-muted-foreground">{p.contact_number||""}</div></TableCell><TableCell>{Number(p.payment?.amount_in_inr||0).toFixed(2)} INR</TableCell><TableCell><Badge variant="secondary">{p.status||"unknown"}</Badge></TableCell><TableCell><div>{p.payment?.payment_method||"N/A"}</div><div className="text-sm text-muted-foreground">{p.payment?.bank||p.payment?.card_network||""}</div></TableCell><TableCell className="font-mono text-sm">{p.razorpay_order_id||"—"}</TableCell></TableRow>)}
      {!purchases.length&&<TableRow><TableCell colSpan={7} className="text-center py-8">No orders found.</TableCell></TableRow>}
      </TableBody></Table></div>
      <div className="mt-4 flex items-center justify-between"><div className="text-sm text-muted-foreground">{totalCount?"Showing "+(currentPage*ITEMS_PER_PAGE+1)+" to "+Math.min((currentPage+1)*ITEMS_PER_PAGE,totalCount)+" of "+totalCount+" entries":"No entries"}</div><div className="flex gap-2">
      <Button variant="outline" onClick={()=>setCurrentPage(p=>Math.max(0,p-1))} disabled={currentPage===0}>Previous</Button>
      <div className="flex gap-1">{Array.from({length:Math.min(5,totalPages)},(_,i)=>{let n=i;if(totalPages>5)n=currentPage<2?i:currentPage>totalPages-4?totalPages-5+i:currentPage-2+i;return <Button key={n} variant={currentPage===n?"default":"outline"} onClick={()=>setCurrentPage(n)} className="w-10">{n+1}</Button>})}</div>
      <Button variant="outline" onClick={()=>setCurrentPage(p=>Math.min(Math.max(0,totalPages-1),p+1))} disabled={!totalPages||currentPage>=totalPages-1}>Next</Button>
      </div></div></>}
    </CardContent></Card>
  </div>;
}
