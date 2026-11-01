"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ImagePlus, WandSparkles } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function countWords(value: string) {
  return value.trim() ? value.trim().split(/\\s+/).length : 0;
}

export default function AiMagicStudioPreview() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  function chooseFile(next?: File) {
    setError("");
    if (!next) return;
    if (!ACCEPTED_TYPES.includes(next.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setFile(next);
    setResultUrl("");
    setDownloaded(false);
  }

  function updatePrompt(value: string) {
    const words = value.trim().split(/\\s+/);
    setPrompt(value.trim() && words.length > 150 ? words.slice(0, 150).join(" ") : value);
    setResultUrl("");
    setDownloaded(false);
  }

  async function createImage() {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please describe the changes you want.");
      return;
    }
    if (countWords(prompt) > 150) {
      setError("Your prompt must be 150 words or fewer.");
      return;
    }

    setLoading(true);
    setError("");
    setDownloaded(false);
    setResultUrl("");
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("prompt", prompt.trim());
      const response = await fetch("/api/ai-magic-studio", {
        method: "POST",
        body: form,
        cache: "no-store",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Image creation failed. Please try again.");
      }
      const blob = await response.blob();
      if (!blob.type.startsWith("image/") || !blob.size) {
        throw new Error("The AI service returned an invalid image. Please try again.");
      }
      setResultUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the image right now.");
    } finally {
      setLoading(false);
    }
  }

  function downloadResult() {
    if (!resultUrl || downloaded) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "shoppers-ocean-creation.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloaded(true);
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-violet-200 bg-white p-4 shadow-md sm:p-5">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-black text-slate-900">✨ AI Magic Studio</h2>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => chooseFile(event.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-300 bg-violet-50 px-3 py-2.5 text-sm font-bold text-violet-800 hover:bg-violet-100"
      >
        <ImagePlus size={17} /> {file ? "Change image" : "Upload image"}
      </button>
      <p className="mt-1 text-center text-[10px] text-slate-500">Supported formats: JPG, PNG, WebP</p>
      {file && <p className="mt-1 truncate text-center text-[10px] text-emerald-700">{file.name}</p>}

      <label htmlFor="ai-magic-prompt" className="mb-1 mt-3 block text-xs font-bold text-slate-800">
        Describe what you want
      </label>
      <textarea
        id="ai-magic-prompt"
        value={prompt}
        onChange={(event) => updatePrompt(event.target.value)}
        rows={3}
        placeholder="Describe how you want your image transformed..."
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
      <p className="mt-1 text-right text-[10px] text-slate-500">{countWords(prompt)}/150 words</p>

      {resultUrl && (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
          <img src={resultUrl} alt="AI-created result" className="max-h-64 w-full rounded-lg object-contain" />
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={createImage}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-700 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-60"
        >
          <WandSparkles size={15} /> {loading ? "Creating..." : "Create image"}
        </button>
        <button
          type="button"
          onClick={downloadResult}
          disabled={!resultUrl || downloaded || loading}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Download size={15} /> {downloaded ? "Downloaded" : "Download"}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-center text-xs font-semibold text-rose-600">{error}</p>}
      <p className="mt-2 text-center text-[10px] text-slate-500">One download per generated image. Saved directly to your device.</p>
    </section>
  );
}
