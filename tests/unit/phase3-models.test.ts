import assert from "node:assert/strict";
import test from "node:test";

import { parseCohortInput } from "../../src/lib/cohorts/model.ts";
import { parseSacredSiteInput } from "../../src/lib/sacred-sites/model.ts";
import { InvalidInput } from "../../src/lib/validation/values.ts";

test("validates and normalizes Sacred Site input", () => {
  assert.deepEqual(
    parseSacredSiteInput({
      name: "  Glastonbury ",
      country: " United Kingdom ",
      region: " Somerset ",
      latitude: 51.15,
      longitude: -2.71,
      timezone: "Europe/London",
      description: " Site description ",
      active: true,
    }),
    {
      name: "Glastonbury",
      country: "United Kingdom",
      region: "Somerset",
      latitude: 51.15,
      longitude: -2.71,
      timezone: "Europe/London",
      description: "Site description",
      active: true,
    },
  );
});

test("rejects malformed Sacred Site fields", () => {
  const valid = {
    name: "Site",
    country: "UK",
    region: "",
    latitude: 51,
    longitude: -2,
    timezone: "Europe/London",
    description: "",
    active: true,
  };
  assert.throws(() => parseSacredSiteInput({ ...valid, latitude: 91 }), InvalidInput);
  assert.throws(() => parseSacredSiteInput({ ...valid, longitude: -181 }), InvalidInput);
  assert.throws(() => parseSacredSiteInput({ ...valid, timezone: "Not/A_Timezone" }), InvalidInput);
  assert.throws(() => parseSacredSiteInput({ ...valid, active: "yes" }), InvalidInput);
  assert.throws(() => parseSacredSiteInput({ ...valid, role: "super_admin" }), InvalidInput);
});

test("validates cohort dates, ordering, timezone, and status", () => {
  const input = {
    name: "Autumn Cohort",
    startDate: "2026-10-27",
    timezone: "Europe/London",
    enrollmentOpenAt: "2026-09-01T09:00:00Z",
    enrollmentCutoffAt: "2026-10-20T17:00:00Z",
    status: "open",
  };
  const cohort = parseCohortInput(input);
  assert.equal(cohort.name, "Autumn Cohort");
  assert.equal(cohort.enrollmentOpenAt.toISOString(), "2026-09-01T09:00:00.000Z");
  assert.throws(
    () =>
      parseCohortInput({
        ...input,
        enrollmentOpenAt: "2026-10-21T00:00:00Z",
        enrollmentCutoffAt: "2026-10-20T00:00:00Z",
      }),
    InvalidInput,
  );
  assert.throws(() => parseCohortInput({ ...input, startDate: "2026-02-30" }), InvalidInput);
  assert.throws(() => parseCohortInput({ ...input, timezone: "GMT+99" }), InvalidInput);
  assert.throws(() => parseCohortInput({ ...input, status: "running" }), InvalidInput);
  assert.throws(() => parseCohortInput({ ...input, cohortId: "unexpected" }), InvalidInput);
});
