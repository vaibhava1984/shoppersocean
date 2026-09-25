"use client"
import { getAuth, signOut } from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";

export default function HeaderLogoutBtn() {
  return (
    <button className="" onClick={async () => {
      try { await signOut(getAuth(getFirebaseApp())); } catch {}
      try { await fetch("/api/auth/session", { method: "DELETE" }); } catch {}
      window.location.href = "/";
    }}>
      Logout
    </button>
  )
}
