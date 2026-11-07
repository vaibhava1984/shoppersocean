"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import EntertainmentHub from "@/components/EntertainmentHub";
import DigitalDiscoveryHub from "@/components/DigitalDiscoveryHub";
import MysteryQuiz from "@/components/MysteryQuiz";
import PuzzleUniverse from "@/components/PuzzleUniverse";
import WorldExplorer from "@/components/WorldExplorer";
import WorldRecordsArena from "@/components/WorldRecordsArena";
import NativeTriviaQuiz from "@/components/NativeTriviaQuiz";
import RiddleCornerQuiz from "@/components/RiddleCornerQuiz";
import GameQuotaPopup from "@/components/GameQuotaPopup";
import GameQuotaNotice from "@/components/GameQuotaNotice";
import { formatFreeQuotaLabel } from "@/lib/game-quota-label";

const zones = [
  { icon: "📚", name: "Flipbook World", tone: "from-sky-500 via-blue-600 to-indigo-700", note: "Open the existing Read E-books library", action: "books" },
  { icon: "🎮", name: "Quiz World", tone: "from-violet-500 via-purple-600 to-indigo-800", note: "A collection of quizzes, mysteries, technology and world challenges", action: "games" },
  { icon: "🎓", name: "Learning Academy", tone: "from-emerald-500 via-teal-600 to-cyan-800", note: "Existing English Master Quiz", action: "learning" },
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

function ColourfulTicTacToe({ quotaText, onPlayed, onNewGame }: { quotaText: string; onPlayed: () => void; onNewGame: (finished: boolean) => Promise<boolean> }) {
  const [mode,setMode]=useState<TicMode>("computer");
  const [difficulty,setDifficulty]=useState<TicDifficulty>("medium");
  const [board,setBoard]=useState<TicMark[]>(Array(9).fill(null));
  const [turn,setTurn]=useState<TicMark>("X");
  const [scores,setScores]=useState({ player:0, opponent:0, draws:0 });
  const [thinking,setThinking]=useState(false);
  const audioContextRef=useRef<AudioContext|null>(null);
  const winner=ticWinner(board);
  const draw=!winner && board.every(Boolean);
  const finished=Boolean(winner || draw);
  const playMoveTone=()=>{
    try {
      const AudioContextClass=window.AudioContext||(window as Window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
      if(!AudioContextClass)return;
      const context=audioContextRef.current??new AudioContextClass();
      audioContextRef.current=context;
      if(context.state==="suspended")void context.resume();
      const now=context.currentTime;
      const oscillator=context.createOscillator();
      const overtone=context.createOscillator();
      const gain=context.createGain();
      oscillator.type="sine"; overtone.type="triangle";
      oscillator.frequency.setValueAtTime(690,now);
      oscillator.frequency.exponentialRampToValueAtTime(930,now+0.075);
      overtone.frequency.setValueAtTime(1380,now);
      gain.gain.setValueAtTime(0.0001,now);
      gain.gain.exponentialRampToValueAtTime(0.13,now+0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001,now+0.18);
      oscillator.connect(gain); overtone.connect(gain); gain.connect(context.destination);
      oscillator.start(now); overtone.start(now);
      oscillator.stop(now+0.19); overtone.stop(now+0.19);
    } catch(error) { console.error("Tic Tac Toe touch sound unavailable:",error); }
  };
  const playResultTone=(kind:"win"|"lose")=>{
    try { const audio=new Audio(kind==="win"?"/correct.mp3":"/Lose.mp3"); audio.volume=0.85; void audio.play().catch(error=>console.error("Tic Tac Toe result tone unavailable:",error)); }
    catch(error) { console.error("Tic Tac Toe result tone unavailable:",error); }
  };
  const resetBoard=()=>{ setBoard(Array(9).fill(null)); setTurn("X"); setThinking(false); };

  useEffect(()=>{
    if (mode!=="computer" || turn!=="O" || finished) return;
    setThinking(true);
    const timer=window.setTimeout(()=>{
      if (ticWinner(board) || board.every(Boolean)) { setThinking(false); return; }
      const move=ticBestMove(board,difficulty);
      if (move<0) { setThinking(false); return; }
      const next=[...board]; next[move]="O";
      const result=ticWinner(next);
      if (result==="O") { setScores(score=>({...score,opponent:score.opponent+1})); playResultTone("lose"); }
      else if (!result && next.every(Boolean)) setScores(score=>({...score,draws:score.draws+1}));
      setBoard(next);
      setTurn("X"); setThinking(false);
    },850+Math.floor(Math.random()*551));
    return ()=>window.clearTimeout(timer);
  },[mode,turn,finished,difficulty,board]);

  const playCell=(index:number)=>{
    if (board[index] || finished || thinking || (mode==="computer" && turn!=="X")) return;
    onPlayed();
    playMoveTone();
    const next=[...board]; next[index]=turn;
    const result=ticWinner(next);
    if (result==="X") { setScores(score=>({...score,player:score.player+1})); playResultTone("win"); }
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
        {board.map((mark,index)=><button data-tic-cell key={index} type="button" onClick={()=>playCell(index)} disabled={Boolean(mark)||finished||thinking||(mode==="computer"&&turn!=="X")} aria-label={`Cell ${index+1}${mark?", "+mark:" empty"}`} className="flex min-h-0 min-w-0 items-center justify-center rounded-[15px] bg-gradient-to-br from-white to-slate-100 text-[clamp(3rem,17vw,6rem)] font-black leading-none shadow-inner transition enabled:active:scale-95 enabled:hover:bg-white disabled:cursor-default">
          {mark==="X" ? <span className="tic-mark-x text-blue-600 drop-shadow-[0_3px_0_#9ccfff]">×</span> : mark==="O" ? <span className="tic-mark-o text-red-500 drop-shadow-[0_3px_0_#ffc1b7]">○</span> : <span className="opacity-0">·</span>}
        </button>)}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button type="button" onClick={async()=>{if (!(await onNewGame(finished))) return; resetBoard();}} className="min-h-14 w-full max-w-[300px] rounded-full border-4 border-green-300 bg-gradient-to-b from-lime-400 to-green-600 px-5 py-3 text-lg font-black text-white shadow-[0_5px_0_#16803a] transition hover:brightness-105 active:translate-y-1 active:shadow-none">↻ New Game</button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] font-bold text-slate-600"><span>Draws: {scores.draws}</span><span className="rounded-full bg-white/80 px-3 py-1 text-center text-blue-800">{quotaText}</span></div>
    </div>
  );
}

export default function HomeActivityZones({ userId }: { userId: string | null }) {
  const [activeZone, setActiveZone] = useState<number | null>(null);
  const [englishTopicOpen, setEnglishTopicOpen] = useState(false);
  const [englishAcademyEntered, setEnglishAcademyEntered] = useState(false);
  const [classicGameStarted, setClassicGameStarted] = useState<"tic-tac-toe" | "solitaire" | "chess" | null | false>(false);
  const classicGameStartedRef = useRef<"tic-tac-toe" | "solitaire" | "chess" | null | false>(false);
  const classicGameInteractedRef = useRef(false);
  const classicGameSessionRef = useRef<{ gameType: "tic" | "solitaire" | "chess"; sessionId: string; consumed: boolean } | null>(null);
  const enterSolitairePortrait = () => {
    try { void screen.orientation?.lock?.("portrait").catch(() => {}); } catch {}
  };
  const leaveSolitaireLandscape = () => {
    try { screen.orientation?.unlock?.(); } catch {}
  };
  const [classicQuota, setClassicQuota] = useState<{ remainingByType: Record<string, number>; isAdmin: boolean; isSubscribed: boolean; loading: boolean }>({ remainingByType: {}, isAdmin: false, isSubscribed: false, loading: true });
  const [classicQuotaPopup, setClassicQuotaPopup] = useState(false);
  const [signInPopup, setSignInPopup] = useState(false);
  useEffect(() => {
    if (!signInPopup) return;
    const timer = window.setTimeout(() => setSignInPopup(false), 5000);
    return () => window.clearTimeout(timer);
  }, [signInPopup]);
  const [classicGameOpening, setClassicGameOpening] = useState(false);
  const [chessPaused, setChessPaused] = useState(false);
  const [chessInstance, setChessInstance] = useState(0);
  const [solitaireInstance, setSolitaireInstance] = useState(0);
  const [trivioRemaining, setTrivioRemaining] = useState(0);
  const [riddleRemaining, setRiddleRemaining] = useState(0);
  const [trivioQuotaLoading, setTrivioQuotaLoading] = useState(true);
  const activeZoneRef = useRef<number | null>(null);
  const activeQuizGameRef = useRef<string | null>(null);
  const activityTargetRef = useRef<HTMLDivElement | null>(null);
  const gameTargetRef = useRef<HTMLDivElement | null>(null);
  const consumeClassicAttempt = async (session: { gameType: "tic" | "solitaire" | "chess"; sessionId: string; consumed: boolean }) => {
    if (session.consumed) return false;
    try {
      const response = await fetch("/api/game-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sectionId: "classic-games", gameTypeId: session.gameType, challengeId: session.sessionId }) });
      const data = await response.json();
      if (!response.ok) {
        setClassicQuotaPopup(true);
        if (session.gameType === "solitaire" || session.gameType === "chess") {
          classicGameStartedRef.current = false;
          setClassicGameStarted(false);
        }
        return false;
      }
      session.consumed = true;
      const remaining = Number(data.remaining ?? 0);
      setClassicQuota(current => ({ ...current, remainingByType: { ...current.remainingByType, [session.gameType]: remaining } }));
      if (remaining <= 0) setClassicQuotaPopup(true);
      // A successful POST has already consumed the attempt. Allow that final
      // permitted attempt to start even when the returned balance is now zero.
      // The next attempt request will be rejected by the API and show the popup.
      return true;
    } catch (error) { console.error("Classic game quota recording failed:", error); session.consumed = false; return false; }
  };
  const startNextClassicAttempt = (gameType: "tic" | "solitaire" | "chess") => {
    classicGameSessionRef.current = { gameType, sessionId: "classic-game:" + gameType + ":" + Date.now() + ":" + Math.random().toString(36).slice(2), consumed: false };
    classicGameInteractedRef.current = false;
  };
  const registerClassicInteraction = async () => {
    const session = classicGameSessionRef.current;
    if (!session) return false;
    if (session.consumed || classicGameInteractedRef.current) return true;
    classicGameInteractedRef.current = true;
    const allowed = await consumeClassicAttempt(session);
    if (!allowed && classicGameSessionRef.current === session) classicGameInteractedRef.current = false;
    return allowed;
  };
  const startChargedClassicRestart = async (gameType: "solitaire" | "chess") => {
    const session = { gameType, sessionId: "classic-game:" + gameType + ":" + Date.now() + ":" + Math.random().toString(36).slice(2), consumed: false };
    classicGameSessionRef.current = session;
    classicGameInteractedRef.current = true;
    const allowed = await consumeClassicAttempt(session);
    if (!allowed) classicGameInteractedRef.current = false;
    return allowed;
  };
  useEffect(() => {
    const handleMobileBack = async () => {
      if (classicGameStartedRef.current) {
        const session = classicGameSessionRef.current;
        // The current game attempt was charged when the game was opened or restarted.
        if (classicGameStartedRef.current === "solitaire") leaveSolitaireLandscape();
        classicGameStartedRef.current = false;
        classicGameSessionRef.current = null;
        classicGameInteractedRef.current = false;
        setChessPaused(false);
        setClassicGameStarted(false);
        return;
      }
      if (activeQuizGameRef.current !== null) {
        activeQuizGameRef.current = null;
        setActiveQuizGame(null);
        return;
      }
      if (englishAcademyEntered && !englishTopicOpen) {
        setEnglishAcademyEntered(false);
        return;
      }
      if (activeZoneRef.current !== null) {
        activeZoneRef.current = null;
        setActiveZone(null);
        setEnglishTopicOpen(false);
        setEnglishAcademyEntered(false);
      }
    };
    window.addEventListener("popstate", handleMobileBack);
    return () => window.removeEventListener("popstate", handleMobileBack);
  }, []);
  const openZone = (index: number) => {
    if (activeZoneRef.current === null) window.history.pushState({ shoppersOceanZone: true }, "", window.location.href);
    activeZoneRef.current = index;
    setActiveZone(index);
    setEnglishTopicOpen(false);
    setEnglishAcademyEntered(false);
    classicGameStartedRef.current = false;
    setClassicGameStarted(false);
    activeQuizGameRef.current = null;
    setActiveQuizGame(null);
  };
  const [activeQuizGame, setActiveQuizGame] = useState<string | null>(null);
  const openGame = (gameId: string) => {
    if (!userId) { setSignInPopup(true); return; }
    window.history.pushState({ shoppersOceanZone: true, shoppersOceanGame: gameId }, "", window.location.href);
    activeQuizGameRef.current = gameId;
    setActiveQuizGame(gameId);
  };
  const exitGame = () => { if (activeQuizGameRef.current !== null) window.history.back(); };
  const openClassicGame = async (game: "tic-tac-toe" | "solitaire" | "chess") => {
    if (!userId) { setSignInPopup(true); return; }
    if (game === "solitaire") { enterSolitairePortrait(); }
    const gameType = game === "solitaire" ? "solitaire" : game === "chess" ? "chess" : "tic";
    setClassicGameOpening(true);
    try {
      // Check the current balance before showing the game, but charge only when
      // the player actually interacts with the game (or starts a new deal/restart).
      const quotaResponse = await fetch("/api/game-access", { cache: "no-store" });
      const quotaData = await quotaResponse.json();
      if (!quotaResponse.ok) throw new Error(quotaData.error || "Quota could not be verified.");
      const remaining = Number(quotaData.remainingByType?.[gameType] ?? 0);
      setClassicQuota({ remainingByType: quotaData.remainingByType ?? {}, isAdmin: Boolean(quotaData.isAdmin), isSubscribed: Boolean(quotaData.isSubscribed), loading: false });
      if (remaining <= 0) {
        if (gameType === "solitaire") leaveSolitaireLandscape();
        setClassicGameOpening(false);
        setClassicQuotaPopup(true);
        return;
      }
      startNextClassicAttempt(gameType);
      setChessPaused(false);
      setChessInstance(0);
      window.history.pushState({ shoppersOceanZone: true, shoppersOceanClassicGame: game }, "", window.location.href);
      classicGameStartedRef.current = game;
      setClassicGameStarted(game);
      setClassicGameOpening(false);
    } catch (error) {
      if (game === "solitaire") leaveSolitaireLandscape();
      setClassicGameOpening(false);
      console.error("Classic game quota check failed:", error);
      setClassicQuota(current => ({ ...current, loading: false }));
    }
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
    if (activeQuizGame !== "word" || !userId) return;
    let live = true;
    setTrivioQuotaLoading(true);
    fetch("/api/game-access", { cache: "no-store" })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Quota unavailable"); return data; })
      .then(data => { if (live) { setTrivioRemaining(Number(data.remainingByType?.trivio ?? 0)); setRiddleRemaining(Number(data.isAdmin || data.isSubscribed ? data.remainingByType?.riddle ?? 0 : data.remainingBySection?.["riddle-corner"] ?? 0)); setClassicQuota(current => ({ ...current, isAdmin: Boolean(data.isAdmin), isSubscribed: Boolean(data.isSubscribed) })); } })
      .catch(error => console.error("Trivio quota check failed:", error))
      .finally(() => { if (live) setTrivioQuotaLoading(false); });
    return () => { live = false; };
  }, [activeQuizGame, userId]);
  const playZoneTap = () => { try { const audio = new Audio("/Tap.mp3"); audio.volume = 0.85; void audio.play().catch(() => {}); } catch {} };
  useEffect(() => { if (!classicQuotaPopup) return; const timer = window.setTimeout(() => setClassicQuotaPopup(false), 5200); return () => window.clearTimeout(timer); }, [classicQuotaPopup]);
  useEffect(() => { if (!signInPopup) return; const timer = window.setTimeout(() => setSignInPopup(false), 5000); return () => window.clearTimeout(timer); }, [signInPopup]);
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
    <section aria-label="Shoppers Ocean activity zones" onClickCapture={(event) => { const target = event.target as HTMLElement; const button = target.closest("button, a"); if (!button || target.closest("[data-answer-choice], [data-entertainment-hub], [data-tic-cell]")) return; playZoneTap(); }} className={`${activeZone !== null || activeQuizGame !== null || Boolean(classicGameStarted) || classicGameOpening ? "fixed inset-0 z-[9999] h-[100dvh] w-full overflow-y-auto overscroll-contain" : "relative overflow-hidden border-y"} border-indigo-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 py-4 sm:py-6`}>
      {classicGameOpening && <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950 text-lg font-black text-white">Opening game…</div>}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <style jsx global>{`@keyframes liveZoneZoom{0%{opacity:0;transform:scale(.55)}65%{opacity:1;transform:scale(1.035)}100%{opacity:1;transform:scale(1)}}\n@keyframes ticMarkPop{0%{opacity:0;transform:scale(.25) rotate(-24deg)}65%{opacity:1;transform:scale(1.18) rotate(5deg)}100%{opacity:1;transform:scale(1) rotate(0)}}\n.tic-mark-x,.tic-mark-o{display:inline-block;animation:ticMarkPop .34s cubic-bezier(.2,.8,.2,1) both;transform-origin:center;}
@media (orientation: landscape) and (max-height: 600px) {

}
.classic-solitaire-frame { height: min(78vw, 420px); min-height: 280px; max-height: 420px; }\n@media (orientation: landscape) { .classic-solitaire-frame { height: min(72dvh, 430px) !important; min-height: 260px !important; max-height: 430px; } }\n.classic-game-landscape-controls { display: none; }
[data-entertainment-hub] div.flex.items-start.gap-3.rounded-xl.border-violet-200 { display: block !important; width: 100%; }
[data-entertainment-hub] div.flex.items-start.gap-3.rounded-xl.border-violet-200 > span { display: inline-flex; max-width: 100%; }
[data-entertainment-hub] div.flex.items-start.gap-3.rounded-xl.border-violet-200 > p { display: block; width: 100%; margin-top: .6rem; white-space: normal; overflow-wrap: anywhere; line-height: 1.75; }
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
              <span className="rounded-full border border-amber-300/50 bg-amber-300/15 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-100">4 activity zones</span>
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
          <div ref={activityTargetRef} className="min-h-[55vh] scroll-mt-24 rounded-3xl border border-white/20 bg-white p-4 shadow-2xl sm:p-7" style={{ touchAction: "pan-x pan-y pinch-zoom", WebkitOverflowScrolling: "touch" }}>
            {!englishTopicOpen && (<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => { if (classicGameStartedRef.current || activeQuizGameRef.current !== null || activeZoneRef.current !== null || selected.action === "learning") window.history.back(); }} className="rounded-full border border-indigo-300 bg-gradient-to-r from-indigo-700 via-blue-700 to-cyan-600 px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110">{classicGameStartedRef.current || activeQuizGame !== null || englishAcademyEntered || selected.action === "learning" ? "← Back" : "← Back to all zones"}</button></div>
                {activeQuizGame === null && !classicGameStarted && selected.action !== "games" && <span className={`rounded-full bg-gradient-to-r ${selected.tone} px-4 py-2 text-sm font-black text-white shadow`}>{selected.icon} {selected.name}</span>}
            </div>            )}
            {selected.action === "games" && (
              <div>
                {!activeQuizGame ? (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {[
                        {id:"word",icon:"🌍",title:"General Knowledge Quiz",note:"Discover facts about the world",tone:"from-cyan-600 to-blue-700"},
                        {id:"riddle",icon:"💡",title:"Riddle Corner",note:"Solve clever riddles and brain teasers",tone:"from-amber-500 to-orange-700"},
                        {id:"mystery",icon:"🔎",title:"Mystery Quiz",note:"Investigate clues and uncover answers",tone:"from-violet-600 to-indigo-800"},
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
                  <div ref={gameTargetRef}>{activeQuizGame === "word" && <div className="mt-5"><NativeTriviaQuiz userId={userId} isPrivileged={classicQuota.isAdmin || classicQuota.isSubscribed} remaining={trivioRemaining} quotaLimit={classicQuota.isAdmin || classicQuota.isSubscribed ? 10 : 3} onRemainingChange={setTrivioRemaining} onExit={exitGame} /></div>}
                    {activeQuizGame === "riddle" && <RiddleCornerQuiz userId={userId} isPrivileged={classicQuota.isAdmin || classicQuota.isSubscribed} remaining={riddleRemaining} quotaLimit={classicQuota.isAdmin || classicQuota.isSubscribed ? 3 : 1} onRemainingChange={setRiddleRemaining} onExit={exitGame} />}
                    {activeQuizGame === "mystery" && <div className="mt-5"><MysteryQuiz userId={userId} onExit={exitGame} /></div>}
                  </div>
                )}
              </div>
            )}
            {selected.action === "classic-games" && (
              <div ref={activityTargetRef} className="flex w-full items-center justify-center">
                {classicGameStarted === null || classicGameStarted === false ? (
                  <div className="w-full max-w-2xl">
                    <div className="grid w-full max-w-2xl gap-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => void openClassicGame("tic-tac-toe")}
                      disabled={classicGameOpening}
                      className="w-full rounded-2xl border border-white/30 bg-gradient-to-r from-orange-500 via-rose-600 to-pink-700 px-6 py-6 text-lg font-black text-white shadow-xl transition hover:-translate-y-1 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200 disabled:opacity-60"
                    >
                      ❌⭕ &nbsp; Play Tic Tac Toe
                    </button>
                    </div>
                    </div>
                  </div>
                ) : (
                  <ColourfulTicTacToe
                    quotaText={classicQuota.loading ? "Checking quota…" : formatFreeQuotaLabel(Number(classicQuota.remainingByType.tic ?? 0), classicQuota.isAdmin || classicQuota.isSubscribed, "game")}
                    onPlayed={() => { classicGameInteractedRef.current = true; }}
                    onNewGame={async (wasFinished) => { if (!wasFinished && !classicGameInteractedRef.current) return true; const session=classicGameSessionRef.current; const allowed=session ? await consumeClassicAttempt(session) : false; if (allowed) startNextClassicAttempt("tic"); return allowed; }}
                  />
                )}
                {!classicQuota.loading && Number(classicQuota.remainingByType.tic ?? 0) <= 0 && <div className="w-full max-w-2xl"><GameQuotaNotice isPrivileged={classicQuota.isAdmin || classicQuota.isSubscribed} /></div>}
              </div>
            )}
            {selected.action === "learning" && (
              <div ref={activityTargetRef} className="w-full" onClickCapture={(event) => { const target = event.target as HTMLElement; const button = target.closest("button"); if (button?.textContent?.trim() === "← Back" && event.currentTarget.querySelector('h4[style*="scroll-margin-top"]')) { event.preventDefault(); event.stopPropagation(); window.history.back(); } }}>
                {!englishAcademyEntered ? (
                  <div className="mx-auto w-full max-w-md">
                    <button type="button" onClick={() => { window.history.pushState({ shoppersOceanLearning: true }, "", window.location.href); setEnglishAcademyEntered(true); }} className="group w-full rounded-2xl border border-sky-300 bg-gradient-to-br from-sky-100 via-white to-violet-100 p-5 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200">
                      <span className="flex items-center justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">📘</span><span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-600">Open →</span></span>
                      <span className="mt-3 block text-lg font-black text-slate-900 group-hover:text-blue-700">English Master Quiz</span>
                    </button>
                  </div>
                ) : (
                  <EntertainmentHub userId={userId} visibleGroupIds={["english-expert"]} initialGroupId="english-expert" autoStart embedded onTopicQuotaChange={(topic) => setEnglishTopicOpen(Boolean(topic))} />
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </section>
    <GameQuotaPopup open={classicQuotaPopup} isSubscribed={classicQuota.isAdmin || classicQuota.isSubscribed} resetKey="classic-games" />
    {signInPopup && <div className="fixed inset-0 z-[10060] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true"><div className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-2xl"><div className="h-2 bg-gradient-to-r from-cyan-300 via-pink-500 to-violet-600"><div className="h-2 bg-gradient-to-r from-cyan-300 to-white/80" style={{animation:"popupCountdown 5s linear forwards"}} /></div><div className="bg-gradient-to-br from-indigo-700 via-violet-600 to-fuchsia-600 px-6 py-7 text-center text-white"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-lg">🔐</div><h3 className="mt-4 text-xl font-black">Sign in or create an account</h3><p className="mt-2 text-sm leading-6 text-white/90">Sign in or create an account to enjoy this feature and explore more on Shoppers Ocean.</p><div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-black text-indigo-700 shadow-lg">Sign in</Link><Link href="/login?type=signup" className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-white/80 bg-white/15 px-6 py-3 text-sm font-black text-white shadow-lg">Create account</Link></div></div></div></div>}
    </>
  );
}
