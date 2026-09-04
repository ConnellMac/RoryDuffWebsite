import assert from "node:assert/strict";
import test from "node:test";

import { InvalidOnboardingInput, parseOnboardingInput } from "../../src/lib/users/onboarding.ts";
import { hasCompletedOnboarding } from "../../src/lib/users/profile.ts";

test("normalizes valid onboarding input", () => {
  assert.deepEqual(
    parseOnboardingInput({
      fullName: "  Test Member ",
      background: "  A brief background. ",
      countryOrRegion: " United Kingdom ",
    }),
    {
      fullName: "Test Member",
      background: "A brief background.",
      countryOrRegion: "United Kingdom",
    },
  );
});

test("rejects invalid onboarding input", () => {
  assert.throws(
    () => parseOnboardingInput({ fullName: "", background: "", countryOrRegion: "UK" }),
    InvalidOnboardingInput,
  );
  assert.throws(
    () =>
      parseOnboardingInput({
        fullName: "Test Member",
        background: "x".repeat(2001),
        countryOrRegion: "UK",
      }),
    InvalidOnboardingInput,
  );
});

test("requires the canonical onboarding state and version", () => {
  assert.equal(hasCompletedOnboarding({ onboarding: { state: "complete", version: 1 } }), true);
  assert.equal(hasCompletedOnboarding({ onboardingCompleted: true }), false);
  assert.equal(hasCompletedOnboarding({ onboarding: { state: "completed", version: 1 } }), false);
  assert.equal(hasCompletedOnboarding({ onboarding: { state: "complete", version: 2 } }), false);
});
