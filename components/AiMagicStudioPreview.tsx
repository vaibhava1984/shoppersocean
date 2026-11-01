"use client";

import { useRef, useState } from "react";
import { ImagePlus, Download, WandSparkles } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function AiMagicStudioPreview() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [resultUrl] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  function chooseFile(next?: File) {
    setError("");
    if (!next) return;
    if (!ACCEPTED_TYPES.includes(next.type)) {
      setError("Please select a JPG, PNG, WebP or AVIF image.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(next);
  }

  function downloadResult() {
    if (!resultUrl || downloaded) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "shoppers-ocean-creation.jpg";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloaded(true);
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-violet-200 bg-white p-4 shadow-md sm:p-5">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-black text-slate-900">✨ AI Magic Studio</h2>
        <p className="mt-1 text-xs text-slate-500">Upload an image and describe your idea.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => chooseFile(event.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-300 bg-violet-50 px-3 py-3 text-sm font-bold text-violet-800 transition hover:bg-violet-100"
      >
        <ImagePlus size={18} /> {file ? "Change image" : "Upload image"}
      </button>
      <p className="mt-1.5 text-center text-[10px] text-slate-500">Supported formats: JPG, PNG, WebP, AVIF</p>
      {file && <p className="mt-2 truncate text-center text-xs text-emerald-700">{file.name}</p>}
      {error && <p role="alert" className="mt-2 text-center text-xs text-rose-600">{error}</p>}

      <label htmlFor="ai-magic-prompt" className="mb-1.5 mt-4 block text-xs font-bold text-slate-800">
        Describe what you want
      </label>
      <textarea
        id="ai-magic-prompt"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        rows={3}
        placeholder="Write your image idea here..."
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
      <p className="mt-1 text-right text-[10px] text-slate-500">{prompt.trim() ? prompt.trim().split(/\\s+/).length : 0}/150 words</p>

      <div className="mt-4 flex flex-col gap-2">
        <button type="button" disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-700 px-4 py-2.5 text-sm font-bold text-white opacity-60" title="AI editing will be connected after preview approval">
          <WandSparkles size={16} /> Create image
        </button>
        <button
          type="button"
          onClick={downloadResult}
          disabled={!resultUrl || downloaded}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={16} /> {downloaded ? "Already downloaded" : "Download image"}
        </button>
      </div>
      <p className="mt-2 text-center text-[10px] leading-4 text-slate-500">
        One download per created image. The image will be saved directly to the user's device.
      </p>
      <p className="mt-2 text-center text-[10px] text-amber-700">Testing preview: image generation and download activate after the AI service is connected.</p>
    </section>
  );
}
