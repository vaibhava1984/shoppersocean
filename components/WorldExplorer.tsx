"use client";

import { useEffect, useRef, useState } from "react";

type Question = { id: string; q: string; options: string[]; answer: number; fact: string; image?: string; alt?: string; };
type Game = { id: string; type: string; icon: string; title: string; subtitle: string; tone: string; questions: Question[]; };

// Image URLs are kept in question data, not bundled into the Worker. Images are small,
// responsive WebP/flag assets and are requested only when their question is shown.
const games: Game[] = [
  { id: "geo", type: "geography-quest", icon: "🧭", title: "The Geography Quest", subtitle: "Explore countries, flags and natural wonders.", tone: "from-emerald-500 via-teal-600 to-cyan-800", questions: [
    { id: "we-gq-01", q: "Which country does this flag belong to?", image: "https://flagcdn.com/w320/jp.png", alt: "Flag of Japan", options: ["China", "Japan", "South Korea", "Thailand"], answer: 1, fact: "The white field and red sun disc identify Japan's national flag." },
    { id: "we-gq-02", q: "Which continent is the Sahara Desert located in?", options: ["Asia", "South America", "Africa", "Australia"], answer: 2, fact: "The Sahara stretches across much of northern Africa." },
    { id: "we-gq-03", q: "Identify the country shown by this flag.", image: "https://flagcdn.com/w320/br.png", alt: "Flag of Brazil", options: ["Portugal", "Brazil", "Argentina", "Mexico"], answer: 1, fact: "The green field, yellow diamond and blue globe belong to Brazil." }
  ]},
  { id: "culture", type: "world-culture", icon: "🎎", title: "The World Culture Challenge", subtitle: "Discover traditions, symbols and cultural heritage.", tone: "from-fuchsia-600 via-purple-700 to-indigo-900", questions: [
    { id: "we-wc-01", q: "Which country is strongly associated with the traditional garment shown?", image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=560&auto=format&fit=crop&q=55", alt: "Traditional Japanese kimono", options: ["Japan", "Norway", "Egypt", "Peru"], answer: 0, fact: "The kimono is a traditional Japanese garment. Clothing styles vary by occasion and region." },
    { id: "we-wc-02", q: "The festival of Holi is widely celebrated in which country?", options: ["India", "Iceland", "Chile", "Kenya"], answer: 0, fact: "Holi is a spring festival widely celebrated in India and by communities around the world." },
    { id: "we-wc-03", q: "Which instrument is traditionally associated with the Scottish Highlands?", options: ["Sitar", "Bagpipes", "Koto", "Didgeridoo"], answer: 1, fact: "The Great Highland bagpipe is strongly associated with Scottish musical tradition." }
  ]},
  { id: "landmark", type: "landmark-adventure", icon: "🏛️", title: "The Landmark Adventure", subtitle: "Recognise iconic buildings and natural wonders.", tone: "from-amber-500 via-orange-600 to-rose-700", questions: [
    { id: "we-la-01", q: "Which world-famous monument is pictured here?", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=560&auto=format&fit=crop&q=55", alt: "Taj Mahal in Agra", options: ["Angkor Wat", "Taj Mahal", "Petra", "Colosseum"], answer: 1, fact: "The Taj Mahal stands in Agra, India, and was commissioned by Mughal emperor Shah Jahan." },
    { id: "we-la-02", q: "In which city would you find the Eiffel Tower?", options: ["Rome", "Paris", "Vienna", "Lisbon"], answer: 1, fact: "The Eiffel Tower is one of the best-known landmarks of Paris, France." },
    { id: "we-la-03", q: "Which natural wonder is shown in this picture?", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=560&auto=format&fit=crop&q=55", alt: "Large waterfall surrounded by greenery", options: ["A glacier", "A volcano", "A waterfall", "A canyon"], answer: 2, fact: "The image shows a powerful waterfall. In the full question bank, each image will be checked against its exact place and caption." }
  ]}
];

export default function WorldExplorer({ userId }: { userId: string | null }) {
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
  const session = useRef("world-" + Date.now() + "-" + Math.random().toString(36).slice(2));
  const repeated = useRef(0);
  const heading = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const question = active?.questions[index] ?? null;

  const play = (kind: "correct" | "wrong" | "tap") => {
    if (!soundOn || typeof window === "undefined") return;
    const audio = new Audio(kind === "correct" ? "/correct.mp3" : kind === "wrong" ? "/Lose.mp3" : "/Tap.mp3");
    audio.volume = 0.8;
    void audio.play().catch(() => {});
  };

  const loadQuota = async (game: Game) => {
    setQuotaReady(false); setAccessError("");
    try {
      const response = await fetch("/api/game-access", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not verify quota.");
      setIsAdmin(Boolean(data.isAdmin)); setIsSubscribed(Boolean(data.isSubscribed));
      setQuota(data.isAdmin || data.isSubscribed ? (data.remainingByType?.[game.type] ?? 0) : (data.remainingBySection?.["world-explorer"] ?? 0));
      setQuotaReady(true);
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Quota could not be verified."); setQuotaReady(true);
    }
  };

  useEffect(() => {
    if (!active || !question || !userId) return;
    let live = true; setReserved(false); setChoice(null); setMessage("");
    fetch("/api/game-access", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: "world-explorer", gameTypeId: active.type, challengeId: question.id, challengeQuestion: question.q, reserveQuestion: true, reservationSessionId: session.current })
    }).then(async response => {
      const data = await response.json(); if (!live) return;
      if (data.repeated) {
        repeated.current += 1;
        if (repeated.current >= active.questions.length) { setExhausted(true); setMessage("You have explored every available starter question in this game."); }
        else setIndex(value => (value + 1) % active.questions.length);
        return;
      }
      if (!response.ok) { setAccessError(data.error || "This question could not be loaded."); return; }
      setReserved(true);
    }).catch(() => { if (live) setAccessError("We could not verify a fresh question. Please try again."); });
    return () => { live = false; };
  }, [active?.id, question?.id, userId]);

  useEffect(() => { if (active && userId) void loadQuota(active); }, [active?.id, userId]);

  useEffect(() => {
    if (!active || choice === null || !message || message === "Recording your answer…") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setIndex(value => (value + 1) % active.questions.length); setChoice(null); setMessage(""); setReserved(false); }, 5000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [active?.id, choice, message]);

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => { if (heading.current) window.scrollTo({ top: Math.max(0, heading.current.getBoundingClientRect().top + window.scrollY - 82), behavior: "smooth" }); }, 120);
    return () => clearTimeout(timeout);
  }, [active?.id]);

  const begin = (game: Game) => {
    if (timer.current) clearTimeout(timer.current);
    repeated.current = 0; setActive(game); setIndex(0); setChoice(null); setMessage(""); setExhausted(false); setAccessError(""); setReserved(false); void loadQuota(game);
  };

  const record = (skip: boolean, selected: number | null) => {
    if (!active || !question || !userId || !reserved || choice !== null) return;
    play(skip ? "tap" : selected === question.answer ? "correct" : "wrong");
    setChoice(skip ? -1 : selected);
    const explanation = skip ? "Skipped. Correct answer: " + question.options[question.answer] + ". " + question.fact : selected === question.answer ? "Correct! " + question.fact : "Not quite. Correct answer: " + question.options[question.answer] + ". " + question.fact;
    setMessage("Recording your answer…");
    void fetch("/api/game-access", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: "world-explorer", gameTypeId: active.type, challengeId: question.id, challengeQuestion: question.q, reservationSessionId: session.current })
    }).then(async response => {
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || "Your attempt could not be recorded."); if (data.freeTrialsExhausted || data.sectionRemaining === 0) setQuota(0); return; }
      setQuota(isAdmin || isSubscribed ? data.remaining : data.sectionRemaining); setMessage(explanation);
    }).catch(() => setMessage("Your attempt could not be recorded. Please check your connection."));
  };

  const back = () => { if (timer.current) clearTimeout(timer.current); setActive(null); setChoice(null); setMessage(""); setReserved(false); setExhausted(false); };

  if (!active) return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-emerald-200 bg-[#071d25] p-4 text-white shadow-2xl sm:p-7">
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 12% 15%,rgba(52,211,153,.35),transparent 32%),radial-gradient(circle at 88% 75%,rgba(34,211,238,.3),transparent 32%),radial-gradient(circle at 50% 45%,rgba(250,204,21,.16),transparent 38%)" }} />
      <div className="relative overflow-hidden rounded-[1.7rem] border border-emerald-100/25 bg-gradient-to-br from-[#103c3a] via-[#12334a] to-[#071c30] px-5 py-8 text-center sm:px-10 sm:py-12">
        <p className="text-[10px] font-black uppercase tracking-[.35em] text-amber-200">A planet full of stories</p>
        <div className="my-3 text-6xl sm:text-7xl">🌍</div>
        <h2 className="font-serif text-3xl font-black tracking-wide text-white sm:text-5xl">WORLD EXPLORER</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90">Travel through maps, traditions and extraordinary places. Look closely, recognise the picture and discover something new.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-100">
          <span className="rounded-full border border-cyan-200/30 bg-cyan-100/10 px-3 py-2">Picture clues</span><span className="rounded-full border border-emerald-200/30 bg-emerald-100/10 px-3 py-2">Maps & flags</span><span className="rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-2">Landmarks</span>
        </div>
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
        {games.map((game, i) => <button key={game.id} onClick={() => begin(game)} className={"group relative min-h-40 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br " + game.tone + " p-5 text-left shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"}>
          <span className="absolute -right-2 -top-5 text-8xl opacity-20">{game.icon}</span><span className="text-3xl">{game.icon}</span><span className="mt-3 block text-lg font-black">{String(i + 1).padStart(2, "0")} · {game.title}</span><span className="mt-1 block text-xs leading-5 text-white/90">{game.subtitle}</span><span className="mt-3 inline-flex rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-xs font-extrabold">Start exploring →</span>
        </button>)}
      </div>
      <p className="relative mt-5 text-center text-[10px] text-emerald-100/70">Admin preview · Starter set · Larger question and picture banks can be added without changing this layout</p>
    </div>
  );

  const noQuota = quota === 0 && !isAdmin && !isSubscribed;
  const noDaily = quota === 0 && (isAdmin || isSubscribed);
  return <div className="space-y-4">
    <div ref={heading} className={"relative scroll-mt-20 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br " + active.tone + " p-5 text-white shadow-xl sm:p-7"}>
      <span className="absolute -right-4 -top-8 text-8xl opacity-20">{active.icon}</span>
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <button onClick={back} className="rounded-full border border-white/50 bg-white/20 px-5 py-2.5 text-sm font-black text-white shadow-lg">← Back to World Explorer</button>
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/30 bg-black/15 px-3 py-2 text-xs font-black">{isAdmin ? "ADMIN PREVIEW" : isSubscribed ? "SUBSCRIBER" : String(quota ?? "…") + " free questions left"}</span><button onClick={() => setSoundOn(v => !v)} className="rounded-full border border-white/40 bg-white/15 px-3 py-2 text-xs font-bold">{soundOn ? "🔊 Sound on" : "🔇 Sound off"}</button></div>
      </div>
      <p className="relative mt-5 text-xs font-bold uppercase tracking-[.2em] text-white/80">World Explorer · Journey {games.findIndex(g => g.id === active.id) + 1}</p><h2 className="relative mt-1 text-2xl font-black sm:text-3xl">{active.title}</h2><p className="relative mt-1 text-sm text-white/90">{active.subtitle}</p>
    </div>
    {accessError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{accessError}</div>}
    {noQuota && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">Your three free trials in World Explorer have been used. Subscribe to continue.</div>}
    {noDaily && <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-bold text-sky-900">Today's quota for this game is complete. Please return after the daily reset.</div>}
    {exhausted && <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 text-center text-sm font-bold text-violet-900">You have completed every currently available starter question in this game. The full picture and question bank will be added in the next content stage.</div>}
    {!noQuota && !noDaily && !exhausted && question && <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-4 shadow-lg sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">Discovery {String(index + 1).padStart(2, "0")}</span><span className="text-xs font-bold text-slate-500">{quotaReady ? (isAdmin ? "Unlimited preview" : String(quota ?? 0) + " remaining") : "Checking quota…"}</span></div>
      {question.image && <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"><img src={question.image} alt={question.alt || "World Explorer picture clue"} loading="lazy" decoding="async" className="mx-auto block h-36 w-full max-w-md object-cover sm:h-44" /><p className="px-3 py-1.5 text-center text-[10px] font-semibold text-slate-500">Picture clue · Look carefully before choosing</p></div>}
      <h3 className="text-lg font-extrabold leading-7 text-slate-900 sm:text-xl">{question.q}</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{question.options.map((option, i) => <button key={question.id + "-" + i} disabled={!reserved || choice !== null || !quotaReady || noQuota || noDaily} onClick={() => record(false, i)} className={"min-h-14 rounded-xl border border-white/70 bg-gradient-to-r " + ["from-indigo-600 to-blue-700", "from-fuchsia-600 to-purple-700", "from-teal-600 to-emerald-700", "from-orange-500 to-rose-600"][i] + " px-4 py-3 text-left text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"}>{String.fromCharCode(65 + i)}. {option}</button>)}</div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-500">{!reserved ? "Preparing your discovery…" : choice === null ? "Observe, identify or skip this question." : "Answer recorded · Next discovery in 5 seconds"}</span><button disabled={!reserved || choice !== null || !quotaReady || noQuota || noDaily} onClick={() => record(true, null)} className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-md transition hover:scale-[1.03] disabled:opacity-50">⏭ Skip question</button></div>
      {message && <div aria-live="polite" className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 text-sm font-semibold leading-6 text-slate-800">{message}</div>}
    </div>}
  </div>;
}
