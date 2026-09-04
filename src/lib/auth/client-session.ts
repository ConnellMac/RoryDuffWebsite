"use client";

import type { User } from "firebase/auth";

export async function createServerSession(user: User) {
  const idToken = await user.getIdToken(true);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) throw new Error((await response.json()).error ?? "Unable to create session");
}

export async function clearServerSession() {
  const response = await fetch("/api/auth/session", { method: "DELETE" });
  if (!response.ok) throw new Error("Unable to clear session");
}
