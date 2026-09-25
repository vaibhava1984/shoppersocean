import { getApps, initializeApp, getApp, applicationDefault, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

export function getFirebaseAdminApp(): App {
  const apps = getApps();
  if (apps.length) return getApp();
  try {
    return initializeApp();
  } catch {
    return initializeApp({ credential: applicationDefault() });
  }
}

export const firebaseAdminApp = getFirebaseAdminApp();
export const firebaseAdminAuth = getAuth(firebaseAdminApp);
export const firestore = getFirestore(firebaseAdminApp);
export const storage = getStorage(firebaseAdminApp);
