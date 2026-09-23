"use client"

import { useClerk } from "@clerk/nextjs"

export default function ClerkHeaderLogoutBtn() {
  const { signOut } = useClerk()

  return (
    <button type="button" onClick={() => signOut({ redirectUrl: "/" })}>
      Logout
    </button>
  )
}
