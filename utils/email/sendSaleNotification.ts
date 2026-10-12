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
  customerEmail: string;
  bookId: string;
  bookTitle: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const html = `<p><strong>New Sale details:</strong></p>
    <p><strong>Customer email:</strong> ${escapeHtml(input.customerEmail)}</p>
    <p><strong>Book ID:</strong> ${escapeHtml(input.bookId)}</p>
    <p><strong>Book Name:</strong> ${escapeHtml(input.bookTitle)}</p>
    <p><strong>Razorpay payment ID:</strong> ${escapeHtml(input.paymentId)}</p>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Both browser verification and Razorpay webhook use the same key,
      // so one captured purchase produces only one admin email.
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
