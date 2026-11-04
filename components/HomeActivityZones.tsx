"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import EntertainmentHub from "@/components/EntertainmentHub";
import DigitalDiscoveryHub from "@/components/DigitalDiscoveryHub";
import MysteryMansion from "@/components/MysteryMansion";
import PuzzleUniverse from "@/components/PuzzleUniverse";
import WorldExplorer from "@/components/WorldExplorer";
import BrainBattleArena from "@/components/BrainBattleArena";
import WorldRecordsArena from "@/components/WorldRecordsArena";
import NativeTriviaQuiz from "@/components/NativeTriviaQuiz";
import GameQuotaPopup from "@/components/GameQuotaPopup";

const zones = [
  { icon: "📚", name: "Flipbook World", tone: "from-sky-500 via-blue-600 to-indigo-700", note: "Open the existing Read E-books library", action: "books" },
  { icon: "🎮", name: "Quiz World", tone: "from-violet-500 via-purple-600 to-indigo-800", note: "A collection of quizzes, mysteries, technology and world challenges", action: "games" },
  { icon: "🎓", name: "Learning Academy", tone: "from-emerald-500 via-teal-600 to-cyan-800", note: "Existing English Master Quiz", action: "learning" },
  { icon: "🏆", name: "Brain Battle Arena", tone: "from-yellow-500 to-amber-700", note: "One challenging real-life reasoning MCQ game", action: "brain-battle-arena" },
  { icon: "🎲", name: "Classic Games", tone: "from-orange-500 via-rose-600 to-pink-700", action: "classic-games" },
];

const entertainmentGroups = [
  "word-playground",
  "brain-logic",
  "riddle-corner",
];


type TicMark = "X" | "O" | null;
type TicMode = "computer" | "local";
type TicDifficulty = "easy" | "medium" | "hard";

function ticWinner(board: TicMark[]): TicMark {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b,c] of lines) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  return null;
}

function ticBestMove(board: TicMark[], difficulty: TicDifficulty): number {
  const empty = board.map((v,i) => v === null ? i : -1).filter(i => i >= 0);
  if (!empty.length) return -1;
  const winAt = (cells: TicMark[], mark: TicMark) => empty.find(i => { const next=[...cells]; next[i]=mark; return ticWinner(next) === mark; });
  if (difficulty === "easy") return empty[Math.floor(Math.random()*empty.length)];
  const winning = winAt(board, "O");
  if (winning !== undefined) return winning;
  const blocking = winAt(board, "X");
  if (blocking !== undefined) return blocking;
  if (difficulty === "medium") {
    if (board[4] === null) return 4;
    const corners = [0,2,6,8].filter(i => board[i] === null);
    if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
    return empty[Math.floor(Math.random()*empty.length)];
  }
  const minimax = (cells: TicMark[], isMax: boolean, depth: number): number => {
    const winner = ticWinner(cells);
    if (winner === "O") return 10-depth;
    if (winner === "X") return depth-10;
    const slots = cells.map((v,i)=>v===null?i:-1).filter(i=>i>=0);
    if (!slots.length) return 0;
    let best = isMax ? -Infinity : Infinity;
    for (const i of slots) {
      const next=[...cells]; next[i]=isMax?"O":"X";
      const value=minimax(next,!isMax,depth+1);
      best=isMax?Math.max(best,value):Math.min(best,value);
    }
    return best;
  };
  let bestScore=-Infinity, best=empty[0];
  for (const i of empty) {
    const next=[...board]; next[i]="O";
    const score=minimax(next,false,0);
    if (score>bestScore) { bestScore=score; best=i; }
  }
  return best;
}

