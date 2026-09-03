import { assertFails, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getBytes, ref, uploadString } from "firebase/storage";
import { after, before, test } from "node:test";
let env: Awaited<ReturnType<typeof initializeTestEnvironment>>;
before(async () => {
  env = await initializeTestEnvironment({ projectId: "demo-sacred-path" });
});
after(async () => env.cleanup());
test("Firestore denies reads and writes", async () => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, "x/y")));
  await assertFails(setDoc(doc(db, "x/y"), { x: 1 }));
});
test("Storage denies reads and writes", async () => {
  const storage = env.unauthenticatedContext().storage();
  await assertFails(getBytes(ref(storage, "x/y")));
  await assertFails(uploadString(ref(storage, "x/y"), "x"));
});
