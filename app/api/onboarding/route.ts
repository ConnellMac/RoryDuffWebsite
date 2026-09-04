import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { hasAllowedOrigin } from "@/src/lib/auth/origin";
import { getSession } from "@/src/lib/auth/session";
import { adminFirestore } from "@/src/lib/firebase/admin";
import { InvalidOnboardingInput, parseOnboardingInput } from "@/src/lib/users/onboarding";
import { hasCompletedOnboarding } from "@/src/lib/users/profile";

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });

  const session = await getSession();
  if (!session?.uid || !session.email || !session.email_verified)
    return NextResponse.json({ error: "Verified session required" }, { status: 401 });

  try {
    const input = parseOnboardingInput(await request.json());
    const reference = adminFirestore.doc(`users/${session.uid}`);
    const siteReference = adminFirestore.doc(`sacredSites/${input.sacredSiteId}`);

    await adminFirestore.runTransaction(async (transaction) => {
      const [existing, site] = await Promise.all([
        transaction.get(reference),
        transaction.get(siteReference),
      ]);
      const existingProfile = existing.data();

      if (!site.exists || site.data()?.active !== true)
        throw new InvalidOnboardingInput("Select an active Sacred Site.");

      if (
        existing.exists &&
        (existingProfile?.uid !== session.uid ||
          existingProfile.email !== session.email ||
          existingProfile.role !== "member")
      ) {
        throw new ExistingProfileConflict();
      }

      if (existing.exists) {
        transaction.update(reference, {
          fullName: input.fullName,
          background: input.background,
          countryOrRegion: input.countryOrRegion,
          sacredSiteId: input.sacredSiteId,
          onboarding: { state: "complete", version: 1 },
          updatedAt: FieldValue.serverTimestamp(),
        });
        return;
      }

      transaction.create(reference, {
        uid: session.uid,
        fullName: input.fullName,
        background: input.background,
        countryOrRegion: input.countryOrRegion,
        sacredSiteId: input.sacredSiteId,
        email: session.email,
        cohortId: null,
        role: "member",
        onboarding: { state: "complete", version: 1 },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    const persisted = await reference.get();
    if (
      !persisted.exists ||
      persisted.data()?.uid !== session.uid ||
      !hasCompletedOnboarding(persisted.data())
    ) {
      throw new Error("Onboarding persistence verification failed.");
    }

    return NextResponse.json(
      { ok: true, onboardingState: "complete" },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof InvalidOnboardingInput)
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: { "cache-control": "no-store" } },
      );
    if (error instanceof ExistingProfileConflict)
      return NextResponse.json(
        { error: "Existing profile cannot be replaced" },
        { status: 409, headers: { "cache-control": "no-store" } },
      );
    return NextResponse.json(
      { error: "Unable to complete onboarding." },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }
}

class ExistingProfileConflict extends Error {}
