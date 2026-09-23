import type { CloudflareEnv } from "../auth/types";
import type { ClerkAdminClient } from "../auth/clerk-admin";
import { getAuthContext } from "../auth/clerk";
import { getUserByClerkId, deleteUserData } from "../db/users";

export async function handleAccountDelete(
  request: Request,
  env: CloudflareEnv,
  verifyToken: Parameters<typeof getAuthContext>[2],
  clerk: ClerkAdminClient,
): Promise<Response> {
  if (request.method !== "DELETE") return Response.json({ error: "Method not allowed" }, { status: 405 });

  let auth;
  try { auth = await getAuthContext(request, env, verifyToken); }
  catch { return Response.json({ error: "Not authorized" }, { status: 401 }); }
  if (!auth.user) return Response.json({ error: "Authentication required" }, { status: 401 });

  const user = await getUserByClerkId(env, auth.user.clerkUserId);
  if (!user) return Response.json({ error: "User profile required" }, { status: 404 });

  // D1 batch is atomic for the statements below; Clerk deletion is deliberately
  // performed after the local data is removed so no live Clerk account is
  // touched until the D1 operation succeeds.
  await deleteUserData(env, user.id);
  await clerk.deleteUser(auth.user.clerkUserId);

  return Response.json({ deleted: true });
}
