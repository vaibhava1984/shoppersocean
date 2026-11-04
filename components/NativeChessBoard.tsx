"use client";

import { useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";

type Props = {
  paused: boolean;
  onFirstMove: () => Promise<boolean>;
};

const glyph: Record<string, string> = {
  wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
};

export default function NativeChessBoard({ paused, onFirstMove }: Props) {
  const [game] = useState(() => new Chess());
  const [, setRevision] = useState(0);
  const [selected, setSelected] = useState<Square | null>(null);
  const [targets, setTargets] = useState<Square[]>([]);
  const [charged, setCharged] = useState(false);
  const [message, setMessage] = useState("White to move");
  const [busy, setBusy] = useState(false);

  const board = game.board();
  const targetSet = useMemo(() => new Set(targets), [targets]);

  const chooseSquare = async (square: Square) => {
    if (paused || busy) return;
    const piece = game.get(square);
    if (!selected) {
      if (piece && piece.color === game.turn()) {
        setSelected(square);
        setTargets(game.moves({ square, verbose: true }).map(move => move.to));
      }
      return;
    }
    if (piece && piece.color === game.turn() && square !== selected) {
      setSelected(square);
      setTargets(game.moves({ square, verbose: true }).map(move => move.to));
      return;
    }
    if (!targetSet.has(square)) {
      setSelected(null);
      setTargets([]);
      return;
    }
    if (!charged) {
      setBusy(true);
      const allowed = await onFirstMove();
      setBusy(false);
      if (!allowed) return;
      setCharged(true);
    }
    try {
      const moving = game.get(selected);
      const promotion = moving?.type === "p" && (square[1] === "8" || square[1] === "1") ? "q" : undefined;
      game.move({ from: selected, to: square, promotion });
      const next = game.turn() === "w" ? "White" : "Black";
      setMessage(game.isCheckmate() ? `${next} is checkmated — game over` : game.isDraw() ? "Draw — game over" : game.isCheck() ? `${next} is in check` : `${next} to move`);
      setSelected(null);
      setTargets([]);
      setRevision(value => value + 1);
    } catch {
      setSelected(null);
      setTargets([]);
    }
  };



  return (
    <div className="mx-auto w-full max-w-[560px] overflow-hidden rounded-2xl border border-amber-950/40 bg-gradient-to-br from-[#25170f] via-[#59371f] to-[#1d140f] p-3 shadow-[0_18px_45px_rgba(0,0,0,.38)] sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2 text-amber-50">
        <div><div className="text-[10px] font-black uppercase tracking-[.28em] text-amber-300">Classic match</div><div className="text-sm font-extrabold">{message}</div></div>
        <div className="rounded-full border border-amber-300/30 bg-black/25 px-3 py-1 text-[10px] font-bold tracking-wider text-amber-100">WHITE vs BLACK</div>
      </div>
      <div className="rounded-xl border-[5px] border-[#b9854c] bg-[#2a1a10] p-1 shadow-[inset_0_0_0_2px_rgba(255,224,174,.3),0_8px_18px_rgba(0,0,0,.5)]">
        <div className="grid grid-cols-8 overflow-hidden rounded-sm">
          {board.flatMap((row, rank) => row.map((piece, file) => {
            const square = `${"abcdefgh"[file]}${8-rank}` as Square;
            const light = (rank + file) % 2 === 0;
            const isSelected = selected === square;
            const isTarget = targetSet.has(square);
            const color = piece?.color ?? "";
            const symbol = piece ? glyph[color + piece.type] : "";
            return (
              <button key={square} type="button" aria-label={piece ? `${piece.color === "w" ? "White" : "Black"} ${piece.type} on ${square}` : square} onClick={() => void chooseSquare(square)}
                className={`relative flex aspect-square min-w-0 items-center justify-center transition-colors ${light ? "bg-[#ead4a8]" : "bg-[#89552f]"} ${isSelected ? "!bg-[#e9bd45]" : ""} `}
                style={{ boxShadow: isSelected ? "inset 0 0 0 3px #fff2a8" : undefined }}>
                {isTarget && <span className={`absolute h-[28%] w-[28%] rounded-full ${piece ? "border-[4px] border-emerald-700/80" : "bg-emerald-800/35"}`} />}
                {symbol && <span className={`relative z-[1] select-none text-[clamp(25px,8vw,48px)] leading-none ${color === "w" ? "text-[#fff8e8] [text-shadow:0_2px_1px_#6c4b2b,0_4px_5px_rgba(0,0,0,.65)]" : "text-[#21160f] [text-shadow:0_1px_0_#d4a875,0_4px_5px_rgba(0,0,0,.65)]"}`}>{symbol}</span>}
                {file === 0 && <span className={`absolute left-0.5 top-0.5 text-[8px] font-black ${light ? "text-[#89552f]" : "text-[#f3dfbd]"}`}>{8-rank}</span>}
                {rank === 7 && <span className={`absolute bottom-0 right-1 text-[8px] font-black ${light ? "text-[#89552f]" : "text-[#f3dfbd]"}`}>{"abcdefgh"[file]}</span>}
              </button>
            );
          }))}
        </div>
      </div>
      {paused && <div className="mt-3 rounded-lg bg-black/60 py-2 text-center text-sm font-black text-white">Game Paused</div>}
      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-bold text-amber-100/80"><span>Tap a piece, then its highlighted square.</span><span>{game.history().length} moves</span></div>

    </div>
  );
}
