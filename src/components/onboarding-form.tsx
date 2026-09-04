"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { clientAuth } from "@/src/lib/firebase/client";
export function OnboardingForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const user = clientAuth.currentUser;
    if (!user?.emailVerified) {
      setMessage("A verified account is required.");
      return;
    }
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: String(data.get("fullName") ?? "").trim(),
          background: String(data.get("background") ?? "").trim(),
          countryOrRegion: String(data.get("countryOrRegion") ?? "").trim(),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        ok?: boolean;
        onboardingState?: string;
      };
      if (!response.ok || result.ok !== true || result.onboardingState !== "complete")
        throw new Error(result.error ?? "Unable to save profile.");
      router.replace("/members");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save profile.");
    }
  }
  return (
    <section className="auth-card">
      <h1>Complete your profile</h1>
      <form onSubmit={submit}>
        <label>
          Full name
          <input name="fullName" maxLength={120} required />
        </label>
        <label>
          Brief background
          <textarea name="background" maxLength={2000} />
        </label>
        <label>
          Country or region
          <input name="countryOrRegion" maxLength={120} required />
        </label>
        <label>
          Nearest Sacred Site
          <select name="sacredSiteId" disabled>
            <option>Sacred Sites will be available in a later phase</option>
          </select>
        </label>
        <p>Your Sacred Site can be selected when the controlled list is available.</p>
        <button type="submit">Complete onboarding</button>
      </form>
      {message && <p role="alert">{message}</p>}
    </section>
  );
}