function ColourfulTicTacToe({ quotaText, onPlayed }: { quotaText: string; onPlayed: () => void }) {
  const [mode,setMode]=useState<TicMode>("computer");
  const [difficulty,setDifficulty]=useState<TicDifficulty>("medium");
  const [board,setBoard]=useState<TicMark[]>(Array(9).fill(null));
  const [turn,setTurn]=useState<TicMark>("X");
  const [scores,setScores]=useState({ player:0, opponent:0, draws:0 });
  const [thinking,setThinking]=useState(false);
  const winner=ticWinner(board);
  const draw=!winner && board.every(Boolean);
  const finished=Boolean(winner || draw);
  const resetBoard=()=>{ setBoard(Array(9).fill(null)); setTurn("X"); setThinking(false); };

  useEffect(()=>{
    if (mode!=="computer" || turn!=="O" || finished) return;
    setThinking(true);
    const timer=window.setTimeout(()=>{
      setBoard(current=>{
        if (ticWinner(current) || current.every(Boolean)) return current;
        const move=ticBestMove(current,difficulty);
        if (move<0) return current;
        const next=[...current]; next[move]="O";
        const result=ticWinner(next);
        if (result==="O") setScores(score=>({...score,opponent:score.opponent+1}));
        else if (!result && next.every(Boolean)) setScores(score=>({...score,draws:score.draws+1}));
        return next;
      });
      setTurn("X"); setThinking(false);
    }, mode==="computer" ? 420 : 0);
    return ()=>window.clearTimeout(timer);
  },[mode,turn,finished,difficulty]);

  const playCell=(index:number)=>{
    if (board[index] || finished || thinking || (mode==="computer" && turn!=="X")) return;
    onPlayed();
    const next=[...board]; next[index]=turn;
    const result=ticWinner(next);
    if (result==="X") setScores(score=>({...score,player:score.player+1}));
    else if (!result && next.every(Boolean)) setScores(score=>({...score,draws:score.draws+1}));
    setBoard(next);
    setTurn(turn==="X"?"O":"X");
  };
  const chooseMode=(next:TicMode)=>{setMode(next);resetBoard();};
  const status=winner ? (winner==="X"?"❌ X wins!":"⭕ O wins!") : draw ? "It's a draw!" : thinking ? "Computer is thinking…" : mode==="computer" ? (turn==="X"?"Your turn — play X":"Computer's turn — O") : (turn==="X"?"Player X's turn":"Player O's turn");

  return (
    <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-[28px] border-[5px] border-white bg-gradient-to-br from-[#fff9e8] via-[#fffdf6] to-[#ffedb8] p-3 shadow-[0_14px_40px_rgba(30,64,175,.24)] sm:p-5">
      <div className="text-center">
        <h2 className="text-[clamp(2rem,9vw,3.5rem)] font-black leading-none tracking-tight text-transparent" style={{backgroundImage:"linear-gradient(180deg,#ffdf36 5%,#ff8b00 48%,#f04428 100%)",WebkitBackgroundClip:"text",filter:"drop-shadow(0 3px 0 #1454bb)"}}>
          Tic Tac Toe
        </h2>
        <p className="mt-2 text-xs font-extrabold uppercase tracking-[.18em] text-blue-800">Play • Think • Win</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={()=>chooseMode("computer")} aria-pressed={mode==="computer"} className={`min-h-12 rounded-2xl border-2 px-2 py-3 text-sm font-black transition active:scale-[.98] ${mode==="computer"?"border-blue-500 bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-lg":"border-slate-200 bg-white text-slate-600"}`}>🤖 Vs Computer</button>
        <button type="button" onClick={()=>chooseMode("local")} aria-pressed={mode==="local"} className={`min-h-12 rounded-2xl border-2 px-2 py-3 text-sm font-black transition active:scale-[.98] ${mode==="local"?"border-blue-500 bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-lg":"border-slate-200 bg-white text-slate-600"}`}>👥 Local 2 Player</button>
      </div>
      {mode==="computer" && <div className="mt-3 grid grid-cols-3 rounded-full border-2 border-white bg-blue-50 p-1">
        {(["easy","medium","hard"] as TicDifficulty[]).map(level=><button key={level} type="button" onClick={()=>{setDifficulty(level);resetBoard();}} aria-pressed={difficulty===level} className={`min-h-10 rounded-full px-1 text-xs font-black capitalize transition ${difficulty===level?"bg-gradient-to-b from-sky-400 to-blue-600 text-white shadow-md":"text-slate-500"}`}>{level}</button>)}
      </div>}
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-blue-50 to-orange-50 p-3">
        <div className="text-center"><div className="text-2xl font-black text-blue-600">✕ <span className="text-base text-slate-700"> {mode==="computer"?"You":"Player X"}</span></div><div className="text-2xl font-black text-blue-800">{scores.player}</div></div>
        <div className="border-l-2 border-amber-300 text-center"><div className="text-2xl font-black text-red-500">◯ <span className="text-base text-slate-700">{mode==="computer"?"Computer":"Player O"}</span></div><div className="text-2xl font-black text-red-700">{scores.opponent}</div></div>
      </div>
      <div role="status" aria-live="polite" className={`my-3 min-h-10 rounded-xl px-2 py-2 text-center text-sm font-black ${finished?"bg-amber-100 text-amber-800":"bg-blue-50 text-blue-800"}`}>{status}</div>
      <div className="mx-auto grid aspect-square w-full max-w-[430px] grid-cols-3 gap-[5px] rounded-[22px] bg-blue-700 p-[5px] shadow-[0_8px_0_#1749a4,0_14px_22px_rgba(30,64,175,.22)]">
        {board.map((mark,index)=><button key={index} type="button" onClick={()=>playCell(index)} disabled={Boolean(mark)||finished||thinking||(mode==="computer"&&turn!=="X")} aria-label={`Cell ${index+1}${mark?", "+mark:" empty"}`} className="flex min-h-0 min-w-0 items-center justify-center rounded-[15px] bg-gradient-to-br from-white to-slate-100 text-[clamp(3rem,17vw,6rem)] font-black leading-none shadow-inner transition enabled:active:scale-95 enabled:hover:bg-white disabled:cursor-default">
          {mark==="X" ? <span className="text-blue-600 drop-shadow-[0_3px_0_#9ccfff]">×</span> : mark==="O" ? <span className="text-red-500 drop-shadow-[0_3px_0_#ffc1b7]">○</span> : <span className="opacity-0">·</span>}
        </button>)}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button type="button" onClick={resetBoard} className="min-h-14 w-full max-w-[300px] rounded-full border-4 border-green-300 bg-gradient-to-b from-lime-400 to-green-600 px-5 py-3 text-lg font-black text-white shadow-[0_5px_0_#16803a] transition hover:brightness-105 active:translate-y-1 active:shadow-none">↻ New Game</button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-600"><span>Draws: {scores.draws}</span><span className="rounded-full bg-white/80 px-3 py-1 text-center text-blue-800">{quotaText}</span></div>
    </div>
  );
}

export default function HomeActivityZones({ userId }: { userId: string | null }) {
  const [activeZone, setActiveZone] = useState<number | null>(null);
  const [classicGameStarted, setClassicGameStarted] = useState<"tic-tac-toe" | "solitaire" | "chess" | null | false>(false);
  const classicGameStartedRef = useRef<"tic-tac-toe" | "solitaire" | "chess" | null | false>(false);
  const classicGameInteractedRef = useRef(false);
  const classicGameSessionRef = useRef<{ gameType: "tic" | "solitaire" | "chess"; sessionId: string; consumed: boolean } | null>(null);
  const enterSolitaireLandscape = () => {
    const orientation = screen.orientation;
    if (typeof document !== "undefined" && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      void document.documentElement.requestFullscreen().then(() => orientation?.lock?.("landscape")).catch(() => {});
    } else {
      void orientation?.lock?.("landscape").catch(() => {});
    }
  };
  const leaveSolitaireLandscape = () => {
    try { screen.orientation?.unlock?.(); } catch {}
    if (typeof document !== "undefined" && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
  };
  const [classicQuota, setClassicQuota] = useState<{ remainingByType: Record<string, number>; isAdmin: boolean; isSubscribed: boolean; loading: boolean }>({ remainingByType: {}, isAdmin: false, isSubscribed: false, loading: true });
  const [classicQuotaPopup, setClassicQuotaPopup] = useState(false);
  const [trivioRemaining, setTrivioRemaining] = useState(0);
  const [trivioQuotaLoading, setTrivioQuotaLoading] = useState(true);
  const activeZoneRef = useRef<number | null>(null);
  const activeQuizGameRef = useRef<string | null>(null);
  const activityTargetRef = useRef<HTMLDivElement | null>(null);
  const gameTargetRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleMobileBack = () => {
      if (classicGameStartedRef.current) {
        const session = classicGameSessionRef.current;
        if (session && classicGameInteractedRef.current && !session.consumed) {
          session.consumed = true;
          void fetch("/api/game-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sectionId: "classic-games", gameTypeId: session.gameType, challengeId: session.sessionId })
          }).then(async response => {
            const data = await response.json();
            if (response.ok) {
              setClassicQuota(current => ({ ...current, remainingByType: { ...current.remainingByType, [session.gameType]: data.remaining } }));
            } else {
              console.error("Classic game quota could not be recorded:", data.error);
            }
          }).catch(error => console.error("Classic game quota recording failed:", error));
        }
        if (classicGameStartedRef.current === "solitaire") leaveSolitaireLandscape();
        classicGameStartedRef.current = false;
        classicGameSessionRef.current = null;
        classicGameInteractedRef.current = false;
        setClassicGameStarted(false);
        return;
      }
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
    classicGameStartedRef.current = false;
    setClassicGameStarted(false);
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
  const openClassicGame = async (game: "tic-tac-toe" | "solitaire" | "chess") => {
    if (!userId) { window.location.assign("/login"); return; }
    if (game === "solitaire") enterSolitaireLandscape();
    const gameType = game === "solitaire" ? "solitaire" : game === "chess" ? "chess" : "tic";
    const sessionKey = "shoppersOcean:classic-session:" + userId + ":" + gameType;
    try {
      const quotaResponse = await fetch("/api/game-access", { cache: "no-store" });
      const quotaData = await quotaResponse.json();
      if (!quotaResponse.ok) throw new Error(quotaData.error || "Quota could not be verified.");
      let remaining = Number(quotaData.remainingByType?.[gameType] ?? 0);
      setClassicQuota({ remainingByType: quotaData.remainingByType ?? {}, isAdmin: Boolean(quotaData.isAdmin), isSubscribed: Boolean(quotaData.isSubscribed), loading: false });

      if (remaining <= 0) { if (gameType === "solitaire") leaveSolitaireLandscape(); setClassicQuotaPopup(true); return; }

      // External games do not expose reliable cross-origin move events, so charge once on launch.
      if (gameType === "solitaire") {
        const sessionId = gameType + "-open:" + Date.now() + ":" + Math.random().toString(36).slice(2);
        const chargeResponse = await fetch("/api/game-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId: "classic-games", gameTypeId: gameType, challengeId: sessionId })
        });
        const chargeData = await chargeResponse.json();
        if (!chargeResponse.ok) {
          if (gameType === "solitaire") leaveSolitaireLandscape();
          setClassicQuotaPopup(true);
          return;
        }
        remaining = Number(chargeData.remaining ?? Math.max(0, remaining - 1));
        setClassicQuota(current => ({ ...current, remainingByType: { ...current.remainingByType, [gameType]: remaining } }));
      }

      const classicSessionToken = "classic-game-session:" + gameType + ":" + Date.now() + ":" + Math.random().toString(36).slice(2);
      window.localStorage.setItem(sessionKey, JSON.stringify({ sessionId: classicSessionToken, played: false }));
      classicGameInteractedRef.current = false;
      classicGameSessionRef.current = gameType === "tic" || gameType === "chess" ? { gameType, sessionId: classicSessionToken, consumed: false } : null;
      window.history.pushState({ shoppersOceanZone: true, shoppersOceanClassicGame: game }, "", window.location.href);
      classicGameStartedRef.current = game; setClassicGameStarted(game);
    } catch (error) { if (game === "solitaire") leaveSolitaireLandscape(); console.error("Classic game quota check failed:", error); setClassicQuota(current => ({ ...current, loading: false })); }
  };
useEffect(() => {
    if (selected?.action !== "classic-games" || !userId) return;
    let live = true;
    setClassicQuota(current => ({ ...current, loading: true }));
    fetch("/api/game-access", { cache: "no-store" })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Quota could not be verified."); return data; })
      .then(data => { if (live) setClassicQuota({ remainingByType: data.remainingByType ?? {}, isAdmin: Boolean(data.isAdmin), isSubscribed: Boolean(data.isSubscribed), loading: false }); })
      .catch(error => { console.error("Classic Games quota meter failed:", error); if (live) setClassicQuota(current => ({ ...current, loading: false })); });
    return () => { live = false; };
  }, [activeZone, userId]);
  useEffect(() => {
    if (activeQuizGame !== "trivio" || !userId) return;
    let live = true;
    setTrivioQuotaLoading(true);
    fetch("/api/game-access", { cache: "no-store" })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Quota unavailable"); return data; })
      .then(data => { if (live) { setTrivioRemaining(Number(data.remainingByType?.trivio ?? 0)); setClassicQuota(current => ({ ...current, isAdmin: Boolean(data.isAdmin), isSubscribed: Boolean(data.isSubscribed) })); } })
      .catch(error => console.error("Trivio quota check failed:", error))
      .finally(() => { if (live) setTrivioQuotaLoading(false); });
    return () => { live = false; };
  }, [activeQuizGame, userId]);
  const playZoneTap = () => { try { const audio = new Audio("/Tap.mp3"); audio.volume = 0.85; void audio.play().catch(() => {}); } catch {} };
  useEffect(() => { if (!classicQuotaPopup) return; const timer = window.setTimeout(() => setClassicQuotaPopup(false), 5200); return () => window.clearTimeout(timer); }, [classicQuotaPopup]);
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
    <>
    <section aria-label="Shoppers Ocean activity zones" onClickCapture={(event) => { const target = event.target as HTMLElement; const button = target.closest("button, a"); if (!button || target.closest("[data-answer-choice], [data-entertainment-hub]")) return; playZoneTap(); }} className={`${activeQuizGame !== null || Boolean(classicGameStarted) ? "fixed inset-0 z-[9999] h-[100dvh] w-full overflow-y-auto overscroll-contain" : "relative overflow-hidden border-y"} border-indigo-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-4 sm:py-6`}>
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <style jsx global>{`@keyframes liveZoneZoom{0%{opacity:0;transform:scale(.55)}65%{opacity:1;transform:scale(1.035)}100%{opacity:1;transform:scale(1)}}
@media (orientation: landscape) and (max-height: 600px) {

}
.classic-game-landscape-controls { display: none; }
`}</style>
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
                  {zone.note && <span className="relative mt-2 block max-w-[18rem] text-sm font-semibold leading-6 text-white/90">{zone.note}</span>}
                  {zone.action && <span className="relative mt-4 inline-flex rounded-full border border-white/30 bg-white/15 px-3.5 py-2 text-sm font-extrabold text-white shadow-sm backdrop-blur-sm">Open zone →</span>}
                </button>
              ))}
            </div>
            <p className="mt-5 text-center text-[10px] font-medium text-slate-400">Choose any zone to begin exploring.</p>
          </>
        ) : (
          <div ref={activityTargetRef} className="min-h-[55vh] scroll-mt-24 rounded-3xl border border-white/20 bg-white p-4 shadow-2xl sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { if (classicGameStartedRef.current || activeQuizGameRef.current !== null) { window.history.back(); return; } if (activeZoneRef.current !== null) window.history.back(); }} className="rounded-full border border-indigo-300 bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110">{classicGameStartedRef.current || activeQuizGame !== null ? "← Back" : "← Back to all zones"}</button></div>
                {activeQuizGame === null && !classicGameStarted && <span className={`rounded-full bg-gradient-to-r ${selected.tone} px-4 py-2 text-sm font-black text-white shadow`}>{selected.icon} {selected.name}</span>}
            </div>
            {selected.action === "games" && (
              <div>
                {!activeQuizGame ? (
                  <>
                    <div className="mb-5 rounded-2xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 p-4 text-white">
                      <h3 className="text-xl font-black">Quiz World</h3>
                      <p className="mt-1 text-sm text-violet-100">Choose any game and enter it directly. All games are displayed together.</p>
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
                        {id:"science",icon:"🔬",title:"Science Quiz",note:"Explore every branch of science",tone:"from-cyan-600 to-blue-800"},
                        {id:"trivio",icon:"🎉",title:"Fun Trivia Questions",note:"Play 100 fun trivia questions",tone:"from-pink-600 to-violet-800"}
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
                    {activeQuizGame==="trivio" && (
                      <div className="w-full">
                        {trivioQuotaLoading ? (
                          <p className="rounded-xl bg-white p-6 text-center text-sm font-bold text-violet-800">Checking your daily quota…</p>
                        ) : trivioRemaining <= 0 ? (
                          <p className="rounded-xl bg-white p-6 text-center text-sm font-bold text-violet-800">Your daily quota for this quiz is over. Please visit tomorrow.</p>
                        ) : (
                          <NativeTriviaQuiz
                            userId={userId}
                            remaining={trivioRemaining}
                            onRemainingChange={setTrivioRemaining}
                            onExit={exitGame}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {selected.action === "brain-battle-arena" && (
              <div ref={activityTargetRef}><BrainBattleArena userId={userId} onExit={exitGame} /></div>
            )}
            {selected.action === "classic-games" && (
              <div ref={activityTargetRef} className="flex w-full items-center justify-center">
                {classicGameStarted === null || classicGameStarted === false ? (
                  <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => void openClassicGame("tic-tac-toe")}
                      className="rounded-2xl border border-white/30 bg-gradient-to-r from-orange-500 via-rose-600 to-pink-700 px-6 py-5 text-lg font-black text-white shadow-xl transition hover:-translate-y-1 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
                    >
                      ❌⭕ &nbsp; Play Tic Tac Toe
                    </button>
                    <button
                      type="button"
                      onClick={() => void openClassicGame("chess")}
                      className="rounded-2xl border border-white/30 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 px-6 py-5 text-lg font-black text-white shadow-xl transition hover:-translate-y-1 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
                    >
                      ♟️ &nbsp; Play Chess
                    </button>
                    <button
                      type="button"
                      onClick={() => void openClassicGame("solitaire")}
                      className="rounded-2xl border border-white/30 bg-gradient-to-r from-emerald-600 via-green-700 to-teal-800 px-6 py-5 text-lg font-black text-white shadow-xl transition hover:-translate-y-1 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                    >
                      🃏 &nbsp; Play Solitaire
                    </button>
                  </div>
                ) : classicGameStarted === "solitaire" ? (
                  <div className="w-full rounded-2xl bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-2 sm:p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-extrabold text-emerald-900">
                      <span>{classicQuota.loading ? "Checking quota…" : `${classicQuota.remainingByType.solitaire ?? 0} / ${classicQuota.isAdmin || classicQuota.isSubscribed ? 10 : 3} ${classicQuota.isAdmin || classicQuota.isSubscribed ? "plays left today" : "free plays left"}`}</span>
                      <span>Klondike · Draw 1</span>
                    </div>
                    <div
                      className="w-full overflow-auto rounded-xl bg-emerald-900"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      <iframe
                        src="https://solitaire-online.com/embed/klondike.html?draw=1&theme=green&v=embedauto1"
                        title="Klondike Solitaire — pinch to zoom"
                        width="800"
                        height="640"
                        className="block w-full border-0"
                        style={{
                          minHeight: "min(80vh, 640px)",
                          height: "640px",
                        }}
                        loading="lazy"
                        allow="autoplay; fullscreen"
                      />
                    </div>
                  </div>
                ) : classicGameStarted === "chess" ? (
                  <div className="flex min-h-[550px] w-full flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-sky-50 p-3 sm:p-6">
                    <div className="w-full max-w-md rounded-xl border border-sky-200 bg-white px-3 py-2 text-center text-xs font-extrabold text-sky-900">
                      {classicQuota.loading ? "Checking quota…" : `${classicQuota.remainingByType.chess ?? 0} / ${classicQuota.isAdmin || classicQuota.isSubscribed ? 10 : 3} ${classicQuota.isAdmin || classicQuota.isSubscribed ? "plays left today" : "free plays left"}`}
                    </div>
                    <iframe
                      src="https://playpager.com/embed/chess/index.html"
                      title="Online Chess Game"
                      className="block w-full max-w-full border-0"
                      style={{ height: "550px", overflow: "hidden" }}
                      scrolling="no"
                      loading="lazy"
                      onFocus={() => { classicGameInteractedRef.current = true; }}
                    />
                  </div>
                ) : (
                  <ColourfulTicTacToe
                    quotaText={classicQuota.loading ? "Checking quota…" : `${classicQuota.remainingByType.tic ?? 0} / ${classicQuota.isAdmin || classicQuota.isSubscribed ? 10 : 3} ${classicQuota.isAdmin || classicQuota.isSubscribed ? "plays left today" : "free plays left"}`}
                    onPlayed={() => { classicGameInteractedRef.current = true; }}
                  />
                )}
              </div>
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
    <GameQuotaPopup open={classicQuotaPopup} isSubscribed={classicQuota.isAdmin || classicQuota.isSubscribed} resetKey="classic-games" />
    </>
  );
}
