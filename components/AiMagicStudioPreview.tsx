"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, WandSparkles, Download, X, Sparkles, ShieldCheck } from "lucide-react";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function AiMagicStudioPreview() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function chooseFile(next: File | undefined) {
    setError("");
    if (!next) return;
    if (!ACCEPTED_TYPES.includes(next.type)) {
      setError("Please choose a JPG, PNG, WebP or AVIF image.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (next.size > MAX_BYTES) {
      setError("This image is larger than 2 MB. Please choose a smaller file.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(next);
  }

  function clearImage() {
    setFile(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-violet-200 bg-white shadow-xl">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 px-5 py-8 text-white sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles size={13} /> Admin design preview
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">AI Magic Studio</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
              Imagine it. Describe it. Transform your image.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200/30 bg-amber-300/10 px-4 py-3 text-right">
            <p className="text-2xl font-black text-amber-200">2</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100">Free AI conversions</p>
            <p className="mt-1 text-[9px] text-amber-100/70">Planned for launch</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="ai-magic-upload" className="text-sm font-extrabold text-slate-900">1. Upload your image</label>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Maximum 2 MB</span>
            </div>
            <input
              ref={inputRef}
              id="ai-magic-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => chooseFile(event.target.files?.[0])}
              className="sr-only"
            />
            {previewUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
                <img src={previewUrl} alt="Your selected image preview" className="max-h-72 w-full rounded-xl object-contain" />
                <button type="button" onClick={clearImage} aria-label="Remove uploaded image" className="absolute right-4 top-4 rounded-full bg-slate-950/80 p-2 text-white shadow-lg hover:bg-rose-600">
                  <X size={16} />
                </button>
                <p className="truncate px-2 pb-1 pt-2 text-xs font-semibold text-slate-600">{file?.name} · {((file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50 via-white to-cyan-50 px-5 text-center transition hover:border-violet-500 hover:bg-violet-50">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg"><ImagePlus size={27} /></span>
                <span className="mt-4 text-sm font-black text-slate-800">Choose an image</span>
                <span className="mt-1 text-xs text-slate-500">JPG · PNG · WebP · AVIF</span>
                <span className="mt-3 rounded-full bg-violet-700 px-4 py-2 text-xs font-extrabold text-white">Browse files</span>
              </button>
            )}
            {error && <p role="alert" className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{error}</p>}
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Your selected image is previewed in this browser only. This design preview does not upload or save it.</p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="ai-magic-prompt" className="text-sm font-extrabold text-slate-900">2. Describe your transformation</label>
              <span className={`text-xs font-bold ${prompt.length >= 140 ? "text-amber-600" : "text-slate-500"}`}>{prompt.length}/150</span>
            </div>
            <textarea
              id="ai-magic-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value.slice(0, 150))}
              maxLength={150}
              rows={4}
              placeholder="Example: Place me in a snowy mountain cabin at sunset..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
            <p className="mt-1 text-[11px] text-slate-500">Maximum 150 characters. Be clear about what you want changed.</p>
          </div>

          <button type="button" disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-700 px-5 py-3.5 text-sm font-black text-white opacity-60 shadow-lg" title="AI provider connection will be added after design approval">
            <WandSparkles size={18} /> AI transformation — coming after approval
          </button>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
            <strong>Preview only:</strong> The image-editing engine is not connected yet. No pretend or sample result will be shown.
          </div>
        </div>

        <div className="flex min-h-[390px] flex-col rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/70 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-black text-slate-900">3. Your transformed image</h3>
            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-500 shadow-sm">Result preview</span>
          </div>
          <div className="my-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/80 px-5 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><WandSparkles size={30} /></div>
            <p className="mt-4 text-sm font-extrabold text-slate-800">Your creation will appear here</p>
            <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">Upload an image and enter your prompt. The connected AI will return an edited result here.</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
            <div>
              <p className="text-xs font-extrabold text-slate-800">Standard download quality</p>
              <p className="mt-1 text-[10px] text-slate-500">JPEG · Average file size · One download per result</p>
            </div>
            <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-slate-200 px-3 py-2 text-xs font-extrabold text-slate-500" aria-label="Download will be available after AI integration">
              <Download size={15} /> Download
            </button>
          </div>
          <p className="mt-3 flex items-start gap-2 text-[10px] leading-4 text-slate-500"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" /> Planned: no permanent image storage on Shoppers Ocean. Uploaded and generated images will be processed temporarily and sent to the visitor's device.</p>
        </div>
      </div>
    </section>
  );
}
