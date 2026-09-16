'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Expand, Loader2, Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global { interface Window { pdfjsLib?: any } }
type Props = { bookId: string; title: string };
const PDFJS_VERSION = '4.10.38';
const PDFJS_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.mjs`;
const PDFJS_WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

export default function BookFlipbook({ bookId, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null), viewerRef = useRef<HTMLDivElement>(null), pdfRef = useRef<any>(null), renderTaskRef = useRef<any>(null);
  const [opened, setOpened] = useState(false), [readerUrl, setReaderUrl] = useState(''), [page, setPage] = useState(1), [pageCount, setPageCount] = useState(0), [zoom, setZoom] = useState(1), [loading, setLoading] = useState(false), [rendering, setRendering] = useState(false), [error, setError] = useState(''), [turning, setTurning] = useState(false), [fullscreen, setFullscreen] = useState(false), [downloading, setDownloading] = useState(false);

  const downloadPdf = async () => {
    setDownloading(true); setError('');
    try {
      const response = await fetch('/api/get-book-download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Download unavailable');
      const pdfFile = data.urls?.find((file: any) => String(file.fileType).toLowerCase() === 'pdf' || String(file.fileName).toLowerCase().endsWith('.pdf'));
      if (!pdfFile?.downloadUrl) throw new Error('PDF book not found');
      const link = document.createElement('a'); link.href = pdfFile.downloadUrl; link.download = pdfFile.fileName || `${title}.pdf`; document.body.appendChild(link); link.click(); link.remove();
    } catch (err: any) { setError(err?.message || 'Download failed'); } finally { setDownloading(false); }
  };

  const openReader = async () => {
    setOpened(true); setLoading(true); setError('');
    try {
      const response = await fetch('/api/get-book-reader', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to open book');
      setReaderUrl(data.readerUrl);
    } catch (err: any) { setError(err?.message || 'Unable to open book'); } finally { setLoading(false); }
  };

  useEffect(() => {
    let cancelled = false;
    const loadPdfJs = async () => {
      if (!readerUrl) return;
      try {
        if (!window.pdfjsLib) window.pdfjsLib = await import(/* webpackIgnore: true */ PDFJS_URL);
        if (cancelled) return; window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
        const pdf = await window.pdfjsLib.getDocument({ url: readerUrl }).promise;
        if (cancelled) return; pdfRef.current = pdf; setPageCount(pdf.numPages); setPage(1);
      } catch (err: any) { if (!cancelled) setError(err?.message || 'Unable to load the book'); }
    };
    loadPdfJs(); return () => { cancelled = true; };
  }, [readerUrl]);

  const renderPage = useCallback(async () => {
    const pdf = pdfRef.current, canvas = canvasRef.current; if (!pdf || !canvas) return;
    setRendering(true);
    try {
      if (renderTaskRef.current) renderTaskRef.current.cancel();
      const pdfPage = await pdf.getPage(page), viewport = pdfPage.getViewport({ scale: zoom * 1.25 }), ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * ratio); canvas.height = Math.floor(viewport.height * ratio); canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
      const context = canvas.getContext('2d'); if (!context) return; context.setTransform(ratio, 0, 0, ratio, 0, 0);
      renderTaskRef.current = pdfPage.render({ canvasContext: context, viewport }); await renderTaskRef.current.promise;
    } catch (err: any) { if (err?.name !== 'RenderingCancelledException') setError('Unable to render this page'); } finally { setRendering(false); }
  }, [page, zoom]);
  useEffect(() => { if (opened) renderPage(); }, [opened, renderPage]);

  const changePage = (next: number) => { if (next < 1 || next > pageCount || turning) return; setTurning(true); window.setTimeout(() => { setPage(next); window.setTimeout(() => setTurning(false), 280); }, 60); };
  const toggleFullscreen = async () => { if (!viewerRef.current) return; if (!document.fullscreenElement) { await viewerRef.current.requestFullscreen?.(); setFullscreen(true); } else { await document.exitFullscreen?.(); setFullscreen(false); } };

  if (!opened) return <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-slate-50 p-6 sm:p-10">
    <p className="text-center font-semibold text-slate-800">Your purchase includes secure online reading and PDF download.</p>
    <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
      <Button className="h-12 flex-1" onClick={openReader}>Read book online</Button>
      <Button className="h-12 flex-1" variant="outline" onClick={downloadPdf} disabled={downloading}><Download className="mr-2 h-4 w-4" />{downloading ? 'Preparing…' : 'Download as PDF book'}</Button>
    </div>
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>;

  if (loading) return <div className="flex min-h-[420px] items-center justify-center rounded-xl bg-slate-100"><Loader2 className="mr-2 animate-spin" /> Opening your book…</div>;
  if (error && !readerUrl) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"><p className="font-semibold">Could not open this book</p><p className="mt-1 text-sm">{error}</p><Button className="mt-4" onClick={openReader}>Try again</Button></div>;

  return <div ref={viewerRef} className={`overflow-hidden rounded-xl border bg-slate-900 text-white shadow-xl ${fullscreen ? 'flex min-h-screen flex-col' : ''}`}>
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950 px-3 py-2">
      <div className="min-w-0 truncate font-medium">{title}</div>
      <div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setZoom(Math.max(.75, Number((zoom - .15).toFixed(2))))} aria-label="Zoom out"><Minus /></Button><span className="w-12 text-center text-xs">{Math.round(zoom * 100)}%</span><Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setZoom(Math.min(2.5, Number((zoom + .15).toFixed(2))))} aria-label="Zoom in"><Plus /></Button><Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}>{fullscreen ? <X /> : <Expand />}</Button></div>
    </div>
    {error && <div className="bg-amber-50 px-4 py-2 text-sm text-amber-900">{error}</div>}
    <div className={`flex flex-1 items-center justify-center overflow-auto p-3 sm:p-6 ${fullscreen ? 'min-h-0' : 'min-h-[520px]'}`}><div className={`relative origin-center rounded bg-white shadow-2xl transition-transform duration-300 ${turning ? 'rotate-y-90 opacity-70' : 'rotate-y-0 opacity-100'}`} style={{ perspective: '1400px' }}><canvas ref={canvasRef} className="block max-w-full" />{rendering && <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-slate-700"><Loader2 className="animate-spin" /></div>}</div></div>
    <div className="flex items-center justify-center gap-4 border-t border-white/10 bg-slate-950 px-3 py-3"><Button variant="ghost" className="text-white hover:bg-white/10" disabled={page <= 1} onClick={() => changePage(page - 1)} aria-label="Previous page"><ChevronLeft /> Previous</Button><span className="min-w-20 text-center text-sm">Page {page} / {pageCount || '—'}</span><Button variant="ghost" className="text-white hover:bg-white/10" disabled={page >= pageCount} onClick={() => changePage(page + 1)} aria-label="Next page">Next <ChevronRight /></Button></div>
  </div>;
}
