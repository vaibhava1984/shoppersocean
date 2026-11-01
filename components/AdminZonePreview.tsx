"use client";

import { useState } from "react";
import Link from "next/link";
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
  { icon: "🎮", name: "Classic Games", tone: "from-violet-500 via-purple-600 to-indigo-800", note: "Play Tic Tac Toe", action: "classic-games" },
  { icon: "🏆", name: "Brain Battle Arena", tone: "from-yellow-500 to-amber-700", note: "One challenging real-life reasoning MCQ game", action: "brain-battle-arena" },
  { icon: "🪐", name: "Space Odyssey", tone: "from-violet-600 to-slate-950" },
  { icon: "🎭", name: "Roleplay Theatre", tone: "from-rose-500 to-pink-800" },
  { icon: "👁️", name: "Visual Wonders", tone: "from-blue-500 to-indigo-800" },
  { icon: "🛠️", name: "Creative Crafts & DIY", tone: "from-lime-500 to-green-700", note: "Proposed zone name" },
  { icon: "🏝️", name: "Adventure Island", tone: "from-cyan-500 to-teal-800" },
  { icon: "🎁", name: "Surprise Station", tone: "from-red-500 to-fuchsia-700" },
  { icon: "🔬", name: "Science Quiz", tone: "from-cyan-500 to-blue-700", note: "Explore fascinating questions from every branch of science", action: "science-quiz" },
];

const entertainmentGroups = [
  "word-playground",
  "brain-logic",
  "riddle-corner",
];

