"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImagePlus, Download, RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  Sun, Palette, Frame, Type, Eye, RotateCcw as ResetIcon
} from "lucide-react";

type EditorSettings = {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sepia: number;
  zoom: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  border: number;
  borderColor: string;
  text: string;
  textColor: string;
};

const initialSettings: EditorSettings = {
  brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0,
  zoom: 1, rotation: 0, flipX: false, flipY: false,
  border: 0, borderColor: "#ffffff", text: "", textColor: "#ffffff",
};

const presets = [
  { name: "Original", values: { brightness: 100, contrast: 100, saturation: 100, sepia: 0 } },
  { name: "Vivid", values: { brightness: 108, contrast: 118, saturation: 155, sepia: 0 } },
  { name: "Vintage", values: { brightness: 105, contrast: 92, saturation: 78, sepia: 42 } },
  { name: "Mono", values: { brightness: 105, contrast: 120, saturation: 0, sepia: 0 } },
  { name: "Dreamy", values: { brightness: 112, contrast: 88, saturation: 112, sepia: 12 } },
  { name: "Cinematic", values: { brightness: 92, contrast: 128, saturation: 82, sepia: 18 } },
];

function Slider({ label, value, min, max, suffix = "%", onChange }: {
  label: string; value: number; min: number; max: number; suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-xl bg-slate-50 p-3">
      <span className="mb-2 flex justify-between text-xs font-semibold text-slate-700">
        {label}<span className="text-violet-700">{value}{suffix}</span>
      </span>
      <input aria-label={label} className="w-full accent-violet-600" type="range" min={min} max={max} value={value}
        onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

export default function AiMagicStudioPreview() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [settings, setSettings] = useState<EditorSettings>(initialSettings);
  const [showOriginal, setShowOriginal] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState("");

  function change<K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setDownloaded(false);
  }

  function chooseFile(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    setImageUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return nextUrl;
    });
    setFileName(file.name);
    setSettings(initialSettings);
    setDownloaded(false);
    setError("");
    setShowOriginal(false);
  }

  useEffect(() => {
    if (!imageUrl) return;
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      renderCanvas(false);
    };
    image.onerror = () => setError("This image could not be opened. Please try another file.");
    image.src = imageUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  useEffect(() => {
    if (imageRef.current) renderCanvas(showOriginal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, showOriginal]);

  function renderCanvas(original: boolean) {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return;
    const s = original ? initialSettings : settings;
    const quarterTurn = Math.abs(s.rotation % 180) === 90;
    const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
    const baseW = Math.max(1, Math.round(image.naturalWidth * scale));
    const baseH = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.width = quarterTurn ? baseH : baseW;
    canvas.height = quarterTurn ? baseW : baseH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((s.rotation * Math.PI) / 180);
    ctx.scale((s.flipX ? -1 : 1) * s.zoom, (s.flipY ? -1 : 1) * s.zoom);
    ctx.filter = `brightness(${s.brightness}%) contrast(${s.contrast}%) saturate(${s.saturation}%) blur(${s.blur}px) sepia(${s.sepia}%)`;
    ctx.drawImage(image, -baseW / 2, -baseH / 2, baseW, baseH);
    ctx.restore();
    ctx.filter = "none";
    if (!original && s.border > 0) {
      ctx.fillStyle = s.borderColor;
      const b = Math.min(s.border, Math.floor(Math.min(canvas.width, canvas.height) / 4));
      ctx.fillRect(0, 0, canvas.width, b);
      ctx.fillRect(0, canvas.height - b, canvas.width, b);
      ctx.fillRect(0, b, b, canvas.height - 2 * b);
      ctx.fillRect(canvas.width - b, b, b, canvas.height - 2 * b);
    }
    if (!original && s.text.trim()) {
      const size = Math.max(18, Math.round(canvas.width * 0.045));
      ctx.font = `bold ${size}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.lineWidth = Math.max(2, size / 10);
      ctx.strokeStyle = "rgba(0,0,0,.55)";
      ctx.fillStyle = s.textColor;
      ctx.strokeText(s.text.slice(0, 100), canvas.width / 2, canvas.height - Math.max(18, size * 0.65));
      ctx.fillText(s.text.slice(0, 100), canvas.width / 2, canvas.height - Math.max(18, size * 0.65));
    }
  }

  function downloadImage() {
    const canvas = canvasRef.current;
    if (!canvas || downloaded || !imageUrl) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("The edited image could not be prepared. Please try again.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "shoppers-ocean-edited-image.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDownloaded(true);
    }, "image/png");
  }

  function rotate(degrees: number) {
    change("rotation", (settings.rotation + degrees + 360) % 360);
  }

  return (
    <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-lg">
      <header className="bg-gradient-to-r from-violet-800 via-indigo-700 to-fuchsia-700 px-4 py-4 text-center text-white">
        <h2 className="text-xl font-black tracking-tight">🎨 Creative Image Studio</h2>
        <p className="mt-1 text-xs text-violet-100">Make every picture your own</p>
      </header>

      <div className="space-y-4 p-3 sm:p-5">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
          onChange={(event) => chooseFile(event.target.files?.[0])} />
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 px-3 py-3 text-sm font-bold text-violet-800 transition hover:bg-violet-100">
          <ImagePlus size={18} /> {imageUrl ? "Change image" : "Upload your image"}
        </button>
        <p className="text-center text-[11px] text-slate-500">Supported formats: JPG, PNG, WebP</p>
        {fileName && <p className="truncate text-center text-xs font-medium text-emerald-700">{fileName}</p>}

        <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] p-2">
          {imageUrl ? <canvas ref={canvasRef} className="h-auto max-h-[440px] max-w-full object-contain" /> :
            <div className="py-12 text-center text-sm text-slate-400"><ImagePlus className="mx-auto mb-2" size={30} />Your image preview will appear here</div>}
        </div>

        {imageUrl && <>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => rotate(-90)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold text-slate-700"><RotateCcw size={14}/> Rotate left</button>
            <button onClick={() => rotate(90)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold text-slate-700"><RotateCw size={14}/> Rotate right</button>
            <button onClick={() => change("flipX", !settings.flipX)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold text-slate-700"><FlipHorizontal size={14}/> Flip H</button>
            <button onClick={() => change("flipY", !settings.flipY)} className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-semibold text-slate-700"><FlipVertical size={14}/> Flip V</button>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800"><Palette size={16} className="text-violet-700"/> Quick looks</h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {presets.map((preset) => <button key={preset.name} onClick={() => setSettings((s) => ({ ...s, ...preset.values }))} className="rounded-lg border border-violet-100 bg-violet-50 px-2 py-2 text-xs font-bold text-violet-800 hover:border-violet-400">{preset.name}</button>)}
            </div>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800"><Sun size={16} className="text-violet-700"/> Light & colour</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Slider label="Brightness" value={settings.brightness} min={30} max={180} onChange={(v) => change("brightness", v)}/>
              <Slider label="Contrast" value={settings.contrast} min={30} max={180} onChange={(v) => change("contrast", v)}/>
              <Slider label="Saturation" value={settings.saturation} min={0} max={200} onChange={(v) => change("saturation", v)}/>
              <Slider label="Soft focus" value={settings.blur} min={0} max={8} suffix="px" onChange={(v) => change("blur", v)}/>
              <Slider label="Sepia / warmth" value={settings.sepia} min={0} max={100} onChange={(v) => change("sepia", v)}/>
              <Slider label="Zoom" value={Math.round(settings.zoom * 100)} min={70} max={150} onChange={(v) => change("zoom", v / 100)}/>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-3">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800"><Frame size={16} className="text-violet-700"/> Border & frame</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1"><Slider label="Frame thickness" value={settings.border} min={0} max={80} suffix="px" onChange={(v) => change("border", v)}/></div>
              <input aria-label="Frame colour" type="color" value={settings.borderColor} onChange={(e) => change("borderColor", e.target.value)} className="h-10 w-12 cursor-pointer rounded border p-1"/>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-3">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800"><Type size={16} className="text-violet-700"/> Add a caption</h3>
            <input value={settings.text} maxLength={100} onChange={(e) => change("text", e.target.value)} placeholder="Write something on your image..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"/>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>Caption colour</span><input aria-label="Caption colour" type="color" value={settings.textColor} onChange={(e) => change("textColor", e.target.value)} className="h-8 w-10 cursor-pointer rounded border p-1"/></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setShowOriginal((v) => !v)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-700"><Eye size={15}/>{showOriginal ? "Show edits" : "Compare original"}</button>
            <button onClick={() => { setSettings(initialSettings); setShowOriginal(false); setDownloaded(false); }} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-700"><ResetIcon size={15}/> Reset edits</button>
          </div>
          <button onClick={downloadImage} disabled={downloaded} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-700 px-4 py-3 text-sm font-extrabold text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
            <Download size={17}/>{downloaded ? "Image already downloaded" : "Download edited image"}
          </button>
          <p className="text-center text-[10px] text-slate-500">One download per editing session. Your image is edited in your browser.</p>
        </>}

        {error && <p role="alert" className="text-center text-xs font-semibold text-rose-600">{error}</p>}
      </div>
    </section>
  );
}
