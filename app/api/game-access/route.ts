import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
const SECTION_IDS = ["word-playground", "brain-logic", "quiz-arena", "riddle-corner", "daily-challenge", "memory-observation"];
const DAILY_SECTION_LIMIT = 10;
const FREE_LIFETIME_SECTION_LIMIT = 3;

async function getAccess(req: Request, consume = false) {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database | undefined;
    const jwtSecret = (env as any).JWT_SECRET as string | undefined;
    if (!db || !jwtSecret) return NextResponse.json({ error: "Game access is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    const user = await getCurrentUser(req, db, jwtSecret);
    if (!user) return NextResponse.json({ error: "Please sign in to play." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    await db.prepare("CREATE TABLE IF NOT EXISTS game_play_usage_by_section (user_id TEXT NOT NULL, section_id TEXT NOT NULL, plays_used INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, section_id))").run();

    if (consume) {
      let body: { sectionId?: string } = {};
      try { body = await req.json() as { sectionId?: string }; } catch {}
      const sectionId = body.sectionId;
      if (!sectionId || !SECTION_IDS.includes(sectionId)) return NextResponse.json({ error: "Choose a valid game section." }, { status: 400, headers: { "Cache-Control": "no-store" } });
      const changed = await db.prepare("INSERT INTO game_play_usage_by_section (user_id, section_id, plays_used, updated_at) VALUES (?, ?, 1, CURRENT_TIMESTAMP) ON CONFLICT(user_id, section_id) DO UPDATE SET plays_used = CASE WHEN date(game_play_usage_by_section.updated_at) < date('now') THEN 1 ELSE game_play_usage_by_section.plays_used + 1 END, updated_at = CURRENT_TIMESTAMP WHERE date(game_play_usage_by_section.updated_at) < date('now') OR game_play_usage_by_section.plays_used < ? RETURNING plays_used").bind(user.id, sectionId, DAILY_SECTION_LIMIT).first<{plays_used:number}>();
      const row = changed ?? await db.prepare("SELECT plays_used, date(updated_at) AS usage_date FROM game_play_usage_by_section WHERE user_id = ? AND section_id = ? LIMIT 1").bind(user.id, sectionId).first<{plays_used:number;usage_date:string}>();
      const used = row?.usage_date === new Date().toISOString().slice(0, 10) ? Number(row?.plays_used ?? 0) : 0;
      if (!changed && used >= DAILY_SECTION_LIMIT) return NextResponse.json({ error: `Your ${DAILY_SECTION_LIMIT} free plays for today in this section are complete.`, sectionId, used, remaining: 0 }, { status: 403, headers: { "Cache-Control": "no-store" } });
      return NextResponse.json({ sectionId, used, remaining: Math.max(0, DAILY_SECTION_LIMIT - used) }, { headers: { "Cache-Control": "no-store" } });
    }

    const rows = await db.prepare("SELECT section_id, plays_used, updated_at FROM game_play_usage_by_section WHERE user_id = ?").bind(user.id).all<{section_id:string;plays_used:number}>();
    const usedBySection: Record<string, number> = {};
    const remainingBySection: Record<string, number> = {};
    for (const id of SECTION_IDS) { usedBySection[id] = 0; remainingBySection[id] = DAILY_SECTION_LIMIT; }
    const today = new Date().toISOString().slice(0, 10);
    for (const row of rows.results ?? []) {
      if (SECTION_IDS.includes(row.section_id) && String((row as any).updated_at ?? "").slice(0, 10) === today) {
        usedBySection[row.section_id] = Number(row.plays_used ?? 0);
        remainingBySection[row.section_id] = Math.max(0, DAILY_SECTION_LIMIT - Number(row.plays_used ?? 0));
      }
    }
    return NextResponse.json({ usedBySection, remainingBySection }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Game access check failed:", error);
    return NextResponse.json({ error: "Game access could not be verified." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
export async function GET(req: Request) { return getAccess(req, false); }
export async function POST(req: Request) { return getAccess(req, true); }
