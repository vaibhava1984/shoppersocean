'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Expand, Loader2, Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (source: { url: string }) => { promise: any };
    };
  }
}

type Props = { bookId: string; title: string };

const PDFJS_VERSION = '3.11.174';
const PDFJS_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

function loadPdfJs(): Promise<NonNullable<Window['pdfjsLib']>> {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-shoppers-ocean-pdfjs]');
    if (existing) {
      existing.addEventListener('load', () => window.pdfjsLib ? resolve(window.pdfjsLib) : reject(new Error('PDF.js failed to initialize')), { once: true });
      existing.addEventListener('error', () => reject(new Error('PDF.js failed to load')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = PDFJS_URL;
    script.async = true;
    script.setAttribute('data-shoppers-ocean-pdfjs', 'true');
    script.onload = () => window.pdfjsLib ? resolve(window.pdfjsLib) : reject(new Error('PDF.js failed to initialize'));
    script.onerror = () => reject(new Error('PDF.js failed to load'));
    document.head.appendChild(script);
  });
}

export default function BookFlipbook({ bookId, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [opened, setOpened] = useState(false);
  const [readerUrl, setReaderUrl] = useState('');
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');
  const [turning, setTurning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const downloadPdf = async () => {
    if (downloading) return;
    setDownloading(true); setError('');
    try {
      const response = await fetch('/api/get-book-download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Download unavailable');
      const pdfFile = data.urls?.find((file: any) => String(file.fileType).toLowerCase() === 'pdf' || String(file.fileName).toLowerCase().endsWith('.pdf'));
      if (!pdfFile?.downloadUrl) throw new Error('PDF book not found');
      const link = document.createElement('a');
      link.href = pdfFile.downloadUrl; link.download = pdfFile.fileName || `${title}.pdf`;
      document.body.appendChild(link); link.click(); link.remove();
    } catch (err: any) {
      setError(err?.message || 'Download failed');
    } finally { setDownloading(false); }
  };

  const openReader = async () => {
    if (loading) return;
    setOpened(true); setLoading(true); setError(''); setReaderUrl('');
    try {
      const response = await fetch('/api/get-book-reader', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId }) });
      const data = await response.json();
      if (!response.ok || !data.readerUrl) throw new Error(data.error || 'Unable to open book');
      setReaderUrl(data.readerUrl);
    } catch (err: any) {
      setError(err?.message || 'Unable to open book');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;
    if (!readerUrl) return;
    const load = async () => {
      try {
        const pdfjs = await loadPdfJs();
        if (cancelled) return;
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        const pdf = await pdfjs.getDocument({ url: readerUrl }).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);
        setPage(1);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Unable to load the purchased book');
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [readerUrl]);

  const renderPage = useCallback(async () => {
    const pdf = pdfRef.current; const canvas = canvasRef.current;
    if (!pdf || !canvas) return;
    setRendering(true); setError('');
    try {
      if (renderTaskRef.current) renderTaskRef.current.cancel();
      const pdfPage = await pdf.getPage(page);
      const viewport = pdfPage.getViewport({ scale: zoom * 1.25 });
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.ceil(viewport.width * ratio);
      canvas.height = Math.ceil(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      renderTaskRef.current = pdfPage.render({ canvasContext: context, viewport });
      await renderTaskRef.current.promise;
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') setError(err?.message || 'Unable to render this page');
    } finally { setRendering(false); }
  }, [page, zoom]);

  useEffect(() => { if (opened && readerUrl && pdfRef.current) void renderPage(); }, [opened, readerUrl, renderPage, pageCount]);

  const changePage = (next: number) => {
    if (next < 1 || next > pageCount || turning) return;
    setTurning(true);
    window.setTimeout(() => { setPage(next); window.setTimeout(() => setTurning(false), 300); }, 80);
  };

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) { await viewerRef.current.requestFullscreen?.(); setFullscreen(true); }
    else { await document.exitFullscreen?.(); setFullscreen(false); }
  };

  const handleTouchStart = (event: React.TouchEvent) => { touchStartXRef.current = event.changedTouches[0]?.clientX ?? null; };
  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartXRef.current; const end = event.changedTouches[0]?.clientX ?? null; touchStartXRef.current = null;
    if (start === null || end === null || Math.abs(end - start) < 45) return;
    changePage(end < start ? page + 1 : page - 1);
  };

  if (!opened) return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-slate-50 p-6 sm:p-10">
      <p className="text-center font-semibold text-slate-800">Your purchase includes secure flipbook reading and PDF download.</p>
      <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
        <Button className="h-12 flex-1" onClick={openReader} disabled={loading}>Read online as flipbook</Button>
        <Button className="h-12 flex-1" variant="outline" onClick={downloadPdf} disabled={downloading}>{downloading ? <><Loader2 className="mr-2 animate-spin" />Preparing…</> : <><Download className="mr-2 h-4 w-4" />Download as PDF book</>}</Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );

  if (loading) return <div className="flex min-h-[420px] items-center justify-center rounded-xl bg-slate-100"><Loader2 className="mr-2 animate-spin" />Opening your book…</div>;
  if (error && !readerUrl) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"><p className="font-semibold">Could not open this book</p><p className="mt-1 text-sm">{error}</p><Button className="mt-4" onClick={openReader}>Try again</Button></div>;

  const flipStyle: React.CSSProperties = { perspective: '1400px', transform: turning ? 'rotateY(-88deg)' : 'rotateY(0deg)', opacity: turning ? 0.72 : 1 };
  return (
    <div ref={viewerRef} className={`overflow-hidden rounded-xl border bg-slate-900 text-white shadow-xl ${fullscreen ? 'flex min-h-screen flex-col' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950 px-3 py-2"><div className="min-w-0 truncate font-medium">{title}</div><div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setZoom(Math.max(0.75, Number((zoom - 0.15).toFixed(2))))} aria-label="Zoom out"><Minus /></Button>
        <span className="w-12 text-center text-xs">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setZoom(Math.min(2.5, Number((zoom + 0.15).toFixed(2))))} aria-label="Zoom in"><Plus /></Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}>{fullscreen ? <X /> : <Expand />}</Button>
      </div></div>
      {error && <div className="bg-amber-50 px-4 py-2 text-sm text-amber-900">{error}</div>}
      <div className={`flex flex-1 items-center justify-center overflow-auto p-3 sm:p-6 ${fullscreen ? 'min-h-0' : 'min-h-[520px]'}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="relative rounded bg-white shadow-2xl transition-all duration-300 ease-in-out" style={flipStyle}>
          <canvas ref={canvasRef} className="block max-w-full" />
          {rendering && <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-slate-700"><Loader2 className="animate-spin" /></div>}
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 border-t border-white/10 bg-slate-950 px-3 py-3">
        <Button variant="ghost" className="text-white hover:bg-white/10" disabled={page <= 1} onClick={() => changePage(page - 1)} aria-label="Previous page"><ChevronLeft /> Previous</Button>
        <span className="min-w-24 text-center text-sm">Page {page} / {pageCount || '—'}</span>
        <Button variant="ghost" className="text-white hover:bg-white/10" disabled={page >= pageCount} onClick={() => changePage(page + 1)} aria-label="Next page">Next <ChevronRight /></Button>
      </div>
    </div>
  );
}
