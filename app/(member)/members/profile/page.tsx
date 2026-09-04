import { requireOnboardedMember } from "@/src/lib/auth/session";
export default async function ProfilePage() {
  const { profile } = await requireOnboardedMember();
  return (
    <article>
      <p>Member profile</p>
      <h1>{String(profile?.fullName)}</h1>
      <dl>
        <dt>Email</dt>
        <dd>{String(profile?.email)}</dd>
        <dt>Country or region</dt>
        <dd>{String(profile?.countryOrRegion)}</dd>
        <dt>Sacred Site</dt>
        <dd>{profile?.sacredSiteId ? String(profile.sacredSiteId) : "Not available yet"}</dd>
        <dt>Cohort</dt>
        <dd>{profile?.cohortId ? String(profile.cohortId) : "Not assigned yet"}</dd>
      </dl>
    </article>
  );
}
