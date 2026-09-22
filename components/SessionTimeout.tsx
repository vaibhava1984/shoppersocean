"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

const IDLE_LIMIT_MS = 15 * 60 * 1000;
const ACTIVITY_KEY = "shoppers-ocean-last-activity";
const ACTIVITY_WRITE_INTERVAL_MS = 5 * 1000;

type ActivityRecord = {
  userId: string;
  at: number;
};

export default function SessionTimeout() {
  const supabaseRef = useRef(createClient());
  const lastActivityRef = useRef<number>(0);
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

    const setActivity = (userId: string, at = Date.now(), force = false) => {
      lastActivityRef.current = at;
      if (!force && at - lastWriteRef.current < ACTIVITY_WRITE_INTERVAL_MS) return;
      lastWriteRef.current = at;
      try {
        localStorage.setItem(ACTIVITY_KEY, JSON.stringify({ userId, at }));
      } catch {}
    };

    const clearActivity = () => {
      lastActivityRef.current = 0;
      try {
        localStorage.removeItem(ACTIVITY_KEY);
      } catch {}
    };

    const signOutForInactivity = async () => {
      clearActivity();
      await supabase.auth.signOut();
      window.location.replace("/login");
    };

    const checkTimeout = async () => {
      if (document.visibilityState !== "visible") return;

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        clearActivity();
        return;
      }

      const stored = readActivity();

      if (stored?.userId === userId) {
        lastActivityRef.current = Math.max(lastActivityRef.current, stored.at);
      } else if (!lastActivityRef.current) {
        setActivity(userId, Date.now(), true);
      }

      if (lastActivityRef.current && Date.now() - lastActivityRef.current >= IDLE_LIMIT_MS) {
        await signOutForInactivity();
      }
    };

    const recordActivity = () => {
      if (document.visibilityState !== "visible") return;
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) setActivity(session.user.id);
      });
    };

    const handleAuthChange = (_event: string, session: any) => {
      const userId = session?.user?.id;
      if (userId) {
        setActivity(userId, Date.now(), true);
      } else {
        clearActivity();
      }
    };

    const activityEvents = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"];
    activityEvents.forEach((event) =>
      window.addEventListener(event, recordActivity, { passive: true })
    );

    document.addEventListener("visibilitychange", checkTimeout);
    window.addEventListener("focus", checkTimeout);
    window.addEventListener("storage", checkTimeout);

    const { data: authSubscription } = supabase.auth.onAuthStateChange(handleAuthChange);
    void checkTimeout();

    const interval = window.setInterval(checkTimeout, 5 * 1000);

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
