import assert from "node:assert/strict";
import test from "node:test";
import { hasAllowedOrigin } from "../../src/lib/auth/origin.ts";
test("accepts configured origin", () =>
  assert.equal(
    hasAllowedOrigin(
      new Request("http://localhost/api", { headers: { origin: "http://localhost:3000" } }),
    ),
    true,
  ));
test("rejects foreign origin", () =>
  assert.equal(
    hasAllowedOrigin(
      new Request("http://localhost/api", { headers: { origin: "https://attacker.test" } }),
    ),
    false,
  ));
