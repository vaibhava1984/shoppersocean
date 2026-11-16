"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function FloatingSubscribeButton() {
  const pathname = usePathname();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);

  const refreshSubscription = useCallback(async () => {
    try {
      const response = await fetch("/api/game-access", { method: "GET", cache: "no-store", credentials: "same-origin" });
      if (response.ok) {
        const data = await response.json();
        setIsSubscribed(data.isSubscribed === true);
      } else {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error("Subscription visibility check failed:", error);
      setIsSubscribed(false);
    } finally {
      setSubscriptionChecked(true);
    }
  }, []);

  useEffect(() => {
    setSubscriptionChecked(false);
    void refreshSubscription();
    const refreshOnFocus = () => { if (document.visibilityState === "visible") void refreshSubscription(); };
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [refreshSubscription, pathname]);

  useEffect(() => {
    const handleGameVisibility = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail;
      setGameOpen(detail?.open === true);
    };
    window.addEventListener("shoppers-ocean:game-visibility", handleGameVisibility);
    return () => window.removeEventListener("shoppers-ocean:game-visibility", handleGameVisibility);
  }, []);

  const isSubscriptionPage = pathname === "/subscribe-now" || pathname === "/subscribe" || pathname.startsWith("/subscribe-now/");
  if (!subscriptionChecked || isSubscribed || isSubscriptionPage || gameOpen) return null;

  return (
    <Link
      href="/subscribe-now"
      aria-label="Subscribe Now"
      style={{ animation: "subscribeFloat 2.2s ease-in-out infinite" }}
      className="fixed bottom-5 right-3 z-[90] inline-flex min-h-8 items-center gap-1 rounded-full border border-amber-200 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 px-2.5 py-1.5 text-[10px] font-extrabold leading-none text-slate-950 shadow-[0_4px_14px_rgba(15,23,42,0.24)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 sm:bottom-6 sm:right-5 sm:min-h-9 sm:px-3 sm:text-xs"
    >
      <Crown className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
      <span>Subscribe Now</span>
    </Link>
  );
}
