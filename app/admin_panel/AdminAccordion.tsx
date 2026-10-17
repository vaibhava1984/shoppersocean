"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, LayoutDashboard, ShoppingCart, Home, BookOpen, PenTool, Users, MessageSquare, UserCheck, ExternalLink, Save } from "lucide-react";
import Dashboard from "../components/adminPage/Dashboard";

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
          input, textarea, select { max-width:100%; }
          button, [role="button"] { touch-action:manipulation; }
        `;
        doc.head.appendChild(style);
      }
      const resize = () => {
        const height = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, 320);
        frame.style.height = Math.min(height + 24, 5000) + "px";
      };
      resize();
      if (!(frame as any).__resizeObserver) {
        const observer = new win.ResizeObserver(resize);
        observer.observe(doc.body);
        (frame as any).__resizeObserver = observer;
      }

      // Do not collapse the Books section on the first successful request:
      // creating a book can be followed by a separate, potentially large PDF upload.
      // Wait until all save/upload-related requests have finished before closing.
      if (!(frame as any).__saveHandler) {
        let savePending = false;
        let closeTimer: number | undefined;
        const originalFetch = win.fetch.bind(win);
        win.fetch = (async (...args: Parameters<typeof fetch>) => {
          if (savePending && closeTimer !== undefined) {
            win.clearTimeout(closeTimer);
            closeTimer = undefined;
          }
          const response = await originalFetch(...args);
          if (savePending && response.ok) {
            if (closeTimer !== undefined) win.clearTimeout(closeTimer);
            closeTimer = win.setTimeout(() => {
              savePending = false;
              closeTimer = undefined;
              win.parent.postMessage({ type: "admin-section-saved", key }, win.location.origin);
            }, 1500);
          }
          return response;
        }) as typeof fetch;
        doc.addEventListener("click", (event) => {
          const target = event.target as HTMLElement | null;
          const button = target?.closest("button, input[type=submit]");
          const label = (button?.textContent || (button as HTMLInputElement | null)?.value || "").trim();
          if (/^save$|save changes|update changes|save and add|update book|add book/i.test(label)) {
            if (closeTimer !== undefined) win.clearTimeout(closeTimer);
            closeTimer = undefined;
            savePending = true;
          }
        }, true);
        (frame as any).__saveHandler = true;
      }
    } catch {
      // Keep the existing admin page usable if frame styling cannot be applied.
    }
  }

  function saveAndClose(key: string) {
    const frame = frameRefs.current[key];
    try {
      const doc = frame?.contentDocument;
      if (!doc) return;
      const candidates = Array.from(doc.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
        'button, input[type="submit"], input[type="button"]'
      ));
      const saveButton = candidates.find((button) => {
        if ((button as HTMLButtonElement).disabled) return false;
        const label = ((button as HTMLButtonElement).innerText || (button as HTMLInputElement).value || "").trim();
        return /^save$|save changes|update changes|save and add|update book/i.test(label);
      });
      if (saveButton) {
        saveButton.click();
        return;
      }
      // Some sections save immediately as actions are performed; close only when
      // there is no pending form to submit.
      const form = doc.querySelector("form");
      if (!form) setOpen(null);
      else form.scrollIntoView({ behavior: "smooth", block: "end" });
    } catch {
      // If a section cannot be accessed, leave it open rather than losing work.
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <header className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
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
                <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                  <button type="button" onClick={() => setOpen(null)} className="min-h-11 rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close section</button>
                  <button type="button" onClick={() => saveAndClose(label)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><Save className="h-4 w-4" /> Save</button>
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
