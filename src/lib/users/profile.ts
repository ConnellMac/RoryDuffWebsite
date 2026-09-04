export type UserRole = "member" | "super_admin" | "content_admin" | "member_support_operations";
export type UserProfile = {
  uid: string;
  fullName: string;
  email: string;
  background: string;
  countryOrRegion: string;
  sacredSiteId: string | null;
  cohortId: string | null;
  role: UserRole;
  onboarding: { state: "complete"; version: 1 };
  createdAt: unknown;
  updatedAt: unknown;
};

export function hasCompletedOnboarding(value: unknown): value is UserProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as { onboarding?: { state?: unknown; version?: unknown } };
  return profile.onboarding?.state === "complete" && profile.onboarding.version === 1;
}
