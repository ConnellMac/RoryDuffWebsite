import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { after, before, beforeEach, test } from "node:test";
import fs from "node:fs";

let env: Awaited<ReturnType<typeof initializeTestEnvironment>>;
const member = {
  uid: "member-1",
  email: "member@example.test",
  token: { email: "member@example.test", email_verified: true },
};
const profile = {
  uid: member.uid,
  fullName: "Member One",
  email: member.email,
  background: "Background",
  countryOrRegion: "United Kingdom",
  sacredSiteId: null,
  cohortId: null,
  role: "member",
  onboarding: { state: "complete", version: 1 },
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-sacred-path",
    firestore: { rules: fs.readFileSync("firestore.rules", "utf8") },
  });
});
beforeEach(async () => env.clearFirestore());
after(async () => env.cleanup());

test("verified member can create, read, and update allowed own profile fields", async () => {
  const db = env.authenticatedContext(member.uid, member.token).firestore();
  const ref = doc(db, "users", member.uid);
  await assertSucceeds(setDoc(ref, profile));
  await assertSucceeds(getDoc(ref));
  await assertSucceeds(
    updateDoc(ref, { fullName: "Updated Member", updatedAt: serverTimestamp() }),
  );
});
test("unverified member cannot create a profile", async () => {
  const db = env
    .authenticatedContext("unverified", { email: "u@example.test", email_verified: false })
    .firestore();
  await assertFails(
    setDoc(doc(db, "users/unverified"), { ...profile, uid: "unverified", email: "u@example.test" }),
  );
});
test("member cannot read another profile", async () => {
  await env.withSecurityRulesDisabled(async (context) =>
    setDoc(doc(context.firestore(), "users/other"), { ...profile, uid: "other" }),
  );
  const db = env.authenticatedContext(member.uid, member.token).firestore();
  await assertFails(getDoc(doc(db, "users/other")));
});
test("member cannot promote role or assign cohort", async () => {
  const db = env.authenticatedContext(member.uid, member.token).firestore();
  const ref = doc(db, "users", member.uid);
  await setDoc(ref, profile);
  await assertFails(updateDoc(ref, { role: "super_admin", updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(ref, { cohortId: "cohort-1", updatedAt: serverTimestamp() }));
});
test("member cannot write privileged collections", async () => {
  const db = env.authenticatedContext(member.uid, member.token).firestore();
  await assertFails(setDoc(doc(db, "entitlements", member.uid), { accessAllowed: true }));
  await assertFails(setDoc(doc(db, "adminRoleAssignments", member.uid), { role: "super_admin" }));
});
test("unauthenticated access remains denied", async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, "users", member.uid)));
  await assertFails(setDoc(doc(db, "users", member.uid), profile));
});
