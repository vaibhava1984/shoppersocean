import { cookies } from "next/headers";
import { getD1 } from "@/utils/cloudflare/d1";

const COOKIE_NAME = "shoppers_ocean_session";
const SESSION_DAYS = 30;
const encoder = new TextEncoder();

function hex(b: Uint8Array) {
  return Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
}
function randomHex(n = 32) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return hex(b);
}
async function sha256(v: string) {
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(v))));
}
async function derivePassword(password: string, saltHex: string) {
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
    key,
    256
  );
  return hex(new Uint8Array(bits));
}
export async function hashPassword(password: string) {
  const salt = randomHex(16);
  return { salt, hash: await derivePassword(password, salt) };
}
export async function verifyPassword(password: string, salt: string, expected: string) {
  return (await derivePassword(password, salt)) === expected;
}

export async function ensureAuthSchema(db: NonNullable<ReturnType<typeof getD1>>) {
  const columns = await db.prepare("PRAGMA table_info(profiles)").all<any>();
  const names = new Set((columns.results ?? []).map((row: any) => String(row.name)));

  if (!names.has("password_hash")) {
    try { await db.prepare("ALTER TABLE profiles ADD COLUMN password_hash TEXT").run(); } catch {}
  }
  if (!names.has("password_salt")) {
    try { await db.prepare("ALTER TABLE profiles ADD COLUMN password_salt TEXT").run(); } catch {}
  }

  await db.prepare("CREATE TABLE IF NOT EXISTS auth_sessions (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,token_hash TEXT UNIQUE NOT NULL,created_at TEXT NOT NULL,expires_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES profiles(id))").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(token_hash)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS password_reset_tokens (id TEXT PRIMARY KEY,user_id TEXT NOT NULL,token_hash TEXT UNIQUE NOT NULL,expires_at TEXT NOT NULL,used_at TEXT,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES profiles(id))").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token_hash)").run();
}

export type AppUser = {
  id: string;
  emailAddresses: { id: string; emailAddress: string }[];
  primaryEmailAddressId: string;
  firstName: string;
  username: string | null;
  phoneNumbers: { phoneNumber: string; verification: { status: "verified" } }[];
  publicMetadata: { userrole?: string; isAuthor?: boolean; country?: string; address?: string };
  unsafeMetadata: { country?: string; address?: string };
};
function rowToUser(r: any): AppUser {
  return {
    id: String(r.id),
    emailAddresses: [{ id: "primary", emailAddress: String(r.email) }],
    primaryEmailAddressId: "primary",
    firstName: String(r.full_name ?? ""),
    username: null,
    phoneNumbers: r.mobile ? [{ phoneNumber: String(r.mobile), verification: { status: "verified" } }] : [],
    publicMetadata: { userrole: r.userrole || undefined, isAuthor: Boolean(r.isAuthor), country: String(r.country ?? ""), address: String(r.address ?? "") },
    unsafeMetadata: { country: String(r.country ?? ""), address: String(r.address ?? "") },
  };
}

export async function getCurrentUser() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const db = getD1();
  if (!db) return null;
  try {
    await ensureAuthSchema(db);
    const row = await db.prepare("SELECT p.*,CASE WHEN EXISTS(SELECT 1 FROM authors a WHERE a.user_id=p.id AND COALESCE(a.is_deleted,0)=0) THEN 1 ELSE 0 END AS isAuthor,CASE WHEN lower(p.email)='kochimonu@gmail.com' THEN 'ADMIN' ELSE '' END AS userrole FROM auth_sessions s JOIN profiles p ON p.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? LIMIT 1").bind(await sha256(token), new Date().toISOString()).first<any>();
    return row ? rowToUser(row) : null;
  } catch { return null; }
}

export async function createSession(userId: string) {
  const db = getD1();
  if (!db) throw new Error("Cloudflare D1 is not available");
  await ensureAuthSchema(db);
  const token = randomHex(32), now = Date.now(), expires = new Date(now + SESSION_DAYS * 86400000).toISOString();
  await db.prepare("INSERT INTO auth_sessions(id,user_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)").bind(randomHex(16), userId, await sha256(token), new Date(now).toISOString(), expires).run();
  const c = await cookies();
  c.set(COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86400 });
}

export async function clearSession() {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  const db = getD1();
  if (db && token) {
    try {
      await ensureAuthSchema(db);
      await db.prepare("DELETE FROM auth_sessions WHERE token_hash=?").bind(await sha256(token)).run();
    } catch {}
  }
  c.set(COOKIE_NAME, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function getSessionProfile() {
  const u = await getCurrentUser();
  if (!u) return null;
  const db = getD1();
  return db ? db.prepare("SELECT id,email,full_name,country,mobile,address FROM profiles WHERE id=? LIMIT 1").bind(u.id).first<any>() : null;
}
