'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, Maximize2, X, Volume2 } from 'lucide-react';

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
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({
          page: pageRef.current,
          lastActivity: lastActivityRef.current,
        }));
      } catch {}
      if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = window.setTimeout(closeIfInactive, INACTIVITY_LIMIT);
    };

    const onVisibilityChange = () => {
      if (!document.hidden) {
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= INACTIVITY_LIMIT) {
          try { sessionStorage.removeItem(storageKey); } catch {}
          router.replace('/');
        } else {
          if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
          inactivityTimerRef.current = window.setTimeout(closeIfInactive, INACTIVITY_LIMIT - elapsed);
        }
      }
    };

    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as { page?: number; lastActivity?: number } | null;
      if (saved?.lastActivity && Date.now() - saved.lastActivity < INACTIVITY_LIMIT && Number.isFinite(saved.page) && saved.page >= 1) {
        pageRef.current = saved.page;
        setPage(saved.page);
        setPageInput(String(saved.page));
        lastActivityRef.current = saved.lastActivity;
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch {}

    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'wheel'];
    events.forEach(event => window.addEventListener(event, markActive, { passive: true }));
    document.addEventListener('visibilitychange', onVisibilityChange);
    markActive();

    return () => {
      events.forEach(event => window.removeEventListener(event, markActive));
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
    };
  }, [pdfUrl, router]);

  const renderPage = useCallback(async (documentProxy: PdfDocument, pageNumber: number, canvas: HTMLCanvasElement) => {
    const pageProxy = await documentProxy.getPage(pageNumber);
    const base = pageProxy.getViewport({ scale: 1 });
    const maxWidth = Math.min(window.innerWidth * 0.90, fullscreen ? 1180 : 900);
    const maxHeight = Math.min(window.innerHeight * (fullscreen ? 0.68 : 0.50), fullscreen ? 700 : 500);
    const scale = Math.min(maxWidth / base.width, maxHeight / base.height) * zoom;
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

      // Only one canvas ever exists. The sheet rotates briefly, then the
      // target PDF page is rendered into that same canvas.
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
    <div className={fullscreen ? 'fixed inset-0 z-[100] bg-slate-950 p-2 sm:p-5' : 'w-full'}>
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{fileName || 'Book'}</p>
            <p className="text-xs text-white/60">Read online as flipbook</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setSoundEnabled(value => !value)} className="rounded-lg p-2 hover:bg-white/10" aria-label={soundEnabled ? 'Mute page turn sound' : 'Enable page turn sound'}>
              <Volume2 size={19} className={soundEnabled ? 'text-white' : 'text-white/35'} />
            </button>
            <button type="button" onClick={() => setZoom(value => Math.max(0.82, Number((value - 0.08).toFixed(2))))} className="rounded-lg px-2 py-1 text-sm font-semibold hover:bg-white/10" aria-label="Decrease text size">A−</button>
            <button type="button" onClick={() => setZoom(value => Math.min(1.18, Number((value + 0.08).toFixed(2))))} className="rounded-lg px-2 py-1 text-sm font-semibold hover:bg-white/10" aria-label="Increase text size">A+</button>
            <button type="button" onClick={() => setFullscreen(value => !value)} className="rounded-lg p-2 hover:bg-white/10" aria-label={fullscreen ? 'Close full screen' : 'Open full screen'}>
              {fullscreen ? <X size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>

        <div
          className="relative flex min-h-[55vh] flex-1 items-center justify-center overflow-auto bg-slate-800 p-3 sm:p-6"
          style={{ touchAction: 'pan-y' }}
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
          <div className="relative flex shrink-0 items-center justify-center" style={{ width: pageSize.width || 'auto', height: pageSize.height || 'auto' }} aria-label={'Interactive book, page ' + page + ' of ' + (pdf?.numPages || 0)}>
            <div
              className="relative flex shrink-0 items-center justify-center overflow-visible rounded-[3px] bg-white shadow-[0_18px_55px_rgba(0,0,0,0.34)]"
            >
              <div
                className="relative z-10 origin-center bg-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                style={{
                  transform: 'translateX(' + (dragX * 0.10) + 'px)',
                  transition: turning ? 'transform 180ms cubic-bezier(.22,.61,.36,1)' : 'none',
                  willChange: 'transform',
                }}
              >
                <canvas ref={canvasRef} className="block shrink-0 select-none" draggable={false} />
              </div>
            </div>
          </div>

          {pdf && !error && !loading && (
            <>
              <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => void goToPage(page - 1)} disabled={page <= 1 || rendering || !!turning} className="absolute bottom-2 left-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-15" aria-label="Previous page">
                <ChevronLeft size={20} strokeWidth={2.2} />
              </button>
              <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => void goToPage(page + 1)} disabled={page >= pdf.numPages || rendering || !!turning} className="absolute bottom-2 right-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-15" aria-label="Next page">
                <ChevronRight size={20} strokeWidth={2.2} />
              </button>
            </>
          )}

          {(loading || rendering) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-800/90 text-white">
              <Loader2 className="animate-spin" size={32} />
              <span>{loading ? 'Opening your book…' : 'Loading page…'}</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white">
              <div className="max-w-md rounded-xl bg-white/10 p-6 backdrop-blur"><p>{error}</p></div>
            </div>
          )}
        </div>

        {pdf && !error && (
          <div className="border-t border-white/10 px-4 pt-3 text-white">
            <div className="flex items-center gap-3">
              <span className="w-10 text-right text-xs text-white/60">1</span>
              <input type="range" min={1} max={pdf.numPages} step={1} value={page} onChange={event => void goToPage(Number(event.target.value))} className="h-2 w-full cursor-pointer accent-white" aria-label="Jump to page" />
              <span className="w-10 text-xs text-white/60">{pdf.numPages}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 py-3">
              <span className="text-sm text-white/80">Page</span>
              <input type="number" min={1} max={pdf.numPages} value={pageInput} onChange={event => setPageInput(event.target.value)} onBlur={commitPageInput} onKeyDown={event => { if (event.key === 'Enter') commitPageInput(); }} className="w-16 rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-center text-sm text-white outline-none focus:border-white/50" aria-label="Page number" />
              <span className="text-sm text-white/70">of {pdf.numPages}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
