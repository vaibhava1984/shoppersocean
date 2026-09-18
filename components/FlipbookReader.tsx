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
const PAGE_TURN_SOUND = 'data:audio/wav;base64,UklGRgQKAA...';

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

function createPaperSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const buffer = context.createBuffer(1, context.sampleRate * 0.2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const envelope = Math.max(0, 1 - i / data.length) ** 2;
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(context.destination);
    const now = context.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    source.start(now);
    source.stop(now + 0.2);
    source.addEventListener('ended', () => context.close());
  } catch {}
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

  const playPageTurn = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!soundRef.current) {
        soundRef.current = new Audio(PAGE_TURN_SOUND);
        soundRef.current.volume = 0.52;
      }
      soundRef.current.currentTime = 0;
      void soundRef.current.play().catch(() => {});
    } catch {}
  }, [soundEnabled]);

  useEffect(() => () => { soundRef.current?.pause(); soundRef.current = null; }, []);

  const renderPage = useCallback(async (documentProxy: PdfDocument, pageNumber: number, canvas: HTMLCanvasElement) => {
    const pageProxy = await documentProxy.getPage(pageNumber);
    const base = pageProxy.getViewport({ scale: 1 });
    const hostWidth = Math.max(bookHostRef.current?.clientWidth || 320, 240);
    const hostHeight = Math.max(bookHostRef.current?.clientHeight || Math.min(window.innerHeight * 0.72, 720), 300);
    const maxWidth = Math.min(hostWidth - 8, fullscreen ? 980 : 760);
    const maxHeight = Math.min(hostHeight - 8, fullscreen ? 760 : Math.max(window.innerHeight * 0.70, 360));
    const scale = Math.min(maxWidth / base.width, maxHeight / base.height);
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
  }, [fullscreen]);

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
        if (!cancelled) setError('This book could not be opened as a flipbook. Please try the PDF download.');
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
      swapCanvas();
      setPage(targetPage);
      setPageInput(String(targetPage));
      setTurning(direction);
      window.setTimeout(() => setTurning(null), 520);
      playPageTurn();

      const preloadPage = direction === 'next' ? targetPage + 1 : targetPage - 1;
      if (preloadPage >= 1 && preloadPage <= pdf.numPages && currentCanvasRef.current) {
        await preparePage(preloadPage, currentCanvasRef.current);
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
  }, [pdf, page, preparePage]);

  const commitPageInput = () => {
    const requested = Number.parseInt(pageInput, 10);
    if (!Number.isFinite(requested)) {
      setPageInput(String(page));
      return;
    }
    void goToPage(requested);
  };

  return (
    <div className={fullscreen ? 'fixed inset-0 z-[100] bg-slate-950 p-3 sm:p-6' : 'w-full'}>
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
            <button type="button" onClick={() => setFullscreen(value => !value)} className="rounded-lg p-2 hover:bg-white/10" aria-label={fullscreen ? 'Close full screen' : 'Open full screen'}>
            {fullscreen ? <X size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>

        <div className="relative flex min-h-[55vh] flex-1 items-center justify-center overflow-hidden bg-slate-800 p-3 sm:p-6" style={{ perspective: '1400px' }}>
          <div ref={bookHostRef} className="relative flex h-[72vh] max-h-[760px] w-[94vw] max-w-[900px] items-center justify-center" aria-label={'Interactive book, page ' + page + ' of ' + (pdf?.numPages || 0)}>
            <div className="relative overflow-hidden rounded-sm bg-white shadow-2xl">
              <canvas ref={currentCanvasRef} className="block max-h-[70vh] max-w-[94vw]" />
              {turning && (
                <div
                  className={'pointer-events-none absolute inset-0 origin-left bg-white/95 shadow-2xl transition-transform duration-500 ease-in-out ' + (turning === 'next' ? 'animate-[flip-next_520ms_ease-in-out]' : 'animate-[flip-prev_520ms_ease-in-out]')}
                />
              )}
            </div>
            <canvas ref={nextCanvasRef} className="pointer-events-none absolute opacity-0" aria-hidden="true" />
          </div>

          {pdf && !error && !loading && (
            <>
              <button type="button" onClick={() => void goToPage(page - 1)} disabled={page <= 1 || rendering || !!turning} className="absolute bottom-2 left-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-15" aria-label="Previous page">
                <ChevronLeft size={20} strokeWidth={2.2} />
              </button>
              <button type="button" onClick={() => void goToPage(page + 1)} disabled={page >= pdf.numPages || rendering || !!turning || !nextReady} className="absolute bottom-2 right-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-15" aria-label="Next page">
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
      <style jsx>{'@keyframes flip-next { 0% { transform: rotateY(0deg); opacity: 1; } 100% { transform: rotateY(-180deg); opacity: 0; } } @keyframes flip-prev { 0% { transform: rotateY(0deg); opacity: 1; } 100% { transform: rotateY(180deg); opacity: 0; } }'}</style>
    </div>
  );
}
