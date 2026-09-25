import { getApps, initializeApp, getApp, type FirebaseApp } from "firebase/app";

function getConfig() {
  const raw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG || process.env.FIREBASE_WEBAPP_CONFIG;
  if (!raw) return undefined;
  try { return typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return undefined; }
}

export function getFirebaseApp(): FirebaseApp {
  const apps = getApps();
  if (apps.length) return getApp();
  const config = getConfig();
  return config ? initializeApp(config) : initializeApp();
}
