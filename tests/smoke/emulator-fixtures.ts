import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";

const app =
  getApps().find((candidate) => candidate.name === "playwright-fixtures") ??
  initializeApp({ projectId: "demo-sacred-path" }, "playwright-fixtures");
const auth = getAuth(app);
const firestore = getFirestore(app);

export async function seedSacredSite(id: string, active = true) {
  await firestore.doc(`sacredSites/${id}`).set({
    id,
    name: active ? "Test Sacred Site" : "Inactive Test Site",
    country: "United Kingdom",
    region: "South West",
    latitude: 51.45,
    longitude: -2.58,
    timezone: "Europe/London",
    description: "Playwright fixture",
    active,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function createTestUser({
  email,
  password,
  role,
  sacredSiteId,
}: {
  email: string;
  password: string;
  role: "member" | "super_admin" | "content_admin" | "member_support_operations";
  sacredSiteId: string | null;
}) {
  const user = await auth.createUser({ email, password, emailVerified: true });
  await firestore.doc(`users/${user.uid}`).set({
    uid: user.uid,
    fullName: role === "member" ? "Phase Three Member" : "Phase Three Admin",
    email,
    background: "Playwright fixture",
    countryOrRegion: "United Kingdom",
    sacredSiteId,
    cohortId: null,
    role,
    onboarding: { state: "complete", version: 1 },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return user.uid;
}

export async function readTestProfile(uid: string) {
  return (await firestore.doc(`users/${uid}`).get()).data();
}
