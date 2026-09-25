import { firebaseAdminAuth, firestore } from "./admin";
import { getFirebaseApp } from "./client";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export async function signInWithPassword(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(getAuth(getFirebaseApp()), email, password);
  const idToken = await credential.user.getIdToken(true);
  return { idToken, localId: credential.user.uid };
}

export async function signUpWithPassword(email: string, password: string) {
  const user = await firebaseAdminAuth.createUser({ email, password });
  const customToken = await firebaseAdminAuth.createCustomToken(user.uid);
  return { localId: user.uid, customToken };
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
