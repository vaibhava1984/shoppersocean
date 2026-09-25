"use client"

import { getApps, getApp, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { firebaseConfig } from "./config"

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const firebaseApp = app
export const firebaseAuth = getAuth(app)
export const firebaseDb = getFirestore(app)
export const firebaseStorage = getStorage(app)
