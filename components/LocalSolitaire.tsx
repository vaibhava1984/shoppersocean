"use client";

import { useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Card = { id: string; rank: number; suit: Suit; faceUp: boolean };
type Source = { kind: "waste" | "tableau"; index: number; cardIndex: number };
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RED = new Set<Suit>(["♥", "♦"]);
const label = (rank: number) => rank === 1 ? "A" : rank === 11 ? "J" : rank === 12 ? "Q" : rank === 13 ? "K" : String(rank);
function makeDeal(): { stock: Card[]; waste: Card[]; piles: Card[][]; foundations: Card[][] } {
  const deck: Card[] = SUITS.flatMap(suit => Array.from({ length: 13 }, (_, i) => ({ id: suit + (i + 1), rank: i + 1, suit, faceUp: false })));
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  const piles: Card[][] = Array.from({ length: 7 }, (_, col) => {
    const cards = deck.splice(0, col + 1);
    return cards.map((card, i) => ({ ...card, faceUp: i === cards.length - 1 }));
  });
  return { stock: deck, waste: [], piles, foundations: [[], [], [], []] };
}
function canTableau(card: Card, target: Card | undefined) { return target ? target.rank === card.rank + 1 && RED.has(target.suit) !== RED.has(card.suit) : card.rank === 13; }
function canFoundation(card: Card, target: Card | undefined) { return target ? target.suit === card.suit && card.rank === target.rank + 1 : card.rank === 1; }

export default function LocalSolitaire({ onQuotaUpdate, onQuotaDenied, quotaText }: { onQuotaUpdate: (remaining: number) => void; onQuotaDenied: () => void; quotaText: string }) {
  const deal = useMemo(makeDeal, []);
  const [stock, setStock] = useState(deal.stock);
  const [waste, setWaste] = useState<Card[]>([]);
  const [piles, setPiles] = useState(deal.piles);
  const [foundations, setFoundations] = useState<Card[][]>(deal.foundations);
  const [selected, setSelected] = useState<Source | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const moveCountRef = useRef(0);
  const [message, setMessage] = useState("");
  const [moves, setMoves] = useState(0);
  const [challengeId] = useState(() => crypto.randomUUID());

  const chargeFirstMove = async () => {
    if (moveCountRef.current > 0) return true;
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/game-access", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: "classic-games", gameTypeId: "solitaire", challengeId })
      });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || "Your Solitaire quota is unavailable."); onQuotaDenied(); return false; }
      onQuotaUpdate(Number(data.remaining ?? 0));
      return true;
    } catch {
      setMessage("Could not verify your quota. Please try again.");
      return false;
    } finally { busyRef.current = false; setBusy(false); }
  };

  const commitMove = async (change: () => void) => {
    if (busy || !(await chargeFirstMove())) return;
    moveCountRef.current += 1;
    change();
    setMoves(moveCountRef.current);
    setMessage("");
  };

  const draw = () => {
    if (busy) return;
    if (stock.length) {
      void commitMove(() => {
        const next = stock[stock.length - 1];
        setStock(current => current.slice(0, -1));
        setWaste(current => [...current, { ...next, faceUp: true }]);
        setSelected(null);
      });
    } else if (waste.length) {
      void commitMove(() => {
        setStock([...waste].reverse().map(card => ({ ...card, faceUp: false })));
        setWaste([]);
        setSelected(null);
      });
    }
  };

  const chooseWaste = () => {
    if (!waste.length || busy) return;
    setSelected({ kind: "waste", index: 0, cardIndex: waste.length - 1 });
  };
  const chooseTableau = (column: number, cardIndex: number) => {
    if (busy) return;
    const card = piles[column]?.[cardIndex];
    if (!card?.faceUp) return;
    setSelected({ kind: "tableau", index: column, cardIndex });
  };

  const moveToTableau = (column: number, sourceOverride?: Source) => {
    const source = sourceOverride ?? selected;
    if (!source || busy) return;
    const sourceCards = source.kind === "waste" ? [waste[waste.length - 1]] : piles[source.index].slice(source.cardIndex);
    if (!sourceCards.length || source.kind === "tableau" && source.index === column) { setSelected(null); return; }
    const targetPile = piles[column];
    if (!canTableau(sourceCards[0], targetPile[targetPile.length - 1])) return;
    void commitMove(() => {
      const nextPiles = piles.map(pile => [...pile]);
      const nextWaste = [...waste];
      if (source.kind === "waste") nextWaste.pop();
      else {
        nextPiles[source.index] = nextPiles[source.index].slice(0, source.cardIndex);
        const oldTop = nextPiles[source.index].length - 1;
        if (oldTop >= 0 && !nextPiles[source.index][oldTop].faceUp) nextPiles[source.index][oldTop] = { ...nextPiles[source.index][oldTop], faceUp: true };
      }
      nextPiles[column] = [...nextPiles[column], ...sourceCards];
      setPiles(nextPiles); setWaste(nextWaste); setSelected(null);
    });
  };

  const moveToFoundation = (foundationIndex: number, sourceOverride?: Source) => {
    const source = sourceOverride ?? selected;
    if (!source || busy) return;
    const sourceCards = source.kind === "waste" ? [waste[waste.length - 1]] : piles[source.index].slice(source.cardIndex);
    if (sourceCards.length !== 1) return;
    const card = sourceCards[0], foundation = foundations[foundationIndex];
    if (!canFoundation(card, foundation[foundation.length - 1])) return;
    void commitMove(() => {
      const nextFoundations = foundations.map(stack => [...stack]);
      nextFoundations[foundationIndex].push(card);
      setFoundations(nextFoundations);
      if (source.kind === "waste") setWaste(current => current.slice(0, -1));
      else {
        const nextPiles = piles.map(pile => [...pile]);
        nextPiles[source.index] = nextPiles[source.index].slice(0, source.cardIndex);
        const top = nextPiles[source.index].length - 1;
        if (top >= 0 && !nextPiles[source.index][top].faceUp) nextPiles[source.index][top] = { ...nextPiles[source.index][top], faceUp: true };
        setPiles(nextPiles);
      }
      setSelected(null);
    });
  };

  const playCardTouch = () => {
    try {
      const AudioClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioClass) return;
      const ctx = new AudioClass();
      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(520, now);
      oscillator.frequency.exponentialRampToValueAtTime(760, now + 0.055);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.075, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.12);
      oscillator.onended = () => { void ctx.close(); };
    } catch {}
  };

  const renderCard = (card: Card, active: boolean, onClick: () => void, stack = false, onDragStart?: (event: DragEvent<HTMLButtonElement>) => void, dragSource?: Source) => (
    <button key={card.id} type="button" onClick={(event) => { event.stopPropagation(); onClick(); }} aria-label={card.faceUp ? label(card.rank) + " of " + card.suit : "Face-down card"}
      className={`relative z-0 flex aspect-[2/3] min-h-0 w-full min-w-0 items-start justify-start overflow-hidden rounded-md border text-left shadow-md transition-all duration-200 ${card.faceUp ? "border-slate-300 bg-gradient-to-br from-white via-white to-slate-100" : "border-slate-400 bg-gradient-to-br from-slate-600 to-slate-900"} ${active ? "z-20 scale-105 -translate-y-2 rotate-2 shadow-2xl ring-2 ring-amber-400" : "hover:-translate-y-0.5"} ${card.faceUp && RED.has(card.suit) ? "text-rose-600" : "text-slate-900"}`}
      style={stack ? { marginTop: "calc(-1 * clamp(1.2rem, 6.5vw, 1.8rem))" } : undefined}
      draggable={card.faceUp}
      onDragStart={(event) => { if (!card.faceUp) { event.preventDefault(); return; } if (onDragStart) onDragStart(event); }}
      onPointerDown={() => { if (card.faceUp) playCardTouch(); }}
      onTouchStart={() => { if (card.faceUp && dragSource) setSelected(dragSource); }}\n      onTouchEnd={(event) => { if (!dragSource) return; const touch = event.changedTouches[0]; const hit = document.elementFromPoint(touch.clientX, touch.clientY); const foundation = hit?.closest("[data-solitaire-foundation]") as HTMLElement | null; const columnTarget = hit?.closest("[data-solitaire-column]") as HTMLElement | null; if (foundation) moveToFoundation(Number(foundation.dataset.solitaireFoundation), dragSource); else if (columnTarget) moveToTableau(Number(columnTarget.dataset.solitaireColumn), dragSource); }}>
      {card.faceUp ? <>
        <span className="absolute left-1 top-0.5 z-10 text-[clamp(8px,2.5vw,12px)] font-black leading-tight">{label(card.rank)}<br/><span className="text-[clamp(11px,3.2vw,17px)]">{card.suit}</span></span>
        <span className="absolute inset-0 flex items-center justify-center text-[clamp(20px,7vw,42px)] font-black opacity-90" aria-hidden="true">{card.rank === 13 ? "👑" : card.rank === 12 ? "👸" : card.rank === 11 ? "🤴" : card.suit}</span>
        <span className="absolute bottom-0.5 right-1 rotate-180 text-[clamp(8px,2.5vw,12px)] font-black leading-tight">{label(card.rank)}<br/>{card.suit}</span>
        {card.rank >= 11 && <span className="absolute inset-[18%] rounded border border-current/25" />}
      </> : <span className="m-1.5 flex h-[calc(100%-12px)] w-[calc(100%-12px)] items-center justify-center rounded border-2 border-white/50 bg-gradient-to-br from-indigo-700 to-slate-950 text-xl text-amber-200">✦</span>}
    </button>
  );

  return (
    <div data-solitaire-game className="mx-auto w-full min-w-0 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-1.5 text-slate-800 shadow-inner sm:p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-2 py-2 shadow-sm sm:mb-3 sm:px-3">
        <div><h3 className="text-base font-black text-slate-900 sm:text-lg">♠ Solitaire</h3><p className="text-[10px] leading-4 text-slate-500 sm:text-[11px]">Draw 1 · Drag cards or tap a card and its destination</p></div>
        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-700">{quotaText}</span>
      </div>
      <div className="mb-3 grid grid-cols-7 gap-1 sm:mb-4 sm:gap-2">
        <button type="button" onClick={draw} disabled={busy} aria-label="Draw from stock" className="flex aspect-[2/3] min-w-0 items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-100 text-2xl sm:rounded-lg sm:text-3xl">{stock.length ? "▧" : "↻"}</button>
        <div className="relative">{waste.length ? renderCard(waste[waste.length - 1], selected?.kind === "waste", chooseWaste, false, (event) => { event.dataTransfer.setData("text/plain", JSON.stringify({ kind: "waste", index: 0, cardIndex: waste.length - 1 })); event.dataTransfer.effectAllowed = "move"; setSelected({ kind: "waste", index: 0, cardIndex: waste.length - 1 }); }, { kind: "waste", index: 0, cardIndex: waste.length - 1 }) : <div className="flex aspect-[2/3] min-w-0 items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-[9px] text-slate-400 sm:rounded-lg sm:text-xs">Waste</div>}</div>
        <div className="col-span-1" />
        {foundations.map((stack, index) => <button key={index} type="button" data-solitaire-foundation={index} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const raw = event.dataTransfer.getData("text/plain"); if (raw) { try { moveToFoundation(index, JSON.parse(raw) as Source); } catch {} } }} onClick={() => moveToFoundation(index)} className="flex aspect-[2/3] min-w-0 items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-100 text-base text-slate-500 sm:rounded-lg sm:text-2xl">{stack.length ? <span className={RED.has(stack[stack.length-1].suit) ? "text-rose-600" : "text-slate-900"}>{label(stack[stack.length-1].rank)}{stack[stack.length-1].suit}</span> : "A"}</button>)}
      </div>
      <div className="grid min-w-0 grid-cols-7 gap-1 sm:gap-2">
        {piles.map((pile, column) => <div key={column} data-solitaire-column={column} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const raw = event.dataTransfer.getData("text/plain"); if (raw) { try { const source = JSON.parse(raw) as Source; moveToTableau(column, source); } catch {} } }} onClick={() => moveToTableau(column)} className="flex min-h-[clamp(10rem,48vw,18rem)] min-w-0 flex-col items-stretch rounded-md bg-black/10 px-px pb-2 pt-1 sm:rounded-lg">
          {pile.length ? pile.map((card, index) => renderCard(card, selected?.kind === "tableau" && selected.index === column && index >= selected.cardIndex, () => { if (selected) moveToTableau(column); else if (card.faceUp) chooseTableau(column, index); }, index > 0, (event) => { event.dataTransfer.setData("text/plain", JSON.stringify({ kind: "tableau", index: column, cardIndex: index })); event.dataTransfer.effectAllowed = "move"; setSelected({ kind: "tableau", index: column, cardIndex: index }); }, { kind: "tableau", index: column, cardIndex: index })) : <button type="button" onClick={() => moveToTableau(column)} className="flex aspect-[2/3] w-full items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-lg">K</button>}
        </div>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-500 sm:text-xs"><span>Moves: {moves}</span><span className="text-right">{busy ? "Checking your first move…" : message || (foundations.reduce((sum, pile) => sum + pile.length, 0) === 52 ? "🎉 You won! All suits completed." : "Build each suit from Ace to King.")}</span></div>
    </div>
  );
}
