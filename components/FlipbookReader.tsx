'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Maximize2, X } from 'lucide-react';

interface FlipbookReaderProps {
  pdfUrl: string;
  fileName?: string;
}

type PdfPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
};

type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
};

type PageFlipInstance = {
  loadFromImages: (images: string[]) => void;
  flipNext: (corner: 'top' | 'bottom') => void;
  flipPrev: (corner: 'top' | 'bottom') => void;
  turnToPage: (pageNum: number) => void;
  on: (event: string, callback: (event: { data: number | string }) => void) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (src: { url: string }) => { promise: Promise<PdfDocument> };
    };
    St?: {
      PageFlip: new (element: HTMLElement, settings: Record<string, unknown>) => PageFlipInstance;
    };
  }
}

const PDFJS_VERSION = '3.11.174';
const PDFJS_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
const PAGE_FLIP_VERSION = '2.0.7';
const PAGE_FLIP_SRC = `https://cdn.jsdelivr.net/npm/page-flip@${PAGE_FLIP_VERSION}/dist/js/page-flip.browser.js`;

function loadScript(src: string, attribute: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-${attribute}]`);
    if (existing) {
      if (attribute === 'shoppers-ocean-pdfjs' && window.pdfjsLib) return resolve();
      if (attribute === 'shoppers-ocean-pageflip' && window.St?.PageFlip) return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Could not load ${src}`)), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.setAttribute(`data-${attribute}`, 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
}

async function loadPdfJs() {
  if (!window.pdfjsLib) await loadScript(PDFJS_SRC, 'shoppers-ocean-pdfjs');
  if (!window.pdfjsLib) throw new Error('PDF viewer failed to initialize');
  return window.pdfjsLib;
}

async function loadPageFlip() {
  if (!window.St?.PageFlip) await loadScript(PAGE_FLIP_SRC, 'shoppers-ocean-pageflip');
  if (!window.St?.PageFlip) throw new Error('Page-turn engine failed to initialize');
  return window.St.PageFlip;
}

function createPaperSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const buffer = context.createBuffer(1, context.sampleRate * 0.18, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / data.length) ** 1.8;
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(context.destination);
    gain.gain.value = 0.0001;
    const now = context.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    source.start(now);
    source.stop(now + 0.18);
    source.addEventListener('ended', () => context.close());
  } catch {
    // Sound is optional and must never block reading.
  }
}

