"use client";

import { useEffect, useRef, useState } from "react";

type Question = { id: string; q: string; options: string[]; answer: number; fact: string };
type Game = { id: string; type: string; icon: string; title: string; subtitle: string; tone: string; questions: Question[] };

const games: Game[] = [
  { id: "pattern", type: "pattern-master", icon: "🔷", title: "The Pattern Master", subtitle: "Spot the rule. Complete the sequence.", tone: "from-cyan-500 via-blue-600 to-indigo-800", questions: [
    { id: "pu-pm-01", q: "What number comes next? 2, 6, 12, 20, 30, __", options: ["36", "40", "42", "44"], answer: 2, fact: "The differences are +4, +6, +8 and +10. The next difference is +12, giving 42." },
    { id: "pu-pm-02", q: "Find the missing letter: A, C, F, J, O, __", options: ["T", "U", "V", "W"], answer: 1, fact: "The letter jumps grow by one each time: +2, +3, +4, +5, then +6. O plus six letters is U." },
    { id: "pu-pm-03", q: "A shape sequence repeats in this order: circle, triangle, square, pentagon. Which shape is 10th?", options: ["Circle", "Triangle", "Square", "Pentagon"], answer: 1, fact: "Each group has four shapes. Positions 1, 5 and 9 are circles, so position 10 is a triangle." }
  ]},

];

