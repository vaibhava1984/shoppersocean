'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, Maximize2, Minus, Plus, RotateCcw, X, Volume2 } from 'lucide-react';

interface FlipbookReaderProps {
  pdfUrl: string;
  fileName?: string;
}

type PdfPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
  cleanup?: () => void;
};

type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
  destroy?: () => Promise<void>;
};

type PdfJs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: { url: string; disableAutoFetch?: boolean; disableStream?: boolean }) => { promise: Promise<PdfDocument> };
};

declare global {
  interface Window { pdfjsLib?: PdfJs; }
}

const PDFJS_VERSION = '3.11.174';
const PDFJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/pdf.worker.min.js';
const PAGE_TURN_SOUND = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Turning_a_page.ogg';
const INACTIVITY_LIMIT = 10 * 60 * 1000;

function loadPdfJs(): Promise<PdfJs> {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-shoppers-ocean-pdfjs]');
    if (existing) {
      existing.addEventListener('load', () => window.pdfjsLib ? resolve(window.pdfjsLib) : reject(new Error('PDF viewer failed to initialize')), { once: true });
      existing.addEventListener('error', () => reject(new Error('Could not load PDF viewer')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = PDFJS_SRC;
    script.async = true;
    script.setAttribute('data-shoppers-ocean-pdfjs', 'true');
    script.onload = () => window.pdfjsLib ? resolve(window.pdfjsLib) : reject(new Error('PDF viewer failed to initialize'));
    script.onerror = () => reject(new Error('Could not load PDF viewer'));
    document.head.appendChild(script);
  });
}

