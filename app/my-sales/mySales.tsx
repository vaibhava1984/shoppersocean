"use client";
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from "@/components/ui/toaster";
type Sale={bookId:string;bookTitle:string;amount_in_inr:number;transactedAmount:number;transactedAmountCurrency?:string;saleDate:string};
type SalesResponse={totalOrders:number;totalRevenue:number;totalActiveBooks:number;salesDetails:Sale[]};
const AuthorOrdersDashboard=({authorId}:{authorId:string})=>{
 const {toast}=useToast(); const [timeFrame,setTimeFrame]=useState('month');
 const [orderedBooksData,setOrderedBooksData]=useState<SalesResponse>({totalOrders:0,totalRevenue:0,totalActiveBooks:0,salesDetails:[]});
 const [loading,setLoading]=useState(true);
 const getSalesData=async(id:string,timeFilter:string|null=null):Promise<SalesResponse>=>{
  const response=await fetch(`/api/my-sales?authorId=${encodeURIComponent(id)}&timeFrame=${encodeURIComponent(timeFilter||'')}`,{cache:'no-store'});
  const data=await response.json(); if(!response.ok) throw new Error(data.error||'Failed to load sales data'); return data as SalesResponse;
 };
 useEffect(()=>{if(!authorId)return;setLoading(true);void getSalesData(authorId,timeFrame).then(setOrderedBooksData).catch(err=>toast({variant:"destructive",title:"Error",description:err?.message||"Failed to load data"})).finally(()=>setLoading(false));},[authorId,timeFrame,toast]);
 return <div className="space-y-6 p-6 max-w-7xl mx-auto"><Toaster/>
  <div className="flex justify-between items-center"><h1 className="text-3xl font-bold">My Sales</h1><Select value={timeFrame} onValueChange={setTimeFrame}><SelectTrigger className="w-32"><SelectValue placeholder="Select timeframe"/></SelectTrigger><SelectContent><SelectItem value="today">Today</SelectItem><SelectItem value="week">Weekly</SelectItem><SelectItem value="month">This Month</SelectItem><SelectItem value="year">This Year</SelectItem><SelectItem value="untilnow">Until Now</SelectItem></SelectContent></Select></div>
  {loading?<div className="p-6 bg-gray-50"><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">{[1,2,3].map(i=><div key={i} className="bg-white rounded-lg shadow p-6"><Skeleton className="h-4 w-24 mb-2"/><Skeleton className="h-8 w-16"/></div>)}</div><div className="bg-white rounded-lg shadow overflow-hidden p-6">{[1,2,3].map(i=><Skeleton key={i} className="h-4 w-full mb-4"/>)}</div></div>:
  <div className="p-6 bg-gray-50"><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
   <div className="bg-white rounded-lg shadow p-6"><h3 className="text-gray-500 text-sm font-medium">Total Orders</h3><p className="text-3xl font-bold text-gray-900">{orderedBooksData.totalOrders}</p></div>
   <div className="bg-white rounded-lg shadow p-6"><h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3><p className="text-3xl font-bold text-gray-900">₹{orderedBooksData.totalRevenue}</p></div>
   <div className="bg-white rounded-lg shadow p-6"><h3 className="text-gray-500 text-sm font-medium">Active Books</h3><p className="text-3xl font-bold text-gray-900">{orderedBooksData.totalActiveBooks}</p></div>
  </div><div className="bg-white rounded-lg shadow overflow-hidden"><div className="px-6 py-4 border-b"><h2 className="text-lg font-medium">Sales Details</h2></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (INR)</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transacted Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Date</th></tr></thead><tbody>{orderedBooksData.salesDetails.map(sale=><tr key={sale.bookId}><td className="px-6 py-4 text-sm">{sale.bookTitle}</td><td className="px-6 py-4 text-sm">₹{sale.amount_in_inr}</td><td className="px-6 py-4 text-sm">{sale.transactedAmount} {sale.transactedAmountCurrency}</td><td className="px-6 py-4 text-sm">{new Date(sale.saleDate).toLocaleDateString()}</td></tr>)}</tbody></table></div></div></div>}
 </div>;
};
export default AuthorOrdersDashboard;
