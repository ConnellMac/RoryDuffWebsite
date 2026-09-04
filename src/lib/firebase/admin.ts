import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID ?? "demo-sacred-path";
const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS !== "false";

if (useEmulators && !projectId.startsWith("demo-")) {
  throw new Error("Local Firebase Admin access requires a demo-* project ID.");
}

if (useEmulators) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
}

const app = getApps()[0] ?? initializeApp({ projectId });

export const adminAuth = getAuth(app);
export const adminFirestore = getFirestore(app);
