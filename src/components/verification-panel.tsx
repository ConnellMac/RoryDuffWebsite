"use client";
import { sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createServerSession } from "@/src/lib/auth/client-session";
import { clientAuth } from "@/src/lib/firebase/client";
export function VerificationPanel() {
  const router = useRouter();
  const [message, setMessage] = useState("Check your inbox, then return here.");
  async function checked() {
    const user = clientAuth.currentUser;
    if (!user) {
      router.replace("/login");
      return;
    }
    await user.reload();
    if (!user.emailVerified) {
      setMessage("Email is not verified yet.");
      return;
    }
    await createServerSession(user);
    router.replace("/onboarding");
  }
  return (
    <section className="auth-card">
      <h1>Verify your email</h1>
      <p role="status">{message}</p>
      <button onClick={checked}>I have verified my email</button>
      <button
        onClick={async () => {
          if (clientAuth.currentUser) {
            await sendEmailVerification(clientAuth.currentUser);
            setMessage("Verification email sent again.");
          }
        }}
      >
        Resend email
      </button>
    </section>
  );
}