export default function FlipbookReader({ pdfUrl, fileName }: FlipbookReaderProps) {
  const bookHostRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlipInstance | null>(null);
  const pageImagesRef = useRef<string[]>([]);
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [imagesReady, setImagesReady] = useState(false);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setReady(false);
        setImagesReady(false);
        pageImagesRef.current = [];
        const pdfjs = await loadPdfJs();
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        const documentProxy = await pdfjs.getDocument({ url: pdfUrl }).promise;
        if (!cancelled) setPdf(documentProxy);
      } catch (err) {
        console.error('Flipbook PDF load failed:', err);
        if (!cancelled) setError('This book could not be opened as a flipbook. Please try the PDF download.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  const buildPageImages = useCallback(async () => {
    if (!pdf) return;
    let cancelled = false;
    setRendering(true);
    setImagesReady(false);
    try {
      const firstPage = await pdf.getPage(1);
      const base = firstPage.getViewport({ scale: 1 });
      const targetWidth = Math.min(1000, Math.max(650, base.width * 1.25));
      const scale = targetWidth / base.width;
      const images: string[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const pdfPage = await pdf.getPage(pageNumber);
        const viewport = pdfPage.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('Could not create page canvas');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        await pdfPage.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL('image/jpeg', 0.86));
        if (cancelled) return;
      }

      pageImagesRef.current = images;
      if (images.length === pdf.numPages) setImagesReady(true);
    } catch (err) {
      console.error('Flipbook page preparation failed:', err);
      setError('This book could not be prepared for the page-turn reader.');
    } finally {
      if (!cancelled) setRendering(false);
    }
  }, [pdf]);

  useEffect(() => {
    let active = true;
    if (pdf) buildPageImages();
    return () => { active = false; void active; };
  }, [pdf, buildPageImages]);

  useEffect(() => {
    if (!pdf || !imagesReady || !bookHostRef.current || pageImagesRef.current.length !== pdf.numPages) return;

    let cancelled = false;
    let pageFlip: PageFlipInstance | null = null;

    async function initializeBook() {
      try {
        setReady(false);
        const PageFlip = await loadPageFlip();
        if (cancelled || !bookHostRef.current) return;

        const first = await pdf.getPage(1);
        const viewport = first.getViewport({ scale: 1 });
        const hostWidth = Math.max(bookHostRef.current.clientWidth, 280);
        const hostHeight = Math.max(bookHostRef.current.clientHeight, 360);
        const maxBookWidth = Math.min(hostWidth - 12, fullscreen ? 1100 : 900);
        const maxBookHeight = Math.min(hostHeight - 12, fullscreen ? 760 : 650);
        const aspect = viewport.width / viewport.height;
        let width = Math.min(maxBookWidth, maxBookHeight * aspect);
        let height = width / aspect;
        if (height > maxBookHeight) {
          height = maxBookHeight;
          width = height * aspect;
        }

        bookHostRef.current.innerHTML = '';
        pageFlip = new PageFlip(bookHostRef.current, {
          width: Math.max(240, Math.floor(width)),
          height: Math.max(320, Math.floor(height)),
          size: 'stretch',
          minWidth: 240,
          maxWidth: Math.max(240, Math.floor(width)),
          minHeight: 320,
          maxHeight: Math.max(320, Math.floor(height)),
          drawShadow: true,
          maxShadowOpacity: 0.55,
          flippingTime: 650,
          usePortrait: true,
          showCover: false,
          mobileScrollSupport: true,
          swipeDistance: 10,
          useMouseEvents: true,
          disableFlipByClick: true,
        });

        pageFlip.on('flip', event => {
          const nextPage = Number(event.data) + 1;
          if (Number.isFinite(nextPage)) setPage(nextPage);
          createPaperSound();
        });
        pageFlip.on('changeState', event => {
          if (event.data === 'user_fold' || event.data === 'fold_corner') createPaperSound();
        });

        pageFlip.loadFromImages(pageImagesRef.current);
        pageFlipRef.current = pageFlip;
        if (!cancelled) {
          setPage(1);
          setReady(true);
        }
      } catch (err) {
        console.error('Realistic flipbook initialization failed:', err);
        if (!cancelled) setError('The page-turn reader could not be initialized.');
      }
    }

    initializeBook();
    return () => {
      cancelled = true;
      if (pageFlip) pageFlip.destroy();
      pageFlipRef.current = null;
    };
  }, [pdf, imagesReady, fullscreen]);

  useEffect(() => setPageInput(String(page)), [page]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') pageFlipRef.current?.flipNext('bottom');
      if (event.key === 'ArrowLeft') pageFlipRef.current?.flipPrev('bottom');
      if (event.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const goToPage = (target: number) => {
    if (!pageFlipRef.current || !pdf) return;
    const nextPage = Math.min(Math.max(Math.round(target), 1), pdf.numPages);
    pageFlipRef.current.turnToPage(nextPage - 1);
    setPage(nextPage);
  };

  const commitPageInput = () => {
    const requested = Number.parseInt(pageInput, 10);
    if (!Number.isFinite(requested)) setPageInput(String(page));
    else goToPage(requested);
  };

  return (
    <div className={fullscreen ? 'fixed inset-0 z-[100] bg-slate-950 p-3 sm:p-6' : 'w-full'}>
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{fileName || 'Book'}</p><p className="text-xs text-white/60">Read online as flipbook</p></div>
          <button type="button" onClick={() => setFullscreen(value => !value)} className="rounded-lg p-2 hover:bg-white/10" aria-label={fullscreen ? 'Close full screen' : 'Open full screen'}>{fullscreen ? <X size={20} /> : <Maximize2 size={20} />}</button>
        </div>

        <div className="relative flex min-h-[55vh] flex-1 items-center justify-center overflow-hidden bg-slate-800 p-3 sm:p-6">
          <div ref={bookHostRef} className="relative flex max-h-full max-w-full items-center justify-center touch-none" aria-label={`Interactive book, page ${page} of ${pdf?.numPages || 0}`} />

          {ready && pdf && !error && <>
            <button type="button" onClick={() => pageFlipRef.current?.flipPrev('bottom')} disabled={page <= 1} className="absolute bottom-3 left-3 z-20 rounded-full bg-black/70 p-3 text-white shadow-lg disabled:opacity-20" aria-label="Previous page"><ChevronLeft size={26} /></button>
            <button type="button" onClick={() => pageFlipRef.current?.flipNext('bottom')} disabled={page >= pdf.numPages} className="absolute bottom-3 right-3 z-20 rounded-full bg-black/70 p-3 text-white shadow-lg disabled:opacity-20" aria-label="Next page"><ChevronRight size={26} /></button>
          </>}

          {(loading || rendering) && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-800/90 text-white"><Loader2 className="animate-spin" size={32} /><span>{loading ? 'Opening your book…' : 'Preparing realistic pages…'}</span></div>}
          {error && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white"><div className="max-w-md rounded-xl bg-white/10 p-6 backdrop-blur"><p>{error}</p></div></div>}
        </div>

        {pdf && !error && <div className="border-t border-white/10 px-4 pt-3 text-white">
          <div className="flex items-center gap-3"><span className="w-10 text-right text-xs text-white/60">1</span><input type="range" min={1} max={pdf.numPages} step={1} value={page} onChange={event => goToPage(Number(event.target.value))} className="h-2 w-full cursor-pointer accent-white" aria-label="Jump to page" /><span className="w-10 text-xs text-white/60">{pdf.numPages}</span></div>
          <div className="flex flex-wrap items-center justify-center gap-3 py-3"><span className="text-sm text-white/80">Page</span><input type="number" min={1} max={pdf.numPages} value={pageInput} onChange={event => setPageInput(event.target.value)} onBlur={commitPageInput} onKeyDown={event => { if (event.key === 'Enter') commitPageInput(); }} className="w-16 rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-center text-sm text-white outline-none" aria-label="Page number" /><span className="text-sm text-white/70">of {pdf.numPages}</span></div>
        </div>}
      </div>
    </div>
  );
}