export default function AdminZonePreview({ userId }: { userId: string | null }) {
  const [activeZone, setActiveZone] = useState<number | null>(null);
  const [activeQuizGame, setActiveQuizGame] = useState<string | null>(null);
  const selected = activeZone === null ? null : zones[activeZone];

  return (
    <section aria-label="Admin-only 12 zone workspace" className="relative overflow-hidden border-y border-indigo-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-9 sm:py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {!selected ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300 sm:text-xs">Private workspace · Admin only</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Explore 12 Worlds</h2>
                <p className="mt-2 max-w-xl text-xs leading-5 text-slate-300 sm:text-sm">Your new Shoppers Ocean layout. Choose a zone to enter its available features.</p>
              </div>
              <span className="rounded-full border border-amber-300/50 bg-amber-300/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-100">12 zones · Admin preview</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {zones.map((zone, index) => (
                <button
                  key={zone.name}
                  type="button"
                  disabled={!zone.action}
                  onClick={() => { if (zone.action) { setActiveZone(index); setActiveQuizGame(null); } }}
                  aria-label={zone.action ? `Open ${zone.name}` : `${zone.name}, under construction`}
                  className={`group relative min-h-[132px] overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br ${zone.tone} p-3 text-left shadow-lg transition duration-300 sm:min-h-[148px] sm:p-4 ${zone.action ? "hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200" : "cursor-not-allowed opacity-90"}`}
                >
                  <span className="absolute -right-3 -top-4 text-7xl opacity-20 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true">{zone.icon}</span>
                  <span className="relative flex items-start justify-between gap-1">
                    <span className="text-3xl drop-shadow sm:text-4xl" aria-hidden="true">{zone.icon}</span>
                    <span className="rounded-full border border-white/30 bg-black/15 px-2 py-1 text-[9px] font-black tracking-wide text-white">#{String(index + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="relative mt-3 block text-xs font-black leading-5 text-white drop-shadow sm:text-sm">{zone.name}</span>
                  <span className="relative mt-1 block text-[9px] font-semibold leading-4 text-white/90 sm:text-[10px]">{zone.note ?? "Under construction"}</span>
                  {zone.action && <span className="relative mt-2 inline-flex rounded-full border border-white/40 bg-white/20 px-2.5 py-1 text-[9px] font-extrabold text-white">Open zone →</span>}
                </button>
              ))}
            </div>
            <p className="mt-5 text-center text-[10px] font-medium text-slate-400">Private admin preview only · Unfinished zones remain unavailable to visitors</p>
          </>
        ) : (
          <div className="min-h-[55vh] rounded-3xl border border-white/20 bg-white p-4 shadow-2xl sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={() => { setActiveZone(null); setActiveQuizGame(null); }} className="rounded-full border border-indigo-300 bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110">← Back to all zones</button>
              <span className={`rounded-full bg-gradient-to-r ${selected.tone} px-4 py-2 text-sm font-black text-white shadow`}>{selected.icon} {selected.name}</span>
            </div>
            {selected.action === "books" && (
              <div className="mx-auto max-w-2xl rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-7 text-center sm:p-10">
                <div className="text-5xl" aria-hidden="true">📚</div>
                <h3 className="mt-4 text-2xl font-black text-slate-900">Read E-books</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Open the existing Shoppers Ocean book library.</p>
                <Link href="/read-ebooks" className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-7 py-3 font-extrabold text-white shadow-lg transition hover:brightness-110">Enter Read E-books →</Link>
              </div>
            )}
            {selected.action === "games" && (
              <div>
                {!activeQuizGame ? (
                  <>
                    <div className="mb-5 rounded-2xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 p-4 text-white">
                      <h3 className="text-xl font-black">Quiz World</h3>
                      <p className="mt-1 text-sm text-violet-100">Choose a collection to explore. Each game collection opens only when selected, while its original questions, history and access rules remain intact.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        { id: "core", icon: "🎯", title: "Quiz & Brain Games", note: "Word games, brain logic and riddles" },
                        { id: "digital", icon: "💡", title: "Digital Discovery Games", note: "Internet, artificial intelligence, cyber safety and technology history" },
                        { id: "mystery", icon: "🕵️", title: "Mystery & Detective Games", note: "Locked room, secret codes and deception cases" },
                        { id: "pattern", icon: "🧩", title: "The Pattern Master", note: "Find the rule and complete the sequence" },
                        { id: "world", icon: "🌍", title: "World Explorer Games", note: "Geography, world culture and landmark challenges" },
                        { id: "records", icon: "🏆", title: "World Records Quiz", note: "Fifty curated questions about remarkable records" },
                      ].map((game) => (
                        <button key={game.id} type="button" onClick={() => setActiveQuizGame(game.id)} className="group rounded-2xl border border-indigo-200 bg-gradient-to-br from-white via-indigo-50 to-sky-50 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                          <span className="text-3xl" aria-hidden="true">{game.icon}</span>
                          <span className="mt-3 block text-base font-black text-slate-900">{game.title}</span>
                          <span className="mt-1 block text-xs leading-5 text-slate-600">{game.note}</span>
                          <span className="mt-3 inline-flex rounded-full bg-indigo-700 px-3 py-1.5 text-[10px] font-extrabold text-white">Open games →</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <button type="button" onClick={() => setActiveQuizGame(null)} className="mb-4 rounded-full border border-indigo-300 bg-indigo-700 px-5 py-2.5 text-sm font-black text-white shadow">← Back to Quiz World</button>
                    {activeQuizGame === "core" && <EntertainmentHub userId={userId} visibleGroupIds={entertainmentGroups} />}
                    {activeQuizGame === "digital" && <DigitalDiscoveryHub userId={userId} />}
                    {activeQuizGame === "mystery" && <MysteryMansion userId={userId} />}
                    {activeQuizGame === "pattern" && <PuzzleUniverse userId={userId} />}
                    {activeQuizGame === "world" && <WorldExplorer userId={userId} />}
                    {activeQuizGame === "records" && <WorldRecordsArena userId={userId} />}
                  </div>
                )}
              </div>
            )}
            {selected.action === "classic-games" && (
              <EntertainmentHub userId={userId} visibleGroupIds={["classic-games"]} />
            )}
            {selected.action === "science-quiz" && (
              <EntertainmentHub userId={userId} visibleGroupIds={["quiz-arena"]} />
            )}
            {selected.action === "brain-battle-arena" && (
              <BrainBattleArena userId={userId} />
            )}
            {selected.action === "learning" && (
              <div>
                <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 p-4 text-white">
                  <h3 className="text-xl font-black">English Master Quiz</h3>
                  <p className="mt-1 text-sm text-emerald-100">Your existing English quiz is retained here without changing its question bank or quota system.</p>
                </div>
                <EntertainmentHub userId={userId} visibleGroupIds={["english-expert"]} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
