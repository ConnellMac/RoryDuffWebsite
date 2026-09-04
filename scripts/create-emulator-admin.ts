import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

if (
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9099" ||
  process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080" ||
  process.env.FIREBASE_PROJECT_ID !== "demo-sacred-path"
)
  throw new Error("Refusing to create an admin outside the configured local emulators.");
const email = process.env.LOCAL_ADMIN_EMAIL;
const password = process.env.LOCAL_ADMIN_PASSWORD;
if (!email || !password || password.length < 12)
  throw new Error(
    "Set LOCAL_ADMIN_EMAIL and LOCAL_ADMIN_PASSWORD (12+ characters). Values are never stored by this script.",
  );
const app = getApps()[0] ?? initializeApp({ projectId: "demo-sacred-path" });
const auth = getAuth(app);
const db = getFirestore(app);
let user;
try {
  user = await auth.getUserByEmail(email);
} catch {
  user = await auth.createUser({ email, password, emailVerified: true });
}
await auth.setCustomUserClaims(user.uid, { role: "super_admin" });
await db.doc(`users/${user.uid}`).set(
  {
    uid: user.uid,
    fullName: "Local Admin",
    email,
    background: "",
    countryOrRegion: "Local emulator",
    sacredSiteId: null,
    cohortId: null,
    role: "super_admin",
    onboarding: { state: "complete", version: 1 },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  },
  { merge: true },
);
console.log(`Local emulator admin ready: ${email}`);
