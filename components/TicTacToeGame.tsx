"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mark = "X" | "O" | null;
type Difficulty = "Easy" | "Medium" | "Hard";
const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]] as const;

function winner(board: Mark[]): Mark {
  for (const [a,b,c] of WINS) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]!;
  return null;
}
function available(board: Mark[]) { return board.map((v,i) => v === null ? i : -1).filter(i => i >= 0); }
function minimax(board: Mark[], turn: "X" | "O", depth = 0): number {
  const won = winner(board);
  if (won === "O") return 10 - depth;
  if (won === "X") return depth - 10;
  if (!available(board).length) return 0;
  const scores = available(board).map(i => {
    board[i] = turn;
    const score = minimax(board, turn === "O" ? "X" : "O", depth + 1);
    board[i] = null;
    return score;
  });
  return turn === "O" ? Math.max(...scores) : Math.min(...scores);
}
function chooseMove(board: Mark[], difficulty: Difficulty): number {
  const moves = available(board);
  if (!moves.length) return -1;
  if (difficulty === "Easy") return moves[Math.floor(Math.random() * moves.length)];
  const findWinning = (mark: "X" | "O") => moves.find(i => { const copy = [...board]; copy[i] = mark; return winner(copy) === mark; });
  if (difficulty === "Medium") {
    const win = findWinning("O"); if (win !== undefined) return win;
    const block = findWinning("X"); if (block !== undefined && Math.random() < .82) return block;
    if (board[4] === null) return 4;
    const corners = [0,2,6,8].filter(i => board[i] === null);
    if (corners.length && Math.random() < .72) return corners[Math.floor(Math.random()*corners.length)];
    return moves[Math.floor(Math.random()*moves.length)];
  }
  let best = -Infinity, choices: number[] = [];
  for (const i of moves) {
    const copy = [...board]; copy[i] = "O";
    const score = minimax(copy, "X");
    if (score > best) { best = score; choices = [i]; }
    else if (score === best) choices.push(i);
  }
  return choices[Math.floor(Math.random()*choices.length)];
}

function playTone(kind: "tap" | "x" | "o" | "win" | "lose" | "draw" | "start") {
  try {
    const Ctx = window.AudioContext || (window as typeof window & {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes: Record<typeof kind, number[]> = {
      tap:[520], x:[440,660], o:[540,720], win:[523,659,784,1047], lose:[392,330,262], draw:[440,392,440], start:[523,659]
    };
    notes[kind].forEach((freq, index) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = kind === "tap" ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now + index * .105);
      gain.gain.setValueAtTime(.0001, now + index * .105);
      gain.gain.exponentialRampToValueAtTime(kind === "tap" ? .035 : .075, now + index * .105 + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, now + index * .105 + .19);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + index * .105); osc.stop(now + index * .105 + .21);
    });
    window.setTimeout(() => void ctx.close(), 900);
  } catch { /* Sound is an enhancement; gameplay never depends on it. */ }
}

function MarkArt({ mark, animate = true }: { mark: "X" | "O"; animate?: boolean }) {
  return mark === "X" ? (
    <svg viewBox="0 0 100 100" className="h-[72%] w-[72%] overflow-visible" aria-label="X">
      <path d="M22 22 L78 78 M78 22 L22 78" fill="none" stroke="#9f1d12" strokeWidth="18" strokeLinecap="round" opacity=".28" transform="translate(0 4)"/>
      <path d="M22 22 L78 78 M78 22 L22 78" fill="none" stroke="#ef3428" strokeWidth="15" strokeLinecap="round" strokeDasharray="160" strokeDashoffset={animate ? 160 : 0} className={animate ? "ocean-mark-draw" : ""}/>
      <path d="M24 19 L78 73 M76 20 L22 74" fill="none" stroke="#ff9a7b" strokeWidth="3.5" strokeLinecap="round" opacity=".85"/>
    </svg>
  ) : (
    <svg viewBox="0 0 100 100" className="h-[72%] w-[72%] overflow-visible" aria-label="O">
      <circle cx="50" cy="50" r="32" fill="none" stroke="#0757a9" strokeWidth="17" opacity=".3" transform="translate(0 4)"/>
      <circle cx="50" cy="50" r="32" fill="none" stroke="#087ce8" strokeWidth="15" strokeDasharray="202" strokeDashoffset={animate ? 202 : 0} className={animate ? "ocean-mark-draw" : ""}/>
      <path d="M31 27 Q50 13 68 30" fill="none" stroke="#9bdcff" strokeWidth="4" strokeLinecap="round"/>
    </svg>
  );
}

