"use client";

import { useEffect, useRef, useState } from "react";
import EntertainmentHub from "@/components/EntertainmentHub";
import DigitalDiscoveryHub from "@/components/DigitalDiscoveryHub";
import MysteryMansion from "@/components/MysteryMansion";
import PuzzleUniverse from "@/components/PuzzleUniverse";
import WorldExplorer from "@/components/WorldExplorer";
import BrainBattleArena from "@/components/BrainBattleArena";
import WorldRecordsArena from "@/components/WorldRecordsArena";

const zones = [
  { icon: "📚", name: "Flipbook World", tone: "from-sky-500 via-blue-600 to-indigo-700", note: "Open the existing Read E-books library", action: "books" },
  { icon: "🎮", name: "Quiz World", tone: "from-violet-500 via-purple-600 to-indigo-800", note: "A collection of quizzes, mysteries, technology and world challenges", action: "games" },
  { icon: "🎓", name: "Learning Academy", tone: "from-emerald-500 via-teal-600 to-cyan-800", note: "Existing English Master Quiz", action: "learning" },
  { icon: "🎮", name: "Classic Games", tone: "from-violet-500 via-purple-600 to-indigo-800", note: "More classic games coming soon", action: "classic-games" },
  { icon: "🏆", name: "Brain Battle Arena", tone: "from-yellow-500 to-amber-700", note: "One challenging real-life reasoning MCQ game", action: "brain-battle-arena" },
];

const entertainmentGroups = [
  "word-playground",
  "brain-logic",
  "riddle-corner",
];

