import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { firestore } from "./admin";

export { FieldPath, Timestamp, firestore };

export function collection(name: string) {
  return firestore.collection(name);
}

export function doc(collectionName: string, id: string) {
  return firestore.collection(collectionName).doc(id);
}
