"use client";

import { useEffect, useState } from "react";

export default function AuthorApplicationBanner() {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/author-book-submission", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (active) setPending(data?.status === "pending");
      })
      .catch(() => {
        if (active) setPending(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!pending) return null;

  return (
    <section className="bg-blue-50 px-4 py-6 sm:px-6" role="status" aria-live="polite">
      <div className="mx-auto max-w-4xl rounded-xl border border-blue-200 bg-white p-5 text-center shadow-sm sm:p-7">
        <h2 className="mb-2 text-xl font-bold text-blue-800 sm:text-2xl">Your Book Is Under Review</h2>
        <p className="text-base leading-relaxed text-slate-700 sm:text-lg">
          Thank you for submitting your book to Shoppers Ocean. Your manuscript and cover page have been received and are now under review. If your book meets our Community Guidelines and Author Policies, it will be published within 2–3 working days. You can check the status on the Create Your Flipbook page.
        </p>
      </div>
    </section>
  );
}
