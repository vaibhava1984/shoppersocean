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

export default function FlipbookReader({ pdfUrl, fileName }: FlipbookReaderProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [page, setPage] = useState(1);
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setPage(current => pdf ? Math.min(current + 1, pdf.numPages) : current);
      if (event.key === 'ArrowLeft') setPage(current => Math.max(current - 1, 1));
      if (event.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pdf]);

  const goPrevious = () => setPage(current => Math.max(current - 1, 1));
  const goNext = () => setPage(current => pdf ? Math.min(current + 1, pdf.numPages) : current);

  return (
    <div className={fullscreen ? 'fixed inset-0 z-[100] bg-slate-950 p-3 sm:p-6' : 'w-full'}>
      <div className="mx-auto flex h-full max-w-6xl flex-col rounded-2xl bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{fileName || 'Book'}</p>
            <p className="text-xs text-white/60">Read online as flipbook</p>
          </div>
          <button
            type="button"
            onClick={() => setFullscreen(value => !value)}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label={fullscreen ? 'Close full screen' : 'Open full screen'}
          >
            {fullscreen ? <X size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>

        <div ref={stageRef} className="relative flex min-h-[55vh] flex-1 items-center justify-center bg-slate-800 p-4 sm:p-6">
          <div className="relative rounded-lg bg-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-transform duration-300" key={page}>
            <canvas aria-label={`Page ${page}`} />
            {rendering && pdf && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <Loader2 className="animate-spin" size={28} />
              </div>
            )}
          </div>

          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
              <Loader2 className="animate-spin" size={32} />
              <span>Opening your book…</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white">
              <div className="max-w-md rounded-xl bg-white/10 p-6 backdrop-blur">
                <p>{error}</p>
              </div>
            </div>
          )}

          {pdf && !error && (
            <>
              <button type="button" onClick={goPrevious} disabled={page <= 1 || rendering} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white disabled:opacity-30" aria-label="Previous page">
                <ChevronLeft size={24} />
              </button>
              <button type="button" onClick={goNext} disabled={page >= pdf.numPages || rendering} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-3 text-white disabled:opacity-30" aria-label="Next page">
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 border-t border-white/10 px-4 py-3 text-white">
          <button type="button" onClick={goPrevious} disabled={!pdf || page <= 1 || rendering} className="rounded-lg px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-30">Previous</button>
          <span className="min-w-[90px] text-center text-sm text-white/80">{pdf ? `${page} / ${pdf.numPages}` : '—'}</span>
          <button type="button" onClick={goNext} disabled={!pdf || page >= pdf.numPages || rendering} className="rounded-lg px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-30">Next</button>
        </div>
      </div>
    </div>
  );
}
