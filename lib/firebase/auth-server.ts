import { firebaseAdminAuth, firestore } from "./admin";

function webApiKey() {
  const raw = process.env.FIREBASE_WEBAPP_CONFIG || process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
  if (!raw) throw new Error("Firebase web configuration is not available");
  const config = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!config?.apiKey) throw new Error("Firebase API key is not configured");
  return config.apiKey as string;
}

async function identityRequest(path: string, body: Record<string, unknown>) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/${path}?key=${encodeURIComponent(webApiKey())}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = String(data?.error?.message || "AUTH_ERROR");
    const error = new Error(code);
    (error as any).code = code;
    throw error;
  }
  return data;
}

export async function signInWithPassword(email: string, password: string) {
  return identityRequest("accounts:signInWithPassword", { email, password, returnSecureToken: true });
}

export async function signUpWithPassword(email: string, password: string) {
  return identityRequest("accounts:signUp", { email, password, returnSecureToken: true });
}

export async function getFirebaseUser(uid: string) {
  return firebaseAdminAuth.getUser(uid);
}

export async function createProfile(uid: string, data: Record<string, unknown>) {
  await firebaseAdminAuth.setCustomUserClaims(uid, { userrole: data.userrole || "USER", isAuthor: Boolean(data.isAuthor) });
  await firestore.collection("profiles").doc(uid).set({
    id: uid, ...data, updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }, { merge: true });
}
