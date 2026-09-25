'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import FlipbookReader from '@/components/FlipbookReader';

type BookFile = { downloadUrl: string; fileName: string; fileType: string };

export default function FlipbookPageClient({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<BookFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadBook() {
      try {
        setLoading(true);
        // Use the protected reader proxy, not the download-URL API. This keeps the
        // PDF inside the authenticated reader flow and supports HTTP Range requests
        // needed by PDF.js while never exposing a long-lived storage URL.
        const downloadUrl = `/api/get-book-reader-pdf?bookId=${encodeURIComponent(bookId)}`;
        if (active) setFile({ downloadUrl, fileName: 'Book.pdf', fileType: 'pdf' });
      } catch (err) {
        console.error('Flipbook access failed:', err);
        if (active) setError(err instanceof Error ? err.message : 'Unable to open this book');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadBook();
    return () => { active = false; };
  }, [bookId]);

  return (
    <main className="min-h-screen bg-slate-950 p-3 sm:p-6">
      <div className="mx-auto mb-3 max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10"><ArrowLeft size={18} /> Back to Shoppers Ocean</Link>
      </div>
      {loading && <div className="flex min-h-[70vh] items-center justify-center gap-3 text-white"><Loader2 className="animate-spin" /><span>Preparing your flipbook…</span></div>}
      {!loading && error && <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center text-center text-white"><div className="rounded-2xl bg-white/10 p-7"><h1 className="mb-2 text-xl font-semibold">Unable to open flipbook</h1><p className="text-sm text-white/70">{error}</p></div></div>}
      {!loading && !error && file && <FlipbookReader pdfUrl={file.downloadUrl} fileName={file.fileName} onClose={() => router.push(`/book/${encodeURIComponent(bookId)}`)} />}
    </main>
  );
}