export default function FlipbookReader({ pdfUrl, fileName }: FlipbookReaderProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PdfDocument | null>(null);
  const renderTokenRef = useRef(0);
  const pageRef = useRef(1);
  const lastActivityRef = useRef(Date.now());
  const inactivityTimerRef = useRef<number | null>(null);

  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [turning, setTurning] = useState<'next' | 'prev' | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  const playPageTurn = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!soundRef.current) {
        soundRef.current = new Audio(PAGE_TURN_SOUND);
        soundRef.current.preload = 'auto';
        soundRef.current.volume = 0.78;
      }
      soundRef.current.currentTime = 0;
      void soundRef.current.play().catch(() => {});
    } catch {}
  }, [soundEnabled]);

  useEffect(() => () => { soundRef.current?.pause(); soundRef.current = null; }, []);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    const storageKey = 'shoppers-ocean-reader-state:' + pdfUrl;

    const persistState = () => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({
          page: pageRef.current,
          lastActivity: lastActivityRef.current,
        }));
      } catch {}
    };

    const closeIfInactive = () => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_LIMIT) {
        try { sessionStorage.removeItem(storageKey); } catch {}
        router.replace('/');
        return;
      }
      inactivityTimerRef.current = window.setTimeout(closeIfInactive, INACTIVITY_LIMIT - elapsed);
    };

    const markActive = () => {
      lastActivityRef.current = Date.now();
      persistState();
      if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = window.setTimeout(closeIfInactive, INACTIVITY_LIMIT);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        persistState();
        if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
        return;
      }

      // Backgrounding the browser must pause the inactivity countdown.
      // Do not count time spent outside the reader as reading inactivity.
      lastActivityRef.current = Date.now();
      persistState();
      if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = window.setTimeout(closeIfInactive, INACTIVITY_LIMIT);
    };

    const onPageHide = () => {
      persistState();
    };

    let restored = false;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as { page?: number; lastActivity?: number } | null;
      if (saved?.lastActivity && Date.now() - saved.lastActivity < INACTIVITY_LIMIT && Number.isFinite(saved.page) && saved.page >= 1) {
        pageRef.current = saved.page;
        setPage(saved.page);
        setPageInput(String(saved.page));
        lastActivityRef.current = saved.lastActivity;
        restored = true;
      } else if (saved) {
        sessionStorage.removeItem(storageKey);
      }
    } catch {}

    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'wheel'];
    events.forEach(event => window.addEventListener(event, markActive, { passive: true }));
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);

    if (restored) {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_LIMIT) {
        try { sessionStorage.removeItem(storageKey); } catch {}
        router.replace('/');
      } else {
        inactivityTimerRef.current = window.setTimeout(closeIfInactive, INACTIVITY_LIMIT - elapsed);
      }
    } else {
      markActive();
    }

    return () => {
      persistState();
      events.forEach(event => window.removeEventListener(event, markActive));
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
    };
  }, [pdfUrl, router]);

  const renderPage = useCallback(async (documentProxy: PdfDocument, pageNumber: number, canvas: HTMLCanvasElement) => {
    const pageProxy = await documentProxy.getPage(pageNumber);
    const base = pageProxy.getViewport({ scale: 1 });

    // Fill the available reader width. The previous 68% height / 960px
    // ceiling made the rendered book unnecessarily small on mobile.
    const maxWidth = Math.max(320, window.innerWidth - 32);
    const maxHeight = Math.max(500, Math.min(window.innerHeight * (fullscreen ? 0.92 : 0.85), fullscreen ? 1200 : 1000));
    const widthScale = maxWidth / base.width;
    const heightScale = maxHeight / base.height;
    const isMobileOrTablet = window.innerWidth < 1024;
    const fitScale = isMobileOrTablet ? widthScale : Math.min(widthScale, heightScale);
    const scale = fitScale * zoom;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const viewport = pageProxy.getViewport({ scale });
    const width = Math.ceil(viewport.width);
    const height = Math.ceil(viewport.height);
    setPageSize({ width, height });

    canvas.width = Math.ceil(width * dpr);
    canvas.height = Math.ceil(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not create page canvas');
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    await pageProxy.render({ canvasContext: context, viewport }).promise;
    pageProxy.cleanup?.();
  }, [fullscreen, zoom]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const pdfjs = await loadPdfJs();
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        const documentProxy = await pdfjs.getDocument({
          url: pdfUrl,
          disableAutoFetch: true,
          disableStream: false,
        }).promise;
        if (cancelled) {
          await documentProxy.destroy?.();
          return;
        }
        pdfRef.current = documentProxy;
        setPdf(documentProxy);
      } catch (err) {
        console.error('Flipbook PDF load failed:', err);
        if (!cancelled) setError('This book could not be opened as a flipbook. Please try opening it again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
      void pdfRef.current?.destroy?.();
      pdfRef.current = null;
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;
    const token = ++renderTokenRef.current;

    async function showPage() {
      try {
        setRendering(true);
        const target = Math.min(Math.max(page, 1), pdf.numPages);
        await renderPage(pdf, target, canvasRef.current!);
      } catch (err) {
        console.error('Flipbook page render failed:', err);
        if (!cancelled) setError('This page could not be rendered.');
      } finally {
        if (!cancelled && token === renderTokenRef.current) setRendering(false);
      }
    }

    void showPage();
    return () => { cancelled = true; };
  }, [pdf, page, renderPage]);

  const goToPage = useCallback(async (target: number) => {
    if (!pdf || rendering || turning || !canvasRef.current) return;
    const targetPage = Math.min(Math.max(Math.round(target), 1), pdf.numPages);
    if (targetPage === page) return;

    const direction = targetPage > page ? 'next' : 'prev';
    const token = ++renderTokenRef.current;

    try {
      setRendering(true);
      setTurning(direction);
      playPageTurn();

      await new Promise<void>(resolve => window.setTimeout(resolve, 140));
      if (token !== renderTokenRef.current) return;
      await renderPage(pdf, targetPage, canvasRef.current);
      if (token !== renderTokenRef.current) return;

      setPage(targetPage);
      setPageInput(String(targetPage));
      await new Promise<void>(resolve => window.setTimeout(resolve, 140));
      if (token !== renderTokenRef.current) return;
      setTurning(null);
    } catch (err) {
      console.error('Flipbook page turn failed:', err);
      setError('The page could not be rendered. Please try again.');
      setTurning(null);
    } finally {
      if (token === renderTokenRef.current) setRendering(false);
    }
  }, [pdf, page, rendering, turning, renderPage, playPageTurn]);

  useEffect(() => setPageInput(String(page)), [page]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') void goToPage(page + 1);
      if (event.key === 'ArrowLeft') void goToPage(page - 1);
      if (event.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToPage, page]);

  useEffect(() => {
    const onResize = () => {
      if (!pdf || !canvasRef.current || rendering) return;
      void renderPage(pdf, page, canvasRef.current);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pdf, page, renderPage, rendering]);

  const commitPageInput = () => {
    const requested = Number.parseInt(pageInput, 10);
    if (!Number.isFinite(requested)) {
      setPageInput(String(page));
      return;
    }
    void goToPage(requested);
  };

  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX === null || turning || rendering) return;
    setDragX(Math.max(-160, Math.min(160, event.clientX - dragStartX)));
  };

  const pointerUp = async () => {
    if (dragStartX === null) return;
    const distance = dragX;
    setDragStartX(null);
    setDragX(0);
    if (Math.abs(distance) < Math.min(90, window.innerWidth * 0.20)) return;
    if (distance < 0) await goToPage(page + 1);
    else await goToPage(page - 1);
  };

  return (
    <div className={fullscreen ? 'fixed inset-0 z-[100] bg-[#0b1020] p-0 sm:p-3' : 'w-full'}>
      <div className="mx-auto flex h-full min-h-[72vh] max-w-7xl flex-col overflow-hidden rounded-none bg-[#111827] shadow-2xl sm:min-h-[680px] sm:rounded-2xl">
        <header className="relative z-40 flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#111827]/95 px-3 py-2.5 text-white backdrop-blur sm:px-5 sm:py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-wide sm:text-base">{fileName || 'Book'}</p>
            <p className="mt-0.5 truncate text-[11px] text-white/50 sm:text-xs">Page {page}{pdf ? ' of ' + pdf.numPages : ''} · Read online</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            <button type="button" onClick={() => setZoom(value => Math.max(0.75, Number((value - 0.08).toFixed(2))))} disabled={!pdf} className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Zoom out"><Minus size={17} /></button>
            <button type="button" onClick={() => setZoom(1)} disabled={!pdf || zoom === 1} className="hidden min-w-12 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-white/65 transition hover:bg-white/10 hover:text-white disabled:opacity-30 sm:block" aria-label="Reset zoom">{Math.round(zoom * 100)}%</button>
            <button type="button" onClick={() => setZoom(value => Math.min(1.55, Number((value + 0.08).toFixed(2))))} disabled={!pdf} className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Zoom in"><Plus size={17} /></button>
            <button type="button" onClick={() => setSoundEnabled(value => !value)} className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label={soundEnabled ? 'Mute page turn sound' : 'Enable page turn sound'}><Volume2 size={17} className={soundEnabled ? '' : 'opacity-30'} /></button>
            <button type="button" onClick={() => setFullscreen(value => !value)} className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label={fullscreen ? 'Close full screen' : 'Open full screen'}>{fullscreen ? <X size={18} /> : <Maximize2 size={18} />}</button>
          </div>
        </header>

        <main
          className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_center,#243247_0,#111827_68%)] px-2 py-4 sm:px-6 sm:py-7"
          style={{ touchAction: zoom > 1 ? 'pan-x pan-y' : 'pan-y' }}
          onPointerDown={event => {
            if (event.pointerType !== 'mouse' || event.button === 0) {
              event.currentTarget.setPointerCapture?.(event.pointerId);
              setDragStartX(event.clientX);
            }
          }}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={() => { setDragStartX(null); setDragX(0); }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center sm:top-5">
            <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-medium tracking-wide text-white/55 backdrop-blur">SWIPE OR USE THE ARROWS TO TURN PAGES</div>
          </div>

          <div className="relative flex shrink-0 items-center justify-center" style={{ width: pageSize.width || 'auto', height: pageSize.height || 'auto' }} aria-label={'Interactive book, page ' + page + ' of ' + (pdf?.numPages || 0)}>
            <div
              className="relative overflow-visible rounded-sm bg-white shadow-[0_22px_70px_rgba(0,0,0,0.48)]"
              style={{ transform: 'translateX(' + (dragX * 0.12) + 'px) rotateY(' + (dragX * -0.035) + 'deg)', transition: turning ? 'transform 180ms cubic-bezier(.22,.61,.36,1)' : 'none', willChange: 'transform' }}
            >
              <canvas ref={canvasRef} className="block shrink-0 select-none" draggable={false} />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent" />
            </div>
          </div>

          {pdf && !error && !loading && (
            <>
              <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => void goToPage(page - 1)} disabled={page <= 1 || rendering || !!turning} className="absolute left-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-black/65 disabled:pointer-events-none disabled:opacity-15 sm:left-5 sm:h-12 sm:w-12" aria-label="Previous page"><ChevronLeft size={25} /></button>
              <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => void goToPage(page + 1)} disabled={page >= pdf.numPages || rendering || !!turning} className="absolute right-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-black/65 disabled:pointer-events-none disabled:opacity-15 sm:right-5 sm:h-12 sm:w-12" aria-label="Next page"><ChevronRight size={25} /></button>
            </>
          )}

          {(loading || rendering) && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#111827]/90 text-white backdrop-blur-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><Loader2 className="animate-spin" size={30} /></div>
              <span className="text-sm text-white/75">{loading ? 'Opening your book…' : 'Turning page…'}</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-6 text-center text-white">
              <div className="max-w-md rounded-2xl border border-white/10 bg-white/10 p-7 shadow-xl backdrop-blur-md"><p className="text-sm leading-6 text-white/80">{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900"><RotateCcw size={15} /> Try again</button></div>
            </div>
          )}
        </main>

        {pdf && !error && (
          <footer className="relative z-40 shrink-0 border-t border-white/10 bg-[#111827]/95 px-3 py-2.5 text-white backdrop-blur sm:px-5 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button type="button" onClick={() => void goToPage(page - 1)} disabled={page <= 1 || rendering || !!turning} className="hidden shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 text-white/75 transition hover:bg-white/10 disabled:opacity-25 sm:block" aria-label="Previous page"><ChevronLeft size={18} /></button>
              <input type="range" min={1} max={pdf.numPages} step={1} value={page} onChange={event => void goToPage(Number(event.target.value))} className="h-1.5 min-w-0 flex-1 cursor-pointer accent-white" aria-label="Jump to page" />
              <button type="button" onClick={() => void goToPage(page + 1)} disabled={page >= pdf.numPages || rendering || !!turning} className="hidden shrink-0 rounded-lg border border-white/10 bg-white/5 p-2 text-white/75 transition hover:bg-white/10 disabled:opacity-25 sm:block" aria-label="Next page"><ChevronRight size={18} /></button>
              <div className="flex shrink-0 items-center gap-1.5 text-xs text-white/60">
                <input type="number" min={1} max={pdf.numPages} value={pageInput} onChange={event => setPageInput(event.target.value)} onBlur={commitPageInput} onKeyDown={event => { if (event.key === 'Enter') commitPageInput(); }} className="w-12 rounded-md border border-white/15 bg-white/5 px-1.5 py-1.5 text-center text-xs text-white outline-none focus:border-white/40" aria-label="Page number" />
                <span>/ {pdf.numPages}</span>
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] tracking-wide text-white/35 sm:hidden">Swipe left/right to turn pages</p>
          </footer>
        )}
      </div>
    </div>
  );
}
