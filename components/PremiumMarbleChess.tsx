'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { Chessboard } from "react-chessboard";

type Props = { quotaText: string; initialAttemptCharged: boolean; onFirstMove: () => Promise<boolean>; onNewBattle: () => Promise<boolean> };
const values: Record<string, number> = { p:100, n:320, b:330, r:500, q:900, k:20000 };
function evaluate(game: Chess) {
  return game.board().flat().reduce((score, piece) => score + (piece ? (piece.color === "w" ? 1 : -1) * values[piece.type] : 0), 0);
}
function chooseMove(game: Chess) {
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;
  let best = moves[0], bestScore = Infinity;
  for (const move of moves) {
    const copy = new Chess(game.fen());
    copy.move(move);
    let score = evaluate(copy);
    if (copy.isCheckmate()) score = -100000;
    else {
      const replies = copy.moves({ verbose: true });
      if (replies.length) {
        let strongestWhiteReply = -Infinity;
        for (const reply of replies) {
          const after = new Chess(copy.fen());
          after.move(reply);
          strongestWhiteReply = Math.max(strongestWhiteReply, evaluate(after));
        }
        score = strongestWhiteReply;
      }
    }
    if (score < bestScore) { bestScore = score; best = move; }
  }
  return best;
}
export default function PremiumMarbleChess({ quotaText, initialAttemptCharged, onFirstMove, onNewBattle }: Props) {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [thinking, setThinking] = useState(false);
  const [message, setMessage] = useState("Your move — White plays first");
  const audioRef = useRef<AudioContext | null>(null);
  const attemptChargedRef = useRef(initialAttemptCharged);
  const quotaPendingRef = useRef(false);
  const tone = useCallback((capture: boolean) => {
    try {
      const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = audioRef.current ?? new Ctx();
      audioRef.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator(), gain = ctx.createGain(), now = ctx.currentTime;
      osc.type = "sine"; osc.frequency.setValueAtTime(capture ? 260 : 620, now);
      osc.frequency.exponentialRampToValueAtTime(capture ? 130 : 880, now + .12);
      gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.12, now + .01); gain.gain.exponentialRampToValueAtTime(.0001, now + .2);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + .21);
    } catch {}
  }, []);
  const updateStatus = useCallback((game: Chess) => {
    setFen(game.fen());
    setMessage(game.isCheckmate() ? "Checkmate!" : game.isDraw() ? "Draw game" : game.isCheck() ? "Check!" : game.turn() === "w" ? "Your move — White" : "Computer is thinking…");
  }, []);
  const onPieceDrop = useCallback((source: Square, target: Square) => {
    const current = gameRef.current;
    if (thinking || current.turn() !== "w" || current.isGameOver() || quotaPendingRef.current) return false;
    // Validate the move on a copy first, so illegal moves never consume quota.
    const candidate = new Chess(current.fen());
    let move;
    try { move = candidate.move({ from: source, to: target, promotion: "q" }); }
    catch { return false; }
    if (!move) return false;
    const commitMove = () => {
      gameRef.current = candidate;
      tone(Boolean(move.captured));
      updateStatus(candidate);
      if (!candidate.isGameOver()) {
        setThinking(true);
        window.setTimeout(() => {
          const liveGame = gameRef.current;
          const aiMove = chooseMove(liveGame);
          if (aiMove) {
            const played = liveGame.move(aiMove);
            tone(Boolean(played?.captured));
            updateStatus(liveGame);
          }
          setThinking(false);
        }, 450);
      }
    };
    if (!attemptChargedRef.current) {
      // react-chessboard v4 expects a synchronous boolean. Snap the piece back,
      // charge asynchronously, then update the controlled FEN after approval.
      quotaPendingRef.current = true;
      void onFirstMove().then(allowed => {
        if (allowed) { attemptChargedRef.current = true; commitMove(); }
      }).catch(error => {
        console.error("Chess quota check failed:", error);
      }).finally(() => { quotaPendingRef.current = false; });
      return false;
    }
    commitMove();
    return true;
  }, [thinking, tone, updateStatus, onFirstMove]);
  useEffect(() => () => { if (audioRef.current) void audioRef.current.close(); }, []);
  const newBattle = async () => {
    // Restarting an untouched board is free; a played battle requires a new attempt.
    if (attemptChargedRef.current && !(await onNewBattle())) return;
    if (attemptChargedRef.current) attemptChargedRef.current = true;
    else attemptChargedRef.current = false;
    quotaPendingRef.current = false;
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setThinking(false);
    setMessage("Your move — White plays first");
  };
  return (
    <div className="mx-auto w-full max-w-[580px] rounded-[28px] border border-cyan-300/50 bg-[#101827] p-3 text-white shadow-[0_0_35px_rgba(34,211,238,.25)] sm:p-5">
      <div className="mb-4 text-center">
        <h2 className="bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-3xl font-black tracking-wide text-transparent sm:text-4xl">MARBLE CHESS</h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-[.22em] text-cyan-200">Challenge the computer</p>
      </div>
      <div className="rounded-2xl border-[5px] border-[#62d9d0] p-1 shadow-[0_0_22px_rgba(45,212,191,.35)]">
        <Chessboard position={fen} onPieceDrop={onPieceDrop} boardOrientation="white" animationDuration={220} customDarkSquareStyle={{ backgroundColor: "#1b4d3e" }} customLightSquareStyle={{ backgroundColor: "#7a4b8c" }} autoPromoteToQueen={true} />
      </div>
      <div role="status" aria-live="polite" className="mt-4 rounded-xl bg-slate-800 px-3 py-3 text-center text-sm font-bold text-cyan-100">{thinking ? "Computer is thinking…" : message}</div>
      <button type="button" onClick={() => void newBattle()} disabled={thinking} className="mt-4 min-h-12 w-full rounded-full border border-cyan-200 bg-gradient-to-r from-cyan-600 to-violet-700 px-5 py-3 font-black text-white shadow-lg transition hover:brightness-110 disabled:opacity-60">↻ New Battle</button>
      <p className="mt-3 text-center text-xs font-bold text-cyan-200">{quotaText}</p>
    </div>
  );
}
