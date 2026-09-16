'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PaymentButton from '@/components/PaymentButton';

const BookFlipbook = dynamic(() => import('@/components/BookFlipbook'), {
  loading: () => <div className="min-h-[420px] animate-pulse rounded-xl bg-slate-100" />,
});

type Props = { bookId: string; title: string; amount: number; userId?: string };

export default function BookAccess({ bookId, title, amount, userId }: Props) {
  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);

  const checkPurchase = useCallback(async () => {
    if (!userId) {
      setHasPurchased(false);
      return;
    }
    try {
      const response = await fetch('/api/check-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: bookId }),
        cache: 'no-store',
      });
      const data = await response.json();
      setHasPurchased(response.ok && Boolean(data.hasPurchased));
    } catch {
      setHasPurchased(false);
    }
  }, [bookId, userId]);

  useEffect(() => {
    checkPurchase();
    const timer = window.setInterval(checkPurchase, 2500);
    return () => window.clearInterval(timer);
  }, [checkPurchase]);

  if (hasPurchased === null) {
    return <div className="mb-6 min-h-[48px] rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Checking your purchase…</div>;
  }

  if (!hasPurchased) {
    return userId ? (
      <div className="mb-6 flex items-center space-x-4">
        <PaymentButton amount={amount} notes={{ product_name: title }} userId={userId} productId={bookId} />
      </div>
    ) : null;
  }

  return (
    <CardShell title="Your book">
      <p className="mb-4 text-sm text-emerald-800">Purchase confirmed. You can read the book online or download the PDF.</p>
      <BookFlipbook bookId={bookId} title={title} />
    </CardShell>
  );
}

function CardShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-emerald-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-3 text-2xl font-bold text-slate-800">{title}</h2>
      {children}
    </div>
  );
}
