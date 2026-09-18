'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Download, Loader2, Minus, Plus, X } from 'lucide-react';
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
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const pageFrameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const renderQueueRef = useRef<Promise<void>>(Promise.resolve());
  const renderRequestRef = useRef(0);
  const touchStartXRef = useRef<number | null>(null);
  const pageTurnAudioRef = useRef<HTMLAudioElement | null>(null);
  const dragStartXRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [readerUrl, setReaderUrl] = useState('');
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');
  const [turning, setTurning] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const [sliderPreviewPage, setSliderPreviewPage] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);
  const turnTimerRef = useRef<number | null>(null);

  const playPageTurnSound = useCallback(() => {
    try {
      const audio = pageTurnAudioRef.current ?? new Audio('https://cdn.freesound.org/previews/484/484940_6150892-hq.mp3');
      pageTurnAudioRef.current = audio;
      audio.currentTime = 0;
      audio.volume = 0.82;
      void audio.play();
    } catch {}
  }, []);

  const downloadPdf = async () => {
    if (downloading) return;
    setDownloading(true); setError('');
    try {
      const response = await fetch('/api/get-book-download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Download unavailable');
      const pdfFile = data.urls?.find((file: any) => String(file.fileType).toLowerCase() === 'pdf' || String(file.fileName).toLowerCase().endsWith('.pdf'));
      if (!pdfFile?.downloadUrl) throw new Error('PDF book not found');
      const link = document.createElement('a'); link.href = pdfFile.downloadUrl; link.download = pdfFile.fileName || `${title}.pdf`;
      document.body.appendChild(link); link.click(); link.remove();
    } catch (err: any) { setError(err?.message || 'Download failed'); }
    finally { setDownloading(false); }
  };

  const openReader = async () => {
    if (loading) return;
    setOpened(true); setLoading(true); setError(''); setReaderUrl('');
    try {
      const response = await fetch('/api/get-book-reader', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId }) });
      const data = await response.json();
      if (!response.ok || !data.readerUrl) throw new Error(data.error || 'Unable to open book');
      setReaderUrl(data.readerUrl);
    } catch (err: any) { setError(err?.message || 'Unable to open book'); }
    finally { setLoading(false); }
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
        pdfRef.current = pdf; setPageCount(pdf.numPages); setPage(1);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Unable to load the purchased book');
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [readerUrl]);

  const cancelRender = useCallback(async () => {
    const task = renderTaskRef.current;
    if (!task) return;
    try { task.cancel(); await task.promise; } catch {}
    renderTaskRef.current = null;
  }, []);

  const renderCanvasPage = useCallback(async (targetPage: number, canvas: HTMLCanvasElement, showLoading = false) => {
    const pdf = pdfRef.current; const frame = pageFrameRef.current;
    if (!pdf || !canvas || !frame) return;

    if (!showLoading) {
      try {
        const pdfPage = await pdf.getPage(targetPage);
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const availableWidth = Math.max(180, frame.clientWidth - 4);
        const availableHeight = Math.max(260, frame.clientHeight - 4);
        const fitScale = Math.min(availableWidth / baseViewport.width, availableHeight / baseViewport.height);
        const scale = Math.max(0.1, fitScale * zoom);
        const viewport = pdfPage.getViewport({ scale });
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.ceil(viewport.width * ratio); canvas.height = Math.ceil(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
        canvas.style.maxWidth = '100%'; canvas.style.maxHeight = '100%';
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas unavailable');
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        await pdfPage.render({ canvasContext: context, viewport }).promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') setError(err?.message || 'Unable to render this page');
      }
      return;
    }

    const requestId = ++renderRequestRef.current;
    const previousRender = renderQueueRef.current;
    const run = async () => {
      await previousRender;
      if (requestId !== renderRequestRef.current) return;
      await cancelRender();
      setRendering(true);
      try {
        const currentPdf = pdfRef.current;
        if (!currentPdf) return;
        const pdfPage = await currentPdf.getPage(targetPage);
        if (requestId !== renderRequestRef.current) return;
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const availableWidth = Math.max(180, frame.clientWidth - 4);
        const availableHeight = Math.max(260, frame.clientHeight - 4);
        const fitScale = Math.min(availableWidth / baseViewport.width, availableHeight / baseViewport.height);
        const scale = Math.max(0.1, fitScale * zoom);
        const viewport = pdfPage.getViewport({ scale });
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.ceil(viewport.width * ratio); canvas.height = Math.ceil(viewport.height * ratio);
        canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
        canvas.style.maxWidth = '100%'; canvas.style.maxHeight = '100%';
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas unavailable');
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const task = pdfPage.render({ canvasContext: context, viewport });
        renderTaskRef.current = task;
        await task.promise;
        if (renderTaskRef.current === task) renderTaskRef.current = null;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') setError(err?.message || 'Unable to render this page');
      } finally {
        if (renderTaskRef.current && requestId === renderRequestRef.current) renderTaskRef.current = null;
        if (requestId === renderRequestRef.current) setRendering(false);
      }
    };
    const queued = run();
    renderQueueRef.current = queued.catch(() => {});
    await queued;
  }, [zoom, cancelRender]);

  const renderPage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await renderCanvasPage(page, canvas, true);
  }, [page, renderCanvasPage]);

  useEffect(() => { if (opened && readerUrl && pdfRef.current) void renderPage(); }, [opened, readerUrl, renderPage, pageCount]);

  useEffect(() => {
    const onResize = () => { if (opened && pdfRef.current) void renderPage(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [opened, renderPage]);

  const changePage = async (next: number) => {
    if (next < 1 || next > pageCount || turning || rendering) return;
    const destination = next > page ? 'next' : 'prev';
    const nextCanvas = nextCanvasRef.current;
    if (!nextCanvas) return;
    setDragOffset(0); setTurnDirection(destination); setTurning(true); playPageTurnSound();
    try {
      await renderCanvasPage(next, nextCanvas);
      if (turnTimerRef.current) window.clearTimeout(turnTimerRef.current);
      turnTimerRef.current = window.setTimeout(() => {
        setPage(next); setTurnDirection(null); setTurning(false); turnTimerRef.current = null;
      }, 620);
    } catch {
      setTurnDirection(null); setTurning(false);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (turning || pageCount <= 1 || (event.pointerType === 'mouse' && event.button !== 0)) return;
    dragStartXRef.current = event.clientX; dragOffsetRef.current = 0; setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null || turning) return;
    const raw = event.clientX - dragStartXRef.current;
    const maxDrag = Math.max(80, Math.min(280, event.currentTarget.clientWidth * 0.62));
    const limited = Math.max(-maxDrag, Math.min(maxDrag, raw));
    dragOffsetRef.current = limited; setDragOffset(limited);
  };
  const finishPointerDrag = () => {
    if (dragStartXRef.current === null) return;
    const offset = dragOffsetRef.current; dragStartXRef.current = null; dragOffsetRef.current = 0; setIsDragging(false);
    const threshold = Math.max(55, Math.min(140, (pageFrameRef.current?.clientWidth || 300) * 0.18));
    if (Math.abs(offset) >= threshold) changePage(offset < 0 ? page + 1 : page - 1);
    else setDragOffset(0);
  };
  const handleTouchStart = (event: React.TouchEvent) => { touchStartXRef.current = event.changedTouches[0]?.clientX ?? null; };
  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStartXRef.current; const end = event.changedTouches[0]?.clientX ?? null; touchStartXRef.current = null;
    if (start === null || end === null || Math.abs(end - start) < 45) return;
    if (dragStartXRef.current === null) changePage(end < start ? page + 1 : page - 1);
  };
  const sliderPageFromPointer = (clientX: number) => {
    if (!sliderRef.current || pageCount <= 1) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const target = Math.round(ratio * (pageCount - 1)) + 1;
    setSliderPreviewPage(target);
  };
  useEffect(() => () => { void cancelRender(); }, [cancelRender]);

  const handleSliderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation(); if (!sliderRef.current || !pageCount) return;
    setIsSliderDragging(true); setSliderPreviewPage(page); sliderRef.current.setPointerCapture?.(event.pointerId); sliderPageFromPointer(event.clientX);
  };
  const handleSliderPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation(); if (!isSliderDragging || !sliderRef.current?.hasPointerCapture(event.pointerId)) return;
    sliderPageFromPointer(event.clientX);
  };
  const handleSliderPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation(); if (!isSliderDragging) return;
    const target = sliderPreviewPage ?? page;
    setIsSliderDragging(false); setSliderPreviewPage(null);
    if (target !== page) setPage(target);
    playPageTurnSound(); sliderRef.current?.releasePointerCapture?.(event.pointerId);
  };

  if (!opened) return <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-slate-50 p-6 sm:p-10"><p className="text-center font-semibold text-slate-800">Your purchase includes secure flipbook reading and PDF download.</p><div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"><Button className="h-12 flex-1" onClick={openReader} disabled={loading}>Read online as flipbook</Button><Button className="h-12 flex-1" variant="outline" onClick={downloadPdf} disabled={downloading}>{downloading ? <><Loader2 className="mr-2 animate-spin" />Preparing…</> : <><Download className="mr-2 h-4 w-4" />Download as PDF book</>}</Button></div>{error && <p className="text-sm text-red-600">{error}</p>}</div>;
  if (loading) return <div className="flex min-h-[320px] items-center justify-center rounded-xl bg-slate-100"><Loader2 className="mr-2 animate-spin" />Opening your book…</div>;
  if (error && !readerUrl) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"><p className="font-semibold">Could not open this book</p><p className="mt-1 text-sm">{error}</p><Button className="mt-4" onClick={openReader}>Try again</Button></div>;

  const dragProgress = pageFrameRef.current?.clientWidth ? Math.max(-1, Math.min(1, dragOffset / pageFrameRef.current.clientWidth)) : 0;
  const dragAngle = dragProgress * 52;
  const flipStyle: React.CSSProperties = {
    transformOrigin: dragOffset < 0 || turnDirection === 'next' ? 'right center' : 'left center',
    transform: turning ? `translateX(${turnDirection === 'next' ? '-1.5%' : '1.5%'}) rotateY(${turnDirection === 'next' ? -178 : 178}deg) scaleX(0.985)` : dragOffset !== 0 ? `translateX(${dragOffset * 0.045}px) rotateY(${dragAngle}deg) scaleX(${1 - Math.abs(dragProgress) * 0.025})` : 'rotateY(0deg) scaleX(1)',
    transition: isDragging ? 'none' : turning ? 'transform 620ms cubic-bezier(.22,.72,.24,1), box-shadow 620ms ease' : 'transform 280ms cubic-bezier(.22,.72,.24,1), box-shadow 280ms ease',
    boxShadow: turning || dragOffset !== 0 ? '0 18px 34px rgba(15,23,42,.26)' : '0 16px 30px rgba(15,23,42,.18)',
    backfaceVisibility: 'hidden', transformStyle: 'preserve-3d', touchAction: 'pan-y',
  };
  const displayedSliderPage = sliderPreviewPage ?? page;
  const sliderPercent = pageCount > 1 ? ((displayedSliderPage - 1) / (pageCount - 1)) * 100 : 0;

  return <div ref={viewerRef} className="overflow-hidden rounded-xl border bg-slate-900 text-white shadow-xl">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-950 px-3 py-2"><div className="min-w-0 truncate font-medium">{title}</div><div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setZoom(Math.max(0.8, Number((zoom - 0.1).toFixed(2))))} aria-label="Zoom out"><Minus /></Button>
      <span className="w-12 text-center text-xs">{Math.round(zoom * 100)}%</span>
      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setZoom(Math.min(1.35, Number((zoom + 0.1).toFixed(2))))} aria-label="Zoom in"><Plus /></Button>
      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => { setOpened(false); setReaderUrl(''); setError(''); setPage(1); setPageCount(0); }} aria-label="Close flipbook"><X /></Button>
    </div></div>
    {error && <div className="bg-amber-50 px-4 py-2 text-sm text-amber-900">{error}</div>}
    <div className="relative flex h-[min(72vh,680px)] min-h-[360px] flex-1 items-center justify-center overflow-hidden p-2 sm:p-4" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div ref={pageFrameRef} className="relative flex h-full w-full max-w-[900px] items-center justify-center" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={finishPointerDrag} onPointerCancel={finishPointerDrag}>
        <div className="relative flex h-full max-h-full w-full max-w-full items-center justify-center" style={{ perspective: '1800px' }}>
          <div className="absolute inset-0 flex items-center justify-center rounded bg-white shadow-[0_16px_30px_rgba(15,23,42,0.18)]" style={{ zIndex: 0, overflow: 'hidden' }}><canvas ref={nextCanvasRef} className="block max-h-full max-w-full rounded select-none" draggable={false} /></div>
          <div className="relative flex h-full max-h-full w-full max-w-full items-center justify-center rounded bg-white shadow-2xl" style={{ ...flipStyle, zIndex: 2 }}>
            <canvas ref={canvasRef} className="block max-h-full max-w-full rounded select-none" draggable={false} />
            {turning && <div className="pointer-events-none absolute inset-y-0 right-0 w-[18%] rounded-l-[45%] bg-gradient-to-l from-black/10 via-white/10 to-transparent" style={{ opacity: 0.65 }} />}
            {rendering && <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-slate-700"><Loader2 className="animate-spin" /></div>}
            <Button variant="ghost" size="icon" className="absolute bottom-1 left-1 z-20 h-10 w-10 rounded-full bg-transparent p-0 text-slate-800 drop-shadow-[0_2px_3px_rgba(255,255,255,0.9)] hover:bg-transparent hover:text-slate-950 disabled:opacity-25" disabled={page <= 1 || turning || rendering} onPointerDown={(event) => event.stopPropagation()} onClick={() => changePage(page - 1)} aria-label="Previous page"><ArrowLeft className="h-8 w-8 stroke-[3.25]" /></Button>
            <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 z-20 h-10 w-10 rounded-full bg-transparent p-0 text-slate-800 drop-shadow-[0_2px_3px_rgba(255,255,255,0.9)] hover:bg-transparent hover:text-slate-950 disabled:opacity-25" disabled={page >= pageCount || turning || rendering} onPointerDown={(event) => event.stopPropagation()} onClick={() => changePage(page + 1)} aria-label="Next page"><ArrowRight className="h-8 w-8 stroke-[3.25]" /></Button>
            <div ref={sliderRef} className="absolute bottom-1.5 left-12 right-12 z-30 h-6 cursor-pointer touch-none select-none" onPointerDown={handleSliderPointerDown} onPointerMove={handleSliderPointerMove} onPointerUp={handleSliderPointerUp} onPointerCancel={handleSliderPointerUp}>
              <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-black/30 shadow-inner" />
              <div className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-black/65" style={{ width: `${sliderPercent}%` }} />
              <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-800 shadow-md transition-transform" style={{ left: `${sliderPercent}%`, transform: `translate(-50%, -50%) scale(${isSliderDragging ? 1.18 : 1})` }} aria-label={`Page ${page}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-center gap-3 border-t border-white/10 bg-slate-950 px-3 py-2"><span className="text-xs opacity-80">Page {page} / {pageCount || '—'}</span></div>
  </div>;
}
