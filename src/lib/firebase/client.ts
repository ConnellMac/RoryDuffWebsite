"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-sacred-path";
const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS !== "false";

if (useEmulators && !projectId.startsWith("demo-")) {
  throw new Error("Firebase emulators require a demo-* project ID.");
}

const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "demo-api-key",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? `${projectId}.appspot.com`,
    });

export const clientAuth = getAuth(app);
export const clientFirestore = getFirestore(app);

if (useEmulators && typeof window !== "undefined") {
  const marker = window as typeof window & { __firebaseEmulatorsConnected?: boolean };
  if (!marker.__firebaseEmulatorsConnected) {
    connectAuthEmulator(clientAuth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(clientFirestore, "127.0.0.1", 8080);
    marker.__firebaseEmulatorsConnected = true;
  }
}
