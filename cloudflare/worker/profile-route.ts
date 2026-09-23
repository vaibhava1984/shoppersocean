import type { CloudflareEnv } from "../auth/types";
import { getAuthContext } from "../auth/clerk";
import { getUserByClerkId, updateUserProfile } from "../db/users";

export async function handleProfile(
  request: Request,
  env: CloudflareEnv,
  verifyToken: Parameters<typeof getAuthContext>[2],
): Promise<Response> {
  let auth;
  try { auth = await getAuthContext(request, env, verifyToken); }
  catch { return Response.json({ error: "Not authorized" }, { status: 401 }); }
  if (!auth.user) return Response.json({ error: "Authentication required" }, { status: 401 });

  const user = await getUserByClerkId(env, auth.user.clerkUserId);
  if (!user) return Response.json({ error: "User profile required" }, { status: 404 });

  if (request.method === "GET") {
    return Response.json({ user }, { headers: { "Cache-Control": "private, no-store" } });
  }

  if (request.method !== "PATCH") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return Response.json({ error: "Invalid request" }, { status: 400 });

  const allowed = ["fullName", "country", "mobile", "address"] as const;
  const patch: Partial<Record<(typeof allowed)[number], string>> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (typeof body[key] !== "string") return Response.json({ error: `${key} must be text` }, { status: 400 });
      patch[key] = body[key] as string;
    }
  }

  const updated = await updateUserProfile(env, user.id, patch);
  return Response.json({ user: updated }, { headers: { "Cache-Control": "private, no-store" } });
}