export default function HomeActivityZones({ userId }: { userId: string | null }) {
  const [activeZone, setActiveZone] = useState<number | null>(null);
  const activeZoneRef = useRef<number | null>(null);
  const activeQuizGameRef = useRef<string | null>(null);
  const activityTargetRef = useRef<HTMLDivElement | null>(null);
  const gameTargetRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleMobileBack = () => {
      if (activeQuizGameRef.current !== null) {
        activeQuizGameRef.current = null;
        setActiveQuizGame(null);
        return;
      }
      if (activeZoneRef.current !== null) {
        activeZoneRef.current = null;
        setActiveZone(null);
      }
    };
    window.addEventListener("popstate", handleMobileBack);
    return () => window.removeEventListener("popstate", handleMobileBack);
  }, []);
  const openZone = (index: number) => {
    if (activeZoneRef.current === null) window.history.pushState({ shoppersOceanZone: true }, "", window.location.href);
    activeZoneRef.current = index;
    setActiveZone(index);
    activeQuizGameRef.current = null;
    setActiveQuizGame(null);
  };
  const [activeQuizGame, setActiveQuizGame] = useState<string | null>(null);
  const openGame = (gameId: string) => {
    window.history.pushState({ shoppersOceanZone: true, shoppersOceanGame: gameId }, "", window.location.href);
    activeQuizGameRef.current = gameId;
    setActiveQuizGame(gameId);
  };
  const exitGame = () => { if (activeQuizGameRef.current !== null) window.history.back(); };
  const playZoneTap = () => { try { const audio = new Audio("/Tap.mp3"); audio.volume = 0.85; void audio.play().catch(() => {}); } catch {} };
  const selected = activeZone === null ? null : zones[activeZone];

  useEffect(() => {
    if (activeZone === null) return;
    const frame = window.requestAnimationFrame(() => {
      const target = activeQuizGame ? (gameTargetRef.current ?? activityTargetRef.current) : activityTargetRef.current;
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeZone, activeQuizGame]);

  return (
    <section aria-label="Shoppers Ocean activity zones" onClickCapture={(event) => { const target = event.target as HTMLElement; const button = target.closest("button, a"); if (!button || target.closest("[data-answer-choice], [data-entertainment-hub]")) return; playZoneTap(); }} className="relative overflow-hidden border-y border-indigo-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-9 sm:py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <style jsx global>{`@keyframes liveZoneZoom{0%{opacity:0;transform:scale(.55)}65%{opacity:1;transform:scale(1.035)}100%{opacity:1;transform:scale(1)}}`}</style>
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {!selected ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300 sm:text-xs">Explore & Enjoy</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Explore Our Worlds</h2>
                <p className="mt-2 max-w-xl text-xs leading-5 text-slate-300 sm:text-sm">Choose a zone and enjoy its activities.</p>
              </div>
              <span className="rounded-full border border-amber-300/50 bg-amber-300/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-100">5 activity zones</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {zones.map((zone, index) => (
                <button
                  key={zone.name}
                  type="button"
                  disabled={!zone.action}
                  onClick={() => { if (zone.action === "books") { window.location.assign("/read-ebooks"); return; } if (zone.action) openZone(index); }}
                  aria-label={zone.action ? `Open ${zone.name}` : `${zone.name}, under construction`}
                  style={{ animation: "liveZoneZoom 5s cubic-bezier(.2,.8,.2,1) both", animationDelay: `${index * 180}ms` }}
                  className={`group relative min-h-[238px] overflow-hidden rounded-[1.65rem] border border-white/30 bg-gradient-to-br ${zone.tone} p-5 text-left shadow-[0_14px_35px_rgba(15,23,42,0.20)] transition-all duration-500 ${zone.action ? "hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200" : "cursor-not-allowed opacity-90"}`}
                >
                  <span className="absolute -right-3 -top-4 text-8xl opacity-20 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true">{zone.icon}</span>
                  <span className="relative flex items-start justify-between gap-1">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 text-3xl shadow-lg backdrop-blur-sm" aria-hidden="true">{zone.icon}</span>
                    <span className="rounded-full border border-white/30 bg-black/15 px-2 py-1 text-[9px] font-black tracking-wide text-white">#{String(index + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="relative mt-4 block text-2xl font-black tracking-tight text-white drop-shadow">{zone.name}</span>
                  <span className="relative mt-2 block max-w-[18rem] text-sm font-semibold leading-6 text-white/90">{zone.note ?? "Under construction"}</span>
                  {zone.action && <span className="relative mt-4 inline-flex rounded-full border border-white/30 bg-white/15 px-3.5 py-2 text-sm font-extrabold text-white shadow-sm backdrop-blur-sm">Open zone →</span>}
                </button>
              ))}
            </div>
            <p className="mt-5 text-center text-[10px] font-medium text-slate-400">Choose any zone to begin exploring.</p>
          </>
        ) : (
          <div ref={activityTargetRef} className="min-h-[55vh] scroll-mt-24 rounded-3xl border border-white/20 bg-white p-4 shadow-2xl sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { if (activeQuizGameRef.current !== null) { window.history.back(); return; } if (activeZoneRef.current !== null) window.history.back(); }} className="rounded-full border border-indigo-300 bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110">← Back to all zones</button><button type="button" onClick={() => { window.location.assign("/"); }} className="rounded-full border border-emerald-300 bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110">⌂ Home</button></div>
              <span className={`rounded-full bg-gradient-to-r ${selected.tone} px-4 py-2 text-sm font-black text-white shadow`}>{selected.icon} {selected.name}</span>
            </div>
            {selected.action === "games" && (
              <div>
                {!activeQuizGame ? (
                  <>
                    <div className="mb-5 rounded-2xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 p-4 text-white">
                      <h3 className="text-xl font-black">Quiz World</h3>
                      <p className="mt-1 text-sm text-violet-100">Choose any game and enter it directly. All 16 games are displayed together.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {[
                        {id:"word",icon:"🔤",title:"Word Playground",note:"Word challenges",tone:"from-cyan-600 to-blue-700"},
                        {id:"brain",icon:"🧠",title:"Brain and Logic Lab",note:"Logic and reasoning",tone:"from-fuchsia-600 to-purple-800"},
                        {id:"riddle",icon:"💡",title:"Riddle Corner",note:"Riddles and brain teasers",tone:"from-amber-500 to-orange-700"},
                        {id:"internet",icon:"🌐",title:"Secrets of the Internet",note:"Explore the connected world",tone:"from-blue-600 to-cyan-700"},
                        {id:"ai",icon:"🤖",title:"Artificial Intelligence",note:"Discover intelligent systems",tone:"from-violet-600 to-fuchsia-700"},
                        {id:"cyber",icon:"🕵️",title:"Cyber Detective",note:"Investigate digital clues",tone:"from-emerald-600 to-teal-800"},
                        {id:"tech",icon:"🕰️",title:"Technology Through Time",note:"Explore landmark inventions",tone:"from-amber-600 to-orange-700"},
                        {id:"locked",icon:"🗝️",title:"The Locked Room Mystery",note:"Solve the impossible-looking case",tone:"from-cyan-700 to-indigo-900"},
                        {id:"codes",icon:"🔐",title:"The Secret Code Chamber",note:"Crack codes and hidden messages",tone:"from-violet-700 to-fuchsia-800"},
                        {id:"deception",icon:"🎭",title:"The Master of Deception",note:"Expose contradictions",tone:"from-rose-600 to-purple-900"},
                        {id:"pattern",icon:"🔷",title:"The Pattern Master",note:"Complete the sequence",tone:"from-cyan-600 to-indigo-800"},
                        {id:"geo",icon:"🧭",title:"The Geography Quest",note:"Countries, flags and natural wonders",tone:"from-emerald-600 to-teal-800"},
                        {id:"culture",icon:"🎎",title:"The World Culture Challenge",note:"Discover cultures and traditions",tone:"from-fuchsia-600 to-indigo-900"},
                        {id:"landmark",icon:"🏛️",title:"The Landmark Adventure",note:"Recognise world landmarks",tone:"from-amber-500 to-rose-700"},
                        {id:"records",icon:"🏆",title:"World Records Quiz",note:"Fifty curated record questions",tone:"from-orange-600 to-red-800"},
                        {id:"science",icon:"🔬",title:"Science Quiz",note:"Explore every branch of science",tone:"from-cyan-600 to-blue-800"}
                      ].map((game,index)=>(
                        <button key={game.id} type="button" onClick={()=>openGame(game.id)} className={"group relative min-h-40 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br "+game.tone+" p-5 text-left text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"}>
                          <span className="absolute -right-3 -top-5 text-8xl opacity-20 transition group-hover:scale-110">{game.icon}</span>
                          <span className="relative text-3xl">{game.icon}</span>
                          <span className="relative mt-3 block text-base font-black leading-6">{String(index+1).padStart(2,"0")}. {game.title}</span>
                          <span className="relative mt-1 block text-xs leading-5 text-white/90">{game.note}</span>
                          <span className="relative mt-3 inline-flex rounded-full border border-white/40 bg-white/20 px-3 py-1.5 text-[10px] font-extrabold">Play now →</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div ref={gameTargetRef}>
                    {activeQuizGame==="word" && <EntertainmentHub key="word" userId={userId} visibleGroupIds={["word-playground"]} initialGroupId="word-playground" initialGame="hidden" autoStart onExit={exitGame} embedded />}
                    {activeQuizGame==="brain" && <EntertainmentHub key="brain" userId={userId} visibleGroupIds={["brain-logic"]} initialGroupId="brain-logic" initialGame="sequence" autoStart onExit={exitGame} embedded />}
                    {activeQuizGame==="riddle" && <EntertainmentHub key="riddle" userId={userId} visibleGroupIds={["riddle-corner"]} initialGroupId="riddle-corner" initialGame="riddle" autoStart onExit={exitGame} embedded />}
                    {activeQuizGame==="science" && <EntertainmentHub key="science" userId={userId} visibleGroupIds={["quiz-arena"]} initialGroupId="quiz-arena" initialGame="quiz" autoStart onExit={exitGame} embedded />}
                    {activeQuizGame==="internet" && <DigitalDiscoveryHub key="internet" userId={userId} initialAreaId="internet" onExit={exitGame} />}
                    {activeQuizGame==="ai" && <DigitalDiscoveryHub key="ai" userId={userId} initialAreaId="artificial-intelligence" onExit={exitGame} />}
                    {activeQuizGame==="cyber" && <DigitalDiscoveryHub key="cyber" userId={userId} initialAreaId="cyber-detective" onExit={exitGame} />}
                    {activeQuizGame==="tech" && <DigitalDiscoveryHub key="tech" userId={userId} initialAreaId="technology-history" onExit={exitGame} />}
                    {activeQuizGame==="locked" && <MysteryMansion key="locked" userId={userId} initialGameId="locked" onExit={exitGame} />}
                    {activeQuizGame==="codes" && <MysteryMansion key="codes" userId={userId} initialGameId="codes" onExit={exitGame} />}
                    {activeQuizGame==="deception" && <MysteryMansion key="deception" userId={userId} initialGameId="deception" onExit={exitGame} />}
                    {activeQuizGame==="pattern" && <PuzzleUniverse key="pattern" userId={userId} initialGameId="pattern" onExit={exitGame} />}
                    {activeQuizGame==="geo" && <WorldExplorer key="geo" userId={userId} initialGameId="geo" onExit={exitGame} />}
                    {activeQuizGame==="culture" && <WorldExplorer key="culture" userId={userId} initialGameId="culture" onExit={exitGame} />}
                    {activeQuizGame==="landmark" && <WorldExplorer key="landmark" userId={userId} initialGameId="landmark" onExit={exitGame} />}
                    {activeQuizGame==="records" && <WorldRecordsArena key="records" userId={userId} onExit={exitGame} />}
                  </div>
                )}
              </div>
            )}
            {selected.action === "classic-games" && (
              <div ref={activityTargetRef} className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-8 text-center"><h3 className="text-xl font-black text-indigo-900">Classic Games</h3><p className="mt-2 text-sm text-slate-600">More classic games coming soon.</p></div>
            )}
            {selected.action === "brain-battle-arena" && (
              <div ref={activityTargetRef}><BrainBattleArena userId={userId} onExit={exitGame} /></div>
            )}
            {selected.action === "learning" && (
              <div ref={activityTargetRef}>
                <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-4 text-white">
                  <h3 className="text-xl font-black">English Master Quiz</h3>
                  <p className="mt-1 text-sm text-emerald-100">Your existing English quiz is retained here without changing its question bank or quota system.</p>
                </div>
                <EntertainmentHub userId={userId} visibleGroupIds={["english-expert"]} embedded />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
