export type OnboardingInput = {
  fullName: string;
  background: string;
  countryOrRegion: string;
  sacredSiteId: string;
};

export class InvalidOnboardingInput extends Error {}

function boundedString(value: unknown, name: string, maximum: number, required = true) {
  if (typeof value !== "string") throw new InvalidOnboardingInput(`${name} must be text.`);

  const normalized = value.trim();
  if ((required && normalized.length === 0) || normalized.length > maximum)
    throw new InvalidOnboardingInput(`${name} is invalid.`);

  return normalized;
}

export function parseOnboardingInput(value: unknown): OnboardingInput {
  if (!value || typeof value !== "object")
    throw new InvalidOnboardingInput("Onboarding details are required.");

  const input = value as Record<string, unknown>;
  if (
    Object.keys(input).some(
      (key) => !["fullName", "background", "countryOrRegion", "sacredSiteId"].includes(key),
    )
  )
    throw new InvalidOnboardingInput("Unexpected onboarding field.");
  const sacredSiteId = boundedString(input.sacredSiteId, "Sacred Site", 128);
  if (!/^[A-Za-z0-9_-]+$/.test(sacredSiteId))
    throw new InvalidOnboardingInput("Sacred Site is invalid.");
  return {
    fullName: boundedString(input.fullName, "Full name", 120),
    background: boundedString(input.background, "Background", 2000, false),
    countryOrRegion: boundedString(input.countryOrRegion, "Country or region", 120),
    sacredSiteId,
  };
}
