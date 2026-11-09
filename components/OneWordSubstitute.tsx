"use client";

import { useEffect, useState } from "react";
import GameQuotaPopup from "@/components/GameQuotaPopup";
import { ONE_WORD_SUBSTITUTE } from "@/data/one-word-substitute-bank";

function highlightKeyword(text: string, keyword: string) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === keyword.toLowerCase()
      ? <strong key={index} className="font-extrabold">{part}</strong>
      : part
  );
}

export default function OneWordSubstitute({ userId }: { userId: string | null }) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [quotaPopup, setQuotaPopup] = useState(false);
  const [error, setError] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [bankComplete, setBankComplete] = useState(false);
  const [reservationSessionId] = useState(() => "one-word-substitute:" + Date.now() + ":" + Math.random().toString(36).slice(2));
  const privileged = isAdmin || isSubscribed;
  const current = ONE_WORD_SUBSTITUTE[index];

  const reserveWordFrom = async (startIndex: number, isLive: () => boolean) => {
    for (let candidateIndex = startIndex; candidateIndex < ONE_WORD_SUBSTITUTE.length; candidateIndex += 1) {
      const candidate = ONE_WORD_SUBSTITUTE[candidateIndex];
      const response = await fetch("/api/game-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: "one-word-substitute",
          gameTypeId: "one-word-substitute",
          challengeId: "one-word-substitute:" + candidate.id,
          challengeQuestion: candidate.keyword,
          reserveQuestion: true,
          reservationSessionId
        })
      });
      const data = await response.json();
      if (!isLive()) return false;
      if (response.ok && data.reserved) {
        const reservedId = typeof data.challengeId === "string" ? data.challengeId : "one-word-substitute:" + candidate.id;
        const reservedIndex = ONE_WORD_SUBSTITUTE.findIndex(entry => "one-word-substitute:" + entry.id === reservedId);
        if (reservedIndex < 0) {
          setError("Your saved word could not be located. Please contact support.");
          return false;
        }
        setIndex(reservedIndex);
        setHasAccess(true);
        setBankComplete(false);
        setError("");
        return true;
      }
      if (response.status === 409 && data.repeated) continue;
      throw new Error(data.error || "Your word could not be loaded.");
    }
    if (isLive()) { setHasAccess(false); setBankComplete(true); }
    return false;
  };

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let live = true;
    (async () => {
      const response = await fetch("/api/game-access", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Quota could not be verified.");
      if (!live) return;
      setIsAdmin(Boolean(data.isAdmin));
      setIsSubscribed(Boolean(data.isSubscribed));
      setRemaining(Number(data.remainingByType?.["one-word-substitute"] ?? 0));
      await reserveWordFrom(0, () => live);
    })().catch(err => {
      if (live) setError(err instanceof Error ? err.message : "Quota could not be verified.");
    }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [userId]);

  useEffect(() => {
    if (!quotaPopup) return;
    const timer = window.setTimeout(() => setQuotaPopup(false), 5200);
    return () => window.clearTimeout(timer);
  }, [quotaPopup]);

  const showNext = async () => {
    if (busy || loading || !current || !hasAccess || !userId) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/game-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: "one-word-substitute",
          gameTypeId: "one-word-substitute",
          challengeId: "one-word-substitute:" + current.id,
          challengeQuestion: current.keyword,
          reservationSessionId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 403) { setRemaining(0); setQuotaPopup(true); }
        else if (data.repeated) {
          setError("This word was already attempted. Loading your next word…");
          await reserveWordFrom(index + 1, () => true);
        } else setError(data.error || "We couldn't verify your quota. Please try again.");
        return;
      }
      const left = Number(data.remaining ?? 0);
      setRemaining(left);
      if (left <= 0) { setHasAccess(false); setQuotaPopup(true); return; }
      await reserveWordFrom(index + 1, () => true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't verify your quota. Please try again.");
    } finally { setBusy(false); }
  };

  const quotaLabel = loading ? "Checking daily quota…" : `${remaining} ${privileged ? "words remaining today" : "free words remaining"}`;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => window.history.back()} className="inline-flex min-h-10 items-center rounded-full border border-blue-300 bg-gradient-to-r from-blue-700 to-cyan-600 px-5 py-2 text-sm font-extrabold text-white shadow-md transition hover:brightness-110">← Back</button>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-800">{quotaLabel}</span>
      </div>

      {!userId ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center font-semibold text-slate-800">Please sign in to access this section.</div>
      ) : loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center font-semibold text-slate-600">Loading your word…</div>
      ) : current && hasAccess ? (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg" aria-label={`One Word Substitute word ${index + 1}`}>
          <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-5 py-5 text-center sm:px-8">
            <p className="text-xs font-black uppercase tracking-[.18em] text-blue-700">Word {index + 1} of {ONE_WORD_SUBSTITUTE.length}</p>
            <h3 className="mt-3 text-xl font-black leading-relaxed tracking-tight text-slate-900 sm:text-2xl">{current.prompt}</h3>
            <p className="mt-4 text-lg font-bold leading-relaxed text-slate-900">{highlightKeyword(current.answerLine, current.keyword)}</p>
          </div>
          <div className="space-y-6 px-5 py-6 text-[15px] leading-8 text-slate-950 sm:px-8 sm:py-8">
            <section className="space-y-3">
              <p>{highlightKeyword(current.examples[0], current.keyword)}</p>
              <p>{highlightKeyword(current.examples[1], current.keyword)}</p>
            </section>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 text-center">
            <button type="button" onClick={showNext} disabled={busy || loading} className="min-h-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45">
              {busy ? "Loading…" : "Next word →"}
            </button>
            {error && <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">{error}</p>}
          </div>
        </article>
      ) : (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center text-blue-950 shadow-sm">
          <p className="text-base font-extrabold leading-relaxed">{error || (bankComplete
            ? "You have completed all the available words."
            : remaining <= 0
              ? privileged
                ? "Your quota for this section today has been exhausted. Please visit tomorrow to play again."
                : "Your free quota for this section has been exhausted. Please subscribe to enjoy further."
              : "No words are available yet.")}</p>
          {!privileged && remaining <= 0 && <a href="/subscribe-now" className="mt-4 inline-flex rounded-full bg-blue-700 px-5 py-2.5 text-sm font-black text-white shadow">Subscribe Now →</a>}
        </div>
      )}
      <GameQuotaPopup open={quotaPopup} isSubscribed={privileged} resetKey="one-word-substitute" />
    </div>
  );
}
