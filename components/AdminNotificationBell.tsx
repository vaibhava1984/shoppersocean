"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2, X } from "lucide-react";

type Notification = { id: string; type: string; title: string; message: string; details?: string; created_at: string; read_at: string | null };

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const response = await fetch("/api/admin-notifications", { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setItems(Array.isArray(data.notifications) ? data.notifications : []);
      setError("");
    } catch { /* leave the header usable */ }
  }
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(timer);
  }, []);

  async function markRead(id: string) {
    try {
      await fetch("/api/admin-notifications", { method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markRead: id }) });
      setItems(current => current.map(item => item.id === id ? { ...item, read_at: item.read_at || new Date().toISOString() } : item));
    } catch { /* next refresh will reconcile */ }
  }
  async function markAllRead() {
    try {
      const response = await fetch("/api/admin-notifications", { method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAllRead: true }) });
      if (!response.ok) throw new Error();
      const now = new Date().toISOString();
      setItems(current => current.map(item => ({ ...item, read_at: item.read_at || now })));
    } catch { setError("Could not mark notifications as read. Please try again."); }
  }
  async function openNotification(item: Notification) {
    await markRead(item.id);
    setOpen(false);
    if (item.type === "book_review") {
      try {
        const details = typeof item.details === "string" ? JSON.parse(item.details) : item.details || {};
        if (details.bookId) {
          const target = details.commentId || details.reviewId;
          window.location.href = `/book/${encodeURIComponent(details.bookId)}#${target ? "comment-" + encodeURIComponent(target) : "book-comments"}`;
          return;
        }
      } catch { /* use comments section fallback */ }
    }
    await refresh();
  }

  const unread = items.filter(item => !item.read_at).length;
  return <div className="relative flex-shrink-0">
    <button type="button" onClick={() => { const next = !open; setOpen(next); if (next) { setLoading(true); void refresh().finally(() => setLoading(false)); } }} aria-label={unread ? `Admin notifications, ${unread} unread` : "Admin notifications"} aria-expanded={open} className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
      <Bell size={21} aria-hidden="true" />{unread > 0 && <span className="absolute -right-1 -top-1 flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold leading-none text-white">{unread > 99 ? "99+" : unread}</span>}
    </button>
    {open && <>
      <button type="button" aria-label="Close notifications" className="fixed inset-0 z-[80] cursor-default" onClick={() => setOpen(false)} />
      <section role="dialog" aria-label="Admin notifications" className="absolute right-0 top-12 z-[90] w-[min(90vw,370px)] overflow-hidden rounded-xl border border-slate-200 bg-white text-left text-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div><h2 className="font-extrabold">Notifications</h2><p className="text-xs text-slate-500">{unread} unread</p></div>
          <div className="flex items-center gap-1">{unread > 0 && <button type="button" onClick={() => void markAllRead()} aria-label="Mark all as read" title="Mark all as read" className="rounded-lg p-2 text-blue-700 hover:bg-blue-50"><CheckCheck size={18}/></button>}<button type="button" onClick={() => setOpen(false)} aria-label="Close notifications panel" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18}/></button></div>
        </div>
        {error && <p className="px-4 py-2 text-xs text-red-600">{error}</p>}
        <div className="max-h-[65vh] overflow-y-auto">
          {loading && items.length === 0 ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" size={22}/></div> : items.length === 0 ? <p className="px-4 py-10 text-center text-sm text-slate-500">No notifications yet.</p> :
            items.map(item => <button type="button" key={item.id} onClick={() => void openNotification(item)} className={`block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${item.read_at ? "bg-white" : "bg-blue-50/70"}`}>
              <span className="flex items-start gap-2"><span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${item.read_at ? "bg-slate-300" : "bg-blue-600"}`}/><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{item.title}</span><span className="mt-1 block break-words text-sm text-slate-600">{item.message}</span><time className="mt-1 block text-[11px] text-slate-400">{new Date(item.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</time></span></span>
            </button>)
          }
        </div>
        <div className="border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">Refreshes automatically every 30 seconds.</div>
      </section>
    </>}
  </div>;
}
