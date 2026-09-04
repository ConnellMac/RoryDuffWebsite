import { sacredSiteManagerRoles, getAuthorizedAdmin } from "@/src/lib/auth/authorization";
import { hasAllowedOrigin } from "@/src/lib/auth/origin";
import { apiError, noStoreJson } from "@/src/lib/http/responses";
import { parseSacredSiteInput } from "@/src/lib/sacred-sites/model";
import { createSacredSite, listSacredSites } from "@/src/lib/sacred-sites/repository";

export async function GET() {
  if (!(await getAuthorizedAdmin(sacredSiteManagerRoles)))
    return noStoreJson({ error: "Forbidden" }, 403);
  return noStoreJson({ sites: await listSacredSites() });
}

export async function POST(request: Request) {
  if (!hasAllowedOrigin(request)) return noStoreJson({ error: "Invalid origin" }, 403);
  const actor = await getAuthorizedAdmin(sacredSiteManagerRoles);
  if (!actor) return noStoreJson({ error: "Forbidden" }, 403);
  try {
    const id = await createSacredSite(actor.uid, parseSacredSiteInput(await request.json()));
    return noStoreJson({ ok: true, id }, 201);
  } catch (error) {
    return apiError(error);
  }
}
