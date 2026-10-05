"use client";

import { useEffect, useRef } from "react";

const IDLE_LIMIT_MS = 15 * 60 * 1000;
const ACTIVITY_KEY = "shoppers-ocean-last-activity";
const ACTIVITY_WRITE_INTERVAL_MS = 30 * 1000;

type ActivityRecord = { userId: string; at: number };

export default function SessionTimeout() {
  const lastWriteRef = useRef(0);

  useEffect(() => {
    const readActivity = (): ActivityRecord | null => {
      try {
        const raw = localStorage.getItem(ACTIVITY_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.userId || typeof parsed.at !== "number") return null;
        return parsed as ActivityRecord;
      } catch { return null; }
    };

    const writeActivity = (userId: string, force = false) => {
      const now = Date.now();
      if (!force && now - lastWriteRef.current < ACTIVITY_WRITE_INTERVAL_MS) return;
      lastWriteRef.current = now;
      try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify({ userId, at: now })); } catch {}
    };

    const checkTimeout = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
        const data = await response.json();
        const userId = data?.user?.id;
        if (!userId) return;

        const activity = readActivity();
        if (!activity || activity.userId !== userId) {
          writeActivity(userId, true);
          return;
        }

        if (Date.now() - activity.at >= IDLE_LIMIT_MS) {
          try { localStorage.removeItem(ACTIVITY_KEY); } catch {}
          await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin", cache: "no-store" });
          window.location.href = "/sign-in?authError=session_expired";
        } else {
          writeActivity(userId);
        }
      } catch {}
    };

    const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    const recordActivity = () => {
      void checkTimeout();
    };
    activityEvents.forEach(event => window.addEventListener(event, recordActivity, { passive: true }));
    const timer = window.setInterval(() => { void checkTimeout(); }, 60 * 1000);
    void checkTimeout();

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, recordActivity));
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
