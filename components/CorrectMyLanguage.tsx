"use client";

import { useEffect, useRef, useState } from "react";

type Access = { remaining: number; limit: number; isPrivileged: boolean; userName: string };

let harperPromise: Promise<any> | null = null;

function getHarperLinter() {
  if (!harperPromise) {
    harperPromise = (async () => {
      const [{ WorkerLinter, Dialect }, { binary }] = await Promise.all([
        import("harper.js"),
        import("harper.js/binary"),
      ]);
      const linter = new WorkerLinter({ binary, dialect: Dialect.Indian });
      await linter.setup();
      // Materialize Harper's default grammar and spelling rules before first use.
      const defaults = await linter.getDefaultLintConfig();
      await linter.setLintConfig(defaults);
      return linter;
    })().catch(error => {
      harperPromise = null;
      throw error;
    });
  }
  return harperPromise;
}

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

const irregularPast: Record<string, string> = {
  am: "was", is: "was", are: "were", go: "went", come: "came", do: "did",
  have: "had", eat: "ate", see: "saw", take: "took", make: "made", get: "got",
  buy: "bought", bring: "brought", write: "wrote", speak: "spoke", say: "said",
  tell: "told", give: "gave", find: "found", think: "thought", know: "knew",
  meet: "met", leave: "left", feel: "felt", keep: "kept", sleep: "slept",
  read: "read", run: "ran", sit: "sat", stand: "stood", begin: "began",
  drink: "drank", drive: "drove", break: "broke", choose: "chose", fall: "fell",
  forget: "forgot", hear: "heard", hold: "held", lose: "lost", pay: "paid",
  send: "sent", teach: "taught", understand: "understood", wear: "wore",
  win: "won", build: "built", catch: "caught", fly: "flew", grow: "grew",
  show: "showed", spend: "spent", swim: "swam", throw: "threw", wake: "woke",
};

const regularPastVerbs = [
  "play", "work", "visit", "call", "watch", "walk", "study", "clean", "cook",
  "travel", "open", "close", "start", "finish", "help", "need", "want", "like",
  "love", "use", "talk", "ask", "answer", "learn", "try", "stay", "move", "live",
  "dance", "wait", "look", "listen", "remember", "arrive", "enjoy", "plan",
];

function applyClearPastTenseHints(text: string) {
  const pastContext = /\b(yesterday|last\s+(?:night|week|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|\d+\s+days?\s+ago|\d+\s+weeks?\s+ago|earlier)\b/i;
  return text.split(/(?<=[.!?])\s+/).map(sentence => {
    if (!pastContext.test(sentence)) return sentence;
    let corrected = sentence;
    const replaceVerb = (word: string, replacement: string) => {
      const pattern = new RegExp("\\b" + word + "\\b", "gi");
      corrected = corrected.replace(pattern, (match, offset: number) => {
        const before = corrected.slice(Math.max(0, offset - 14), offset);
        if (/\b(?:can|could|may|might|must|shall|should|will|would|to)\s*$/i.test(before)) return match;
        return match === match.toUpperCase() ? replacement.toUpperCase()
          : match[0] === match[0].toUpperCase() ? replacement[0].toUpperCase() + replacement.slice(1)
          : replacement;
      });
    };
    for (const [present, past] of Object.entries(irregularPast)) replaceVerb(present, past);
    for (const verb of regularPastVerbs) {
      const past = /[^aeiou]y$/i.test(verb) ? verb.slice(0, -1) + "ied" : /e$/i.test(verb) ? verb + "d" : verb + "ed";
      replaceVerb(verb, past);
    }
    return corrected;
  }).join(" ");
}

function addMissingTerminalPunctuation(text: string) {
  const trimmed = text.trim();
  if (!/\s/.test(trimmed) || /[.!?…]["')\]]?$/.test(trimmed)) return trimmed;
  return trimmed.replace(/(["')\]]*)$/, ".$1");
}

async function correctWithHarper(source: string): Promise<string> {
  const linter = await getHarperLinter();
  let current = source;
  for (let pass = 0; pass < 6; pass += 1) {
    const lints = await linter.lint(current, { language: "plaintext" });
    if (!lints.length) break;
    let next = current;
    let changed = false;
    // Apply from right to left so earlier spans remain valid as text is changed.
    const ordered = [...lints].sort((a, b) => b.span().start - a.span().start);
    for (const lint of ordered) {
      const suggestions = lint.suggestions();
      if (!suggestions.length) continue;
      const candidate = await linter.applySuggestion(next, lint, suggestions[0]);
      if (candidate !== next) {
        next = candidate;
        changed = true;
      }
    }
    if (!changed || next === current) break;
    current = next;
  }
  current = applyClearPastTenseHints(current);
  current = addMissingTerminalPunctuation(current);
  return current;
}

export default function CorrectMyLanguage({ userId }: { userId: string | null }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [notice, setNotice] = useState("");
  const [access, setAccess] = useState<Access | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const requestRef = useRef(0);
  const pendingUsageRef = useRef<string | null>(null);
  const consumingRef = useRef(false);

  useEffect(() => {
    let live = true;
    if (!userId) { setLoading(false); return; }
    // Warm up the grammar engine while the user is typing, not after Submit.
    void getHarperLinter().catch(error => console.error("Harper preload failed:", error));
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
    if (!source) { setNotice("Please enter an English word, sentence, or short paragraph."); return; }
    if (source.length > 150) { setNotice("Please keep your text within 150 characters."); return; }
    if (!isEnglishText(source)) { setNotice("Please enter text in English using the Latin alphabet."); return; }
    if (!access || access.remaining <= 0) { setNotice("Your quota for Correct My Language has been exhausted. Please subscribe to continue."); return; }

    setBusy(true);
    const requestId = ++requestRef.current;
    try {
      const corrected = await correctWithHarper(source);
      if (requestId !== requestRef.current) return;
      pendingUsageRef.current = source;
      setResult(corrected);
      const kind = contentKind(source);
      setNotice(corrected === source
        ? `Your ${kind} is correct. 😊`
        : `This is your correct ${kind}${access.userName ? `, ${access.userName}` : ""} 🤗`);
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
        <button type="button" onClick={submit} disabled={busy || loading || !access || access.remaining <= 0 || Boolean(pendingUsageRef.current)} className="mt-3 rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Submit</button>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:p-6">
        <label htmlFor="correct-language-output" className="mb-2 block text-sm font-black text-emerald-700">Corrected text</label>
        <div id="correct-language-output" aria-live="polite" className="min-h-24 w-full whitespace-pre-wrap break-words rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3 text-base leading-6 text-slate-900">{result}</div>
      </div>

      {notice && <div role="status" aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm font-semibold leading-6 ${notice.includes("correct") || notice.includes("🤗") ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>{notice}{pendingUsageRef.current && <div><button type="button" onClick={clearResult} className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700">Clear</button></div>}</div>}
    </section>
  );
}
