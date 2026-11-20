import { COUNTRIES } from "@/utils/countries";

function escapeHtml(value: unknown) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(value ?? "").replace(/[&<>"']/g, (character) => entities[character] || character);
}

export async function sendSaleNotification(input: {
  paymentId: string;
  paymentMethod?: string;
  customerEmail: string;
  bookId: string;
  bookTitle: string;
  customerName?: string;
  saleCountry?: string | null;
  saleRegion?: string | null;
  saleCity?: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const paymentMethod = input.paymentMethod || "Razorpay";
  const countryCode = String(input.saleCountry || "").trim().toUpperCase();
  const countryName = COUNTRIES.find((country) => country.code === countryCode)?.name || (countryCode && countryCode !== "XX" && countryCode !== "T1" ? countryCode : "");
  const saleLocation = [input.saleCity, input.saleRegion, countryName].map((value) => String(value || "").trim()).filter(Boolean).join(", ") || "Not available";
  const html = `<p><strong>New Sale details:</strong></p>
    <p><strong>Customer name:</strong> ${escapeHtml(input.customerName || "Not available")}</p>
    <p><strong>Customer email:</strong> ${escapeHtml(input.customerEmail)}</p>
    <p><strong>Actual purchase location:</strong> ${escapeHtml(saleLocation)}</p>
    <p><strong>Book ID:</strong> ${escapeHtml(input.bookId)}</p>
    <p><strong>Book Name:</strong> ${escapeHtml(input.bookTitle)}</p>
    <p><strong>${escapeHtml(paymentMethod)} payment ID:</strong> ${escapeHtml(input.paymentId)}</p>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Browser verification and retries share this key so one captured purchase
      // produces only one admin email.
      "Idempotency-Key": `sale-notification/${input.paymentId}`,
    },
    body: JSON.stringify({
      from: "Shoppers Ocean <no-reply@shoppersocean.com>",
      to: ["kochimonu@gmail.com"],
      subject: "New Sale | Shoppers Ocean",
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend sale notification failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  return await response.json();
}
