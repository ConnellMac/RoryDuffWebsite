import { SacredSiteSelector } from "@/src/components/sacred-site-selector";
import { requireOnboardedMember } from "@/src/lib/auth/session";
import { getCohort } from "@/src/lib/cohorts/repository";
import { getSacredSite, listActiveSacredSites } from "@/src/lib/sacred-sites/repository";
export default async function ProfilePage() {
  const { profile } = await requireOnboardedMember();
  const sacredSiteId = profile?.sacredSiteId ? String(profile.sacredSiteId) : null;
  const cohortId = profile?.cohortId ? String(profile.cohortId) : null;
  const [selectedSite, activeSites, cohort] = await Promise.all([
    sacredSiteId ? getSacredSite(sacredSiteId) : null,
    listActiveSacredSites(),
    cohortId ? getCohort(cohortId) : null,
  ]);
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
        <dd>
          {selectedSite
            ? `${selectedSite.name}${selectedSite.active ? "" : " (inactive)"}`
            : "Not selected"}
        </dd>
        <dt>Cohort</dt>
        <dd>{cohort ? `${cohort.name} — ${cohort.status}` : "Not assigned yet"}</dd>
        {cohort && (
          <>
            <dt>Cohort start</dt>
            <dd>
              {cohort.startDate} ({cohort.timezone})
            </dd>
          </>
        )}
      </dl>
      <SacredSiteSelector sites={activeSites} currentSiteId={sacredSiteId} />
    </article>
  );
}
