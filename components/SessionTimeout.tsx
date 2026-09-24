"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

const IDLE_LIMIT_MS = 15 * 60 * 1000;
const ACTIVITY_KEY = "shoppers-ocean-last-activity";
const ACTIVITY_WRITE_INTERVAL_MS = 30 * 1000;

type ActivityRecord = { userId: string; at: number };

export default function SessionTimeout() {
  const { userId, isSignedIn, signOut } = useAuth();
  const lastWriteRef = useRef(0);

  useEffect(() => {
    const readActivity = (): ActivityRecord | null => {
      try {
        const parsed = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "null");
        return parsed?.userId && typeof parsed.at === "number" ? parsed : null;
      } catch { return null; }
    };
    const writeActivity = (id: string, force = false) => {
      const now = Date.now();
      if (!force && now - lastWriteRef.current < ACTIVITY_WRITE_INTERVAL_MS) return;
      lastWriteRef.current = now;
      try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify({ userId: id, at: now })); } catch {}
    };
    const checkTimeout = async () => {
      if (!isSignedIn || !userId || document.visibilityState !== "visible") return;
      const activity = readActivity();
      if (!activity || activity.userId !== userId) { writeActivity(userId, true); return; }
      if (Date.now() - activity.at >= IDLE_LIMIT_MS) {
        try { localStorage.removeItem(ACTIVITY_KEY); } catch {}
        await signOut({ redirectUrl: "/sign-in" });
      }
    };
    const recordActivity = () => {
      if (isSignedIn && userId && document.visibilityState === "visible") writeActivity(userId);
    };
    const events = ["pointerdown","keydown","scroll","touchstart","mousemove"];
    events.forEach(e => window.addEventListener(e, recordActivity, { passive: true }));
    document.addEventListener("visibilitychange", checkTimeout);
    window.addEventListener("focus", checkTimeout);
    window.addEventListener("storage", checkTimeout);
    void checkTimeout();
    const interval = window.setInterval(checkTimeout, 30000);
    return () => {
      events.forEach(e => window.removeEventListener(e, recordActivity));
      document.removeEventListener("visibilitychange", checkTimeout);
      window.removeEventListener("focus", checkTimeout);
      window.removeEventListener("storage", checkTimeout);
      window.clearInterval(interval);
    };
  }, [isSignedIn, userId, signOut]);
  return null;
}
