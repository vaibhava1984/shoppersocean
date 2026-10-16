"use client";

import Link from "next/link";

type HeaderAccountMenuProps = {
  fullName?: string | null;
  email?: string | null;
  isAdmin: boolean;
  isAuthor: boolean;
};

const accountButtonClass =
  "inline-flex shrink-0 items-center justify-center rounded-md bg-blue-600 px-2 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:px-4 sm:text-sm";

export default function HeaderAccountMenu({
  fullName,
  email,
}: HeaderAccountMenuProps) {
  async function signOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/";
    }
  }

  return (
    <div className="ml-auto flex min-w-0 items-center justify-end gap-1.5 sm:gap-2">
      <span
        title={fullName ?? email ?? "User"}
        className="min-w-0 max-w-[78px] truncate text-xs font-semibold text-slate-700 sm:max-w-[220px] sm:text-sm"
      >
        Hi {fullName ?? email}
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
