"use client";

import { useEffect, useRef, useState } from "react";

type RecordQuestion = { id: string; category: string; question: string; options: string[]; answer: number; fact: string };

// Curated record facts. Records that can change are anchored to the stated date or category.
const bank: RecordQuestion[] = [
{id:"wr-001",category:"Mountains",question:"Which mountain is the highest on Earth above sea level?",options:["K2","Mount Everest","Kangchenjunga","Lhotse"],answer:1,fact:"Everest reaches 8,848.86 m above sea level, according to the 2020 Nepal–China survey."},
{id:"wr-002",category:"Mountains",question:"Which mountain is tallest when measured from its submarine base to its summit?",options:["Mauna Kea","Mount Everest","Denali","Kilimanjaro"],answer:0,fact:"Mauna Kea rises about 10,205 m from its submarine base to its summit."},
{id:"wr-003",category:"Mountains",question:"Which peak is farthest from the centre of the Earth?",options:["Mount Everest","Aconcagua","Chimborazo","Mont Blanc"],answer:2,fact:"Chimborazo's equatorial location places its summit farther from Earth's centre than Everest's."},
{id:"wr-004",category:"Oceans",question:"What is the deepest known point in the world's oceans?",options:["Puerto Rico Trench","Tonga Trench","Java Trench","Challenger Deep"],answer:3,fact:"Challenger Deep lies in the Mariana Trench in the western Pacific."},
{id:"wr-005",category:"Rivers",question:"Which river is generally recognised by Guinness World Records as the longest?",options:["Amazon","Nile","Yangtze","Mississippi–Missouri"],answer:1,fact:"Guinness lists the Nile at approximately 6,695 km; river-length measurements can vary by method."},
{id:"wr-006",category:"Lakes",question:"Which lake holds the record as the world's deepest lake?",options:["Lake Tanganyika","Lake Superior","Lake Baikal","Caspian Sea"],answer:2,fact:"Lake Baikal in Siberia reaches about 1,642 m deep."},
{id:"wr-007",category:"Deserts",question:"Which is the world's largest desert when polar deserts are included?",options:["Sahara","Arabian Desert","Gobi Desert","Antarctic Desert"],answer:3,fact:"Antarctica is a polar desert and is larger than the Sahara."},
{id:"wr-008",category:"Animals",question:"Which animal is the largest known living animal by mass?",options:["African elephant","Blue whale","Whale shark","Colossal squid"],answer:1,fact:"The blue whale is the largest animal known to have lived."},
{id:"wr-009",category:"Animals",question:"Which land animal is the fastest over short distances?",options:["Pronghorn","Lion","Cheetah","Springbok"],answer:2,fact:"The cheetah is the fastest land animal, with recorded bursts around 100 km/h or more."},
{id:"wr-010",category:"Animals",question:"Which bird is famous for reaching the highest speeds in a hunting dive?",options:["Peregrine falcon","Golden eagle","White-throated needletail","Common swift"],answer:0,fact:"The peregrine falcon is the fastest bird in a hunting dive, with speeds exceeding 300 km/h recorded."},
{id:"wr-011",category:"Animals",question:"Which is the tallest living land animal?",options:["Ostrich","Giraffe","African elephant","Camel"],answer:1,fact:"Giraffes are the tallest living land animals; adult males can exceed 5 m."},
{id:"wr-012",category:"Animals",question:"Which reptile is the largest living species by mass?",options:["Komodo dragon","Green anaconda","Saltwater crocodile","Leatherback sea turtle"],answer:2,fact:"The saltwater crocodile is the largest living reptile."},
{id:"wr-013",category:"Plants",question:"Which plant is known for producing the world's largest single flower?",options:["Rafflesia arnoldii","Titan arum","Sunflower","Victoria amazonica"],answer:0,fact:"Rafflesia arnoldii produces an enormous single flower, often around a metre across."},
{id:"wr-014",category:"Plants",question:"Which tree species is famous for being the tallest living tree?",options:["Giant sequoia","African baobab","Coast redwood","Bristlecone pine"],answer:2,fact:"Coast redwoods include the tallest measured living trees."},
{id:"wr-015",category:"Structures",question:"Which building is the world's tallest by architectural height?",options:["Shanghai Tower","Burj Khalifa","Merdeka 118","One World Trade Center"],answer:1,fact:"The Burj Khalifa in Dubai stands 828 m tall and remains the tallest building by architectural height."},
{id:"wr-016",category:"Structures",question:"Which structure is the longest wall system commonly recognised as the world's longest?",options:["Hadrian's Wall","Great Wall of China","Berlin Wall","Walls of Ston"],answer:1,fact:"The Great Wall of China system extends for more than 21,000 km when all sections are counted."},
{id:"wr-017",category:"Structures",question:"Which bridge has the world's longest main span among suspension bridges?",options:["Golden Gate Bridge","Akashi Kaikyo Bridge","1915 Çanakkale Bridge","Brooklyn Bridge"],answer:2,fact:"The 1915 Çanakkale Bridge in Türkiye has a 2,023 m main span, the longest suspension-bridge span."},
{id:"wr-018",category:"Transport",question:"Which passenger aircraft is the largest ever built by passenger capacity?",options:["Boeing 747-8","Airbus A380","Boeing 777-300ER","Airbus A350-1000"],answer:1,fact:"The Airbus A380 is the largest passenger airliner ever built."},
{id:"wr-019",category:"Transport",question:"Which vehicle achieved the official world land-speed record for a car?",options:["Blue Flame","Thrust SSC","Bloodhound LSR","Goldenrod"],answer:1,fact:"Thrust SSC, driven by Andy Green, reached 1,227.985 km/h in 1997 and broke the sound barrier."},
{id:"wr-020",category:"Space",question:"Which human-made spacecraft was the first to reach interstellar space?",options:["Voyager 1","Pioneer 10","New Horizons","Voyager 2"],answer:0,fact:"NASA's Voyager 1 crossed the heliopause into interstellar space in 2012."},
{id:"wr-021",category:"Space",question:"Which planet hosts Olympus Mons, the tallest known volcano in the Solar System?",options:["Venus","Jupiter","Mars","Mercury"],answer:2,fact:"Olympus Mons on Mars rises roughly 22 km above its surrounding plains."},
{id:"wr-022",category:"Space",question:"Which space telescope was the first to be launched into orbit?",options:["Hubble Space Telescope","Chandra X-ray Observatory","James Webb Space Telescope","Kepler Space Telescope"],answer:0,fact:"The Hubble Space Telescope was launched in 1990."},
{id:"wr-023",category:"Human achievements",question:"Who was the first person to walk on the Moon?",options:["Buzz Aldrin","Yuri Gagarin","Neil Armstrong","Michael Collins"],answer:2,fact:"Neil Armstrong stepped onto the lunar surface during Apollo 11 on 21 July 1969 UTC."},
{id:"wr-024",category:"Human achievements",question:"Who was the first human in space?",options:["Alan Shepard","Yuri Gagarin","John Glenn","Valentina Tereshkova"],answer:1,fact:"Yuri Gagarin orbited Earth aboard Vostok 1 on 12 April 1961."},
{id:"wr-025",category:"Human achievements",question:"Who was the first woman to travel into space?",options:["Sally Ride","Mae Jemison","Valentina Tereshkova","Svetlana Savitskaya"],answer:2,fact:"Valentina Tereshkova flew aboard Vostok 6 in June 1963."},
{id:"wr-026",category:"Human achievements",question:"Who was the first climber to reach the summit of Mount Everest?",options:["Reinhold Messner and Peter Habeler","Edmund Hillary and Tenzing Norgay","George Mallory and Andrew Irvine","Junko Tabei and Ang Tsering"],answer:1,fact:"Edmund Hillary and Tenzing Norgay reached Everest's summit on 29 May 1953."},
{id:"wr-027",category:"Human achievements",question:"Who was the first woman to climb Mount Everest?",options:["Junko Tabei","Lhakpa Sherpa","Wanda Rutkiewicz","Bachendri Pal"],answer:0,fact:"Japan's Junko Tabei reached Everest's summit on 16 May 1975."},
{id:"wr-028",category:"Sports",question:"Which athlete holds the men's 100-metre world record of 9.58 seconds?",options:["Tyson Gay","Yohan Blake","Usain Bolt","Justin Gatlin"],answer:2,fact:"Usain Bolt set the 9.58-second 100 m world record in Berlin in 2009."},
{id:"wr-029",category:"Sports",question:"Which athlete holds the men's long-jump world record of 8.95 m?",options:["Carl Lewis","Mike Powell","Bob Beamon","Ivan Pedroso"],answer:1,fact:"Mike Powell set the 8.95 m record at the 1991 World Championships in Tokyo."},
{id:"wr-030",category:"Sports",question:"Who holds the men's high-jump world record of 2.45 m?",options:["Mutaz Barshim","Javier Sotomayor","Patrik Sjöberg","Stefka Kostadinova"],answer:1,fact:"Javier Sotomayor set the men's 2.45 m high-jump record in 1993."},
{id:"wr-031",category:"Sports",question:"Which tennis player has won the most men's singles Grand Slam titles (as of the end of 2024)?",options:["Roger Federer","Rafael Nadal","Novak Djokovic","Pete Sampras"],answer:2,fact:"Novak Djokovic finished 2024 with 24 men's singles major titles."},
{id:"wr-032",category:"Sports",question:"Which swimmer holds the record for the most Olympic gold medals?",options:["Mark Spitz","Michael Phelps","Caeleb Dressel","Ian Thorpe"],answer:1,fact:"Michael Phelps won 23 Olympic gold medals, more than any other athlete."},
{id:"wr-033",category:"Sports",question:"Which country won the first FIFA World Cup in 1930?",options:["Brazil","Italy","Uruguay","Argentina"],answer:2,fact:"Uruguay hosted and won the inaugural men's FIFA World Cup in 1930."},
{id:"wr-034",category:"Sports",question:"Who scored the fastest century in men's One Day International cricket (by balls faced)?",options:["AB de Villiers","Corey Anderson","Shahid Afridi","Glenn Maxwell"],answer:0,fact:"AB de Villiers reached 100 from 31 balls against the West Indies in 2015."},
{id:"wr-035",category:"Arts & entertainment",question:"Which film was the first to win 11 Academy Awards?",options:["Titanic","Ben-Hur","The Lord of the Rings: The Return of the King","West Side Story"],answer:1,fact:"Ben-Hur (1959) won 11 Oscars; Titanic and The Return of the King later matched that total."},
{id:"wr-036",category:"Arts & entertainment",question:"Who has received the most Academy Award nominations in the acting categories?",options:["Katharine Hepburn","Meryl Streep","Jack Nicholson","Bette Davis"],answer:1,fact:"Meryl Streep has received 21 acting nominations, the most in Academy Awards history."},
{id:"wr-037",category:"Arts & entertainment",question:"Which artist is credited with the best-selling music album of all time worldwide?",options:["The Beatles – Sgt. Pepper's","Michael Jackson – Thriller","Pink Floyd – The Dark Side of the Moon","Eagles – Hotel California"],answer:1,fact:"Michael Jackson's Thriller is widely recognised as the best-selling album, with estimates varying by source."},
{id:"wr-038",category:"Food",question:"Which country is home to the world's largest pizza ever made by area, created in 2023?",options:["Italy","United States","Brazil","Japan"],answer:1,fact:"The record-setting pizza, named Ottavia, was made in Los Angeles, USA, in 2023."},
{id:"wr-039",category:"Food",question:"Which spice is the most expensive by weight in the world?",options:["Vanilla","Cardamom","Saffron","Cinnamon"],answer:2,fact:"Saffron is typically the most expensive spice by weight because harvesting its stigmas is highly labour-intensive."},
{id:"wr-040",category:"Technology",question:"Which company created the first commercially available handheld mobile phone?",options:["Nokia","Motorola","Ericsson","IBM"],answer:1,fact:"Motorola's DynaTAC 8000X became the first commercially available handheld mobile phone in 1983."},
{id:"wr-041",category:"Technology",question:"What was the first artificial satellite placed into Earth orbit?",options:["Explorer 1","Sputnik 1","Vanguard 1","Telstar 1"],answer:1,fact:"The Soviet Union launched Sputnik 1 on 4 October 1957."},
{id:"wr-042",category:"Technology",question:"Which computer is often recognised as the first general-purpose electronic digital computer?",options:["ENIAC","UNIVAC I","Colossus","Apple I"],answer:0,fact:"ENIAC was an early general-purpose electronic digital computer, completed in 1945."},
{id:"wr-043",category:"Nature",question:"Which waterfall is commonly listed as the world's tallest uninterrupted waterfall?",options:["Niagara Falls","Angel Falls","Victoria Falls","Iguazu Falls"],answer:1,fact:"Angel Falls in Venezuela has a total height of about 979 m, including its longest uninterrupted drop."},
{id:"wr-044",category:"Nature",question:"Which coral reef system is the world's largest?",options:["Belize Barrier Reef","New Caledonia Barrier Reef","Great Barrier Reef","Red Sea Coral Reef"],answer:2,fact:"Australia's Great Barrier Reef is the world's largest coral reef system."},
{id:"wr-045",category:"Nature",question:"Which is the largest island in the world that is not considered a continent?",options:["Borneo","Madagascar","Greenland","New Guinea"],answer:2,fact:"Greenland is the world's largest island under the usual continent-island distinction."},
{id:"wr-046",category:"People",question:"Which woman was recognised by Guinness World Records in 2011 as the shortest living woman?",options:["Jyoti Amge","Pauline Musters","Lin Yü-chih","Bridgette Jordan"],answer:0,fact:"India's Jyoti Amge was measured at 62.8 cm in 2011 and recognised as the shortest living woman."},
{id:"wr-047",category:"People",question:"Who was the first person to reach the geographic South Pole?",options:["Robert Falcon Scott","Ernest Shackleton","Roald Amundsen","Richard Byrd"],answer:2,fact:"Roald Amundsen's expedition reached the South Pole on 14 December 1911."},
{id:"wr-048",category:"People",question:"Who was the first person to fly solo nonstop across the Atlantic Ocean?",options:["Amelia Earhart","Charles Lindbergh","Wiley Post","Howard Hughes"],answer:1,fact:"Charles Lindbergh completed the solo nonstop transatlantic flight in 1927."},
{id:"wr-049",category:"Transport",question:"Which train service is famous for setting the record for the fastest conventional steel-wheel train test run at 574.8 km/h?",options:["Japanese Shinkansen","French TGV","German ICE","Chinese CRH"],answer:1,fact:"A modified French TGV set the 574.8 km/h steel-wheel rail speed record in 2007."},
{id:"wr-050",category:"Animals",question:"Which whale species is known for the longest annual migration among mammals?",options:["Humpback whale","Gray whale","Blue whale","Sperm whale"],answer:1,fact:"Gray whales make exceptionally long annual migrations between Arctic feeding grounds and breeding lagoons in Baja California."}
];

