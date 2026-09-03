import assert from "node:assert/strict";
import test from "node:test";
import { parseEnvironment } from "../../src/lib/env.ts";
test("safe defaults", () => {
  assert.equal(parseEnvironment({}).firebaseProjectId, "demo-sacred-path");
});
test("rejects unsafe URL", () => {
  assert.throws(() => parseEnvironment({ NEXT_PUBLIC_APP_URL: "file:///x" }));
});
