import { AdminCohorts } from "@/src/components/admin-cohorts";
import {
  cohortAssignmentManagerRoles,
  cohortViewerRoles,
  requireAdminRole,
} from "@/src/lib/auth/authorization";
import { listAssignableMembers, listCohorts } from "@/src/lib/cohorts/repository";

export default async function CohortsAdminPage() {
  const { profile } = await requireAdminRole(cohortViewerRoles);
  const [cohorts, members] = await Promise.all([listCohorts(), listAssignableMembers()]);
  return (
    <article>
      <h1>Cohorts</h1>
      <AdminCohorts
        cohorts={cohorts}
        members={members}
        canManageDefinitions={profile.role === "super_admin"}
        canAssign={cohortAssignmentManagerRoles.includes(profile.role)}
      />
    </article>
  );
}
