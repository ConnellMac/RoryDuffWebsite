import { redirect } from "next/navigation";

import { getSession, requireOnboardedMember } from "@/src/lib/auth/session";
import { adminFirestore } from "@/src/lib/firebase/admin";
import {
  hasCompletedOnboarding,
  isUserRole,
  type UserProfile,
  type UserRole,
} from "@/src/lib/users/profile";

export const sacredSiteManagerRoles: readonly UserRole[] = ["super_admin", "content_admin"];
export const cohortDefinitionManagerRoles: readonly UserRole[] = ["super_admin"];
export const cohortAssignmentManagerRoles: readonly UserRole[] = [
  "super_admin",
  "member_support_operations",
];
export const cohortViewerRoles: readonly UserRole[] = ["super_admin", "member_support_operations"];

export async function requireAdminRole(allowedRoles: readonly UserRole[]) {
  const member = await requireOnboardedMember();
  if (!isUserRole(member.profile?.role) || !allowedRoles.includes(member.profile.role))
    redirect("/admin?notice=permission-denied");
  return member as {
    session: Awaited<ReturnType<typeof getSession>> & { uid: string };
    profile: UserProfile;
  };
}

export async function getAuthorizedAdmin(allowedRoles: readonly UserRole[]) {
  const session = await getSession();
  if (!session?.uid || !session.email_verified) return null;
  const snapshot = await adminFirestore.doc(`users/${session.uid}`).get();
  const profile = snapshot.data();
  if (
    !snapshot.exists ||
    !hasCompletedOnboarding(profile) ||
    !isUserRole(profile.role) ||
    !allowedRoles.includes(profile.role)
  )
    return null;
  return { uid: session.uid, role: profile.role, profile };
}
