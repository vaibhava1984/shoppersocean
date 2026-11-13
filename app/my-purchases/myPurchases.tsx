"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
type Subscription = {
  status?: string | null; started_at?: string | null; expires_at?: string | null;
  plan_name?: string | null; amount?: number | null; payment_id?: string | null;
};

const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
const remainingDaysFor = (expiresAt?: string | null, now = Date.now()) => {
  if (!expiresAt) return null;
  const expiry = Date.parse(expiresAt);
  if (!Number.isFinite(expiry) || expiry <= now) return 0;
  return Math.ceil((expiry - now) / 86400000);
};
const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
};

const PurchaseHistory = () => {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await fetch('/api/my-purchases', { cache: 'no-store' });
        if (response.status === 401) { router.replace('/'); return; }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load purchases');
        setPurchases(Array.isArray(data) ? data : (data.purchases || []));
        setSubscription(data.subscription || null);
      } catch (err: any) {
        setError(err?.message || 'Failed to load purchases');
      } finally { setLoading(false); }
    };
    void fetchPurchases();
  }, [router]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remainingDays = remainingDaysFor(subscription?.expires_at, now);
  const active = subscription?.status?.toLowerCase() === 'active' && remainingDays !== null && remainingDays > 0;
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

  return <div className="w-full max-w-5xl mx-auto space-y-6 px-3 sm:px-0">
    <Card>
      <CardHeader><CardTitle>My Subscription</CardTitle></CardHeader>
      <CardContent>
        {!subscription ? <div className="py-4 text-center text-gray-600">You don't have an active subscription yet.</div> :
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4"><div className="text-sm text-gray-500">Subscription Plan</div><div className="mt-1 text-lg font-semibold">{subscription.plan_name || 'Subscription'}</div></div>
            <div className="rounded-lg border p-4"><div className="text-sm text-gray-500">Status</div><div className="mt-2"><Badge className={active ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>{active ? 'Active' : 'Expired'}</Badge></div></div>
            <div className="rounded-lg border p-4"><div className="text-sm text-gray-500">Days Remaining</div><div className="mt-1 text-2xl font-bold">{active ? remainingDays : 0} {active && remainingDays === 1 ? 'day' : 'days'}</div><div className="mt-1 text-xs text-gray-500">Automatically refreshed while this page is open.</div></div>
            <div className="rounded-lg border p-4"><div className="text-sm text-gray-500">Amount Paid</div><div className="mt-1 text-lg font-semibold">{subscription.amount == null ? '—' : `₹${Number(subscription.amount).toLocaleString('en-IN')}`}</div></div>
            <div className="rounded-lg border p-4"><div className="text-sm text-gray-500">Start Date</div><div className="mt-1 font-medium">{formatDate(subscription.started_at)}</div></div>
            <div className="rounded-lg border p-4"><div className="text-sm text-gray-500">Expiry Date</div><div className="mt-1 font-medium">{formatDate(subscription.expires_at)}</div></div>
            {subscription.payment_id && <div className="rounded-lg border p-4 sm:col-span-2"><div className="text-sm text-gray-500">Payment ID</div><div className="mt-1 break-all font-mono text-sm">{subscription.payment_id}</div></div>}
          </div>}
      </CardContent>
    </Card>
    <Card><CardHeader><CardTitle>Purchase History</CardTitle></CardHeader><CardContent>
      <AuthorApplicationBanner />
      {purchases.length === 0 ? <div className="text-center py-8 text-gray-500">No purchases found</div> :
        <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Order Date</TableHead><TableHead>Book Title</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Payment Method</TableHead></TableRow></TableHeader>
        <TableBody>{purchases.map(purchase => <TableRow key={purchase.id}>
          <TableCell>{new Date(purchase.order_date).toLocaleDateString('en-IN')}</TableCell>
          <TableCell className="font-medium"><Link href={purchase.books?.id ? `/book/${purchase.books.id}` : '#'}>{purchase.books?.title || 'Unknown Book'}</Link></TableCell>
          <TableCell>{(purchase.payment?.original_amount ?? purchase.original_amount ?? 0).toFixed(2)} {purchase.payment?.original_currency ?? ''}</TableCell>
          <TableCell><Badge variant="secondary" className={getStatusColor(purchase.status)}>{purchase.status || 'Unknown'}</Badge></TableCell>
          <TableCell>{purchase.payment?.payment_method || 'N/A'}</TableCell>
        </TableRow>)}</TableBody></Table></div>}
    </CardContent></Card>
  </div>;
};
export default PurchaseHistory;
