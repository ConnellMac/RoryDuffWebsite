"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import type { SacredSiteInput, SacredSiteView } from "@/src/lib/sacred-sites/model";

const emptySite: SacredSiteInput = {
  name: "",
  country: "",
  region: "",
  latitude: 0,
  longitude: 0,
  timezone: "UTC",
  description: "",
  active: true,
};

function values(form: HTMLFormElement): SacredSiteInput {
  const data = new FormData(form);
  return {
    name: String(data.get("name") ?? ""),
    country: String(data.get("country") ?? ""),
    region: String(data.get("region") ?? ""),
    latitude: Number(data.get("latitude")),
    longitude: Number(data.get("longitude")),
    timezone: String(data.get("timezone") ?? ""),
    description: String(data.get("description") ?? ""),
    active: data.get("active") === "true",
  };
}

function SiteForm({ site }: { site?: SacredSiteView }) {
  const router = useRouter();
  const initial = site ?? emptySite;
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setMessage("");
    const response = await fetch(
      site ? `/api/admin/sacred-sites/${site.id}` : "/api/admin/sacred-sites",
      {
        method: site ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values(form)),
      },
    );
    const result = (await response.json()) as { error?: string; ok?: boolean };
    setBusy(false);
    if (!response.ok || result.ok !== true) {
      setMessage(result.error ?? "Unable to save the Sacred Site.");
      return;
    }
    setMessage(site ? "Sacred Site updated." : "Sacred Site created.");
    if (!site) form.reset();
    router.refresh();
  }

  async function toggleActive() {
    if (!site) return;
    setBusy(true);
    const response = await fetch(`/api/admin/sacred-sites/${site.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: site.name,
        country: site.country,
        region: site.region,
        latitude: site.latitude,
        longitude: site.longitude,
        timezone: site.timezone,
        description: site.description,
        active: !site.active,
      }),
    });
    const result = (await response.json()) as { error?: string; ok?: boolean };
    setBusy(false);
    setMessage(
      result.ok
        ? site.active
          ? "Sacred Site deactivated."
          : "Sacred Site reactivated."
        : (result.error ?? "Unable to update status."),
    );
    if (response.ok) router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <label>
        Name
        <input name="name" defaultValue={initial.name} maxLength={120} required />
      </label>
      <label>
        Country
        <input name="country" defaultValue={initial.country} maxLength={120} required />
      </label>
      <label>
        Region
        <input name="region" defaultValue={initial.region} maxLength={120} />
      </label>
      <label>
        Latitude
        <input
          name="latitude"
          type="number"
          step="any"
          min={-90}
          max={90}
          defaultValue={initial.latitude}
          required
        />
      </label>
      <label>
        Longitude
        <input
          name="longitude"
          type="number"
          step="any"
          min={-180}
          max={180}
          defaultValue={initial.longitude}
          required
        />
      </label>
      <label>
        Timezone
        <input name="timezone" defaultValue={initial.timezone} maxLength={100} required />
      </label>
      <label>
        Description
        <textarea name="description" defaultValue={initial.description} maxLength={4000} />
      </label>
      <label>
        Status
        <select name="active" defaultValue={String(initial.active)}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </label>
      <button type="submit" disabled={busy}>
        {busy ? "Saving…" : site ? "Save changes" : "Create Sacred Site"}
      </button>
      {site && (
        <button type="button" disabled={busy} onClick={toggleActive}>
          {site.active ? "Deactivate" : "Reactivate"}
        </button>
      )}
      {message && <p role="status">{message}</p>}
    </form>
  );
}

export function AdminSacredSites({ sites }: { sites: SacredSiteView[] }) {
  return (
    <>
      <section>
        <h2>Create Sacred Site</h2>
        <SiteForm />
      </section>
      <section>
        <h2>Existing Sacred Sites</h2>
        {sites.length === 0 ? (
          <p>No Sacred Sites yet.</p>
        ) : (
          sites.map((site) => (
            <details key={site.id}>
              <summary>
                {site.name} — {site.active ? "Active" : "Inactive"}
              </summary>
              <SiteForm site={site} />
            </details>
          ))
        )}
      </section>
    </>
  );
}
