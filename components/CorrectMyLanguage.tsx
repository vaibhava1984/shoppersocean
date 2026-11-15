"use client";

import { useEffect, useRef, useState } from "react";

type Access = { remaining: number; limit: number; isPrivileged: boolean; userName: string };

function isEnglishText(value: string) {
  const letters = value.match(/[\p{L}]/gu) ?? [];
  if (!letters.length) return false;
  const latin = value.match(/[\p{Script=Latin}]/gu) ?? [];
  return latin.length / letters.length >= 0.9 && !/[\p{Script=Devanagari}\p{Script=Arabic}\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hangul}]/u.test(value);
}

function contentKind(value: string): "word" | "sentence" {
  return /\s/.test(value.trim()) ? "sentence" : "word";
}

function playFeedbackTone(isCorrect: boolean) {
  if (typeof window === "undefined") return;
  const tone = new Audio(isCorrect ? "/Win.mp3" : "/Lose.mp3");
  tone.volume = 0.75;
  void tone.play().catch(() => {});
}

export default function CorrectMyLanguage({ userId }: { userId: string | null }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [notice, setNotice] = useState("");
  const [access, setAccess] = useState<Access | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [hasPendingUsage, setHasPendingUsage] = useState(false);
  const requestRef = useRef(0);
  const pendingUsageRef = useRef<string | null>(null);
  const consumingRef = useRef(false);

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
    return () => {
      live = false;
      requestRef.current += 1;
      const pendingText = pendingUsageRef.current;
      if (pendingText && !consumingRef.current) {
        void fetch("/api/correct-my-language", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ processed: true, text: pendingText }),
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [userId]);

  const consumePendingUsage = async () => {
    const pendingText = pendingUsageRef.current;
    if (!pendingText) return access;
    if (consumingRef.current) throw new Error("Your correction is already being recorded.");
    consumingRef.current = true;
    try {
      const response = await fetch("/api/correct-my-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processed: true, text: pendingText }),
        keepalive: true,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your correction could not be recorded.");
      pendingUsageRef.current = null;
      setHasPendingUsage(false);
      setAccess(data);
      return data as Access;
    } finally {
      consumingRef.current = false;
    }
  };

  const clearResult = async () => {
    if (!pendingUsageRef.current) return;
    try {
      await consumePendingUsage();
      setInput("");
      setResult("");
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Please try clearing again.");
    }
  };

  const submit = async () => {
    const source = input.trim();
    if (busy || pendingUsageRef.current) return;
    setResult("");
    setNotice("");
    if (!source || source.length > 100 || /[\r\n]/.test(source)) { setNotice("Check your word or sentence."); return; }
    if (!isEnglishText(source)) { setNotice("Please enter text in English using the Latin alphabet."); return; }
    if (!access || access.remaining <= 0) { setNotice("Your quota for Correct My English has been exhausted. Please subscribe to continue."); return; }

    setBusy(true);
    const requestId = ++requestRef.current;
    try {
      const response = await fetch("/api/correct-my-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "correct", text: source }),
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your text could not be corrected. Please try again.");
      const corrected = typeof data.corrected === "string" ? data.corrected : "";
      if (!corrected) throw new Error("Your text could not be corrected. Please try again.");
      if (requestId !== requestRef.current) return;
      pendingUsageRef.current = source;
      setHasPendingUsage(true);
      setResult(corrected);
      const kind = contentKind(source);
      const isCorrect = corrected === source;
      setNotice(isCorrect
        ? `Your ${kind} is correct. 😊`
        : `This is your correct ${kind}${access.userName ? `, ${access.userName}` : ""} 🤗`);
      playFeedbackTone(isCorrect);
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
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Correct My English</h2>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-800 shadow-sm">{loading ? "Checking quota…" : access ? privileged ? `${access.remaining} out of 10 corrections remaining for today` : `${access.remaining} out of 3 free corrections remaining` : "Quota unavailable"}</span>
        </div>
        <label htmlFor="correct-language-input" className="mb-2 block text-sm font-bold text-slate-700">Enter your word or sentence</label>
        <textarea id="correct-language-input" value={input} onChange={event => setInput(event.target.value.slice(0, 100))} maxLength={100} rows={3} placeholder="Type your English text here…" className="h-24 w-full resize-none rounded-xl border-2 border-violet-200 bg-white p-3 text-base leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
        <div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500"><span>Maximum 100 characters</span><span>{input.length}/100</span></div>
        <button type="button" onClick={submit} disabled={busy || loading || !access || access.remaining <= 0 || hasPendingUsage} className="mt-3 rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Submit</button>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:p-6">
        <label htmlFor="correct-language-output" className="mb-2 block text-sm font-black text-emerald-700">Corrected text</label>
        <div id="correct-language-output" aria-live="polite" className="min-h-24 w-full whitespace-pre-wrap break-words rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3 text-base leading-6 text-slate-900">{result}</div>
        {notice && <div role="status" aria-live="polite" className={`mt-3 rounded-xl border px-4 py-3 text-sm font-semibold leading-6 ${notice.includes("correct") || notice.includes("🤗") ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{notice}</div>}
        {hasPendingUsage && <button type="button" onClick={clearResult} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700">Clear</button>}
      </div>
    </section>
  );
}
