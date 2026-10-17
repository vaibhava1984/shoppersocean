"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, LayoutDashboard, ShoppingCart, Home, BookOpen, PenTool, Users, MessageSquare, UserCheck, ExternalLink } from "lucide-react";
import Dashboard from "@/components/adminPage/Dashboard";

const sections = [
  { label: "Dashboard", path: "", icon: LayoutDashboard, dashboard: true },
  { label: "Orders", path: "orders", icon: ShoppingCart },
  { label: "Home Section", path: "home_section", icon: Home },
  { label: "Books", path: "books", icon: BookOpen },
  { label: "Authors", path: "authors", icon: PenTool },
  { label: "Users", path: "users", icon: Users },
  { label: "Review Section", path: "review_section", icon: MessageSquare },
  { label: "Authors Approvals", path: "authors_approvals", icon: UserCheck },
] as const;

export default function AdminAccordion() {
  const [open, setOpen] = useState<string | null>(null);
  const frameRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "admin-section-saved") setOpen(null);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function prepareFrame(key: string) {
    const frame = frameRefs.current[key];
    if (!frame) return;
    try {
      const doc = frame.contentDocument;
      const win = frame.contentWindow;
      if (!doc || !win) return;
      if (!doc.getElementById("admin-accordion-frame-style")) {
        const style = doc.createElement("style");
        style.id = "admin-accordion-frame-style";
        style.textContent = `
          html,body { min-height:0!important; height:auto!important; background:#fff!important; }
          body > div > .h-screen, body .h-screen { height:auto!important; min-height:0!important; }
          aside { display:none!important; }
          main { padding:12px!important; width:100%!important; min-width:0!important; overflow:visible!important; }
          body .flex.h-screen { display:block!important; }
          table { min-width:640px; }
          .overflow-x-auto { max-width:100%; overflow-x:auto; }
        `;
        doc.head.appendChild(style);
      }
      const resize = () => {
        const height = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, 320);
        frame.style.height = Math.min(height + 24, 2400) + "px";
      };
      resize();
      if (!(frame as any).__resizeObserver) {
        const observer = new win.ResizeObserver(resize);
        observer.observe(doc.body);
        (frame as any).__resizeObserver = observer;
      }
      if (!(frame as any).__saveHandler) {
        let savePending = false;
        const originalFetch = win.fetch.bind(win);
        win.fetch = (async (...args: Parameters<typeof fetch>) => {
          const response = await originalFetch(...args);
          if (savePending) {
            savePending = false;
            if (response.ok) win.parent.postMessage({ type: "admin-section-saved", key }, win.location.origin);
          }
          return response;
        }) as typeof fetch;
        doc.addEventListener("click", (event) => {
          const target = event.target as HTMLElement | null;
          const button = target?.closest("button, input[type=submit]");
          const label = (button?.textContent || (button as HTMLInputElement | null)?.value || "").trim();
          if (/save|update changes|save changes|save and add/i.test(label)) savePending = true;
        }, true);
        (frame as any).__saveHandler = true;
      }
    } catch {
      // Keep the existing admin page usable if frame styling cannot be applied.
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <header className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Shoppers Ocean</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-600">Choose a section to open its controls below.</p>
      </header>
      {sections.map(({ label, path, icon: Icon, ...rest }) => {
        const isOpen = open === label;
        return (
          <section key={label} className="overflow-hidden rounded-xl bg-white shadow-sm">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : label)}
              className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-blue-600 px-4 py-3 text-left text-base font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:px-5"
            >
              <span className="flex min-w-0 items-center gap-3"><Icon className="h-5 w-5 shrink-0" /><span>{label}</span></span>
              {isOpen ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 p-2 sm:p-4">
                {"dashboard" in rest && rest.dashboard ? (
                  <Dashboard />
                ) : (
                  <iframe
                    ref={(node) => { frameRefs.current[label] = node; }}
                    title={label}
                    src={"/admin_panel/" + path}
                    onLoad={() => prepareFrame(label)}
                    className="block w-full border-0 bg-white"
                    style={{ minHeight: 360 }}
                  />
                )}
                <div className="mt-3 flex justify-end">
                  <button type="button" onClick={() => setOpen(null)} className="min-h-11 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">Close section</button>
                </div>
              </div>
            )}
          </section>
        );
      })}
      <a href="/" className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"><ExternalLink className="h-4 w-4" /> Back to Homepage</a>
    </div>
  );
}
