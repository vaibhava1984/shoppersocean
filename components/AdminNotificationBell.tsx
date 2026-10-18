"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Bell, CheckCheck, Loader2, X } from "lucide-react";

type Notification = { id: string; type: string; title: string; message: string; details?: string; created_at: string; read_at: string | null };

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [portalReady, setPortalReady] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({ left: 8, top: 64, width: "min(320px, calc(100vw - 16px))" });

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
    setPortalReady(true);
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
  function togglePanel() {
    const next = !open;
    if (next) {
      const rect = bellRef.current?.getBoundingClientRect();
      const width = Math.min(260, window.innerWidth - 16);
      const left = rect ? Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) : 8;
      const top = rect ? Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 180)) : 64;
      setPanelStyle({ position: "fixed", left, top, width, maxHeight: `min(52dvh, calc(100dvh - ${top + 16}px))` });
      setLoading(true);
      void (async () => { await refresh(); await markAllRead(); setLoading(false); })();
    }
    setOpen(next);
  }
  return <div className="relative flex-shrink-0">
    <button ref={bellRef} type="button" onClick={togglePanel} aria-label={unread ? `Admin notifications, ${unread} unread` : "Admin notifications"} aria-expanded={open} className="relative inline-flex h-10 w-10 items-center justify-center rounded-md border-0 bg-black p-0 text-amber-400 shadow-none outline-none ring-0 transition-colors hover:bg-slate-900 hover:text-yellow-300 focus:outline-none focus:ring-0">
      <Bell size={23} strokeWidth={1.8} fill="currentColor" aria-hidden="true" />{unread > 0 && <span className="absolute -right-1 -top-1 flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold leading-none text-white">{unread > 99 ? "99+" : unread}</span>}
    </button>
    {open && portalReady && createPortal(<>
      <button type="button" aria-label="Close notifications" className="fixed inset-0 z-[9998] cursor-default bg-transparent" onClick={() => setOpen(false)} />
      <section role="dialog" aria-label="Admin notifications" style={{ ...panelStyle, zIndex: 9999, maxHeight: `min(52dvh, calc(100dvh - ${Number(panelStyle.top || 64) + 16}px))` }} className="fixed flex flex-col overflow-hidden rounded-lg border border-slate-300 bg-white text-left text-slate-900 shadow-md">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 px-2.5 py-1.5">
          <div><h2 className="text-[13px] font-extrabold">Notifications</h2><p className="text-[11px] text-slate-500">{unread} unread</p></div>
          <div className="flex items-center gap-1">{unread > 0 && <button type="button" onClick={() => void markAllRead()} aria-label="Mark all as read" title="Mark all as read" className="rounded-md p-1.5 text-blue-700 hover:bg-blue-50"><CheckCheck size={16}/></button>}<button type="button" onClick={() => setOpen(false)} aria-label="Close notifications panel" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><X size={16}/></button></div>
        </div>
        {error && <p className="flex-shrink-0 px-3 py-1.5 text-xs text-red-600">{error}</p>}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {loading && items.length === 0 ? <div className="flex justify-center p-5"><Loader2 className="animate-spin text-blue-600" size={20}/></div> : items.length === 0 ? <p className="px-3 py-5 text-center text-xs text-slate-500">No notifications yet.</p> :
            items.map(item => <button type="button" key={item.id} onClick={() => void openNotification(item)} className={`block w-full border-b border-slate-100 px-2.5 py-1.5 text-left hover:bg-slate-50 ${item.read_at ? "bg-white" : "bg-blue-50/70"}`}>
              <span className="flex items-start gap-1.5"><span className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${item.read_at ? "bg-slate-300" : "bg-blue-600"}`}/><span className="min-w-0 flex-1"><span className="block break-words text-xs font-bold leading-snug">{item.title.replace(/review/gi, "comment")}</span><span className="mt-0.5 block break-words text-[11px] leading-snug text-slate-600">{item.message.replace(/reviews?/gi, match => match.toLowerCase().endsWith("s") ? "comments" : "comment")}</span><time className="mt-0.5 block text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</time></span></span>
            </button>)
          }
        </div>
        <div className="flex-shrink-0 border-t border-slate-100 px-2.5 py-1 text-[9px] text-slate-400">Refreshes automatically every 30 seconds.</div>
      </section>
    </>, document.body)}
  </div>;
}
