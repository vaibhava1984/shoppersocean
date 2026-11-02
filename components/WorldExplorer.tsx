"use client";
import GameQuotaNotice from "@/components/GameQuotaNotice";

import { useEffect, useRef, useState } from "react";
import GameQuotaPopup from "@/components/GameQuotaPopup";

type Question = { id: string; q: string; options: string[]; answer: number; fact: string; image?: string; alt?: string; };
type Game = { id: string; type: string; icon: string; title: string; subtitle: string; tone: string; questions: Question[]; };

// Image URLs are kept in question data, not bundled into the Worker. Images are small,
// responsive WebP/flag assets and are requested only when their question is shown.
const games: Game[] = [
  { id: "geo", type: "geography-quest", icon: "🧭", title: "The Geography Quest", subtitle: "Explore countries, flags and natural wonders.", tone: "from-emerald-500 via-teal-600 to-cyan-800", questions: [
    { id: "we-gq-01", q: "Which country does this flag belong to?", image: "https://flagcdn.com/w320/jp.png", alt: "", options: ["China", "Japan", "South Korea", "Thailand"], answer: 1, fact: "The white field and red sun disc identify Japan's national flag." },
    { id: "we-gq-02", q: "Which continent is home to this famous desert landscape?", image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=640&auto=format&fit=crop&q=60", alt: "", options: ["Asia", "Africa", "South America", "Europe"], answer: 1, fact: "The Sahara is the world's largest hot desert and lies in northern Africa." },
    { id: "we-gq-03", q: "Identify the country shown by this flag.", image: "https://flagcdn.com/w320/br.png", alt: "", options: ["Portugal", "Brazil", "Argentina", "Mexico"], answer: 1, fact: "The green field, yellow diamond and blue globe belong to Brazil." },
    { id: "we-gq-04", q: "Which country does this flag represent?", image: "https://flagcdn.com/w320/ca.png", alt: "", options: ["Austria", "Canada", "Denmark", "Peru"], answer: 1, fact: "The maple leaf is a national symbol of Canada." },
    { id: "we-gq-05", q: "Which country is represented by this flag?", image: "https://flagcdn.com/w320/za.png", alt: "", options: ["South Africa", "Jamaica", "Kenya", "Ghana"], answer: 0, fact: "South Africa's flag has six colours and a distinctive green Y shape." },
    { id: "we-gq-06", q: "Which country does this flag belong to?", image: "https://flagcdn.com/w320/gr.png", alt: "", options: ["Greece", "Finland", "Israel", "Uruguay"], answer: 0, fact: "The blue and white stripes and cross identify Greece." },
    { id: "we-gq-07", q: "What natural feature is shown in this picture?", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=640&auto=format&fit=crop&q=60", alt: "", options: ["Volcano", "Waterfall", "Glacier", "Canyon"], answer: 1, fact: "A waterfall is a place where water drops vertically over a steep edge." },
    { id: "we-gq-08", q: "Which country is shown by this flag?", image: "https://flagcdn.com/w320/in.png", alt: "", options: ["Ireland", "India", "Niger", "Italy"], answer: 1, fact: "India's flag has saffron, white and green bands with a navy Ashoka Chakra." },
    { id: "we-gq-09", q: "Identify this famous mountain range.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=640&auto=format&fit=crop&q=60", alt: "", options: ["The Alps", "The Andes", "The Himalayas", "The Urals"], answer: 2, fact: "The Himalayas contain Mount Everest, the world's highest mountain above sea level." },
    { id: "we-gq-10", q: "Which country does this flag represent?", image: "https://flagcdn.com/w320/kr.png", alt: "", options: ["Japan", "South Korea", "North Korea", "Mongolia"], answer: 1, fact: "The central red-and-blue taegeuk and four black trigrams identify South Korea." }
  ]},
  { id: "culture", type: "world-culture", icon: "🎎", title: "The World Culture Challenge", subtitle: "Identify cultural clothing, celebrations, art and traditions from pictures.", tone: "from-fuchsia-600 via-purple-700 to-indigo-900", questions: [
    { id: "we-wc-01", q: "Which traditional Japanese garment is shown?", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Japanese_Traditional_Kimono.jpg?width=640", alt: "", options: ["Sari", "Kimono", "Hanbok", "Kilt"], answer: 1, fact: "The kimono is a traditional Japanese garment, with styles varying by occasion and season." },
    { id: "we-wc-02", q: "Which traditional Indian garment is pictured?", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Indian_traditional_lady_wearing_saree.jpg?width=640", alt: "", options: ["Sari", "Dirndl", "Kimono", "Poncho"], answer: 0, fact: "The sari is a traditional draped garment worn in India and across South Asia." },
    { id: "we-wc-03", q: "Which country's traditional clothing is represented by this outfit?", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Japanese_Kimono.jpg?width=640", alt: "", options: ["Japan", "Norway", "Egypt", "Peru"], answer: 0, fact: "The outfit shown is associated with traditional Japanese dress." },
    { id: "we-wc-04", q: "Which cultural celebration is famous for colourful powder being thrown?", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Colour_celebration_in_Holi_festival.jpg?width=640", alt: "", options: ["Holi", "Oktoberfest", "Hanami", "Carnival of Venice"], answer: 0, fact: "Holi is a spring festival celebrated with coloured powders in India and worldwide." },
    { id: "we-wc-05", q: "Which traditional musical instrument is pictured?", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Sitar_a_string_instrument.jpg?width=480", alt: "", options: ["Sitar", "Bagpipes", "Drum", "Flute"], answer: 0, fact: "The sitar is a plucked string instrument strongly associated with Hindustani classical music." },
    { id: "we-wc-06", q: "Which traditional Chinese celebration features this iconic creature?", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chinese_Dragon_Dance.jpg?width=640", alt: "", options: ["Dragon dance", "Flamenco", "Morris dance", "Hula"], answer: 0, fact: "The dragon dance is a traditional performance often seen during Chinese New Year celebrations." },
    { id: "we-wc-07", q: "Which country is most closely associated with this traditional dance?", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Woman_Flamenco_dancer.jpg?width=640", alt: "", options: ["Spain", "Iceland", "Canada", "Thailand"], answer: 0, fact: "Flamenco is a celebrated music and dance tradition from Andalusia in Spain." },
    { id: "we-wc-08", q: "Which traditional headwear is shown in this cultural picture?", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Traditional_turban_of_Rajasthan.jpg?width=480", alt: "", options: ["Turban", "Sombrero", "Beret", " fez"], answer: 0, fact: "Turbans are worn in many communities and have different cultural meanings and styles." },
    { id: "we-wc-09", q: "Which country is famous for the traditional Oktoberfest clothing shown?", image: "https://commons.wikimedia.org/wiki/Special:FilePath/InsideAugustinerTentOktoberfest.jpg?width=640", alt: "", options: ["Germany", "Japan", "Brazil", "Morocco"], answer: 0, fact: "Dirndl dresses and lederhosen are associated with Bavarian culture and Oktoberfest." },
    { id: "we-wc-10", q: "Which traditional performance art uses these expressive masks?", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Masked_dancer_-_Bali.jpg?width=640", alt: "", options: ["Balinese mask dance", "Irish step dance", "Flamenco", "Tango"], answer: 0, fact: "Masked dance traditions are important in Bali, Indonesia, and tell stories through movement." }
  ]},
  { id: "landmark", type: "landmark-adventure", icon: "🏛️", title: "The Landmark Adventure", subtitle: "Recognise iconic buildings and natural wonders.", tone: "from-amber-500 via-orange-600 to-rose-700", questions: [
    { id: "we-la-01", q: "Which world-famous monument is pictured here?", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=640&auto=format&fit=crop&q=60", alt: "", options: ["Angkor Wat", "Taj Mahal", "Petra", "Colosseum"], answer: 1, fact: "The Taj Mahal stands in Agra, India, and was commissioned by Mughal emperor Shah Jahan." },
    { id: "we-la-02", q: "Which landmark is shown in this picture?", image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=640&auto=format&fit=crop&q=60", alt: "", options: ["Eiffel Tower", "Leaning Tower of Pisa", "Big Ben", "Brandenburg Gate"], answer: 0, fact: "The Eiffel Tower is one of the best-known landmarks of Paris, France." },
    { id: "we-la-03", q: "Which ancient amphitheatre is pictured?", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=640&auto=format&fit=crop&q=60", alt: "", options: ["The Colosseum", "The Parthenon", "The Pantheon", "The Arena of Verona"], answer: 0, fact: "The Colosseum in Rome was used for public spectacles in ancient Rome." },
    { id: "we-la-04", q: "Identify this famous clock tower.", image: "https://images.unsplash.com/photo-1520986606214-8b456906c813?w=640&auto=format&fit=crop&q=60", alt: "", options: ["Big Ben", "Tokyo Tower", "CN Tower", "Space Needle"], answer: 0, fact: "Big Ben is the nickname commonly used for the Great Bell at the Palace of Westminster in London." },
    { id: "we-la-05", q: "Which world landmark is shown here?", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=640&auto=format&fit=crop&q=60", alt: "", options: ["Taj Mahal", "Great Wall", "Petra", "Machu Picchu"], answer: 0, fact: "The Taj Mahal is a UNESCO World Heritage Site in Agra." },
    { id: "we-la-06", q: "Which famous ancient structure is pictured?", image: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?w=640&auto=format&fit=crop&q=60", alt: "", options: ["Parthenon", "Stonehenge", "Sphinx", "Hagia Sophia"], answer: 0, fact: "The Parthenon stands on the Acropolis in Athens, Greece." },
    { id: "we-la-07", q: "Which natural landmark is shown in this image?", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=640&auto=format&fit=crop&q=60", alt: "", options: ["Alpine lake", "Desert dune", "Volcanic crater", "Coral reef"], answer: 0, fact: "Alpine lakes are formed in mountain regions, often by glaciers." },
    { id: "we-la-08", q: "Which famous archaeological site is pictured?", image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=640&auto=format&fit=crop&q=60", alt: "", options: ["Machu Picchu", "Petra", "Chichen Itza", "Angkor Wat"], answer: 0, fact: "Machu Picchu is an Inca citadel high in the Andes of Peru." },
    { id: "we-la-09", q: "Which famous natural landmark is pictured?", image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=640&auto=format&fit=crop&q=60", alt: "", options: ["A desert landscape", "A glacier", "A rainforest canopy", "A coral reef"], answer: 0, fact: "Deserts are defined by very low precipitation, not simply by high temperatures." },
    { id: "we-la-10", q: "Which famous waterfall is shown?", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=640&auto=format&fit=crop&q=60", alt: "", options: ["Niagara Falls", "Angel Falls", "Iguazu Falls", "Victoria Falls"], answer: 2, fact: "Iguazu Falls lies on the border between Argentina and Brazil." }
  ]}
];

export default function WorldExplorer({ userId, initialGameId, onExit }: { userId: string | null; initialGameId?:string; onExit?:()=>void }) {
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

  useEffect(() => { if (!initialGameId) return; const game = games.find(item => item.id === initialGameId); if (game) begin(game); }, [initialGameId]);
  const record = (skip: boolean, selected: number | null) => {
    if (!active || !question || !userId || !reserved || choice !== null) return;
    if (!skip) play(selected === question.answer ? "correct" : "wrong");
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

  const back = () => { if (timer.current) clearTimeout(timer.current); if (initialGameId && onExit) { onExit(); return; } setActive(null); setChoice(null); setMessage(""); setReserved(false); setExhausted(false); };

  if (!active && !initialGameId) return (
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-emerald-200 bg-[#071d25] p-4 text-white shadow-2xl sm:p-7">
      <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 12% 15%,rgba(52,211,153,.35),transparent 32%),radial-gradient(circle at 88% 75%,rgba(34,211,238,.3),transparent 32%),radial-gradient(circle at 50% 45%,rgba(250,204,21,.16),transparent 38%)" }} />
      <div className="relative overflow-hidden rounded-[1.7rem] border border-emerald-100/25 bg-gradient-to-br from-[#103c3a] via-[#12334a] to-[#071c30] px-5 py-8 text-center sm:px-10 sm:py-12">
        <p className="text-[10px] font-black uppercase tracking-[.35em] text-amber-200">A planet full of stories</p>
        <div className="my-3 text-6xl sm:text-7xl">🌍</div>
        <h2 className="font-serif text-3xl font-black tracking-wide text-white sm:text-5xl">WORLD DISCOVERY GAMES</h2>
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
      <p className="relative mt-5 text-center text-[10px] text-emerald-100/70">Choose a world challenge and begin exploring.</p>
    </div>
  );
  if (!active) return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center font-bold text-emerald-900">Opening your world discovery game…</div>;

  const noQuota = quota === 0 && !isAdmin && !isSubscribed;
  const noDaily = quota === 0 && (isAdmin || isSubscribed);
  return <div className="space-y-4">
    <div ref={heading} className={"relative scroll-mt-20 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br " + active.tone + " p-5 text-white shadow-xl sm:p-7"}>
      <span className="absolute -right-4 -top-8 text-8xl opacity-20">{active.icon}</span>
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <button onClick={back} className="rounded-full border border-white/50 bg-white/20 px-5 py-2.5 text-sm font-black text-white shadow-lg">← Back to Quiz World</button>
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-white/30 bg-black/15 px-3 py-2 text-xs font-black">{!quotaReady ? "Checking quota…" : String(quota ?? 0) + " / " + (isAdmin || isSubscribed ? 10 : 3) + (isAdmin || isSubscribed ? " plays left today" : " free trials left")}</span><button onClick={() => setSoundOn(v => !v)} className="rounded-full border border-white/40 bg-white/15 px-3 py-2 text-xs font-bold">{soundOn ? "🔊 Sound on" : "🔇 Sound off"}</button></div>
      </div>
      <p className="relative mt-5 text-xs font-bold uppercase tracking-[.2em] text-white/80">Quiz World · World Challenge {games.findIndex(g => g.id === active.id) + 1}</p><h2 className="relative mt-1 text-2xl font-black sm:text-3xl">{active.title}</h2><p className="relative mt-1 text-sm text-white/90">{active.subtitle}</p>
    </div>
    {accessError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{accessError}</div>}
    {noQuota && <GameQuotaNotice title="Your three free trials are complete!" description="Subscribe to continue exploring and unlock every world." />}
    {noDaily && <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-bold text-sky-900">Today's quota for this game is complete. Please return after the daily reset.</div>}
    {exhausted && <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 text-center text-sm font-bold text-violet-900">You have completed every currently available starter question in this game. The full picture and question bank will be added in the next content stage.</div>}
    {!noQuota && !noDaily && !exhausted && question && <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50 p-4 shadow-lg sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">Discovery {String(index + 1).padStart(2, "0")}</span><span className="text-xs font-bold text-slate-500">{quotaReady ? String(quota ?? 0) + " / " + (isAdmin || isSubscribed ? 10 : 3) + (isAdmin || isSubscribed ? " plays left today" : " free trials left") : "Checking quota…"}</span></div>
      {question.image && <div className="mb-4 flex min-h-40 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:min-h-48"><img src={question.image} alt="" aria-hidden="true" loading="eager" fetchPriority="high" decoding="async" referrerPolicy="no-referrer" width={640} height={420} onError={(event) => { const image = event.currentTarget; if (image.dataset.fallback !== "proxy") { image.dataset.fallback = "proxy"; image.src = "https://wsrv.nl/?url=" + encodeURIComponent(question.image || "") + "&w=640&output=webp"; } }} className="mx-auto block h-40 w-full max-w-md object-contain sm:h-48" /></div>}
      <h3 className="text-lg font-extrabold leading-7 text-slate-900 sm:text-xl">{question.q}</h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{question.options.map((option, i) => <button data-answer-choice key={question.id + "-" + i} disabled={!reserved || choice !== null || !quotaReady || noQuota || noDaily} onClick={() => record(false, i)} className={"min-h-14 rounded-xl border border-white/70 bg-gradient-to-r " + ["from-indigo-600 to-blue-700", "from-fuchsia-600 to-purple-700", "from-teal-600 to-emerald-700", "from-orange-500 to-rose-600"][i] + " px-4 py-3 text-left text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"}>{String.fromCharCode(65 + i)}. {option}</button>)}</div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-500">{!reserved ? "Preparing your discovery…" : choice === null ? "Observe, identify or skip this question." : "Answer recorded · Next discovery in 5 seconds"}</span><button disabled={!reserved || choice !== null || !quotaReady || noQuota || noDaily} onClick={() => record(true, null)} className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-md transition hover:scale-[1.03] disabled:opacity-50">⏭ Skip question</button></div>
      {message && <div aria-live="polite" className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 text-sm font-semibold leading-6 text-slate-800">{message}</div>}
    </div>}
  <GameQuotaPopup open={(noQuota || (quotaReady && quota===0)) && !isAdmin} isSubscribed={isSubscribed} resetKey={active?.id??''} /></div>;
}
