"use client";

import { useCallback, useEffect, useState } from "react";
import AuthModal from "@/components/AuthModal";

export default function HeaderAuthButtons() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [deviceRegistered, setDeviceRegistered] = useState(false);

  useEffect(() => {
    try { setDeviceRegistered(localStorage.getItem("so-admin-device-shortcut") === "registered"); } catch {}
  }, []);
  const close = useCallback(() => setOpen(false), []);

  const show = (nextMode: "signin" | "signup") => {
    setMode(nextMode);
    setOpen(true);
  };

  return (
    <>
      <div className="ml-auto flex flex-shrink-0 items-center gap-2">
        {deviceRegistered && (
          <button
            type="button"
            aria-label="Admin sign-in shortcut"
            title="Admin sign-in"
            onClick={() => show("signin")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-300 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-blue-600 text-lg font-black text-yellow-200 shadow-md ring-2 ring-purple-200 hover:scale-105"
          >
            A
          </button>
        )}
        <button
          type="button"
          onClick={() => show("signin")}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:px-4 sm:text-sm"
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => show("signup")}
          className="inline-flex min-w-[128px] flex-col items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-center text-xs font-semibold leading-tight text-white shadow-sm transition-colors hover:bg-blue-700 sm:min-w-[150px] sm:px-4 sm:text-sm"
        >
          <span>New user?</span>
          <span>Create account now</span>
        </button>
      </div>
      <AuthModal open={open} initialMode={mode} onClose={close} />
    </>
  );
}
