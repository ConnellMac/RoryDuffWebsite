import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import type { CohortInput, CohortView } from "@/src/lib/cohorts/model";
import { adminFirestore } from "@/src/lib/firebase/admin";
import { timestampIso } from "@/src/lib/firestore/serialize";
import { boundedString, documentId, InvalidInput } from "@/src/lib/validation/values";

function toView(data: FirebaseFirestore.DocumentData): CohortView {
  return {
    id: String(data.id),
    name: String(data.name),
    startDate: String(data.startDate),
    timezone: String(data.timezone),
    enrollmentOpenAt: timestampIso(data.enrollmentOpenAt) ?? "",
    enrollmentCutoffAt: timestampIso(data.enrollmentCutoffAt) ?? "",
    status: data.status,
    createdAt: timestampIso(data.createdAt),
    updatedAt: timestampIso(data.updatedAt),
  };
}

export async function listCohorts() {
  const snapshot = await adminFirestore.collection("cohorts").orderBy("startDate", "desc").get();
  return snapshot.docs.map((document) => toView(document.data()));
}

export async function getCohort(id: string) {
  const snapshot = await adminFirestore.doc(`cohorts/${id}`).get();
  return snapshot.exists ? toView(snapshot.data()!) : null;
}

export async function createCohort(actorId: string, input: CohortInput) {
  const reference = adminFirestore.collection("cohorts").doc();
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
    action: "cohort.create",
    resourceType: "cohort",
    resourceId: reference.id,
    occurredAt: FieldValue.serverTimestamp(),
    metadata: { status: input.status },
  });
  await batch.commit();
  return reference.id;
}

export async function updateCohort(actorId: string, id: string, input: CohortInput) {
  const reference = adminFirestore.doc(`cohorts/${id}`);
  const auditReference = adminFirestore.collection("auditEvents").doc();
  return adminFirestore.runTransaction(async (transaction) => {
    const existing = await transaction.get(reference);
    if (!existing.exists) return false;
    transaction.update(reference, { ...input, updatedAt: FieldValue.serverTimestamp() });
    transaction.create(auditReference, {
      actorType: "admin",
      actorId,
      action: "cohort.update",
      resourceType: "cohort",
      resourceId: id,
      occurredAt: FieldValue.serverTimestamp(),
      metadata: { previousStatus: existing.data()?.status, status: input.status },
    });
    return true;
  });
}

export type CohortMemberView = {
  uid: string;
  fullName: string;
  email: string;
  cohortId: string | null;
};

export async function listCohortMembers(cohortId: string) {
  const snapshot = await adminFirestore.collection("users").where("cohortId", "==", cohortId).get();
  return snapshot.docs.map(
    (document) =>
      ({
        uid: document.id,
        fullName: String(document.data().fullName),
        email: String(document.data().email),
        cohortId: String(document.data().cohortId),
      }) satisfies CohortMemberView,
  );
}

export async function listAssignableMembers() {
  const snapshot = await adminFirestore.collection("users").orderBy("fullName").get();
  return snapshot.docs
    .filter((document) => document.data().role === "member")
    .map(
      (document) =>
        ({
          uid: document.id,
          fullName: String(document.data().fullName),
          email: String(document.data().email),
          cohortId: document.data().cohortId ? String(document.data().cohortId) : null,
        }) satisfies CohortMemberView,
    );
}

export function parseCohortAssignment(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new InvalidInput("Assignment details are required.");
  const input = value as Record<string, unknown>;
  const keys = Object.keys(input);
  if (keys.some((key) => !["uid", "cohortId", "reason"].includes(key)))
    throw new InvalidInput("Unexpected assignment field.");
  return {
    uid: documentId(input.uid, "Member ID"),
    cohortId: documentId(input.cohortId, "Cohort ID"),
    reason: boundedString(input.reason, "Assignment reason", 500),
  };
}

export async function assignMemberToCohort(
  actorId: string,
  assignment: ReturnType<typeof parseCohortAssignment>,
) {
  const userReference = adminFirestore.doc(`users/${assignment.uid}`);
  const cohortReference = adminFirestore.doc(`cohorts/${assignment.cohortId}`);
  const auditReference = adminFirestore.collection("auditEvents").doc();
  return adminFirestore.runTransaction(async (transaction) => {
    const [user, cohort] = await Promise.all([
      transaction.get(userReference),
      transaction.get(cohortReference),
    ]);
    if (!user.exists) throw new InvalidInput("Member does not exist.");
    if (user.data()?.role !== "member") throw new InvalidInput("Only members may join a cohort.");
    if (!cohort.exists) throw new InvalidInput("Cohort does not exist.");
    if (!new Set(["open", "active"]).has(String(cohort.data()?.status)))
      throw new InvalidInput("Members can only be assigned to open or active cohorts.");
    const previousCohortId = user.data()?.cohortId ? String(user.data()?.cohortId) : null;
    transaction.update(userReference, {
      cohortId: assignment.cohortId,
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.create(auditReference, {
      actorType: "admin",
      actorId,
      action: previousCohortId ? "cohort.transfer" : "cohort.assign",
      resourceType: "user",
      resourceId: assignment.uid,
      occurredAt: FieldValue.serverTimestamp(),
      metadata: {
        previousCohortId,
        cohortId: assignment.cohortId,
        reason: assignment.reason,
      },
    });
    return { previousCohortId, cohortId: assignment.cohortId };
  });
}
