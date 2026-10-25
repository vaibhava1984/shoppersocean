"use client";

export default function HeaderLogoutBtn() {
  return (
    <button
      type="button"
      onClick={async () => {
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
      }}
      className="w-full text-left"
    >
      Logout
    </button>
  );
}