export default function TicTacToeGame({ onExit }: { onExit?: () => void }) {
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [thinking, setThinking] = useState(false);
  const [message, setMessage] = useState("Your move! Choose a wooden tile.");
  const [score, setScore] = useState({ you: 0, computer: 0, draws: 0 });
  const [lastMove, setLastMove] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const timerRef = useRef<number | null>(null);
  const boardRef = useRef(board);
  boardRef.current = board;
  const result = winner(board);
  const draw = !result && board.every(Boolean);
  const finished = Boolean(result || draw);

  const resetRound = useCallback((announce = true) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setBoard(Array(9).fill(null)); setThinking(false); setLastMove(null);
    setRound(v => v + 1);
    setMessage(announce ? "New round! You're X — make the first move." : "You're X — make the first move.");
    if (announce) playTone("start");
  }, []);

  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);
  useEffect(() => {
    if (!finished) return;
    if (result === "X") { setMessage("Brilliant! You won this round!"); setScore(s => ({...s, you:s.you+1})); playTone("win"); }
    else if (result === "O") { setMessage("The computer got this one. Try again!"); setScore(s => ({...s, computer:s.computer+1})); playTone("lose"); }
    else { setMessage("A lovely match — it's a draw!"); setScore(s => ({...s, draws:s.draws+1})); playTone("draw"); }
  }, [finished, result]);

  const makeHumanMove = (index: number) => {
    if (thinking || finished || board[index] !== null) return;
    playTone("x");
    const next = [...board]; next[index] = "X";
    setBoard(next); setLastMove(index);
    if (winner(next) || next.every(Boolean)) return;
    setThinking(true); setMessage("Hmm... let me think!");
    const delay = 1000 + Math.floor(Math.random() * 2001);
    timerRef.current = window.setTimeout(() => {
      const current = [...next];
      const move = chooseMove(current, difficulty);
      if (move >= 0) {
        current[move] = "O"; setBoard(current); setLastMove(move); playTone("o");
      }
      setThinking(false); setMessage("Your turn! Make your next move.");
      timerRef.current = null;
    }, delay);
  };

  return (
    <div className="ocean-ttt relative isolate min-h-[min(720px,calc(100svh-150px))] overflow-hidden rounded-[28px] border-[5px] border-sky-300 shadow-[0_22px_55px_rgba(8,47,73,.28)]">
      <style jsx global>{`
        @keyframes oceanMarkDraw { to { stroke-dashoffset: 0; } }
        .ocean-mark-draw { animation: oceanMarkDraw .42s cubic-bezier(.2,.8,.2,1) forwards; }
        @keyframes oceanCellPop { 0%{transform:scale(.72);opacity:.5} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        .ocean-cell-pop { animation:oceanCellPop .28s ease-out both; }
        @keyframes oceanRobotBob { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-7px) rotate(2deg)} }
        .ocean-robot-bob { animation:oceanRobotBob 2.4s ease-in-out infinite; }
        @keyframes oceanCheer { 0%,100%{transform:rotate(-4deg)} 50%{transform:rotate(5deg) translateY(-4px)} }
        .ocean-cheer { animation:oceanCheer 2s ease-in-out infinite; }
        .ocean-ttt { background:linear-gradient(180deg,#60c8ff 0%,#bcecff 47%,#b7f17d 72%,#4dbb50 100%); font-family:Trebuchet MS,Arial,sans-serif; font-style:normal; }
        .ocean-ttt * { font-style:normal; }
        @media (prefers-reduced-motion: reduce) { .ocean-mark-draw,.ocean-cell-pop,.ocean-robot-bob,.ocean-cheer {animation:none!important} }
      `}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/35 blur-2xl"/>
        <div className="absolute right-8 top-20 h-32 w-52 rounded-full bg-white/35 blur-2xl"/>
        <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-green-500/65 to-transparent"/>
        <div className="absolute bottom-[14%] left-0 h-16 w-full border-t-4 border-emerald-700/15 bg-emerald-500/20"/>
        <span className="absolute left-[4%] top-[24%] text-5xl opacity-60">☁️</span><span className="absolute right-[5%] top-[18%] text-6xl opacity-60">☁️</span>
        <span className="absolute bottom-3 left-4 text-3xl">🌼</span><span className="absolute bottom-4 right-6 text-3xl">🌷</span><span className="absolute bottom-7 left-[24%] text-2xl">🌸</span>
      </div>
      <div className="relative flex min-h-[inherit] flex-col p-3 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <button onClick={onExit} className="rounded-full border-2 border-sky-200 bg-gradient-to-b from-blue-500 to-blue-800 px-3 py-2 text-xs font-black text-white shadow-[0_4px_0_#164a8b] sm:px-5 sm:text-sm">← Back to Games</button>
          <div className="rounded-full border-2 border-fuchsia-200 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-700 px-5 py-2 text-center shadow-[0_5px_0_#65218e] sm:px-10">
            <h2 className="text-xl font-black tracking-wide text-yellow-200 drop-shadow-[0_2px_1px_#6b2800] sm:text-3xl">Tic Tac Toe</h2>
            <p className="hidden text-[10px] font-bold text-white sm:block">GET 3 IN A ROW TO WIN!</p>
          </div>
          <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-b from-blue-600 to-indigo-900 p-1.5 text-center shadow-lg sm:px-3">
            <p className="text-[10px] font-black text-white sm:text-xs">DIFFICULTY</p>
            <div className="mt-1 flex gap-1">
              {(["Easy","Medium","Hard"] as Difficulty[]).map(level => <button key={level} onClick={() => {setDifficulty(level);playTone("tap");}} className={`rounded-full px-2 py-1 text-[9px] font-black sm:px-3 sm:text-xs ${difficulty===level?"bg-gradient-to-b from-lime-300 to-green-500 text-green-950 shadow-inner":"bg-blue-500 text-white"}`}>{level}</button>)}
            </div>
          </div>
        </div>
        <div className="mt-3 grid flex-1 grid-cols-[minmax(82px,1fr)_minmax(220px,2.2fr)_minmax(82px,1fr)] items-center gap-2 sm:gap-5">
          <div className="flex flex-col items-center justify-center">
            <div className="ocean-cheer text-5xl drop-shadow-md sm:text-7xl">🧒🏻</div>
            <div className="mt-1 w-full max-w-[150px] rounded-2xl border-[3px] border-amber-700 bg-gradient-to-b from-amber-400 to-amber-700 p-2 text-center shadow-[0_5px_0_#78350f]">
              <p className="text-sm font-black text-white drop-shadow sm:text-lg">YOU</p>
              <div className="mx-auto mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/80 sm:h-14 sm:w-14"><MarkArt mark="X" animate={false}/></div>
              <p className="mt-1 text-[10px] font-bold text-white/95 sm:text-xs">Player 1</p>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[530px]">
            <div className="mb-2 rounded-full border border-white/80 bg-white/75 px-3 py-2 text-center text-xs font-black text-indigo-950 shadow sm:text-sm" aria-live="polite">{thinking ? "🤔 " : finished ? "🏆 " : "✨ "}{message}</div>
            <div className="rounded-[28px] border-[7px] border-amber-600 bg-gradient-to-br from-amber-300 via-orange-400 to-amber-700 p-2 shadow-[0_12px_0_#854d0e,0_18px_28px_rgba(75,35,5,.3)] sm:p-3">
              <div className="grid aspect-square grid-cols-3 gap-2 rounded-2xl bg-amber-900/35 p-1.5 sm:gap-3 sm:p-2">
                {board.map((mark,index) => <button key={index} type="button" onClick={() => makeHumanMove(index)} disabled={Boolean(mark)||thinking||finished} aria-label={`Row ${Math.floor(index/3)+1}, column ${index%3+1}${mark ? `, ${mark}` : ", empty"}`} className={`flex min-h-0 items-center justify-center rounded-[17px] border-[3px] border-amber-200 bg-gradient-to-br from-[#fff1bd] via-[#f7d98a] to-[#eebd5e] shadow-[inset_0_3px_5px_rgba(255,255,255,.8),0_4px_0_#a16207] transition duration-150 ${!mark&&!thinking&&!finished?"hover:-translate-y-1 hover:brightness-110 active:translate-y-1 active:shadow-none":""}`}>
                  {mark && <span key={`${round}-${index}-${mark}`} className="ocean-cell-pop flex h-full w-full items-center justify-center"><MarkArt mark={mark}/></span>}
                </button>)}
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <button onClick={() => resetRound(true)} className="rounded-full border-[3px] border-lime-200 bg-gradient-to-b from-lime-400 via-green-500 to-green-700 px-7 py-2.5 text-base font-black text-white shadow-[0_6px_0_#166534,0_10px_18px_rgba(22,101,52,.25)] transition hover:-translate-y-1 hover:brightness-110 active:translate-y-1 active:shadow-none sm:px-12 sm:text-xl">↻ New Game</button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="ocean-robot-bob text-5xl drop-shadow-md sm:text-7xl">🤖</div>
            <div className="mt-1 w-full max-w-[150px] rounded-2xl border-[3px] border-amber-700 bg-gradient-to-b from-amber-400 to-amber-700 p-2 text-center shadow-[0_5px_0_#78350f]">
              <p className="text-sm font-black text-white drop-shadow sm:text-lg">COMPUTER</p>
              <div className="mx-auto mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/80 sm:h-14 sm:w-14"><MarkArt mark="O" animate={false}/></div>
              <p className="mt-1 text-[10px] font-bold text-white/95 sm:text-xs">{thinking ? "Thinking..." : "Player 2"}</p>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-gradient-to-r from-blue-700 to-indigo-900 px-4 py-2 text-white shadow-lg">
            <span className="text-2xl">🏆</span><div className="text-xs font-black sm:text-sm"><span>You: {score.you}</span><span className="mx-2 text-sky-200">•</span><span>Computer: {score.computer}</span><span className="mx-2 text-sky-200">•</span><span>Draws: {score.draws}</span></div>
          </div>
          <div className="rounded-full border-2 border-yellow-200 bg-gradient-to-r from-yellow-300 to-amber-500 px-5 py-2 text-sm font-black text-blue-900 shadow-lg">⭐ Round {round} · Good luck!</div>
        </div>
      </div>
    </div>
  );
}
