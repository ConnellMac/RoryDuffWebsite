import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
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
  sacredSiteId: "active-site",
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
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "sacredSites/active-site"), {
      id: "active-site",
      name: "Active Site",
      country: "United Kingdom",
      region: "South West",
      latitude: 51,
      longitude: -2,
      timezone: "Europe/London",
      description: "",
      active: true,
    });
    await setDoc(doc(context.firestore(), "sacredSites/inactive-site"), {
      id: "inactive-site",
      name: "Inactive Site",
      country: "United Kingdom",
      region: "South West",
      latitude: 51,
      longitude: -2,
      timezone: "Europe/London",
      description: "",
      active: false,
    });
    await setDoc(doc(context.firestore(), "sacredSites/second-active-site"), {
      id: "second-active-site",
      name: "Second Active Site",
      country: "United Kingdom",
      region: "South West",
      latitude: 52,
      longitude: -1,
      timezone: "Europe/London",
      description: "",
      active: true,
    });
  });
});
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
test("member can list active Sacred Sites but not arbitrary inactive sites", async () => {
  const db = env.authenticatedContext(member.uid, member.token).firestore();
  await assertSucceeds(getDoc(doc(db, "sacredSites/active-site")));
  await assertSucceeds(getDocs(query(collection(db, "sacredSites"), where("active", "==", true))));
  await assertFails(getDoc(doc(db, "sacredSites/inactive-site")));
  await assertFails(getDocs(collection(db, "sacredSites")));
});
test("member can keep reading a selected Sacred Site after it becomes inactive", async () => {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), `users/${member.uid}`), {
      ...profile,
      sacredSiteId: "inactive-site",
    });
  });
  const db = env.authenticatedContext(member.uid, member.token).firestore();
  await assertSucceeds(getDoc(doc(db, "sacredSites/inactive-site")));
});
test("member can select and change only to an active Sacred Site", async () => {
  const db = env.authenticatedContext(member.uid, member.token).firestore();
  const ref = doc(db, "users", member.uid);
  await setDoc(ref, profile);
  await assertSucceeds(
    updateDoc(ref, { sacredSiteId: "second-active-site", updatedAt: serverTimestamp() }),
  );
  await assertFails(
    updateDoc(ref, { sacredSiteId: "inactive-site", updatedAt: serverTimestamp() }),
  );
  await assertFails(updateDoc(ref, { sacredSiteId: "missing-site", updatedAt: serverTimestamp() }));
});
test("member cannot create, edit, or delete Sacred Sites", async () => {
  const db = env.authenticatedContext(member.uid, member.token).firestore();
  await assertFails(setDoc(doc(db, "sacredSites/member-site"), { active: true }));
  await assertFails(updateDoc(doc(db, "sacredSites/active-site"), { active: false }));
  await assertFails(deleteDoc(doc(db, "sacredSites/active-site")));
});
test("member can read only their assigned cohort and cannot modify cohorts", async () => {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), `users/${member.uid}`), {
      ...profile,
      cohortId: "cohort-1",
    });
    await setDoc(doc(context.firestore(), "cohorts/cohort-1"), {
      id: "cohort-1",
      name: "Cohort One",
      status: "open",
    });
    await setDoc(doc(context.firestore(), "cohorts/cohort-2"), {
      id: "cohort-2",
      name: "Cohort Two",
      status: "open",
    });
  });
  const db = env.authenticatedContext(member.uid, member.token).firestore();
  await assertSucceeds(getDoc(doc(db, "cohorts/cohort-1")));
  await assertFails(getDoc(doc(db, "cohorts/cohort-2")));
  await assertFails(setDoc(doc(db, "cohorts/member-created"), { name: "No" }));
  await assertFails(updateDoc(doc(db, "cohorts/cohort-1"), { status: "active" }));
  await assertFails(deleteDoc(doc(db, "cohorts/cohort-1")));
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
