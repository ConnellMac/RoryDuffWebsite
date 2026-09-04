import { cohortDefinitionManagerRoles, getAuthorizedAdmin } from "@/src/lib/auth/authorization";
import { hasAllowedOrigin } from "@/src/lib/auth/origin";
import { parseCohortInput } from "@/src/lib/cohorts/model";
import { updateCohort } from "@/src/lib/cohorts/repository";
import { apiError, noStoreJson } from "@/src/lib/http/responses";
import { documentId } from "@/src/lib/validation/values";

export async function PATCH(request: Request, context: { params: Promise<{ cohortId: string }> }) {
  if (!hasAllowedOrigin(request)) return noStoreJson({ error: "Invalid origin" }, 403);
  const actor = await getAuthorizedAdmin(cohortDefinitionManagerRoles);
  if (!actor) return noStoreJson({ error: "Forbidden" }, 403);
  try {
    const cohortId = documentId((await context.params).cohortId, "Cohort ID");
    const updated = await updateCohort(actor.uid, cohortId, parseCohortInput(await request.json()));
    return updated ? noStoreJson({ ok: true }) : noStoreJson({ error: "Cohort not found" }, 404);
  } catch (error) {
    return apiError(error);
  }
}
