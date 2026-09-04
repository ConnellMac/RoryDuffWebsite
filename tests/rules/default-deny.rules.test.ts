import { assertFails, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getBytes, ref, uploadString } from "firebase/storage";
import { after, before, test } from "node:test";
import fs from "node:fs";

let env: Awaited<ReturnType<typeof initializeTestEnvironment>>;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-sacred-path",
    firestore: { rules: fs.readFileSync("firestore.rules", "utf8") },
    storage: { rules: fs.readFileSync("storage.rules", "utf8") },
  });
});
after(async () => env.cleanup());
test("unmatched Firestore collections remain denied", async () => {
  const db = env
    .authenticatedContext("member-1", { email: "member@example.test", email_verified: true })
    .firestore();
  await assertFails(getDoc(doc(db, "unknown/item")));
  await assertFails(setDoc(doc(db, "unknown/item"), { value: true }));
});
test("Storage remains default deny", async () => {
  const storage = env.authenticatedContext("member-1").storage();
  await assertFails(getBytes(ref(storage, "members/member-1/file.txt")));
  await assertFails(uploadString(ref(storage, "members/member-1/file.txt"), "denied"));
});
