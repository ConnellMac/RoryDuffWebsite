import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { adminFirestore } from "@/src/lib/firebase/admin";
import { timestampIso } from "@/src/lib/firestore/serialize";
import type { SacredSiteInput, SacredSiteView } from "@/src/lib/sacred-sites/model";

function toView(data: FirebaseFirestore.DocumentData): SacredSiteView {
  return {
    id: String(data.id),
    name: String(data.name),
    country: String(data.country),
    region: String(data.region),
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    timezone: String(data.timezone),
    description: String(data.description),
    active: data.active === true,
    createdAt: timestampIso(data.createdAt),
    updatedAt: timestampIso(data.updatedAt),
  };
}

export async function listSacredSites() {
  const snapshot = await adminFirestore.collection("sacredSites").orderBy("name").get();
  return snapshot.docs.map((document) => toView(document.data()));
}

export async function listActiveSacredSites() {
  const snapshot = await adminFirestore
    .collection("sacredSites")
    .where("active", "==", true)
    .orderBy("name")
    .get();
  return snapshot.docs.map((document) => toView(document.data()));
}

export async function getSacredSite(id: string) {
  const snapshot = await adminFirestore.doc(`sacredSites/${id}`).get();
  return snapshot.exists ? toView(snapshot.data()!) : null;
}

export async function createSacredSite(actorId: string, input: SacredSiteInput) {
  const reference = adminFirestore.collection("sacredSites").doc();
  const auditReference = adminFirestore.collection("auditEvents").doc();
  const batch = adminFirestore.batch();
  batch.create(reference, {
    id: reference.id,
    ...input,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch.create(auditReference, {
    actorType: "admin",
    actorId,
    action: "sacred_site.create",
    resourceType: "sacredSite",
    resourceId: reference.id,
    occurredAt: FieldValue.serverTimestamp(),
    metadata: { active: input.active },
  });
  await batch.commit();
  return reference.id;
}

export async function updateSacredSite(actorId: string, id: string, input: SacredSiteInput) {
  const reference = adminFirestore.doc(`sacredSites/${id}`);
  const auditReference = adminFirestore.collection("auditEvents").doc();
  return adminFirestore.runTransaction(async (transaction) => {
    const existing = await transaction.get(reference);
    if (!existing.exists) return false;
    transaction.update(reference, { ...input, updatedAt: FieldValue.serverTimestamp() });
    transaction.create(auditReference, {
      actorType: "admin",
      actorId,
      action: "sacred_site.update",
      resourceType: "sacredSite",
      resourceId: id,
      occurredAt: FieldValue.serverTimestamp(),
      metadata: {
        previousActive: existing.data()?.active === true,
        active: input.active,
      },
    });
    return true;
  });
}
