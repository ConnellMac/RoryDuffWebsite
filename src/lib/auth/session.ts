import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminAuth, adminFirestore } from "@/src/lib/firebase/admin";
import { hasCompletedOnboarding } from "@/src/lib/users/profile";

export const sessionCookieName = "__session";
export const sessionDurationMilliseconds = 5 * 24 * 60 * 60 * 1000;

export async function getSession() {
  const value = (await cookies()).get(sessionCookieName)?.value;
  if (!value) return null;
  try {
    return await adminAuth.verifySessionCookie(value, true);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.uid || !session.email_verified) redirect("/login");
  return session;
}

export async function requireOnboardedMember() {
  const session = await requireSession();
  const snapshot = await adminFirestore.doc(`users/${session.uid}`).get();
  if (!snapshot.exists || !hasCompletedOnboarding(snapshot.data())) redirect("/onboarding");
  return { session, profile: snapshot.data() };
}

export async function requireAdmin() {
  const member = await requireOnboardedMember();
  if (member.profile?.role !== "super_admin") redirect("/members?notice=admin-denied");
  return member;
}
