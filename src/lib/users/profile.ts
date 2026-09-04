export type UserRole = "member" | "super_admin" | "content_admin" | "member_support_operations";
export const adminRoles: readonly UserRole[] = [
  "super_admin",
  "content_admin",
  "member_support_operations",
];
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

export function isUserRole(value: unknown): value is UserRole {
  return (
    value === "member" ||
    value === "super_admin" ||
    value === "content_admin" ||
    value === "member_support_operations"
  );
}

export function isAdminRole(value: unknown): value is Exclude<UserRole, "member"> {
  return isUserRole(value) && value !== "member";
}
