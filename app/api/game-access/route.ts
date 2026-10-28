import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getAccess(req: Request, consume = false) {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext();
    const db = (env as any).DB as D1Database | undefined;
    const jwtSecret = (env as any).JWT_SECRET as string | undefined;
    if (!db || !jwtSecret) return NextResponse.json({ error: "Game access is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    const user = await getCurrentUser(req, db, jwtSecret);
    if (!user) return NextResponse.json({ error: "Please sign in to play." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    await db.prepare("CREATE TABLE IF NOT EXISTS game_play_usage (user_id TEXT PRIMARY KEY, plays_used INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
    if (consume) {
      const changed = await db.prepare("INSERT INTO game_play_usage (user_id, plays_used, updated_at) VALUES (?, 1, CURRENT_TIMESTAMP) ON CONFLICT(user_id) DO UPDATE SET plays_used = plays_used + 1, updated_at = CURRENT_TIMESTAMP WHERE plays_used < 3 RETURNING plays_used").bind(user.id).first<{plays_used:number}>();
      const row = changed ?? await db.prepare("SELECT plays_used FROM game_play_usage WHERE user_id = ? LIMIT 1").bind(user.id).first<{plays_used:number}>();
      const used = Number(row?.plays_used ?? 0);
      if (!changed && used >= 3) return NextResponse.json({ error: "Your free plays are complete.", used, remaining: 0 }, { status: 403, headers: { "Cache-Control": "no-store" } });
      return NextResponse.json({ used, remaining: Math.max(0, 3 - used) }, { headers: { "Cache-Control": "no-store" } });
    }
    const row = await db.prepare("SELECT plays_used FROM game_play_usage WHERE user_id = ? LIMIT 1").bind(user.id).first<{plays_used:number}>();
    const used = Number(row?.plays_used ?? 0);
    return NextResponse.json({ used, remaining: Math.max(0, 3 - used) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Game access check failed:", error);
    return NextResponse.json({ error: "Game access could not be verified." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
export async function GET(req: Request) { return getAccess(req, false); }
export async function POST(req: Request) { return getAccess(req, true); }
