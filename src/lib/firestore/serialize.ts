import { Timestamp } from "firebase-admin/firestore";

export function timestampIso(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}
