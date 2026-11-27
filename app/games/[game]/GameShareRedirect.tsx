"use client";

import { useEffect } from "react";

export default function GameShareRedirect({ gameId, title }: { gameId: string; title: string }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.replace(`/classic-games?game=${encodeURIComponent(gameId)}`);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [gameId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-5 text-white">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-4 text-center shadow-2xl backdrop-blur">
        <img src={`/api/game-share-image/${encodeURIComponent(gameId)}?v=4`} alt={`${title} game preview`} className="aspect-[1200/630] w-full rounded-2xl object-cover" />
        <h1 className="mt-4 text-2xl font-black">{title}</h1>
        <p className="mt-2 text-sm text-white/75">Opening your game on Shoppers Ocean…</p>
        <a href={`/classic-games?game=${encodeURIComponent(gameId)}`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-cyan-300 px-6 py-2 font-black text-slate-950">Play now</a>
      </div>
    </main>
  );
}
