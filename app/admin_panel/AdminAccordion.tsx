"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, LayoutDashboard, ShoppingCart, Home, BookOpen, PenTool, Users, UserCheck, ExternalLink } from "lucide-react";
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
  const [saveNotice, setSaveNotice] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const noticeTimer = useRef<number | undefined>(undefined);
  const frameRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  useEffect(() => {
    // Warm the Books admin route while the admin menu is visible, reducing the delay on first open.
    const prefetch = document.createElement("link");
    prefetch.rel = "prefetch";
    prefetch.href = "/admin_panel/books";
    prefetch.as = "document";
    document.head.appendChild(prefetch);
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.key !== "Books" && (event.data?.type === "admin-section-saved" || event.data?.type === "admin-book-uploaded")) {
        const sectionName = String(event.data.key || open || "Section");
        const keepSectionOpen = sectionName === "Books";
        setSaving(false);
        setSaveNotice(event.data?.type === "admin-book-uploaded" ? "Your book is uploaded successfully." : "Your changes are saved successfully.");
        if (noticeTimer.current !== undefined) window.clearTimeout(noticeTimer.current);
        noticeTimer.current = window.setTimeout(() => {
          setSaveNotice("");
          // Book management must remain open so multiple books/files can be
          // added or edited without being thrown back to the section menu.
          if (!keepSectionOpen) {
            setOpen(null);
            setFrameReady(false);
          }
          setSaving(false);
        }, 3000);
      }
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      if (noticeTimer.current !== undefined) window.clearTimeout(noticeTimer.current);
      prefetch.remove();
    };
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
          html { height:100%!important; scroll-behavior:smooth!important; }
          html,body { min-height:0!important; height:100%!important; }
          body { margin:0!important; overflow:hidden!important; background:#fff!important; }
          body > div { height:100%!important; min-height:0!important; }
          body > div > .h-screen, body .h-screen { height:100%!important; min-height:0!important; }
          aside { display:none!important; }
          main { box-sizing:border-box!important; height:100%!important; min-height:0!important; padding:12px!important; width:100%!important; min-width:0!important; overflow-y:auto!important; overflow-x:hidden!important; overscroll-behavior:contain; scroll-behavior:smooth!important; -webkit-overflow-scrolling:touch; }
          body .flex.h-screen { display:flex!important; height:100%!important; min-height:0!important; }
          table { min-width:640px; }
          .overflow-x-auto { max-width:100%; overflow-x:auto; }
          input, textarea, select { max-width:100%; }
          button, [role="button"] { touch-action:manipulation; }
          [data-radix-portal] { z-index:1000!important; }\n          [data-radix-popper-content-wrapper] { z-index:1001!important; max-width:calc(100vw - 16px)!important; }\n          [role="listbox"] { max-height:min(60dvh, 360px)!important; overflow-y:auto!important; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; }
        `;
        doc.head.appendChild(style);
      }

      // Keep the embedded admin page within the available screen area so its
      // controls scroll inside the section instead of pushing the footer away.
      frame.style.height = "calc(100dvh - 176px)";
      frame.style.minHeight = "300px";
      frame.style.maxHeight = "calc(100dvh - 150px)";

      // Avoid a ResizeObserver-driven resize loop: the frame is intentionally
      // viewport-sized and should not be resized every time a form changes.
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
          const requestMethod = String((args[1] as RequestInit | undefined)?.method || (args[0] instanceof Request ? args[0].method : "GET")).toUpperCase();
          if (savePending && response.ok && ["POST", "PUT", "PATCH", "DELETE"].includes(requestMethod)) {
            if (closeTimer !== undefined) win.clearTimeout(closeTimer);
            closeTimer = win.setTimeout(() => {
              savePending = false;
              closeTimer = undefined;
              win.parent.postMessage({ type: "admin-section-saved", key }, win.location.origin);
            }, 1500);
          }
          return response;
        }) as typeof fetch;
        doc.addEventListener("submit", () => { savePending = true; }, true);
        doc.addEventListener("click", (event) => {
          const target = event.target as HTMLElement | null;
          const button = target?.closest("button, input[type=submit]");
          const label = (button?.textContent || (button as HTMLInputElement | null)?.value || "").trim();
          if (/^save(?:\s|$)|save changes|update changes|save and add|update(?:\s|$)|submit|save book|create book/i.test(label)) {
            if (closeTimer !== undefined) win.clearTimeout(closeTimer);
            closeTimer = undefined;
            savePending = true;
          }
        }, true);
        (frame as any).__saveHandler = true;
      }
    } catch {
      // Keep the admin page usable if embedded-page styling cannot be applied.
    }
  }

  function saveAndClose(key: string) {
    const frame = frameRefs.current[key];
    try {
      const doc = frame?.contentDocument;
      if (!doc) {
        setSaving(false);
        setSaveNotice("Could not save changes. Please reopen the section and try again.");
        return;
      }
      setSaving(true);
      setSaveNotice("Saving changes…");
      if (key === "Books") {
        const form = doc.querySelector("form");
        if (form instanceof HTMLFormElement) {
          form.requestSubmit();
          return;
        }
        // Books saves only through its own form. Never show a second parent-level prompt.
        setSaving(false);
        setSaveNotice("");
        return;
      }
      const candidates = Array.from(doc.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
        'button, input[type="submit"], input[type="button"]'
      ));
      const saveButton = candidates.find((button) => {
        if ((button as HTMLButtonElement).disabled) return false;
        const label = ((button as HTMLButtonElement).innerText || (button as HTMLInputElement).value || "").trim();
        return /^save(?:\s|$)|save changes|update(?:\s|$)|update changes|save and add|submit|save book|create book/i.test(label);
      });
      if (saveButton) {
        saveButton.click();
        return;
      }
      const form = doc.querySelector("form");
      if (form instanceof HTMLFormElement) {
        form.requestSubmit();
        return;
      }
      // Sections with immediate-save actions have nothing extra to submit.
      setSaving(false);
      setSaveNotice("This section saves changes immediately.");
      setOpen(null);
    } catch {
      // Do not close the section if the current form cannot be accessed.
    }
  }

  const activeSection = sections.find(({ label }) => label === open);

  return (
    <div className="mx-0 flex h-[100dvh] min-h-0 w-full max-w-none flex-col overflow-hidden">
      {saveNotice && (
        <div role="status" aria-live="polite" className={`fixed left-1/2 top-16 z-[2000] w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-lg px-4 py-3 text-center text-sm font-semibold shadow-lg ${saving ? "bg-blue-600 text-white" : saveNotice.startsWith("Could not") ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
          {saveNotice}
        </div>
      )}
      {!open ? (
        <>
          <header className="mb-4 rounded-xl bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Shoppers Ocean</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Admin Panel</h1>
            <p className="mt-1 text-sm text-slate-600">Choose a section to open it full screen.</p>
          </header>
          <nav aria-label="Admin sections" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sections.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => { setFrameReady(false); setSaveNotice(""); setOpen(label); }}
                className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md bg-blue-600 px-3 py-2 text-left text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <span className="flex min-w-0 items-center gap-3"><Icon className="h-5 w-5 shrink-0" /><span>{label}</span></span>
                <span aria-hidden="true" className="text-lg">›</span>
              </button>
            ))}
          </nav>
          <a href="/" className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><ExternalLink className="h-4 w-4" /> Back to Homepage</a>
        </>
      ) : (
        <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 py-2 sm:px-4">
            <button
              type="button"
              onClick={() => { setSaveNotice(""); setSaving(false); setOpen(null); setFrameReady(false); }}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-slate-900 sm:text-xl">{activeSection?.label || open}</h1>
          </header>
          <div className="min-h-0 flex-1 overflow-hidden p-0">
            {activeSection && "dashboard" in activeSection && activeSection.dashboard ? (
              <div className="h-full overflow-y-auto overscroll-contain [scroll-behavior:smooth]">
                <Dashboard />
              </div>
            ) : (
              <iframe
                key={open}
                ref={(node) => { if (open) frameRefs.current[open] = node; }}
                title={open}
                src={"/admin_panel/" + (activeSection?.path || "")}
                onLoad={() => { prepareFrame(open); setFrameReady(true); }}
                className="block w-full border-0 bg-white"
                style={{ height: "calc(100dvh - 126px)", minHeight: 0, maxHeight: "calc(100dvh - 126px)", visibility: frameReady ? "visible" : "hidden" }}
              />
            )}
          </div>
          <footer className="flex h-14 shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-3 py-2 sm:px-4">
            <button
              type="button"
              onClick={() => { setSaveNotice(""); setSaving(false); setOpen(null); setFrameReady(false); }}
              className="min-h-9 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            {open !== "Books" && <button
              type="button"
              onClick={() => saveAndClose(open)}
              className="inline-flex min-h-9 items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Save
            </button>}
          </footer>
        </section>
      )}
    </div>
  );
}
