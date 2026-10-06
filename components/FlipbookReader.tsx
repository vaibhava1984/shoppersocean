'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  Volume2,
  ZoomIn,
  ZoomOut,
  X,
} from 'lucide-react';

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
  interface Window {
    pdfjsLib?: PdfJs;
  }
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
  const soundRef = useRef<HTMLAudioElement | null>(null);

  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [turning, setTurning] = useState<'next' | 'prev' | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);

  const playPageTurn = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!soundRef.current) {
        soundRef.current = new Audio(PAGE_TURN_SOUND);
        soundRef.current.preload = 'auto';
        soundRef.current.volume = 0.55;
      }
      soundRef.current.currentTime = 0;
      void soundRef.current.play().catch(() => {});
    } catch {}
  }, [soundEnabled]);

  useEffect(() => () => {
    soundRef.current?.pause();
    soundRef.current = null;
  }, []);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // Keep the book open while the reader is actively reading. Leaving the
  // browser/app pauses no timer reset; returning after 10 minutes closes it.
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
      if (!document.hidden) {
        closeIfInactive();
      } else {
        persistState();
        if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
      }
    };

    const onPageHide = () => persistState();

    let restored = false;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null') as {
        page?: number;
        lastActivity?: number;
      } | null;

      if (
        saved?.lastActivity &&
        Date.now() - saved.lastActivity < INACTIVITY_LIMIT &&
        Number.isFinite(saved.page) &&
        saved.page >= 1
      ) {
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
      closeIfInactive();
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

  const renderPage = useCallback(async (
    documentProxy: PdfDocument,
    pageNumber: number,
    canvas: HTMLCanvasElement,
  ) => {
    const pageProxy = await documentProxy.getPage(pageNumber);
    const base = pageProxy.getViewport({ scale: 1 });

    const chromeWidth = fullscreen ? 30 : 24;
    const chromeHeight = fullscreen ? 170 : 190;
    const maxWidth = Math.max(280, Math.min(window.innerWidth - chromeWidth, 980));
    const maxHeight = Math.max(420, Math.min(window.innerHeight - chromeHeight, 1280));
    const widthScale = maxWidth / base.width;
    const heightScale = maxHeight / base.height;
    const fitScale = Math.min(widthScale, heightScale);
    const scale = fitScale * zoom;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
        if (!cancelled) setError('This book could not be opened. Please try opening it again.');
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
        await renderPage(pdf, Math.min(Math.max(page, 1), pdf.numPages), canvasRef.current!);
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

      await new Promise<void>(resolve => window.setTimeout(resolve, 80));
      if (token !== renderTokenRef.current) return;

      await renderPage(pdf, targetPage, canvasRef.current);
      if (token !== renderTokenRef.current) return;

      setPage(targetPage);
      setPageInput(String(targetPage));

      await new Promise<void>(resolve => window.setTimeout(resolve, 170));
      if (token === renderTokenRef.current) setTurning(null);
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
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        event.preventDefault();
        void goToPage(page + 1);
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        void goToPage(page - 1);
      }
      if (event.key === 'Escape') setFullscreen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goToPage, page]);

  useEffect(() => {
    const onResize = () => {
      if (!pdf || !canvasRef.current) return;
      void renderPage(pdf, page, canvasRef.current);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pdf, page, renderPage]);

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
    setDragX(Math.max(-140, Math.min(140, event.clientX - dragStartX)));
  };

  const pointerUp = async () => {
    if (dragStartX === null) return;

    const distance = dragX;
    setDragStartX(null);
    setDragX(0);

    if (Math.abs(distance) < Math.min(70, window.innerWidth * 0.16)) return;

    if (distance < 0) await goToPage(page + 1);
    else await goToPage(page - 1);
  };

  const zoomOut = () => setZoom(value => Math.max(0.82, Number((value - 0.10).toFixed(2))));
  const zoomIn = () => setZoom(value => Math.min(1.45, Number((value + 0.10).toFixed(2))));

  return (
    <div data-flipbook-reader="true" className={fullscreen ? 'fixed inset-0 z-[100] bg-[#151515]' : 'w-full'}>
      <div className={fullscreen ? 'flex h-full w-full flex-col bg-[#151515]' : 'mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-[#151515] shadow-2xl'}>
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#202020] px-3 text-white sm:h-14 sm:px-5">
          <div className="min-w-0 pr-3">
            <p className="truncate text-xs font-semibold tracking-wide sm:text-sm">{fileName || 'Book'}</p>
            <p className="hidden text-[10px] text-white/45 sm:block">Shoppers Ocean • Online Reader</p>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= 0.82}
              className="rounded-md p-2 text-white/80 transition hover:bg-white/10 disabled:opacity-30"
              aria-label="Zoom out"
            >
              <ZoomOut size={17} />
            </button>
            <span className="hidden min-w-12 text-center text-[11px] text-white/50 sm:block">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= 1.45}
              className="rounded-md p-2 text-white/80 transition hover:bg-white/10 disabled:opacity-30"
              aria-label="Zoom in"
            >
              <ZoomIn size={17} />
            </button>
            <button
              type="button"
              onClick={() => setSoundEnabled(value => !value)}
              className="rounded-md p-2 text-white/80 transition hover:bg-white/10"
              aria-label={soundEnabled ? 'Mute page turn sound' : 'Enable page turn sound'}
            >
              <Volume2 size={17} className={soundEnabled ? 'text-white' : 'text-white/30'} />
            </button>
            <button
              type="button"
              onClick={() => setFullscreen(value => !value)}
              className="rounded-md p-2 text-white/80 transition hover:bg-white/10"
              aria-label={fullscreen ? 'Exit full screen' : 'Open full screen'}
            >
              {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
          </div>
        </div>

        <div
          className="relative flex min-h-[58vh] flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_center,#3b3b3b_0%,#252525_48%,#171717_100%)] px-3 py-4 sm:min-h-[68vh] sm:px-8 sm:py-6"
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
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 opacity-25"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,.45), transparent)' }}
          />

          <div
            className="relative flex shrink-0 items-center justify-center"
            style={{ width: pageSize.width || 'auto', height: pageSize.height || 'auto' }}
            aria-label={'Interactive book, page ' + page + ' of ' + (pdf?.numPages || 0)}
          >
            <div
              className="relative bg-white"
              style={{
                transform: 'translateX(' + (dragX * 0.08) + 'px) rotateY(' + (dragX * 0.025) + 'deg)',
                transformOrigin: dragX < 0 ? 'left center' : 'right center',
                transition: turning ? 'transform 220ms cubic-bezier(.22,.61,.36,1)' : 'transform 70ms ease-out',
                boxShadow: '0 20px 55px rgba(0,0,0,.52), 0 3px 10px rgba(0,0,0,.30)',
                willChange: 'transform',
              }}
            >
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[10px] opacity-40"
                style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.22), transparent)' }}
              />
              <canvas ref={canvasRef} className="block shrink-0 select-none" draggable={false} />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-8 opacity-25"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,.16), transparent)' }}
              />
            </div>
          </div>

          {pdf && !error && !loading && (
            <>
              <button
                type="button"
                onPointerDown={event => event.stopPropagation()}
                onClick={() => void goToPage(page - 1)}
                disabled={page <= 1 || rendering || !!turning}
                className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65 disabled:opacity-15 sm:left-5 sm:h-11 sm:w-11"
                aria-label="Previous page"
              >
                <ChevronLeft size={23} />
              </button>
              <button
                type="button"
                onPointerDown={event => event.stopPropagation()}
                onClick={() => void goToPage(page + 1)}
                disabled={page >= pdf.numPages || rendering || !!turning}
                className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65 disabled:opacity-15 sm:right-5 sm:h-11 sm:w-11"
                aria-label="Next page"
              >
                <ChevronRight size={23} />
              </button>
            </>
          )}

          {(loading || rendering) && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-[#1b1b1b]/90 text-white backdrop-blur-[2px]">
              <Loader2 className="animate-spin" size={30} />
              <span className="text-sm text-white/75">{loading ? 'Opening your book…' : 'Turning page…'}</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-6 text-center text-white">
              <div className="max-w-md rounded-xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur-md">
                <p className="text-sm text-white/85">{error}</p>
              </div>
            </div>
          )}
        </div>

        {pdf && !error && (
          <div className="shrink-0 border-t border-white/10 bg-[#202020] px-3 pb-2 pt-2 text-white sm:px-5 sm:pb-3">
            <div className="mx-auto flex max-w-4xl items-center gap-2">
              <button
                type="button"
                onClick={() => void goToPage(page - 1)}
                disabled={page <= 1 || rendering || !!turning}
                className="rounded-md p-1 text-white/65 hover:bg-white/10 disabled:opacity-20"
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>

              <input
                type="range"
                min={1}
                max={pdf.numPages}
                step={1}
                value={page}
                onChange={event => void goToPage(Number(event.target.value))}
                className="h-1.5 w-full cursor-pointer accent-white"
                aria-label="Jump to page"
              />

              <button
                type="button"
                onClick={() => void goToPage(page + 1)}
                disabled={page >= pdf.numPages || rendering || !!turning}
                className="rounded-md p-1 text-white/65 hover:bg-white/10 disabled:opacity-20"
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>

              <div className="ml-1 flex shrink-0 items-center gap-1 text-[11px] text-white/55">
                <input
                  type="number"
                  min={1}
                  max={pdf.numPages}
                  value={pageInput}
                  onChange={event => setPageInput(event.target.value)}
                  onBlur={commitPageInput}
                  onKeyDown={event => { if (event.key === 'Enter') commitPageInput(); }}
                  className="w-10 rounded border border-white/15 bg-white/5 px-1 py-1 text-center text-[11px] text-white outline-none focus:border-white/40"
                  aria-label="Page number"
                />
                <span>/ {pdf.numPages}</span>
              </div>
            </div>

            <div className="mt-1 text-center text-[9px] tracking-wide text-white/25 sm:text-[10px]">
              Swipe or use the arrows to turn pages
            </div>
          </div>
        )}

        {fullscreen && (
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-3 top-16 z-[110] rounded-full bg-black/50 p-2 text-white/70 hover:bg-black/70 sm:hidden"
            aria-label="Close reader"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