export default function WorldRecordsArena({ userId }: { userId: string | null }) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [quota, setQuota] = useState<number | null>(null);
  const [quotaReady, setQuotaReady] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [reserved, setReserved] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [session] = useState(() => "records-" + Date.now() + "-" + Math.random().toString(36).slice(2));
  const repeated = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const q = bank[index];

  const loadQuota = async () => {
    setQuotaReady(false); setAccessError("");
    try {
      const response = await fetch("/api/game-access", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not verify quota.");
      setIsAdmin(Boolean(data.isAdmin)); setIsSubscribed(Boolean(data.isSubscribed));
      setQuota(data.isAdmin || data.isSubscribed ? (data.remainingByType?.["world-records"] ?? 0) : (data.remainingBySection?.["world-records-arena"] ?? 0));
      setQuotaReady(true);
    } catch (error) { setAccessError(error instanceof Error ? error.message : "Quota could not be verified."); setQuotaReady(true); }
  };

  useEffect(() => { if (userId) void loadQuota(); else setQuotaReady(true); }, [userId]);

  useEffect(() => {
    if (!userId || choice !== null || exhausted) return;
    let live = true; setReserved(false);
    fetch("/api/game-access", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: "world-records-arena", gameTypeId: "world-records", challengeId: q.id, challengeQuestion: q.question, reserveQuestion: true, previewMode: true, reservationSessionId: session })
    }).then(async response => {
      const data = await response.json(); if (!live) return;
      if (data.repeated) {
        repeated.current += 1;
        if (repeated.current >= bank.length) setExhausted(true);
        else setIndex(value => (value + 1) % bank.length);
        return;
      }
      if (!response.ok) { setAccessError(data.error || "This question could not be loaded."); return; }
      setReserved(true);
    }).catch(() => { if (live) setAccessError("We could not verify a fresh question. Please try again."); });
    return () => { live = false; };
  }, [index, userId, choice, exhausted, q.id, session]);

  useEffect(() => {
    if (choice === null || !message || message === "Recording your answer…") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setIndex(value => (value + 1) % bank.length); setChoice(null); setMessage(""); setReserved(false); }, 4500);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [choice, message]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const answer = (selected: number | null) => {
    if (!userId || !reserved || choice !== null || !quotaReady || !q) return;
    setChoice(selected ?? -1);
    const explanation = selected === null ? "Skipped. " : selected === q.answer ? "Correct! " : "Not quite. The correct answer is " + q.options[q.answer] + ". ";
    setMessage("Recording your answer…");
    const sound = new Audio(selected === null ? "/Tap.mp3" : selected === q.answer ? "/correct.mp3" : "/Lose.mp3");
    if (soundOn) void sound.play().catch(() => {});
    void fetch("/api/game-access", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId: "world-records-arena", gameTypeId: "world-records", challengeId: q.id, challengeQuestion: q.question, reservationSessionId: session })
    }).then(async response => {
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || "Your attempt could not be recorded."); if (data.freeTrialsExhausted || data.sectionRemaining === 0) setQuota(0); return; }
      setQuota(isAdmin || isSubscribed ? data.remaining : data.sectionRemaining);
      setMessage(explanation + q.fact);
    }).catch(() => setMessage("Your attempt could not be recorded. Please check your connection."));
  };

  const next = () => { if (timer.current) clearTimeout(timer.current); setIndex(value => (value + 1) % bank.length); setChoice(null); setMessage(""); setReserved(false); };

  const noFree = quota === 0 && !isAdmin && !isSubscribed;
  const noDaily = quota === 0 && (isAdmin || isSubscribed);
  return <div className="relative isolate overflow-hidden rounded-[2rem] border border-orange-200 bg-[#21110d] p-4 text-white shadow-2xl sm:p-7">
    <div className="pointer-events-none absolute inset-0 opacity-50" style={{backgroundImage:"radial-gradient(circle at 12% 15%,rgba(251,146,60,.35),transparent 32%),radial-gradient(circle at 88% 75%,rgba(239,68,68,.28),transparent 32%),radial-gradient(circle at 50% 45%,rgba(250,204,21,.14),transparent 38%)"}} />
    <div className="relative overflow-hidden rounded-[1.7rem] border border-orange-100/25 bg-gradient-to-br from-[#54220f] via-[#7c2d12] to-[#301015] px-5 py-8 text-center sm:px-10 sm:py-10">
      <p className="text-[10px] font-black uppercase tracking-[.35em] text-amber-200">The extraordinary, verified and unbelievable</p>
      <div className="my-3 text-6xl sm:text-7xl">🏆</div>
      <h2 className="font-serif text-3xl font-black tracking-wide text-white sm:text-5xl">WORLD RECORDS QUIZ</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-orange-50/90">Test your knowledge of extraordinary human achievements, nature's extremes, sporting milestones, inventions and astonishing firsts.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-100">
        {["Nature & animals","Sports & people","Science & technology","Landmarks & extremes"].map(tag=><span key={tag} className="rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-2">{tag}</span>)}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <span className="rounded-full border border-amber-200/30 bg-black/20 px-4 py-2 text-xs font-black">{bank.length} unique MCQs in the current question bank</span>
        <button onClick={()=>setSoundOn(v=>!v)} className="rounded-full border border-white/40 bg-white/15 px-4 py-2 text-xs font-bold">{soundOn ? "🔊 Sound on" : "🔇 Sound off"}</button>
      </div>
    </div>
    <div className="relative mt-5">
      {accessError && <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{accessError}</div>}
      {noFree && <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">Your three free trials for World Records Quiz have been used. Subscribe to continue.</div>}
      {noDaily && <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-bold text-sky-900">Today's quota for this game is complete. Please return after the daily reset.</div>}
      {exhausted ? <div className="rounded-2xl bg-white p-7 text-center font-bold text-slate-800">You have completed all unique questions currently in this question bank.</div> : <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-white via-orange-50 to-amber-50 p-4 text-slate-900 shadow-lg sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><span className="rounded-full bg-orange-800 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">{q.category}</span><span className="text-xs font-bold text-slate-500">{quotaReady ? (isAdmin ? "Unlimited admin preview" : String(quota ?? 0) + " remaining") : "Checking quota…"}</span></div>
        <h3 className="text-lg font-extrabold leading-7 text-slate-900 sm:text-xl">{q.question}</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{q.options.map((option,i)=><button key={q.id+"-"+i} disabled={!reserved || choice!==null || !quotaReady || noFree || noDaily || !userId} onClick={()=>answer(i)} className={"min-h-14 rounded-xl border border-white/70 bg-gradient-to-r "+["from-indigo-600 to-blue-700","from-fuchsia-600 to-purple-700","from-teal-600 to-emerald-700","from-orange-500 to-rose-600"][i]+" px-4 py-3 text-left text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"}>{String.fromCharCode(65+i)}. {option}</button>)}</div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-500">{!userId ? "Sign in to play." : !reserved ? "Preparing a fresh record question…" : choice===null ? "Choose the correct record-holder." : "Answer recorded · Next question shortly"}</span><button disabled={!reserved || choice!==null || noFree || noDaily || !userId} onClick={()=>answer(null)} className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-black text-slate-950 shadow-md disabled:opacity-50">Skip question ⏭</button></div>
        {message && <div aria-live="polite" className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50 p-4 text-sm font-semibold leading-6 text-slate-800">{message}</div>}
      </div>}
    </div>
  </div>;
}
