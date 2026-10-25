"use client";

import Link from "next/link";

type HeaderAccountMenuProps = {
  fullName?: string | null;
  email?: string | null;
  isAdmin: boolean;
  isAuthor: boolean;
};

const accountButtonClass =
  "inline-flex shrink-0 items-center justify-center rounded-md bg-blue-600 px-2 py-2 text-[10px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:px-4 sm:text-sm";

export default function HeaderAccountMenu({
  fullName,
  email,
}: HeaderAccountMenuProps) {
  async function signOut() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });
    } finally {
      try { localStorage.removeItem("shoppers-ocean-last-activity"); } catch {}
      window.location.replace("/");
    }
  }

  const firstName = fullName?.trim().split(/\s+/)[0];

  return (
    <div className="ml-auto flex min-w-0 items-center justify-end gap-2 sm:gap-3">
      <span
        title={fullName ?? email ?? "User"}
        className="mr-1 min-w-0 max-w-[92px] truncate font-serif text-sm font-bold tracking-tight text-slate-950 sm:mr-2 sm:max-w-[240px] sm:text-lg"
      >
        Hi {firstName || email}
      </span>
      <Link href="/settings" className={accountButtonClass}>
        Account Settings
      </Link>
      <button type="button" onClick={signOut} className={accountButtonClass}>
        Sign Out
      </button>
    </div>
  );
}
