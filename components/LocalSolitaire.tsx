"use client";

import { useMemo, useRef, useState } from "react";

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

export default function LocalSolitaire({ userId, onQuotaUpdate }: { userId: string; onQuotaUpdate: (remaining: number) => void }) {
  const [dealKey, setDealKey] = useState(0);
  const deal = useMemo(makeDeal, [dealKey]);
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
  const [challengeId, setChallengeId] = useState(() => crypto.randomUUID());

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
      if (!response.ok) { setMessage(data.error || "Your Solitaire quota is unavailable."); return false; }
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

  const moveToTableau = (column: number) => {
    if (!selected || busy) return;
    const sourceCards = selected.kind === "waste" ? [waste[waste.length - 1]] : piles[selected.index].slice(selected.cardIndex);
    if (!sourceCards.length || selected.kind === "tableau" && selected.index === column) { setSelected(null); return; }
    const targetPile = piles[column];
    if (!canTableau(sourceCards[0], targetPile[targetPile.length - 1])) return;
    void commitMove(() => {
      const nextPiles = piles.map(pile => [...pile]);
      const nextWaste = [...waste];
      if (selected.kind === "waste") nextWaste.pop();
      else {
        nextPiles[selected.index] = nextPiles[selected.index].slice(0, selected.cardIndex);
        const oldTop = nextPiles[selected.index].length - 1;
        if (oldTop >= 0 && !nextPiles[selected.index][oldTop].faceUp) nextPiles[selected.index][oldTop] = { ...nextPiles[selected.index][oldTop], faceUp: true };
      }
      nextPiles[column] = [...nextPiles[column], ...sourceCards];
      setPiles(nextPiles); setWaste(nextWaste); setSelected(null);
    });
  };

  const moveToFoundation = (foundationIndex: number) => {
    if (!selected || busy) return;
    const sourceCards = selected.kind === "waste" ? [waste[waste.length - 1]] : piles[selected.index].slice(selected.cardIndex);
    if (sourceCards.length !== 1) return;
    const card = sourceCards[0], foundation = foundations[foundationIndex];
    if (!canFoundation(card, foundation[foundation.length - 1])) return;
    void commitMove(() => {
      const nextFoundations = foundations.map(stack => [...stack]);
      nextFoundations[foundationIndex].push(card);
      setFoundations(nextFoundations);
      if (selected.kind === "waste") setWaste(current => current.slice(0, -1));
      else {
        const nextPiles = piles.map(pile => [...pile]);
        nextPiles[selected.index] = nextPiles[selected.index].slice(0, selected.cardIndex);
        const top = nextPiles[selected.index].length - 1;
        if (top >= 0 && !nextPiles[selected.index][top].faceUp) nextPiles[selected.index][top] = { ...nextPiles[selected.index][top], faceUp: true };
        setPiles(nextPiles);
      }
      setSelected(null);
    });
  };

  const newGame = () => {
    const next = makeDeal();
    setStock(next.stock); setWaste([]); setPiles(next.piles); setFoundations(next.foundations);
    setSelected(null); moveCountRef.current = 0; setMoves(0); setMessage(""); setChallengeId(crypto.randomUUID()); setDealKey(value => value + 1);
  };
  const renderCard = (card: Card, active: boolean, onClick: () => void, stack = false) => (
    <button key={card.id} type="button" onClick={onClick} aria-label={card.faceUp ? label(card.rank) + " of " + card.suit : "Face-down card"}
      className={`relative flex h-[clamp(4.6rem,17vw,7.1rem)] w-[clamp(3.15rem,12vw,5.05rem)] shrink-0 items-start justify-start rounded-lg border text-left shadow-md ${card.faceUp ? "border-slate-300 bg-white" : "border-emerald-200 bg-gradient-to-br from-emerald-700 to-green-950"} ${active ? "ring-4 ring-amber-400 -translate-y-1" : ""} ${card.faceUp && RED.has(card.suit) ? "text-rose-600" : "text-slate-900"}`}
      style={stack ? { marginTop: "-4.35rem" } : undefined}>
      {card.faceUp ? <span className="p-1.5 text-sm font-black leading-4">{label(card.rank)}<br/><span className="text-lg">{card.suit}</span></span> : <span className="m-1.5 flex h-[calc(100%-12px)] w-[calc(100%-12px)] items-center justify-center rounded border border-white/40 text-xl text-white">✦</span>}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-5xl rounded-2xl bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-950 p-2 text-white shadow-inner sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/20 px-3 py-2">
        <div><h3 className="text-lg font-black">♠ Klondike Solitaire</h3><p className="text-[11px] text-emerald-100">Draw 1 · Tap a card, then tap its destination</p></div>
        <button type="button" onClick={newGame} className="rounded-full border border-white/40 bg-white/15 px-4 py-2 text-xs font-black">New game ↻</button>
      </div>
      <div className="mb-5 grid grid-cols-7 gap-1.5 sm:gap-3">
        <button type="button" onClick={draw} disabled={busy} aria-label="Draw from stock" className="flex h-[clamp(4.6rem,17vw,7.1rem)] items-center justify-center rounded-lg border-2 border-dashed border-white/50 bg-emerald-950/50 text-3xl">{stock.length ? "▧" : "↻"}</button>
        <div className="relative">{waste.length ? renderCard(waste[waste.length - 1], selected?.kind === "waste", chooseWaste) : <div className="flex h-[clamp(4.6rem,17vw,7.1rem)] items-center justify-center rounded-lg border-2 border-dashed border-white/30 text-xs text-white/60">Waste</div>}</div>
        <div className="col-span-1" />
        {foundations.map((stack, index) => <button key={index} type="button" onClick={() => moveToFoundation(index)} className="flex h-[clamp(4.6rem,17vw,7.1rem)] items-center justify-center rounded-lg border-2 border-dashed border-white/40 bg-emerald-950/30 text-2xl text-white/70">{stack.length ? <span className={RED.has(stack[stack.length-1].suit) ? "text-rose-300" : "text-white"}>{label(stack[stack.length-1].rank)}{stack[stack.length-1].suit}</span> : "A"}</button>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
        {piles.map((pile, column) => <div key={column} onClick={() => moveToTableau(column)} className="flex min-h-36 flex-col items-center rounded-lg bg-black/10 pb-2 pt-1">
          {pile.length ? pile.map((card, index) => renderCard(card, selected?.kind === "tableau" && selected.index === column && index >= selected.cardIndex, () => card.faceUp ? chooseTableau(column, index) : undefined, index > 0)) : <button type="button" onClick={() => moveToTableau(column)} className="flex h-[clamp(4.6rem,17vw,7.1rem)] w-[clamp(3.15rem,12vw,5.05rem)] items-center justify-center rounded-lg border-2 border-dashed border-white/30 text-2xl">K</button>}
        </div>)}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-emerald-100"><span>Moves: {moves}</span><span>{busy ? "Saving first move…" : message || "Build each suit from Ace to King."}</span></div>
    </div>
  );
}
