"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/utils/db/client";

const IDLE_LIMIT_MS = 15 * 60 * 1000;
const ACTIVITY_KEY = "shoppers-ocean-last-activity";
const ACTIVITY_WRITE_INTERVAL_MS = 30 * 1000;

type ActivityRecord = {
  userId: string;
  at: number;
};

export default function SessionTimeout() {
  const supabaseRef = useRef(createClient());
  const lastWriteRef = useRef(0);

  useEffect(() => {
    const supabase = supabaseRef.current;

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

    const checkTimeout = async () => {
      if (document.visibilityState !== "visible") return;
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return;

      const activity = readActivity();

      // A different signed-in user gets a fresh inactivity window.
      if (!activity || activity.userId !== userId) {
        writeActivity(userId, true);
        return;
      }

      if (Date.now() - activity.at >= IDLE_LIMIT_MS) {
        try { localStorage.removeItem(ACTIVITY_KEY); } catch {}
        await supabase.auth.signOut();
        window.location.replace("/login");
      }
    };

    const recordActivity = () => {
      if (document.visibilityState !== "visible") return;
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) writeActivity(session.user.id);
      });
    };

    const handleAuthChange = (_event: string, session: any) => {
      const userId = session?.user?.id;
      if (userId) {
        writeActivity(userId, true);
      } else {
        try { localStorage.removeItem(ACTIVITY_KEY); } catch {}
      }
    };

    const activityEvents = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"];
    activityEvents.forEach((event) => window.addEventListener(event, recordActivity, { passive: true }));
    document.addEventListener("visibilitychange", checkTimeout);
    window.addEventListener("focus", checkTimeout);
    window.addEventListener("storage", checkTimeout);

    const { data: authSubscription } = supabase.auth.onAuthStateChange(handleAuthChange);
    void checkTimeout();
    const interval = window.setInterval(checkTimeout, 30 * 1000);

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, recordActivity));
      document.removeEventListener("visibilitychange", checkTimeout);
      window.removeEventListener("focus", checkTimeout);
      window.removeEventListener("storage", checkTimeout);
      window.clearInterval(interval);
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  return null;
}
