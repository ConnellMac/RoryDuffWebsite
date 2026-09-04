import {
  cohortDefinitionManagerRoles,
  cohortViewerRoles,
  getAuthorizedAdmin,
} from "@/src/lib/auth/authorization";
import { hasAllowedOrigin } from "@/src/lib/auth/origin";
import { createCohort, listCohorts } from "@/src/lib/cohorts/repository";
import { parseCohortInput } from "@/src/lib/cohorts/model";
import { apiError, noStoreJson } from "@/src/lib/http/responses";

export async function GET() {
  if (!(await getAuthorizedAdmin(cohortViewerRoles)))
    return noStoreJson({ error: "Forbidden" }, 403);
  return noStoreJson({ cohorts: await listCohorts() });
}

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) return noStoreJson({ error: "Invalid origin" }, 403);
  const actor = await getAuthorizedAdmin(cohortDefinitionManagerRoles);
  if (!actor) return noStoreJson({ error: "Forbidden" }, 403);
  try {
    const id = await createCohort(actor.uid, parseCohortInput(await request.json()));
    return noStoreJson({ ok: true, id }, 201);
  } catch (error) {
    return apiError(error);
  }
}
