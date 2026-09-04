"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type { SacredSiteView } from "@/src/lib/sacred-sites/model";

export function SacredSiteSelector({
  sites,
  currentSiteId,
}: {
  sites: SacredSiteView[];
  currentSiteId: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const sacredSiteId = String(new FormData(event.currentTarget).get("sacredSiteId") ?? "");
    try {
      const response = await fetch("/api/profile/sacred-site", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sacredSiteId }),
      });
      const result = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok || result.ok !== true)
        throw new Error(result.error ?? "Unable to update your Sacred Site.");
      setMessage("Sacred Site updated.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update your Sacred Site.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>
        Change Sacred Site
        <select name="sacredSiteId" defaultValue={currentSiteId ?? ""} required>
          <option value="">Select a Sacred Site</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name} — {site.region ? `${site.region}, ` : ""}
              {site.country}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={busy || sites.length === 0}>
        {busy ? "Saving…" : "Save Sacred Site"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
