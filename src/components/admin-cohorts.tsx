"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { cohortStatuses, type CohortStatus, type CohortView } from "@/src/lib/cohorts/model";
import type { CohortMemberView } from "@/src/lib/cohorts/repository";

type CohortFormValues = {
  name: string;
  startDate: string;
  timezone: string;
  enrollmentOpenAt: string;
  enrollmentCutoffAt: string;
  status: CohortStatus;
};

const emptyCohort: CohortFormValues = {
  name: "",
  startDate: "",
  timezone: "UTC",
  enrollmentOpenAt: "",
  enrollmentCutoffAt: "",
  status: "draft",
};

function values(form: HTMLFormElement): CohortFormValues {
  const data = new FormData(form);
  return {
    name: String(data.get("name") ?? ""),
    startDate: String(data.get("startDate") ?? ""),
    timezone: String(data.get("timezone") ?? ""),
    enrollmentOpenAt: String(data.get("enrollmentOpenAt") ?? ""),
    enrollmentCutoffAt: String(data.get("enrollmentCutoffAt") ?? ""),
    status: String(data.get("status") ?? "") as CohortStatus,
  };
}

function CohortForm({ cohort }: { cohort?: CohortView }) {
  const router = useRouter();
  const initial = cohort ?? emptyCohort;
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setMessage("");
    const response = await fetch(
      cohort ? `/api/admin/cohorts/${cohort.id}` : "/api/admin/cohorts",
      {
        method: cohort ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values(form)),
      },
    );
    const result = (await response.json()) as { error?: string; ok?: boolean };
    setBusy(false);
    if (!response.ok || result.ok !== true) {
      setMessage(result.error ?? "Unable to save the cohort.");
      return;
    }
    setMessage(cohort ? "Cohort updated." : "Cohort created.");
    if (!cohort) form.reset();
    router.refresh();
  }
  return (
    <form className="admin-form" onSubmit={submit}>
      <label>
        Name
        <input name="name" defaultValue={initial.name} maxLength={120} required />
      </label>
      <label>
        Start date
        <input name="startDate" type="date" defaultValue={initial.startDate} required />
      </label>
      <label>
        Timezone
        <input name="timezone" defaultValue={initial.timezone} maxLength={100} required />
      </label>
      <label>
        Enrollment opens (ISO instant)
        <input
          name="enrollmentOpenAt"
          defaultValue={initial.enrollmentOpenAt}
          placeholder="2026-10-01T09:00:00Z"
          required
        />
      </label>
      <label>
        Enrollment cutoff (ISO instant)
        <input
          name="enrollmentCutoffAt"
          defaultValue={initial.enrollmentCutoffAt}
          placeholder="2026-10-20T17:00:00Z"
          required
        />
      </label>
      <label>
        Status
        <select name="status" defaultValue={initial.status}>
          {cohortStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={busy}>
        {busy ? "Saving…" : cohort ? "Save changes" : "Create cohort"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}

function AssignmentForm({
  cohorts,
  members,
}: {
  cohorts: CohortView[];
  members: CohortMemberView[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const eligible = cohorts.filter(
    (cohort) => cohort.status === "open" || cohort.status === "active",
  );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setMessage("");
    const data = new FormData(form);
    const response = await fetch("/api/admin/cohort-assignments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        uid: data.get("uid"),
        cohortId: data.get("cohortId"),
        reason: data.get("reason"),
      }),
    });
    const result = (await response.json()) as { error?: string; ok?: boolean };
    setBusy(false);
    setMessage(
      result.ok
        ? "Member cohort assignment updated."
        : (result.error ?? "Unable to assign member."),
    );
    if (response.ok) router.refresh();
  }
  return (
    <form className="admin-form" onSubmit={submit}>
      <label>
        Member
        <select name="uid" required>
          <option value="">Select a member</option>
          {members.map((member) => (
            <option key={member.uid} value={member.uid}>
              {member.fullName} — {member.email}
            </option>
          ))}
        </select>
      </label>
      <label>
        Cohort
        <select name="cohortId" required>
          <option value="">Select a cohort</option>
          {eligible.map((cohort) => (
            <option key={cohort.id} value={cohort.id}>
              {cohort.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Reason
        <input name="reason" maxLength={500} required />
      </label>
      <button type="submit" disabled={busy || eligible.length === 0}>
        {busy ? "Saving…" : "Assign or transfer member"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}

export function AdminCohorts({
  cohorts,
  members,
  canManageDefinitions,
  canAssign,
}: {
  cohorts: CohortView[];
  members: CohortMemberView[];
  canManageDefinitions: boolean;
  canAssign: boolean;
}) {
  return (
    <>
      {canManageDefinitions && (
        <section>
          <h2>Create cohort</h2>
          <CohortForm />
        </section>
      )}
      <section>
        <h2>Cohorts</h2>
        {cohorts.length === 0 ? (
          <p>No cohorts yet.</p>
        ) : (
          cohorts.map((cohort) => (
            <details key={cohort.id}>
              <summary>
                {cohort.name} — {cohort.status}
              </summary>
              <dl>
                <dt>Start</dt>
                <dd>{cohort.startDate}</dd>
                <dt>Timezone</dt>
                <dd>{cohort.timezone}</dd>
                <dt>Enrollment</dt>
                <dd>
                  {cohort.enrollmentOpenAt} to {cohort.enrollmentCutoffAt}
                </dd>
              </dl>
              {canManageDefinitions && <CohortForm cohort={cohort} />}
              <h3>Assigned members</h3>
              <ul>
                {members
                  .filter((member) => member.cohortId === cohort.id)
                  .map((member) => (
                    <li key={member.uid}>
                      {member.fullName} — {member.email}
                    </li>
                  ))}
              </ul>
            </details>
          ))
        )}
      </section>
      {canAssign && (
        <section>
          <h2>Assign or transfer member</h2>
          <AssignmentForm cohorts={cohorts} members={members} />
        </section>
      )}
    </>
  );
}
