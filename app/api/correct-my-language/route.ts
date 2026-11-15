import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
const ADMIN_EMAIL = "kochimonu@gmail.com";
const FREE_LIMIT = 3;
const DAILY_LIMIT = 10;
const headers = { "Cache-Control": "no-store" };
const today = () => new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString().slice(0, 10);

async function getContext(req: Request) {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext();
  const db = (env as any).DB as D1Database | undefined;
  const secret = (env as any).JWT_SECRET as string | undefined;
  if (!db || !secret) throw new Error("Correct My Language is temporarily unavailable.");
  const user = await getCurrentUser(req, db, secret);
  if (!user) return { response: NextResponse.json({ error: "Please sign in to use Correct My Language." }, { status: 401, headers }) };
  await db.prepare("CREATE TABLE IF NOT EXISTS correct_my_language_free_usage(user_id TEXT PRIMARY KEY,attempts_used INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS correct_my_language_daily_usage(user_id TEXT NOT NULL,usage_date TEXT NOT NULL,attempts_used INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(user_id,usage_date))").run();
  const account = await db.prepare("SELECT role,email,full_name FROM users WHERE id=? LIMIT 1").bind(user.id).first<any>();
  const admin = String(account?.role ?? "").toLowerCase() === "admin" || String(account?.email ?? user.email).trim().toLowerCase() === ADMIN_EMAIL;
  const subscription = await db.prepare("SELECT status,expires_at FROM user_subscriptions WHERE user_id=? LIMIT 1").bind(user.id).first<any>();
  const expiry = subscription?.expires_at ? Date.parse(String(subscription.expires_at)) : 0;
  const subscribed = !admin && String(subscription?.status ?? "").toLowerCase() === "active" && Boolean(subscription?.expires_at) && Number.isFinite(expiry) && expiry > Date.now();
  if (!admin && String(subscription?.status ?? "").toLowerCase() === "active" && (!subscription?.expires_at || !Number.isFinite(expiry) || expiry <= Date.now())) {
    await db.prepare("UPDATE user_subscriptions SET status='expired',updated_at=? WHERE user_id=? AND status='active'").bind(new Date().toISOString(), user.id).run();
  }
  return { db, user, account, admin, subscribed, privileged: admin || subscribed, userName: String(account?.full_name ?? user.full_name ?? "").trim().split(/\s+/)[0] };
}

async function payload(context: any) {
  const date = today();
  const row = context.privileged
    ? await context.db.prepare("SELECT attempts_used FROM correct_my_language_daily_usage WHERE user_id=? AND usage_date=?").bind(context.user.id, date).first<any>()
    : await context.db.prepare("SELECT attempts_used FROM correct_my_language_free_usage WHERE user_id=?").bind(context.user.id).first<any>();
  const used = Number(row?.attempts_used ?? 0);
  const limit = context.privileged ? DAILY_LIMIT : FREE_LIMIT;
  return { remaining: Math.max(0, limit - used), limit, used, isPrivileged: context.privileged, userName: context.userName };
}

export async function GET(req: Request) {
  try {
    const context = await getContext(req);
    if ("response" in context && context.response) return context.response;
    return NextResponse.json(await payload(context), { headers });
  } catch (error) {
    console.error("Correct My Language access failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Quota could not be verified." }, { status: 503, headers });
  }
}

export async function POST(req: Request) {
  try {
    const context = await getContext(req);
    if ("response" in context && context.response) return context.response;
    let body: any = {};
    try { body = await req.json(); } catch {}
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const letters = text.match(/[\p{L}]/gu) ?? [];
    const latin = text.match(/[\p{Script=Latin}]/gu) ?? [];
    if (body.processed !== true || !text || text.length > 3000 || !letters.length || latin.length / letters.length < 0.9 || /[\p{Script=Devanagari}\p{Script=Arabic}\p{Script=Cyrillic}\p{Script=Han}\p{Script=Hangul}]/u.test(text)) {
      return NextResponse.json({ error: "Please submit valid English text for correction." }, { status: 400, headers });
    }
    const date = today();
    let row: any;
    if (context.privileged) {
      row = await context.db.prepare("INSERT INTO correct_my_language_daily_usage(user_id,usage_date,attempts_used) VALUES(?,?,1) ON CONFLICT(user_id,usage_date) DO UPDATE SET attempts_used=attempts_used+1 WHERE correct_my_language_daily_usage.attempts_used<? RETURNING attempts_used").bind(context.user.id, date, DAILY_LIMIT).first<any>();
    } else {
      row = await context.db.prepare("INSERT INTO correct_my_language_free_usage(user_id,attempts_used,updated_at) VALUES(?,1,?) ON CONFLICT(user_id) DO UPDATE SET attempts_used=attempts_used+1,updated_at=excluded.updated_at WHERE correct_my_language_free_usage.attempts_used<? RETURNING attempts_used").bind(context.user.id, new Date().toISOString(), FREE_LIMIT).first<any>();
    }
    if (!row) return NextResponse.json({ error: context.privileged ? "Your daily quota for Correct My Language has been exhausted." : "Your free quota for Correct My Language has been exhausted. Please subscribe to continue.", remaining: 0 }, { status: 403, headers });
    return NextResponse.json(await payload(context), { headers });
  } catch (error) {
    console.error("Correct My Language submission failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Your correction could not be processed." }, { status: 503, headers });
  }
}
