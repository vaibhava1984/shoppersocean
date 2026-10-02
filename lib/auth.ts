/**
 * Server-side authentication utilities â Cloudflare D1 + JWT (Web Crypto API)
 * Replaces Supabase Auth entirely. No external dependencies.
 */

// âââ Types ââââââââââââââââââââââââââââââââââââââââââââââââ
export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  country: string | null;
}

interface JWTPayload {
  sub: string;       // user id
  email: string;
  exp: number;       // expiry timestamp (seconds)
  iat: number;       // issued at
}

// âââ JWT helpers (HMAC-SHA256 via Web Crypto) âââââââââââââââ
const enc = new TextEncoder();
const dec = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return new Uint8Array([...atob(str)].map(c => c.charCodeAt(0)));
}

async function getJwtKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createJwt(payload: Omit<JWTPayload, 'iat' | 'exp'>, secret: string, expiresInSeconds = 7 * 24 * 3600): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = { ...payload, iat: now, exp: now + expiresInSeconds };
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(fullPayload)));
  const signingInput = `${headerB64}.${payloadB64}`;
  const key = await getJwtKey(secret);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(signingInput)));
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

export async function verifyJwt(token: string, secret: string): Promise<JWTPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;
  const key = await getJwtKey(secret);
  const sig = base64UrlDecode(sigB64);
  const valid = await crypto.subtle.verif)('HMAC', key, sig, enc.encode(signingInput));
  if (!valid) return null;
  const payload: JWTPayload = JSON.parse(dec.decode(base64UrlDecode(payloadB64)));
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

// âââ Password hashing (PBKDF2 via Web Crypto) ââââââââââââââ
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256,
  ));
  return `pbkdf2$100000$${base64UrlEncode(salt)}$${base64UrlEncode(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const salt = base64UrlDecode(parts[2]);
  const expectedHash = base64UrlDecode(parts[3]);
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: parseInt(parts[1]), hash: 'SHA-256' },
    keyMaterial,
    256,
  ));
  if (hash.length !== expectedHash.length) return false;
  return crypto.subtle.timingSafeEqual(hash, expectedHash);
}

// âââ Cookie helpers ââââââââââââââââââââââââââââââââââââââ
const SESSION_COOKIE = 'so_session';
const SESSION_MAX_AGE = 7 * 24 * 3600; // 7 days

export function setSessionCookie(res: Response, token: string): void {
  res.headers.append('Set-Cookie', `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE}`);
}

export function clearSessionCookie(res: Response): void {
  res.headers.append('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}

export function getSessionToken(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

// âââ Get current user from request ââââââââââââââââââââââââ
export async function getCurrentUser(req: Request, db: D1Database, jwtSecret: string): Promise<AuthUser | null> {
  const token = getSessionToken(req);
  if (!token) return null;
  const payload = await verifyJwt(token, jwtSecret);
  if (!payload) return null;
  const user = await db.prepare('SELECT id, email, full_name, country FROM users WHERE id = ?').bind(payload.sub).first<AuthUser>();
  return user || null;
}
