import { getApps, initializeApp, getApp, type FirebaseApp } from "firebase/app";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBlqXxmhMFSODhiuZ02PmqOOGOz-NdhO1U",
  authDomain: "shoppers-ocean.firebaseapp.com",
  projectId: "shoppers-ocean",
  storageBucket: "shoppers-ocean.firebasestorage.app",
  messagingSenderId: "860877766037",
  appId: "1:860877766037:web:1b2f6c5ffcee6272d20a9c",
  measurementId: "G-WVT7WD4L37",
};

function getConfig() {
  const raw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG || process.env.FIREBASE_WEBAPP_CONFIG;
  if (!raw) return FIREBASE_CONFIG;
  try { return typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return FIREBASE_CONFIG; }
}

export function getFirebaseApp(): FirebaseApp {
  const apps = getApps();
  if (apps.length) return getApp();
  return initializeApp(getConfig());
}
