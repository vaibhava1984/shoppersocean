"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

const IDLE_LIMIT_MS = 15 * 60 * 1000;
const ACTIVITY_KEY = "shoppers-ocean-last-activity";
const ACTIVITY_WRITE_INTERVAL_MS = 30 * 1000;

export default function SessionTimeout() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const lastWriteRef = useRef(0);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const userId = user.id;

    const readActivity = () => {
      try {
        const raw = localStorage.getItem(ACTIVITY_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed?.userId === userId && typeof parsed.at === "number" ? parsed : null;
      } catch { return null; }
    };

    const writeActivity = (force = false) => {
      const now = Date.now();
      if (!force && now - lastWriteRef.current < ACTIVITY_WRITE_INTERVAL_MS) return;
      lastWriteRef.current = now;
      try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify({ userId, at: now })); } catch {}
    };

    const checkTimeout = async () => {
      if (document.visibilityState !== "visible") return;
      const activity = readActivity();
      if (!activity) { writeActivity(true); return; }
      if (Date.now() - activity.at >= IDLE_LIMIT_MS) {
        try { localStorage.removeItem(ACTIVITY_KEY); } catch {}
        await signOut({ redirectUrl: "/sign-in" });
      }
    };

    const recordActivity = () => { if (document.visibilityState === "visible") writeActivity(); };
    const events = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach(e => window.addEventListener(e, recordActivity, { passive: true }));
    document.addEventListener("visibilitychange", checkTimeout);
    window.addEventListener("focus", checkTimeout);
    void checkTimeout();
    const interval = window.setInterval(checkTimeout, 30 * 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, recordActivity));
      document.removeEventListener("visibilitychange", checkTimeout);
      window.removeEventListener("focus", checkTimeout);
      window.clearInterval(interval);
    };
  }, [isLoaded, user?.id, signOut]);

  return null;
}