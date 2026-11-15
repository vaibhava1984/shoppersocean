"use client";

import { useEffect, useRef, useState } from "react";

type Access = { remaining: number; limit: number; isPrivileged: boolean; userName: string };

function isEnglishText(value: string) {
  const letters = value.match(/[\p{L}]/gu) ?? [];
  if (!letters.length) return false;
  const latin = value.match(/[\p{Script=Latin}]/gu) ?? [];
  return latin.length / letters.length >= 0.9 && !/[\p{Script=Devanagari}\p{Script=Arabic}\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hangul}]/u.test(value);
}

function contentKind(value: string): "word" | "sentence" | "paragraph" {
  if (!/\s/.test(value.trim())) return "word";
  if (value.includes("\n") || value.trim().length > 240) return "paragraph";
  return "sentence";
}

async function correctWithHarper(source: string): Promise<string> {
  // LocalLinter avoids worker-startup/bundling failures in the hosted app.
  // The 150-character limit keeps this small task responsive on mobile.
  const [{ LocalLinter, Dialect }, { binary }] = await Promise.all([
    import("harper.js"),
    import("harper.js/binary"),
  ]);
  const linter = new LocalLinter({ binary, dialect: Dialect.Indian });
  try {
    await linter.setup();
    let current = source;
    for (let pass = 0; pass < 40; pass += 1) {
      const lints = await linter.lint(current, { language: "plaintext" });
      let changed = false;
      for (const lint of lints) {
        const suggestions = lint.suggestions();
        if (suggestions.length > 0) {
          current = await linter.applySuggestion(current, lint, suggestions[0]);
          changed = true;
          break;
        }
      }
      if (!changed) break;
    }
    return current;
  } finally {
    await linter.dispose();
  }
}

export default function CorrectMyLanguage({ userId }: { userId: string | null }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [notice, setNotice] = useState("");
  const [access, setAccess] = useState<Access | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    let live = true;
    if (!userId) { setLoading(false); return; }
    fetch("/api/correct-my-language", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Quota could not be verified.");
        if (live) setAccess(data);
      })
      .catch(error => { if (live) setNotice(error instanceof Error ? error.message : "Quota could not be verified."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; requestRef.current += 1; };
  }, [userId]);

  const submit = async () => {
    const source = input.trim();
    if (busy) return;
    setResult("");
    setNotice("");
    if (!source) { setNotice("Please enter an English word, sentence, or short paragraph."); return; }
    if (source.length > 150) { setNotice("Please keep your text within 150 characters."); return; }
    if (!isEnglishText(source)) { setNotice("Please enter text in English using the Latin alphabet."); return; }
    if (!access || access.remaining <= 0) { setNotice("Your quota for Correct My Language has been exhausted. Please subscribe to continue."); return; }

    setBusy(true);
    const requestId = ++requestRef.current;
    try {
      const corrected = await correctWithHarper(source);
      if (requestId !== requestRef.current) return;
      const response = await fetch("/api/correct-my-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processed: true, text: source }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) {
          setAccess(previous => previous ? { ...previous, remaining: 0 } : previous);
          setNotice(data.error || "Your quota for Correct My Language has been exhausted.");
        } else setNotice(data.error || "Your correction could not be saved. Please try again.");
        return;
      }
      setAccess(data);
      setResult(corrected);
      const kind = contentKind(source);
      setNotice(corrected === source
        ? `Your ${kind} is correct. 😊`
        : `This is your correct ${kind}${data.userName ? `, ${data.userName}` : ""} 🤗`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The correction engine could not start. Please try again.");
    } finally {
      if (requestId === requestRef.current) setBusy(false);
    }
  };

  const privileged = Boolean(access?.isPrivileged);
  return (
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Correct My Language</h2>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-800 shadow-sm">{loading ? "Checking quota…" : access ? privileged ? `${access.remaining} out of 10 corrections remaining for today` : `${access.remaining} out of 3 free corrections remaining` : "Quota unavailable"}</span>
        </div>
        <label htmlFor="correct-language-input" className="mb-2 block text-sm font-bold text-slate-700">Enter an English word, sentence, or short paragraph</label>
        <textarea id="correct-language-input" value={input} onChange={event => setInput(event.target.value.slice(0, 150))} maxLength={150} rows={3} placeholder="Type your English text here…" className="h-24 w-full resize-none rounded-xl border-2 border-violet-200 bg-white p-3 text-base leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
        <div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500"><span>Maximum 150 characters</span><span>{input.length}/150</span></div>
        <button type="button" onClick={submit} disabled={busy || loading || !access || access.remaining <= 0} className="mt-3 rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Submit</button>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:p-6">
        <label htmlFor="correct-language-output" className="mb-2 block text-sm font-black text-emerald-700">Corrected text</label>
        <div id="correct-language-output" aria-live="polite" className="min-h-24 w-full whitespace-pre-wrap break-words rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3 text-base leading-6 text-slate-900">{result || <span className="text-slate-400">Your corrected text will appear here…</span>}</div>
      </div>

      {notice && <p role="status" aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm font-semibold leading-6 ${notice.includes("correct") || notice.includes("🤗") ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{notice}</p>}
    </section>
  );
}
