"use client";

import { useClerk } from "@clerk/nextjs";

export default function HeaderLogoutBtn() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/" })}
      className="w-full text-left"
    >
      Logout
    </button>
  );
}
