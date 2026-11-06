"use client";

import { useEffect, useState } from "react";

export default function MysteryMansion({ userId, initialGameId, onExit }: { userId: string | null; initialGameId?: string; onExit?: () => void }) {
  const [quota, setQuota] = useState<number | null>(null);
  const [daily, setDaily] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetch("/api/game-access", { cache: "no-store" })
      .then(response => response.json())
      .then(data => {
        if (!live) return;
        const privileged = Boolean(data.isAdmin || data.isSubscribed);
        setDaily(privileged);
        setQuota(privileged ? Number(data.remainingByType?.["mystery-quiz"] ?? 0) : Number(data.remainingBySection?.["mystery-quiz"] ?? 0));
        setLoading(false);
      })
      .catch(() => { if (live) { setQuota(null); setLoading(false); } });
    return () => { live = false; };
  }, [userId, initialGameId]);

  return (
    <div className="mx-auto mt-5 w-full max-w-3xl rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 text-center shadow-lg sm:p-9">
      <div className="text-5xl" aria-hidden="true">🔎</div>
      <h3 className="mt-3 text-2xl font-black text-indigo-950">Mystery Quiz</h3>
      <p className="mt-2 text-sm font-semibold text-slate-700">The question bank has not been added yet.</p>
      <p className="mt-4 inline-flex rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-black text-indigo-900">
        {loading ? "Checking quota…" : quota === null ? "Quota unavailable" : daily ? quota + " / 3 questions left today" : quota + " / 1 free attempt left"}
      </p>
      {onExit && <button type="button" onClick={onExit} className="mt-6 block mx-auto rounded-full bg-gradient-to-r from-violet-600 to-indigo-700 px-6 py-3 text-sm font-black text-white shadow">← Back to Quiz World</button>}
    </div>
  );
}
