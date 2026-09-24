"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import AuthorApplicationBanner from '@/app/components/AuthorApplicationBanner';

type Purchase = {
  id: string; order_date: string; original_amount?: number; status?: string;
  books?: { id: string; title?: string } | null;
  payment?: { original_amount?: number; original_currency?: string; payment_method?: string } | null;
};
const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch('/api/my-purchases', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load purchases');
        setPurchases(Array.isArray(data) ? data : []);
      } catch (err: any) { setError(err?.message || 'Failed to load purchases'); }
      finally { setLoading(false); }
    };
    void fetchPurchases();
  }, []);
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  if (loading) return <div className="flex justify-center items-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <Card className="w-full"><CardContent className="p-6"><div className="text-red-600">Error loading purchases: {error}</div></CardContent></Card>;
  return <Card className="max-w-[80%] mx-auto"><CardHeader><CardTitle>Purchase History</CardTitle></CardHeader><CardContent>
    <AuthorApplicationBanner />
    {purchases.length === 0 ? <div className="text-center py-8 text-gray-500">No purchases found</div> :
      <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Order Date</TableHead><TableHead>Book Title</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Payment Method</TableHead></TableRow></TableHeader>
      <TableBody>{purchases.map(purchase => <TableRow key={purchase.id}>
        <TableCell>{new Date(purchase.order_date).toLocaleDateString()}</TableCell>
        <TableCell className="font-medium"><Link href={purchase.books?.id ? `/book/${purchase.books.id}` : '#'}>{purchase.books?.title || 'Unknown Book'}</Link></TableCell>
        <TableCell>{(purchase.payment?.original_amount ?? purchase.original_amount ?? 0).toFixed(2)} {purchase.payment?.original_currency ?? ''}</TableCell>
        <TableCell><Badge variant="secondary" className={getStatusColor(purchase.status)}>{purchase.status || 'Unknown'}</Badge></TableCell>
        <TableCell>{purchase.payment?.payment_method || 'N/A'}</TableCell>
      </TableRow>)}</TableBody></Table></div>}
  </CardContent></Card>;
};
export default PurchaseHistory;
