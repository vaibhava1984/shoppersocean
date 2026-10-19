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
      if (event.data?.type === "admin-section-save-failed" && event.data?.key === "Books") {
        setSaving(false);
        setSaveNotice(String(event.data.message || "Please check the form and try again."));
        if (noticeTimer.current !== undefined) window.clearTimeout(noticeTimer.current);
        noticeTimer.current = window.setTimeout(() => setSaveNotice(""), 3500);
        return;
      }
      if (event.data?.type === "admin-section-saved" || event.data?.type === "admin-book-uploaded") {
        const sectionName = String(event.data.key || open || "Section");
        const keepSectionOpen = sectionName === "Books";
        setSaving(false);
        setSaveNotice(event.data?.type === "admin-book-uploaded" ? "The new book uploaded" : "Your changes have been saved");
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
      frame.style.height = "calc(100dvh - 112px)";
      frame.style.minHeight = "0";
      frame.style.maxHeight = "calc(100dvh - 112px)";

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
          if (key !== "Books" && savePending && response.ok && ["POST", "PUT", "PATCH", "DELETE"].includes(requestMethod)) {
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
      if (key === "Books") {
        const form = doc.querySelector('[role="dialog"] form') || doc.querySelector("form");
        if (form instanceof HTMLFormElement) {
          // Prevent native required-field validation from leaving the common Save
          // button stuck in its loading state when submission is blocked.
          if (!form.reportValidity()) {
            setSaving(false);
            setSaveNotice("Please complete the required fields before saving.");
            if (noticeTimer.current !== undefined) window.clearTimeout(noticeTimer.current);
            noticeTimer.current = window.setTimeout(() => setSaveNotice(""), 3500);
            return;
          }
          setSaving(true);
          setSaveNotice("Saving changes…");
          form.requestSubmit();
          return;
        }
        setSaving(false);
        setSaveNotice("Could not find the book form. Please reopen the section and try again.");
        return;
      }
      setSaving(true);
      setSaveNotice("Saving changes…");
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
    <div className="m-0 flex h-[100dvh] min-h-0 w-full max-w-none flex-col overflow-hidden bg-white p-0">
      {saveNotice && (
        <div role="status" aria-live="polite" className={`fixed left-1/2 top-16 z-[2000] w-[calc(100%-24px)] max-w-md -translate-x-1/2 rounded-lg px-4 py-3 text-center text-sm font-semibold shadow-lg ${saving ? "bg-blue-600 text-white" : saveNotice.startsWith("Could not") ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
          {saveNotice}
        </div>
      )}
      {!open ? (
        <>
          <header className="mb-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/60 p-4 shadow-sm sm:mb-4 sm:p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Shoppers Ocean</p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Admin Panel</h1>
            <p className="mt-1 text-sm text-slate-600">Choose a section to open it full screen.</p>
          </header>
          <nav aria-label="Admin sections" className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {sections.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => { setFrameReady(false); setSaveNotice(""); setOpen(label); }}
                className="group flex min-h-[64px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-600 group-hover:text-white"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 break-words text-sm font-semibold leading-tight text-slate-800">{label}</span>
                </span>
                <span aria-hidden="true" className="shrink-0 text-lg text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600">›</span>
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
                style={{ height: "calc(100dvh - 112px)", minHeight: 0, maxHeight: "calc(100dvh - 112px)", visibility: frameReady ? "visible" : "hidden" }}
              />
            )}
          </div>
          <footer className="flex h-14 shrink-0 items-center justify-center border-t border-slate-200 bg-white px-3 py-2 sm:px-4">
            <button
              type="button"
              onClick={() => saveAndClose(open)}
              disabled={saving}
              className="inline-flex min-h-10 w-full max-w-sm items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {saving ? "Saving changes…" : "Save changes"}
            </button>
          </footer>
        </section>
      )}
    </div>
  );
}