export default function PuzzleUniverse({ userId, initialGameId, onExit }: { userId: string | null; initialGameId?:string; onExit?:()=>void }) {
  const [active, setActive] = useState<Game | null>(null);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [quota, setQuota] = useState<number | null>(null);
  const [quotaReady, setQuotaReady] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [exhausted, setExhausted] = useState(false);
  const session = useRef("puzzle-" + Date.now() + "-" + Math.random().toString(36).slice(2));
  const repeated = useRef(0);
  const heading = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = active?.questions[index] ?? null;

  const play = (kind: "correct" | "wrong" | "tap") => {
    if (!soundOn || typeof window === "undefined") return;
    const audio = new Audio(kind === "correct" ? "/correct.mp3" : kind === "wrong" ? "/Lose.mp3" : "/Tap.mp3");
    audio.volume = 0.85;
    void audio.play().catch(() => {});
  };

  const loadQuota = async (game: Game) => {
    setQuotaReady(false);
    setAccessError("");
    try {
      const response = await fetch("/api/game-access", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not verify quota.");
      setIsAdmin(Boolean(data.isAdmin));
      setIsSubscribed(Boolean(data.isSubscribed));
      setQuota(data.isAdmin || data.isSubscribed ? (data.remainingByType?.[game.type] ?? 0) : (data.remainingBySection?.["puzzle-universe"] ?? 0));
      setQuotaReady(true);
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Quota could not be verified.");
      setQuotaReady(true);
    }
  };

  useEffect(() => {
    if (!active || !question || !userId) return;
    let live = true;
    setReserved(false);
    setChoice(null);
    setMessage("");
    fetch("/api/game-access", {
      method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: "puzzle-universe", gameTypeId: active.type, challengeId: question.id, challengeQuestion: question.q, reserveQuestion: true, reservationSessionId: session.current })
    }).then(async response => {
      const data = await response.json();
      if (!live) return;
      if (data.repeated) {
        repeated.current += 1;
        if (repeated.current >= active.questions.length) {
          setExhausted(true);
          setMessage("You have solved every available starter puzzle in this room.");
        } else setIndex(value => (value + 1) % active.questions.length);
        return;
      }
      if (!response.ok) { setAccessError(data.error || "This puzzle could not be loaded."); return; }
      setReserved(true);
    }).catch(() => { if (live) setAccessError("We could not verify a fresh puzzle. Please try again."); });
    return () => { live = false; };
  }, [active?.id, question?.id, userId]);

  useEffect(() => { if (active && userId) void loadQuota(active); }, [active?.id, userId]);

  useEffect(() => {
    if (!active || choice === null || !message || message === "Recording your answer…") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIndex(value => (value + 1) % active.questions.length);
      setChoice(null);
      setMessage("");
      setReserved(false);
    }, 5000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [active?.id, choice, message]);

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => {
      if (heading.current) window.scrollTo({ top: Math.max(0, heading.current.getBoundingClientRect().top + window.scrollY - 82), behavior: "smooth" });
    }, 120);
    return () => clearTimeout(timeout);
  }, [active?.id]);

  const begin = (game: Game) => {
    if (timer.current) clearTimeout(timer.current);
    repeated.current = 0;
    setActive(game); setIndex(0); setChoice(null); setMessage(""); setExhausted(false); setAccessError(""); setReserved(false);
    void loadQuota(game);
  };

  useEffect(() => { if (!initialGameId) return; const game = games.find(item => item.id === initialGameId); if (game) begin(game); }, [initialGameId]);
  const record = (skip: boolean, selected: number | null) => {
    if (!active || !question || !userId || !reserved || choice !== null) return;
    if (!skip) play(selected === question.answer ? "correct" : "wrong");
    setChoice(skip ? -1 : selected);
    const explanation = skip
      ? "Skipped. Correct answer: " + question.options[question.answer] + ". " + question.fact
      : selected === question.answer ? "Correct! " + question.fact : "Not quite. Correct answer: " + question.options[question.answer] + ". " + question.fact;
    setMessage("Recording your answer…");
    void fetch("/api/game-access", {
      method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: "puzzle-universe", gameTypeId: active.type, challengeId: question.id, challengeQuestion: question.q, reservationSessionId: session.current })
    }).then(async response => {
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Your attempt could not be recorded.");
        if (data.freeTrialsExhausted || data.sectionRemaining === 0) setQuota(0);
        return;
      }
      setQuota(isAdmin || isSubscribed ? data.remaining : data.sectionRemaining);
      setMessage(explanation);
    }).catch(() => setMessage("Your attempt could not be recorded. Please check your connection."));
  };

  const back = () => {
    if (timer.current) clearTimeout(timer.current);
    if (initialGameId && onExit) { onExit(); return; }
    setActive(null); setChoice(null); setMessage(""); setReserved(false); setExhausted(false);
  };

  if (!active && !initialGameId) return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-fuchsia-200 bg-[#100b25] p-4 text-white shadow-2xl sm:p-7">
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 12% 18%,rgba(217,70,239,.42),transparent 32%),radial-gradient(circle at 88% 78%,rgba(34,211,238,.30),transparent 32%),radial-gradient(circle at 52% 45%,rgba(99,102,241,.20),transparent 38%)" }} />
      <div className="relative overflow-hidden rounded-[1.7rem] border border-fuchsia-200/30 bg-gradient-to-br from-[#21113e] via-[#171a43] to-[#08172d] px-5 py-8 text-center shadow-[inset_0_0_55px_rgba(217,70,239,.13)] sm:px-10 sm:py-12">
        <p className="text-[10px] font-black uppercase tracking-[.35em] text-cyan-200">Enter the world of curious minds</p>
        <div className="my-4 text-6xl sm:text-7xl">🧩</div>
        <h2 className="font-serif text-3xl font-black tracking-wide text-white sm:text-5xl">THE PATTERN MASTER</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-fuchsia-100/90">A playful universe of patterns, missing pieces and word mysteries. Three puzzle rooms. Countless ways to think differently.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-100">
          <span className="rounded-full border border-cyan-200/30 bg-cyan-100/10 px-3 py-2">Patterns</span>
          <span className="rounded-full border border-fuchsia-200/30 bg-fuchsia-100/10 px-3 py-2">Spatial thinking</span>
          <span className="rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-2">Wordplay</span>
        </div>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
        {games.map((game, i) => (
          <button key={game.id} onClick={() => begin(game)} className={"group relative min-h-40 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br " + game.tone + " p-5 text-left shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200"}>
            <span className="absolute -right-2 -top-5 text-8xl opacity-20 transition duration-500 group-hover:rotate-12 group-hover:scale-110">{game.icon}</span>
            <span className="text-3xl">{game.icon}</span>
            <span className="mt-3 block text-lg font-black">{String(i + 1).padStart(2, "0")} · {game.title}</span>
            <span className="mt-1 block text-xs leading-5 text-white/90">{game.subtitle}</span>
            <span className="mt-3 inline-flex rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-xs font-extrabold">Enter puzzle room →</span>
          </button>
        ))}
      </div>
      <p className="relative mt-5 text-center text-[10px] text-fuchsia-200/70">Choose a puzzle room and test your skills.</p>
    </div>
  );
  if (!active) return <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-6 text-center font-bold text-fuchsia-900">Opening Pattern Master…</div>;

  const noQuota = quota === 0 && !isAdmin && !isSubscribed;
  const noDaily = quota === 0 && (isAdmin || isSubscribed);
  return (
    <div className="space-y-4">
      <div ref={heading} className={"relative scroll-mt-20 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br " + active.tone + " p-5 text-white shadow-xl sm:p-7"}>
        <span className="absolute -right-4 -top-8 text-8xl opacity-20">{active.icon}</span>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <button onClick={back} className="rounded-full border border-white/50 bg-white/20 px-5 py-2.5 text-sm font-black text-white shadow-lg">← Back to Quiz World</button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/30 bg-black/15 px-3 py-2 text-xs font-black">{!quotaReady ? "Checking quota…" : String(quota ?? 0) + " / " + (isAdmin || isSubscribed ? 10 : 3) + (isAdmin || isSubscribed ? " plays left today" : " free trials left")}</span>
            <button onClick={() => setSoundOn(value => !value)} className="rounded-full border border-white/40 bg-white/15 px-3 py-2 text-xs font-bold">{soundOn ? "🔊 Sound on" : "🔇 Sound off"}</button>
          </div>
        </div>
        <p className="relative mt-5 text-xs font-bold uppercase tracking-[.2em] text-white/80">Quiz World · Pattern Challenge {games.findIndex(game => game.id === active.id) + 1}</p>
        <h2 className="relative mt-1 text-2xl font-black sm:text-3xl">{active.title}</h2>
        <p className="relative mt-1 text-sm text-white/90">{active.subtitle}</p>
      </div>
      {accessError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{accessError}</div>}
      {noQuota && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">Your three free trials in Puzzle Universe have been used. Subscribe to continue.</div>}
      {noDaily && <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-bold text-sky-900">Today's quota for this room is complete. Please return after the daily reset.</div>}
      {exhausted && <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 text-center text-sm font-bold text-violet-900">You have completed every currently available starter puzzle in this room. More puzzles will be added during the question-bank stage.</div>}
      {!noQuota && !noDaily && !exhausted && question && (
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-fuchsia-50 p-4 shadow-lg sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">Puzzle {String(index + 1).padStart(2, "0")}</span>
            <span className="text-xs font-bold text-slate-500">{quotaReady ? String(quota ?? 0) + " / " + (isAdmin || isSubscribed ? 10 : 3) + (isAdmin || isSubscribed ? " plays left today" : " free trials left") : "Checking quota…"}</span>
          </div>
          <h3 className="text-lg font-extrabold leading-7 text-slate-900 sm:text-xl">{question.q}</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {question.options.map((option, i) => (
              <button data-answer-choice key={question.id + "-" + i} disabled={!reserved || choice !== null || !quotaReady || noQuota || noDaily} onClick={() => record(false, i)} className={"min-h-14 rounded-xl border border-white/70 bg-gradient-to-r " + ["from-indigo-600 to-blue-700", "from-fuchsia-600 to-purple-700", "from-teal-600 to-emerald-700", "from-orange-500 to-rose-600"][i] + " px-4 py-3 text-left text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"}>
                {String.fromCharCode(65 + i)}. {option}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-500">{!reserved ? "Preparing a fresh puzzle…" : choice === null ? "Find the missing logic or skip this puzzle." : "Puzzle recorded · Next challenge in 5 seconds"}</span>
            <button disabled={!reserved || choice !== null || !quotaReady || noQuota || noDaily} onClick={() => record(true, null)} className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-md transition hover:scale-[1.03] disabled:opacity-50">⏭ Skip puzzle</button>
          </div>
          {message && <div aria-live="polite" className="mt-4 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-amber-50 p-4 text-sm font-semibold leading-6 text-slate-800">{message}</div>}
        </div>
      )}
    </div>
  );
}
