"use client";

import { useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";

const IDLE_LIMIT_MS = 15 * 60 * 1000;
const ACTIVITY_KEY = "shoppers-ocean-last-activity";
const ACTIVITY_WRITE_INTERVAL_MS = 30 * 1000;

type ActivityRecord = { userId: string; at: number };

export default function SessionTimeout() {
  const authRef = useRef(getAuth(getFirebaseApp()));
  const lastWriteRef = useRef(0);

  useEffect(() => {
    const auth = authRef.current;
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
      const user = auth.currentUser;
      if (!user) return;
      const activity = readActivity();
      if (!activity || activity.userId !== user.uid) { writeActivity(user.uid, true); return; }
      if (Date.now() - activity.at >= IDLE_LIMIT_MS) {
        try { localStorage.removeItem(ACTIVITY_KEY); } catch {}
        try { await signOut(auth); } catch {}
        try { await fetch("/api/auth/session", { method: "DELETE" }); } catch {}
        window.location.replace("/login");
      }
    };
    const recordActivity = () => {
      if (document.visibilityState !== "visible") return;
      const user = auth.currentUser;
      if (user) writeActivity(user.uid);
    };
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) writeActivity(user.uid, true);
      else { try { localStorage.removeItem(ACTIVITY_KEY); } catch {} }
    });
    const activityEvents = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"];
    activityEvents.forEach(event => window.addEventListener(event, recordActivity, { passive: true }));
    document.addEventListener("visibilitychange", checkTimeout);
    window.addEventListener("focus", checkTimeout);
    window.addEventListener("storage", checkTimeout);
    void checkTimeout();
    const interval = window.setInterval(checkTimeout, 30 * 1000);
    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, recordActivity));
      document.removeEventListener("visibilitychange", checkTimeout);
      window.removeEventListener("focus", checkTimeout);
      window.removeEventListener("storage", checkTimeout);
      window.clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return null;
}
