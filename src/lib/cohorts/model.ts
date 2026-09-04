import {
  assertExactKeys,
  boundedString,
  calendarDate,
  ianaTimezone,
  InvalidInput,
  isoInstant,
} from "../validation/values.ts";

export const cohortStatuses = ["draft", "open", "active", "completed", "archived"] as const;
export type CohortStatus = (typeof cohortStatuses)[number];

export type CohortInput = {
  name: string;
  startDate: string;
  timezone: string;
  enrollmentOpenAt: Date;
  enrollmentCutoffAt: Date;
  status: CohortStatus;
};

export type CohortView = Omit<CohortInput, "enrollmentOpenAt" | "enrollmentCutoffAt"> & {
  id: string;
  enrollmentOpenAt: string;
  enrollmentCutoffAt: string;
  createdAt: string | null;
  updatedAt: string | null;
};

const cohortKeys = [
  "name",
  "startDate",
  "timezone",
  "enrollmentOpenAt",
  "enrollmentCutoffAt",
  "status",
] as const;

export function parseCohortInput(value: unknown): CohortInput {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new InvalidInput("Cohort details are required.");
  const input = value as Record<string, unknown>;
  assertExactKeys(input, cohortKeys);
  const enrollmentOpenAt = isoInstant(input.enrollmentOpenAt, "Enrollment open time");
  const enrollmentCutoffAt = isoInstant(input.enrollmentCutoffAt, "Enrollment cutoff time");
  if (enrollmentOpenAt.getTime() >= enrollmentCutoffAt.getTime())
    throw new InvalidInput("Enrollment must open before its cutoff.");
  if (typeof input.status !== "string" || !cohortStatuses.includes(input.status as CohortStatus))
    throw new InvalidInput("Cohort status is invalid.");
  return {
    name: boundedString(input.name, "Name", 120),
    startDate: calendarDate(input.startDate, "Start date"),
    timezone: ianaTimezone(input.timezone),
    enrollmentOpenAt,
    enrollmentCutoffAt,
    status: input.status as CohortStatus,
  };
}
