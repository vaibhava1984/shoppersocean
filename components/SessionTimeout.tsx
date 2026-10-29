"use client";

import { useEffect, useRef } from "react";

const IDLE_LIMIT_MS = 10 * 60 * 1000;
const ACTIVITY_KEY = "shoppers-ocean-last-activity";
const ACTIVITY_WRITE_INTERVAL_MS = 1000;
const CHECK_INTERVAL_MS = 5000;

type ActivityRecord = { userId: string; at: number };

export default function SessionTimeout() {
  const lastWriteRef = useRef(0);
  const logoutStartedRef = useRef(false);

  useEffect(() => {
    let checkInProgress = false;

    const readActivity = (): ActivityRecord | null => {
      try {
        const raw = localStorage.getItem(ACTIVITY_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.userId || typeof parsed.at !== "number") return null;
        return parsed as ActivityRecord;
      } catch {
        return null;
      }
    };

    const writeActivity = (userId: string, force = false) => {
      const now = Date.now();
      if (!force && now - lastWriteRef.current < ACTIVITY_WRITE_INTERVAL_MS) return;
      lastWriteRef.current = now;
      try {
        localStorage.setItem(ACTIVITY_KEY, JSON.stringify({ userId, at: now }));
      } catch {}
    };

    const logoutForInactivity = async () => {
      if (logoutStartedRef.current) return;
      logoutStartedRef.current = true;
      try { localStorage.removeItem(ACTIVITY_KEY); } catch {}
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        });
      } catch {
        // Still redirect to the homepage if the logout request fails.
      }
      window.location.replace("/");
    };

    const checkTimeout = async () => {
      if (checkInProgress || document.visibilityState !== "visible") return;
      checkInProgress = true;
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = await response.json();
        // Apply the same timeout to all authenticated users, including admins.
        const userId = data?.user?.id;
        if (!userId) {
          try { localStorage.removeItem(ACTIVITY_KEY); } catch {}
          return;
        }

        const activity = readActivity();
        if (!activity || activity.userId !== userId) {
          writeActivity(userId, true);
          return;
        }

        if (Date.now() - activity.at >= IDLE_LIMIT_MS) {
          await logoutForInactivity();
        }
      } catch {
        // Network failures must not reset the inactivity clock.
      } finally {
        checkInProgress = false;
      }
    };

    const recordActivity = () => {
      if (document.visibilityState !== "visible") return;
      const activity = readActivity();
      if (activity?.userId) writeActivity(activity.userId);
    };

    const activityEvents = [
      "click", "keydown", "mousemove", "scroll", "touchstart",
      "pointerdown", "input", "change"
    ] as const;
    activityEvents.forEach(event =>
      window.addEventListener(event, recordActivity, { passive: true })
    );

    const timer = window.setInterval(() => { void checkTimeout(); }, CHECK_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void checkTimeout();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    void checkTimeout();

    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, recordActivity));
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
