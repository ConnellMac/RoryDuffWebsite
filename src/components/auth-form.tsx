"use client";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createServerSession } from "@/src/lib/auth/client-session";
import { clientAuth } from "@/src/lib/firebase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" | "reset" }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "").trim();
    const password = String(values.get("password") ?? "");
    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(clientAuth, email);
        setMessage("Password reset email requested.");
        return;
      }
      const credential =
        mode === "signup"
          ? await createUserWithEmailAndPassword(clientAuth, email, password)
          : await signInWithEmailAndPassword(clientAuth, email, password);
      if (!credential.user.emailVerified) {
        await sendEmailVerification(credential.user);
        router.replace("/verify-email");
        return;
      }
      await createServerSession(credential.user);
      router.replace("/members");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Reset password";
  return (
    <section className="auth-card">
      <h1>{title}</h1>
      <form onSubmit={submit}>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        {mode !== "reset" && (
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </label>
        )}
        <button disabled={busy} type="submit">
          {busy ? "Please wait…" : title}
        </button>
      </form>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
