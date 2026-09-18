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
const PAGE_TURN_SOUND = 'data:audio/wav;base64,UklGRiQKAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAKAACEeYF/f4B6f32IgH5+fXx+gH6Bfn6Cf31+f4R+foF8foKBgIF4gn17gYF+fH5+g4F/gX58gYJ/fYB4goF7gX2Cen2ChHl+gH6Fe4B8g399eIOAgYJ+fH19hXt+gIGDfHl/g4J/fX99gXx+fX5/h4ODeH19gnmFhHt7e36BhXx/fYSBg3p9fIWCfn1/e3uBiX58enmCg4CBgIF6f4F9f3x+gnx+gYGGdYF7foKCgn2Ee3t/eYaAhXx6foB8gH6HfYV9e3x5f4N+gIV/gH53hHeEgIWAe4F8f4CAgH2AdYF7h4l2gYB8hX54f3+BeoOEeXx/fYuAeXp9i3x9fnuJeoB9gHiKf395eYGDgYJ/e39+e4GDfnuBiH1+fIVyf4V4iIJ6gHR7inmMf4WBcn6DfHuEfnZ7hX2Hin93dX+FgYN8gn6Ae3iBenqFfZKDdoGAeoh5aoh8jX11inaAiH59fYB1gYCPe3aCe4KCint/bXuOfH13hIJ3hH+EeYuAfHh5gnmEgoiEfG6BhoKEeXp3i4B6dHyKgXaGhYGAgX1+c4d9jmuChXqDg4B3eoSGfX5/iXh2g3l+hYZ5inGHdHeKfnx9hYGBiXZ3doeFiHp4hHmHhHN6eI6Xe31lgoR5jnN/hHaLi3NzhoF2fXx7hX6KhX6ChH5rgXqLe39+jX96gHV+fH+ReH99hnV6god/eHOBjYGAgnR+foJ/cImOeX98gmuPeIyAeX+Md3t5aY+GfYpxgpqPalx2koGAhXKCiISDcYB4jp1yYHaDjo90dIxvineDhIOFbX9+hJJ8d3V5iXaOgX1vgIhniot7fpSHcXx9gWaNe4aAh3lvgY12jn10kXOOeINuc46EhX2Kc3eEenl+eXiSio+Be299ZXqLlotugGuEdYGbf5FybIqSdH5pgJKCeWqEiYWAZ5h/gI1efn+GlYRkfYaHdG6LjYhomVN8n32HbZRuh4ZxkWt1gXuLkXx4d3mNe4V9b45xhZx1h219bXx5gZmEjIB6cmN+l4Z3mXp2bnOBpIJydntnh5KJi2xklZFngnyHhXqLjIxtWHtvjpGGeXyObYmCfJNxjnN3d4xzgGeIknWRe5l8Ypp/dXhkg3eil25wf2uJg3F0gpOVfYhwh3GMb3SGjnB9h4VygX2aimlZgpqIkHJli4GMaoR6kHl3eJiBdnNxnmZziY54gX+BdpF9mWuQa2iKcYxwm4Jsf4drgpqJgnmRbVR/d6iKcm6Kd3yAfYF5jJBXo3iPbnyAfYuDaHqLj4F8fm1sm3R+bZGadIJmlIdmj3+EhnNziH1uoXZyb4qUho9henR/ilm1a4eRi4dOdZd7e1+cknaBe2l7hYqYgXSEcWeVeYOMaYyLgYxzW4B2lYZyeo+Mfn9zfI+GjnBjZX+fmnNkjYZljHiRgoyDboB2kGxeiZOclWd2eYZhg4dwgpB6jYZ7f3CSdnKLcISLe3+LimhvnpBjbIF0j4KIaIOZZ5CJhHtla4eMkYmFcGmGkYtufGqHcIGOh5poU4iQloKDgGZ4inWhZXuaeXNqdJqFhnOLgHB3fI97gZpsZ4+Ff4F1h3qQbnWGeo+Ceol+b3V4en+JfY+IcJCIbXqEeYh/hXqFd4dff5KJgolxdHl+k3SRaHqHl3xhi4V2eXeFjWWgdW+DeaOOc3Nudop0nIF+j11wioKIj3qDb2OVcniZknl2emyFfHqIhJiUXopsa5J7gZFxcISTiGZxd5iGgohygodwfoNriYWJcX2PhW12iXaCpHp6bHOYf3J0go51hnOBhYl7fYRpf4OOgX2Bdn6JhXR/aJN/hXJ7hY9ujX92iHl7eIeFgHN0gI58kn5uh29/iHR4nH5/h3d8hmGYeHeOgnWJdn50eYiCg4d6dHqUfoB4foWBf3VzhIaIf3OHhWuJg5Rzc5Fzgnl2a4COhoN3jIKJaYR0hoRuf4uGiXV3coGOhIF2i4Vubn55l4R0eY5vg36LgneAeYR4kHqCdn+Afod4dIt/e42FYHmIi32Qcnd8eoeKe4pwdY19i3p7fX14e4OLgoSDbWmOj4OHdXGDboh4gJKOd4JudoSQe4J8bnuOfoKBbYOHi4x6eHV0doqQfYx1fXhyhoeDf3l/eoJ0goWMiHxzbYKSlGp3fHiJh4GDdHl6i3WBiH2CcnyCj4CEdXWDe4Z+iIpthn2CgIZ1dnaBioiEeW1/f4WOf39rhIF7hXd6jIB/fn59j32Ee3puc4+Ne3yAeZB6emqJf4x3fnt6iIeCdoCFf359dYCMeYKFdoJ4gXx/f3+Bco+Ce32AeX9/hnuBf3yHgHiAfXt9i3+BfYV8eXiFh3h7gYV4f4h/fnx3gYR5gYR+gXmHe4t8enp9f35+g4N8h3x9e4N1doeKiHd9g4F4f3l8jYN3eIR/hX1/gn16fX6Af32BeoWHfHuCgoF+eniBhnyCg358fHWBgImBeHqFh4F+dnx/fYp3foB/h3l+gYB9eoN6fYaGgnp7fH2Ahn98fX2IeoF5enuGgYp4eYGCgHeDgIB9gn5/fIJ8foSAfnuAfIKIgXx6gX1+f3yDeYV9gYN/gnx4gXyAhH5/fYGBe4B7gH+DgXx7foODf36BeIF+hX59en6BhHp7iX9+gXaEf3qDfn6CgX1+e3yDg39+fX99hXx+fnuHf31+e4B+goB6gX59gYCDe39+goB/gHt6gYCAgHyBf4CCgH1+fX+AgHx+goN+gH1+f4CBf319foGAgYF7fYCAfoJ+fIN9gX5/gH2AgH6Cfn5+gIF/gnp8gX6AfX9/gYGBfn9/f35+gHqAf4OBfn96gIJ9gX5+fYGBf3x/gYCBfX1+foSAfn97f4GAf3x+foKBfnuAgICAf32Bf35/e4B/gYJ+f39+fYCAgX99fX9/f39+gICAfn+AfX9/f39+gH6Af35/foCAgH9+fICBgH9+fn6AgH59gYGAf3x9f4F+f4B+f4B/f39/fYF+f4J9f35/fn5+gICBfn9+gH9/gH9+foCAgH5+f3+Bf399foCAf39/f36Bfn9+f4B/f36AfoCAfn5+gX5/fn+Bf39/fX9/gH9/fn9/gX99f39/gn99fn+AgX99foCAf39/fn+Af35/f3+Afn5/fn+Af35+f4B/gH5/f4B+fn9+f4B/fX9/gH9+fn9/gH9/fn5/gH9/f39/f399f4CBf35+f39/f39/f39/fn+Af4B+fn9/gH9+fn5/gX9+foB/f39+f3+Af35/f4B/f35/f39/f35/gYB/fn9/gH9/fn9/f39/foCAf35+f4CAf39+f4B/f35/gIB/fn9/gH9+f3+Af35+f3+Af35/f4B/f39/gH9/fn5/gH9/fn9/gH9+f3+Af39/f39/fn9/f4B/f35/gH9/f3+Af39/f39/f39+f4B/f39/gH9/fn9/';

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
  const dragStartXRef = useRef<number | null>(null);
  const dragXRef = useRef(0);
  const draggingRef = useRef(false);
  const [dragX, setDragX] = useState(0);

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
    const maxWidth = Math.min(window.innerWidth * 0.86, fullscreen ? 980 : 760);
    const maxHeight = Math.min(window.innerHeight * (fullscreen ? 0.78 : 0.68), fullscreen ? 760 : 680);
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

  const beginDrag = (clientX: number) => { if (!pdf || rendering || turning) return; dragStartXRef.current = clientX; dragXRef.current = 0; draggingRef.current = true; setDragX(0); };
  const moveDrag = (clientX: number) => { if (!draggingRef.current || dragStartXRef.current === null) return; const raw = clientX - dragStartXRef.current; const bounded = Math.max(-Math.min(window.innerWidth * 0.70, 500), Math.min(window.innerWidth * 0.70, raw)); dragXRef.current = bounded; setDragX(bounded); };
  const endDrag = () => { if (!draggingRef.current) return; const distance = dragXRef.current; draggingRef.current = false; dragStartXRef.current = null; dragXRef.current = 0; setDragX(0); if (Math.abs(distance) > 55) void goToPage(page + (distance < 0 ? 1 : -1)); };

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

        <div className="relative flex min-h-[55vh] flex-1 items-center justify-center overflow-hidden bg-slate-800 p-3 sm:p-6" style={{ perspective: '1600px', touchAction: 'pan-y' }} onPointerDown={event => { if (event.pointerType !== 'mouse' || event.button === 0) { event.currentTarget.setPointerCapture?.(event.pointerId); beginDrag(event.clientX); } }} onPointerMove={event => moveDrag(event.clientX)} onPointerUp={endDrag} onPointerCancel={endDrag}>
          <div ref={bookHostRef} className="relative flex max-h-full max-w-full items-center justify-center" aria-label={'Interactive book, page ' + page + ' of ' + (pdf?.numPages || 0)}>
            <div className="relative overflow-hidden rounded-[2px] bg-white shadow-2xl" style={{ transform: dragX === 0 ? 'rotateY(0deg)' : `rotateY(${Math.max(-72, Math.min(72, dragX * 0.16))}deg) translateX(${dragX * 0.10}px)`, transformOrigin: dragX < 0 ? 'left center' : 'right center', transition: draggingRef.current ? 'none' : 'transform 420ms cubic-bezier(.2,.8,.2,1)', willChange: 'transform' }}>
              <canvas ref={currentCanvasRef} className="block max-h-[68dvh] max-w-[86vw] select-none" draggable={false} />
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
      <style jsx>{'@keyframes flip-next { 0% { transform: rotateY(0deg); opacity: 1; } 100% { transform: rotateY(-180deg); opacity: 0; } } @keyframes flip-prev { 0% { transform: rotateY(0deg); opacity: 1; } 100% { transform: rotateY(180deg); opacity: 0; } }'}</style>
    </div>
  );
}
