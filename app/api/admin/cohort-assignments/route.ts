import { cohortAssignmentManagerRoles, getAuthorizedAdmin } from "@/src/lib/auth/authorization";
import { hasAllowedOrigin } from "@/src/lib/auth/origin";
import { assignMemberToCohort, parseCohortAssignment } from "@/src/lib/cohorts/repository";
import { apiError, noStoreJson } from "@/src/lib/http/responses";

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) return noStoreJson({ error: "Invalid origin" }, 403);
  const actor = await getAuthorizedAdmin(cohortAssignmentManagerRoles);
  if (!actor) return noStoreJson({ error: "Forbidden" }, 403);
  try {
    const result = await assignMemberToCohort(
      actor.uid,
      parseCohortAssignment(await request.json()),
    );
    return noStoreJson({ ok: true, ...result });
  } catch (error) {
    return apiError(error);
  }
}
