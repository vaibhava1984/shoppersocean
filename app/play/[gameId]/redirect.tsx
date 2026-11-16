"use client";
import { useEffect } from "react";
export default function GameShareRedirect({ gameId, title }: { gameId: string; title: string }) {
  useEffect(() => { window.location.replace("/?game=" + encodeURIComponent(gameId)); }, [gameId]);
  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-900 px-5 text-center text-white"><div><div className="text-5xl">🎮</div><h1 className="mt-4 text-2xl font-black">{title}</h1><p className="mt-2 text-sm text-blue-100">Opening your game on Shoppers Ocean…</p><a className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 font-bold text-blue-900" href={"/?game=" + encodeURIComponent(gameId)}>Open game</a></div></main>;
}