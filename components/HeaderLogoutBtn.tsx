"use client";

export default function HeaderLogoutBtn() {
  const handleLogout = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/";
  };

  return <button type="button" onClick={handleLogout} className="w-full text-left">Logout</button>;
}
