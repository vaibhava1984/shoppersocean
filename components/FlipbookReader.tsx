'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  interface Window {
    pdfjsLib?: PdfJs;
  }
}

const PDFJS_VERSION = '3.11.174';
const PDFJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/pdf.min.js';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/pdf.worker.min.js';
const PAGE_TURN_SOUND = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Turning_a_page.ogg';

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
  const bookHostRef = useRef<HTMLDivElement>(null);
  const currentCanvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PdfDocument | null>(null);
  const renderTokenRef = useRef(0);
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [turning, setTurning] = useState<'next' | 'prev' | null>(null);
  const [nextReady, setNextReady] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const dragStartXRef = useRef<number | null>(null);
  const dragXRef = useRef(0);
  const draggingRef = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [dragAngle, setDragAngle] = useState(0);
  const [dragDirection, setDragDirection] = useState<'next' | 'prev' | null>(null);
  const [settling, setSettling] = useState(false);
  const [zoom, setZoom] = useState(1);

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

  const renderPage = useCallback(async (documentProxy: PdfDocument, pageNumber: number, canvas: HTMLCanvasElement) => {
    const pageProxy = await documentProxy.getPage(pageNumber);
    const base = pageProxy.getViewport({ scale: 1 });
    // The reader is intentionally single-page. The second canvas is only a
    // hidden/preloaded destination for the page-turn animation; it must never
    // be laid out as a visible second page.
    const maxWidth = Math.min(window.innerWidth * 0.90, fullscreen ? 1180 : 900);
    const maxHeight = Math.min(window.innerHeight * (fullscreen ? 0.68 : 0.58), fullscreen ? 700 : 560);
    const scale = Math.min(maxWidth / base.width, maxHeight / base.height) * zoom;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const viewport = pageProxy.getViewport({ scale });
    const width = Math.ceil(viewport.width);
    const height = Math.ceil(viewport.height);

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

  const preparePage = useCallback(async (pageNumber: number, canvas: HTMLCanvasElement) => {
    if (!pdf || pageNumber < 1 || pageNumber > pdf.numPages) return false;
    await renderPage(pdf, pageNumber, canvas);
    return true;
  }, [pdf, renderPage]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setPdf(null);
        setPage(1);
        setNextReady(false);
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
        if (!cancelled) setError('This book could not be opened as a flipbook. Please try opening the book again.');
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
    if (!pdf || !currentCanvasRef.current) return;
    let cancelled = false;
    const token = ++renderTokenRef.current;
    async function showFirstPage() {
      try {
        setRendering(true);
        setNextReady(false);
        await preparePage(1, currentCanvasRef.current!);
        if (cancelled || token !== renderTokenRef.current) return;
        if (pdf.numPages > 1 && nextCanvasRef.current) {
          await preparePage(2, nextCanvasRef.current);
          if (!cancelled && token === renderTokenRef.current) setNextReady(true);
        }
      } catch (err) {
        console.error('Initial flipbook page render failed:', err);
        if (!cancelled) setError('This book could not render its first page.');
      } finally {
        if (!cancelled && token === renderTokenRef.current) setRendering(false);
      }
    }
    void showFirstPage();
    return () => { cancelled = true; };
  }, [pdf, preparePage]);

  const swapCanvas = useCallback(() => {
    const current = currentCanvasRef.current;
    const next = nextCanvasRef.current;
    if (!current || !next) return;
    const temp = document.createElement('canvas');
    temp.width = current.width;
    temp.height = current.height;
    temp.getContext('2d')?.drawImage(current, 0, 0);
    current.width = next.width;
    current.height = next.height;
    current.style.width = next.style.width;
    current.style.height = next.style.height;
    current.getContext('2d')?.drawImage(next, 0, 0);
    next.width = temp.width;
    next.height = temp.height;
    next.style.width = temp.width / Math.min(window.devicePixelRatio || 1, 1.5) + 'px';
    next.style.height = temp.height / Math.min(window.devicePixelRatio || 1, 1.5) + 'px';
    next.getContext('2d')?.drawImage(temp, 0, 0);
  }, []);

  const beginDrag = (clientX: number) => {
    if (!pdf || rendering || turning || settling) return;
    dragStartXRef.current = clientX;
    dragXRef.current = 0;
    draggingRef.current = true;
    setDragX(0);
    setDragAngle(0);
    setDragDirection(null);
  };

  const moveDrag = (clientX: number) => {
    if (!draggingRef.current || dragStartXRef.current === null) return;
    const raw = clientX - dragStartXRef.current;
    const limit = Math.min(window.innerWidth * 0.78, 560);
    const bounded = Math.max(-limit, Math.min(limit, raw));
    const direction = bounded < 0 ? 'next' : bounded > 0 ? 'prev' : null;
    const progress = Math.min(Math.abs(bounded) / Math.max(1, limit), 1);
    dragXRef.current = bounded;
    setDragX(bounded);
    setDragDirection(direction);
    setDragAngle(direction === 'next' ? -168 * progress : direction === 'prev' ? 168 * progress : 0);
  };

  const endDrag = async () => {
    if (!draggingRef.current) return;
    const distance = dragXRef.current;
    const direction = distance < 0 ? 'next' : distance > 0 ? 'prev' : null;
    draggingRef.current = false;
    dragStartXRef.current = null;
    dragXRef.current = 0;

    const target = direction === 'next' ? page + 1 : direction === 'prev' ? page - 1 : page;
    const shouldComplete = !!direction && Math.abs(distance) > Math.min(120, window.innerWidth * 0.24) && target >= 1 && target <= (pdf?.numPages || 0);

    if (!shouldComplete || !pdf) {
      setSettling(true);
      setDragAngle(0);
      await new Promise<void>(resolve => window.setTimeout(resolve, 260));
      setSettling(false);
      setDragX(0);
      setDragDirection(null);
      return;
    }

    const token = ++renderTokenRef.current;
    try {
      setRendering(true);
      setSettling(true);
      setDragDirection(direction);
      await preparePage(target, nextCanvasRef.current!);
      if (token !== renderTokenRef.current) return;
      setDragAngle(direction === 'next' ? -180 : 180);
      playPageTurn();
      await new Promise<void>(resolve => window.setTimeout(resolve, 360));
      if (token !== renderTokenRef.current) return;
      swapCanvas();
      setPage(target);
      setPageInput(String(target));
      setDragAngle(0);
      setDragX(0);
      setDragDirection(null);
      setSettling(false);

      const preloadPage = direction === 'next' ? target + 1 : target - 1;
      if (preloadPage >= 1 && preloadPage <= pdf.numPages && nextCanvasRef.current) {
        await preparePage(preloadPage, nextCanvasRef.current);
        if (token === renderTokenRef.current) setNextReady(true);
      }
    } catch (err) {
      console.error('Flipbook drag page turn failed:', err);
      setError('The page could not be turned. Please try again.');
      setDragAngle(0);
      setDragX(0);
      setDragDirection(null);
      setSettling(false);
    } finally {
      if (token === renderTokenRef.current) setRendering(false);
    }
  };

  const goToPage = useCallback(async (target: number) => {
    if (!pdf || rendering || turning) return;
    const targetPage = Math.min(Math.max(Math.round(target), 1), pdf.numPages);
    if (targetPage === page) return;
    const canvas = nextCanvasRef.current;
    if (!canvas) return;

    const direction = targetPage > page ? 'next' : 'prev';
    const token = ++renderTokenRef.current;
    try {
      setRendering(true);
      setNextReady(false);
      await preparePage(targetPage, canvas);
      if (token !== renderTokenRef.current) return;
      setTurning(direction);
      setDragDirection(direction);
      playPageTurn();

      // Keep the destination page underneath while the visible page physically
      // folds away. Only swap the canvases after the animation completes.
      await new Promise<void>(resolve => window.setTimeout(resolve, 520));
      if (token !== renderTokenRef.current) return;
      swapCanvas();
      setPage(targetPage);
      setPageInput(String(targetPage));
      setTurning(null);
      setDragDirection(null);

      const preloadPage = direction === 'next' ? targetPage + 1 : targetPage - 1;
      if (preloadPage >= 1 && preloadPage <= pdf.numPages && nextCanvasRef.current) {
        await preparePage(preloadPage, nextCanvasRef.current);
        if (token === renderTokenRef.current) setNextReady(true);
      }
    } catch (err) {
      console.error('Flipbook page render failed:', err);
      setError('The next page could not be rendered. Please try again.');
    } finally {
      if (token === renderTokenRef.current) setRendering(false);
    }
  }, [pdf, page, preparePage, playPageTurn, rendering, turning, swapCanvas]);

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
      if (!pdf || !currentCanvasRef.current) return;
      const token = ++renderTokenRef.current;
      void preparePage(page, currentCanvasRef.current).then(() => {
        if (token === renderTokenRef.current && page < pdf.numPages && nextCanvasRef.current) {
          return preparePage(page + 1, nextCanvasRef.current);
        }
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pdf, page, preparePage, zoom]);

  const commitPageInput = () => {
    const requested = Number.parseInt(pageInput, 10);
    if (!Number.isFinite(requested)) {
      setPageInput(String(page));
      return;
    }
    void goToPage(requested);
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

        <div className="relative flex min-h-[55vh] flex-1 items-center justify-center overflow-hidden bg-slate-800 p-3 sm:p-6" style={{ perspective: '1600px', touchAction: 'pan-y' }} onPointerDown={event => { if (event.pointerType !== 'mouse' || event.button === 0) { event.currentTarget.setPointerCapture?.(event.pointerId); beginDrag(event.clientX); } }} onPointerMove={event => moveDrag(event.clientX)} onPointerUp={endDrag} onPointerCancel={endDrag}>
          <div ref={bookHostRef} className="relative flex h-[min(56vh,600px)] w-[min(96vw,980px)] items-center justify-center"
 aria-label={'Interactive book, page ' + page + ' of ' + (pdf?.numPages || 0)}>
            <div
              className="relative flex max-h-full max-w-full items-center justify-center overflow-visible rounded-[3px] bg-white shadow-[0_18px_55px_rgba(0,0,0,0.34)]"
              style={{
                perspective: '1800px',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Destination page sits underneath the sheet being turned. */}
              <canvas
                ref={nextCanvasRef}
                className="pointer-events-none absolute inset-0 block max-h-[56dvh] max-w-[90vw] select-none"
                draggable={false}
                aria-hidden="true"
              />
              <div
                className={
                  'relative z-10 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] ' +
                  (dragDirection === 'prev' ? 'origin-right' : 'origin-left')
                }
                style={{
                  backfaceVisibility: 'hidden',
                  transformStyle: 'preserve-3d',
                  transform: `translateX(${dragX * 0.10}px) rotateY(${dragAngle}deg)`,
                  transition: settling ? 'transform 360ms cubic-bezier(.22,.61,.36,1)' : 'none',
                  willChange: 'transform',
                }}
              >
                <canvas ref={currentCanvasRef} className="block max-h-[68dvh] max-w-[86vw] select-none" draggable={false} />
              </div>
            </div>
          </div>

          {pdf && !error && !loading && (
            <>
              <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => void goToPage(page - 1)} disabled={page <= 1 || rendering || !!turning} className="absolute bottom-2 left-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-15" aria-label="Previous page">
                <ChevronLeft size={20} strokeWidth={2.2} />
              </button>
              <button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => void goToPage(page + 1)} disabled={page >= pdf.numPages || rendering || !!turning || !nextReady} className="absolute bottom-2 right-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-15" aria-label="Next page">
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
