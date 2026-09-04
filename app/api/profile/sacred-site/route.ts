import { FieldValue } from "firebase-admin/firestore";

import { hasAllowedOrigin } from "@/src/lib/auth/origin";
import { getSession } from "@/src/lib/auth/session";
import { adminFirestore } from "@/src/lib/firebase/admin";
import { noStoreJson } from "@/src/lib/http/responses";
import { hasCompletedOnboarding } from "@/src/lib/users/profile";
import { documentId, InvalidInput } from "@/src/lib/validation/values";

export async function PATCH(request: Request) {
  if (!hasAllowedOrigin(request)) return noStoreJson({ error: "Invalid origin" }, 403);
  const session = await getSession();
  if (!session?.uid || !session.email_verified) return noStoreJson({ error: "Forbidden" }, 403);
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (
      !body ||
      typeof body !== "object" ||
      Object.keys(body).some((key) => key !== "sacredSiteId")
    )
      throw new InvalidInput("Only a Sacred Site may be changed here.");
    const sacredSiteId = documentId(body.sacredSiteId, "Sacred Site ID");
    const userReference = adminFirestore.doc(`users/${session.uid}`);
    const siteReference = adminFirestore.doc(`sacredSites/${sacredSiteId}`);
    await adminFirestore.runTransaction(async (transaction) => {
      const [user, site] = await Promise.all([
        transaction.get(userReference),
        transaction.get(siteReference),
      ]);
      if (!user.exists || !hasCompletedOnboarding(user.data()))
        throw new InvalidInput("Member profile is unavailable.");
      if (!site.exists || site.data()?.active !== true)
        throw new InvalidInput("Select an active Sacred Site.");
      transaction.update(userReference, {
        sacredSiteId,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    return noStoreJson({ ok: true, sacredSiteId });
  } catch (error) {
    if (error instanceof InvalidInput) return noStoreJson({ error: error.message }, 400);
    return noStoreJson({ error: "Unable to update the Sacred Site." }, 500);
  }
}
