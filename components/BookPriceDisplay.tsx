'use client';

import { useEffect, useState } from "react";

type PriceState = { currency: string; amount: number; unavailable?: boolean };

export default function BookPriceDisplay({ bookId }: { bookId: string }) {
  const [price, setPrice] = useState<PriceState | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/book-pricing?bookId=${encodeURIComponent(bookId)}`, { cache: "no-store", credentials: "same-origin" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "Price unavailable");
        if (active && data.currency && Number(data.amount) > 0) setPrice({ currency: data.currency, amount: Number(data.amount) });
      })
      .catch(error => console.error("Unable to load local book price:", error));
    return () => { active = false; };
  }, [bookId]);

  if (!price) return <span className="text-sm text-slate-500">Checking price…</span>;
  return <span>{new Intl.NumberFormat(typeof navigator !== "undefined" ? navigator.language : "en", { style: "currency", currency: price.currency }).format(price.amount)}</span>;
}
