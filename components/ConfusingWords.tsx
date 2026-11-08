"use client";

import { useEffect, useState } from "react";
import GameQuotaPopup from "@/components/GameQuotaPopup";

type WordPair = { id: string; title: string; difference: string; examples: { label: string; sentence: string }[] };

// The first entry is the sample supplied for the section layout.
// New entries can be appended here as the word-pair batches are provided.
const WORD_PAIRS: WordPair[] = [
  {
    id: "affect-effect",
    title: "Affect and effect",
    difference: "\"Affect\" is generally a verb meaning to influence or produce a change in something. \"Effect\" is usually a noun meaning the result or outcome of that change.",
    examples: [
      { label: "Affect", sentence: "Lack of sleep can negatively affect your focus during the day." },
      { label: "Effect", sentence: "The new study showed a positive effect on student grades." }
    ]
  }
];

export default function ConfusingWords({ userId }: { userId: string | null }) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [quotaPopup, setQuotaPopup] = useState(false);
  const [error, setError] = useState("");

  const privileged = isAdmin || isSubscribed;
  const current = WORD_PAIRS[index];

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let live = true;
    fetch("/api/game-access", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Quota could not be verified.");
        if (!live) return;
        setIsAdmin(Boolean(data.isAdmin));
        setIsSubscribed(Boolean(data.isSubscribed));
        setRemaining(Number(data.remainingByType?.["confusing-words"] ?? 0));
      })
      .catch(err => { if (live) setError(err instanceof Error ? err.message : "Quota could not be verified."); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [userId]);

  useEffect(() => {
    if (!quotaPopup) return;
    const timer = window.setTimeout(() => setQuotaPopup(false), 5200);
    return () => window.clearTimeout(timer);
  }, [quotaPopup]);

  const showNext = async () => {
    if (busy || index >= WORD_PAIRS.length - 1 || remaining <= 0 || !userId) return;
    setBusy(true);
    setError("");
    try {
      const next = WORD_PAIRS[index + 1];
      const response = await fetch("/api/game-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: "word-differences",
          gameTypeId: "confusing-words",
          challengeId: "confusing-words:" + next.id + ":" + Date.now()
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setQuotaPopup(true);
        setRemaining(0);
        return;
      }
      setRemaining(Number(data.remaining ?? 0));
      setIndex(value => value + 1);
    } catch {
      setError("We couldn't verify your quota. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const quotaLabel = loading
    ? "Checking daily quota…"
    : `${remaining} ${privileged ? "words remaining today" : "free words remaining"}`;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3">
        <div>
          <h2 className="text-lg font-black text-slate-900">Confusing Words</h2>
          <p className="text-xs font-medium text-slate-600">Understand the difference, one word pair at a time.</p>
        </div>
        <span className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-black text-violet-800">{quotaLabel}</span>
      </div>

      {!userId ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center font-semibold text-slate-800">Please sign in to access this section.</div>
      ) : loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center font-semibold text-slate-600">Loading your word lesson…</div>
      ) : current ? (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-violet-50 px-5 py-5 text-center sm:px-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Word Pair {index + 1} of {WORD_PAIRS.length}</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-violet-700 sm:text-3xl">{index + 1}. {current.title}</h3>
          </div>
          <div className="space-y-6 px-5 py-6 text-[15px] leading-8 text-slate-950 sm:px-8 sm:py-8">
            <section>
              <h4 className="mb-2 text-base font-extrabold text-slate-950">Difference:</h4>
              <p>{current.difference}</p>
            </section>
            <section>
              <h4 className="mb-3 text-base font-extrabold text-slate-950">Examples:</h4>
              <div className="space-y-4">
                {current.examples.map(example => (
                  <div key={example.label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="font-extrabold text-slate-950">{example.label}:</p>
                    <p className="mt-1 text-slate-950">{example.sentence}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 text-center">
            <p className="mb-3 text-xs font-semibold text-slate-500">{index + 1} of {WORD_PAIRS.length}</p>
            <button type="button" onClick={showNext} disabled={busy || loading || remaining <= 0 || index >= WORD_PAIRS.length - 1} className="min-h-12 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-8 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45">
              {busy ? "Loading…" : "Next word →"}
            </button>
            {index >= WORD_PAIRS.length - 1 && <p className="mt-3 text-xs font-medium text-slate-500">More word pairs can be added to this section.</p>}
            {error && <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">{error}</p>}
          </div>
        </article>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center font-semibold text-slate-700">No word pairs are available yet.</div>
      )}
      <GameQuotaPopup open={quotaPopup} isSubscribed={privileged} resetKey="word-differences" />
    </div>
  );
}
