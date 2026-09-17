'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Maximize2, X } from 'lucide-react';

interface FlipbookReaderProps {
  pdfUrl: string;
  fileName?: string;
}

type PdfDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<any>;
};

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions: { workerSrc: string };
      getDocument: (src: { url: string }) => { promise: Promise<PdfDocument> };
    };
  }
}

const PDFJS_VERSION = '3.11.174';
const PDFJS_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

function loadPdfJs(): Promise<NonNullable<Window['pdfjsLib']>> {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-shoppers-ocean-pdfjs]');
    if (existing) {
      existing.addEventListener('load', () => window.pdfjsLib ? resolve(window.pdfjsLib) : reject(new Error('PDF viewer failed to initialize')));
      existing.addEventListener('error', () => reject(new Error('Could not load the PDF viewer')));
      return;
    }

    const script = document.createElement('script');
    script.src = PDFJS_SRC;
    script.async = true;
    script.dataset.shoppersOceanPdfjs = 'true';
    script.onload = () => window.pdfjsLib ? resolve(window.pdfjsLib) : reject(new Error('PDF viewer failed to initialize'));
    script.onerror = () => reject(new Error('Could not load the PDF viewer'));
    document.head.appendChild(script);
  });
}

function playPageTurnSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.055, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    gain.connect(context.destination);
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(180, now);
    oscillator.frequency.exponentialRampToValueAtTime(90, now + 0.13);
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + 0.14);
    oscillator.addEventListener('ended', () => context.close());
  } catch {
    // Sound must never interfere with reading or navigation.
  }
}

export default function FlipbookReader({ pdfUrl, fileName }: FlipbookReaderProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
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

  useEffect(() => setPageInput(String(page)), [page]);

  useEffect(() => {
    if (!pdf || !stageRef.current) return;
    let cancelled = false;
    async function renderPage() {
      try {
        setRendering(true);
        const pageProxy = await pdf.getPage(page);
        if (cancelled || !stageRef.current) return;
        const baseViewport = pageProxy.getViewport({ scale: 1 });
        const maxWidth = Math.max(stageRef.current.clientWidth - 32, 280);
        const maxHeight = Math.max(window.innerHeight * 0.68, 320);
        const scale = Math.min(maxWidth / baseViewport.width, maxHeight / baseViewport.height);
        const viewport = pageProxy.getViewport({ scale: Math.max(scale, 0.5) });
        const canvas = stageRef.current.querySelector('canvas');
        if (!canvas) return;
        const context = canvas.getContext('2d');
        if (!context) return;
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;
        await pageProxy.render({ canvasContext: context, viewport }).promise;
      } catch (err) {
        console.error('Flipbook page render failed:', err);
        if (!cancelled) setError('This page could not be rendered.');
      } finally {
        if (!cancelled) setRendering(false);
      }
    }
    renderPage();
    return () => { cancelled = true; };
  }, [pdf, page, fullscreen]);

  const goToPage = (target: number, withSound = true) => {
    if (!pdf) return;
    const nextPage = Math.min(Math.max(Math.round(target), 1), pdf.numPages);
    if (nextPage === page) return;
    setPage(nextPage);
    if (withSound) playPageTurnSound();
  };

  const goPrevious = () => goToPage(page - 1);
  const goNext = () => goToPage(page + 1);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goNext();
      if (event.key === 'ArrowLeft') goPrevious();
      if (event.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pdf, page]);

  const commitPageInput = () => {
    const requested = Number.parseInt(pageInput, 10);
    if (!Number.isFinite(requested)) {
      setPageInput(String(page));
      return;
    }
    goToPage(requested);
  };

  return (
    <div className={fullscreen ? 'fixed inset-0 z-[100] bg-slate-950 p-3 sm:p-6' : 'w-full'}>
      <div className="mx-auto flex h-full max-w-6xl flex-col rounded-2xl bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{fileName || 'Book'}</p>
            <p className="text-xs text-white/60">Read online as flipbook</p>
          </div>
          <button type="button" onClick={() => setFullscreen(value => !value)} className="rounded-lg p-2 hover:bg-white/10" aria-label={fullscreen ? 'Close full screen' : 'Open full screen'}>
            {fullscreen ? <X size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>

        <div ref={stageRef} className="relative flex min-h-[55vh] flex-1 items-center justify-center bg-slate-800 p-4 sm:p-6">
          <div className="relative rounded-lg bg-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-transform duration-300" key={page}>
            <canvas aria-label={`Page ${page}`} />
            {rendering && pdf && <div className="absolute inset-0 flex items-center justify-center bg-white/60"><Loader2 className="animate-spin" size={28} /></div>}

            {pdf && !error && (
              <>
                <button
                  type="button"
                  onClick={goPrevious}
                  disabled={page <= 1 || rendering}
                  className="absolute bottom-3 left-3 z-10 rounded-full bg-black/65 p-3 text-white shadow-lg transition hover:bg-black/80 disabled:opacity-20"
                  aria-label="Previous page"
                  title="Previous page"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={page >= pdf.numPages || rendering}
                  className="absolute bottom-3 right-3 z-10 rounded-full bg-black/65 p-3 text-white shadow-lg transition hover:bg-black/80 disabled:opacity-20"
                  aria-label="Next page"
                  title="Next page"
                >
                  <ChevronRight size={26} />
                </button>
              </>
            )}
          </div>

          {loading && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white"><Loader2 className="animate-spin" size={32} /><span>Opening your book…</span></div>}
          {error && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white"><div className="max-w-md rounded-xl bg-white/10 p-6 backdrop-blur"><p>{error}</p></div></div>}
        </div>

        {pdf && !error && (
          <div className="border-t border-white/10 px-4 pt-3 text-white">
            <div className="flex items-center gap-3">
              <span className="w-10 text-right text-xs text-white/60">1</span>
              <input type="range" min={1} max={pdf.numPages} step={1} value={page} onChange={(event) => goToPage(Number(event.target.value))} className="h-2 w-full cursor-pointer accent-white" aria-label="Jump to page" />
              <span className="w-10 text-xs text-white/60">{pdf.numPages}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 py-3">
              <span className="text-sm text-white/80">Page</span>
              <input
                type="number"
                min={1}
                max={pdf.numPages}
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value)}
                onBlur={commitPageInput}
                onKeyDown={(event) => { if (event.key === 'Enter') commitPageInput(); }}
                className="w-16 rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-center text-sm text-white outline-none focus:border-white/50"
                aria-label="Page number"
              />
              <span className="text-sm text-white/70">of {pdf.numPages}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
