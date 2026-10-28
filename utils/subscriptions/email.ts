function esc(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] || ch));
}
function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
}
async function sendEmail(input: { apiKey: string; to: string; subject: string; html: string; idempotencyKey: string }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${input.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": input.idempotencyKey },
    body: JSON.stringify({ from: "Shoppers Ocean <no-reply@shoppersocean.com>", to: [input.to], subject: input.subject, html: input.html }),
  });
  if (!response.ok) throw new Error(`Subscription email failed (${response.status}): ${(await response.text()).slice(0, 400)}`);
  return response.json();
}
export async function sendSubscriptionWelcome(input: {
  apiKey: string; email: string; name: string; planName: string; amount: number;
  startedAt: string; expiresAt: string; paymentId: string;
}) {
  const name = esc(input.name || "Shoppers Ocean member");
  const plan = esc(input.planName);
  const start = esc(dateLabel(input.startedAt));
  const expiry = esc(dateLabel(input.expiresAt));
  const amount = input.amount.toLocaleString("en-IN");
  return sendEmail({
    apiKey: input.apiKey, to: input.email, subject: "Welcome to Shoppers Ocean — Your Subscription Is Active",
    idempotencyKey: `subscription-welcome/${input.paymentId}`,
    html: `<div style="margin:0;background:#f1f5f9;padding:28px 12px;font-family:Arial,sans-serif;color:#172554"><div style="max-width:620px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px #0f172a18"><div style="padding:30px 26px;text-align:center;background:linear-gradient(135deg,#1d4ed8,#0891b2);color:#fff"><div style="font-size:32px">🌊</div><h1 style="margin:12px 0 6px;font-size:27px">Welcome to Shoppers Ocean!</h1><p style="margin:0;color:#e0f2fe">Your subscription is now active</p></div><div style="padding:28px"><p>Dear ${name},</p><p>Thank you for subscribing to Shoppers Ocean. We are delighted to welcome you to our entertainment community. Your membership is active, and you can now enjoy the games, quizzes, brain challenges, exercises and other features included in your plan.</p><div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:14px;padding:18px;margin:22px 0"><h2 style="margin:0 0 14px;font-size:18px;color:#1d4ed8">Your subscription details</h2><p style="margin:7px 0"><strong>Plan:</strong> ${plan}</p><p style="margin:7px 0"><strong>Amount paid:</strong> ₹${amount}</p><p style="margin:7px 0"><strong>Activation date:</strong> ${start}</p><p style="margin:7px 0"><strong>Expiry date:</strong> ${expiry}</p><p style="margin:7px 0"><strong>Status:</strong> Active</p></div><p>Please note that e-books and flipbooks are separate from subscriptions and remain subject to their existing access and purchase rules.</p><p>We hope your time here is enjoyable, enriching and full of new discoveries.</p><p style="margin-top:26px">Warm regards,<br><strong>Team Shoppers Ocean</strong><br><span style="color:#64748b">One destination. Endless possibilities.</span></p></div></div></div>`,
  });
}
export async function sendSubscriptionReminder(input: {
  apiKey: string; email: string; name: string; planName: string; expiresAt: string; userId: string;
}) {
  const name = esc(input.name || "Shoppers Ocean member");
  const expiry = esc(dateLabel(input.expiresAt));
  return sendEmail({
    apiKey: input.apiKey, to: input.email, subject: "A Friendly Reminder: Your Shoppers Ocean Subscription Is Ending Soon",
    idempotencyKey: `subscription-reminder/${input.userId}/${input.expiresAt}`,
    html: `<div style="margin:0;background:#f1f5f9;padding:28px 12px;font-family:Arial,sans-serif;color:#172554"><div style="max-width:620px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px #0f172a18"><div style="padding:28px;text-align:center;background:linear-gradient(135deg,#1d4ed8,#0891b2);color:#fff"><div style="font-size:30px">✨</div><h1 style="margin:10px 0;font-size:25px">We hope you’re enjoying Shoppers Ocean!</h1></div><div style="padding:28px"><p>Dear ${name},</p><p>This is a friendly reminder that your <strong>${esc(input.planName)}</strong> subscription is scheduled to end on <strong>${expiry}</strong>.</p><p>After the expiry date, access to subscription-covered games, quizzes, challenges, exercises and other membership features will pause until you renew. Your account will remain available, and e-books and flipbooks will continue to follow their separate access rules.</p><p style="text-align:center;margin:28px 0"><a href="https://www.shoppersocean.com/subscribe-now" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:bold">View Renewal Plans</a></p><p>We would be delighted to have you continue with us. Thank you for being part of Shoppers Ocean.</p><p>Warm regards,<br><strong>Team Shoppers Ocean</strong></p></div></div></div>`,
  });
}
