import { cookies } from "next/headers";
import { firebaseAdminAuth } from "./admin";

export const FIREBASE_SESSION_COOKIE = "__session";
const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 5;

export async function getFirebaseUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(FIREBASE_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await firebaseAdminAuth.verifySessionCookie(token, true);
  } catch {
    return null;
  }
}

export async function createFirebaseSessionCookie(idToken: string) {
  return firebaseAdminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE });
}

export { SESSION_MAX_AGE };
