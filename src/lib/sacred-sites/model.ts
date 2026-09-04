import {
  assertExactKeys,
  boundedString,
  finiteNumber,
  ianaTimezone,
  InvalidInput,
} from "../validation/values.ts";

export type SacredSiteInput = {
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
  description: string;
  active: boolean;
};

export type SacredSiteView = SacredSiteInput & {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
};

const sacredSiteKeys = [
  "name",
  "country",
  "region",
  "latitude",
  "longitude",
  "timezone",
  "description",
  "active",
] as const;

export function parseSacredSiteInput(value: unknown): SacredSiteInput {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new InvalidInput("Sacred Site details are required.");
  const input = value as Record<string, unknown>;
  assertExactKeys(input, sacredSiteKeys);
  if (typeof input.active !== "boolean") throw new InvalidInput("Active must be a boolean.");
  return {
    name: boundedString(input.name, "Name", 120),
    country: boundedString(input.country, "Country", 120),
    region: boundedString(input.region, "Region", 120, false),
    latitude: finiteNumber(input.latitude, "Latitude", -90, 90),
    longitude: finiteNumber(input.longitude, "Longitude", -180, 180),
    timezone: ianaTimezone(input.timezone),
    description: boundedString(input.description, "Description", 4000, false),
    active: input.active,
  };
}
