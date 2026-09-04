import { getAuthorizedAdmin, sacredSiteManagerRoles } from "@/src/lib/auth/authorization";
import { hasAllowedOrigin } from "@/src/lib/auth/origin";
import { apiError, noStoreJson } from "@/src/lib/http/responses";
import { parseSacredSiteInput } from "@/src/lib/sacred-sites/model";
import { updateSacredSite } from "@/src/lib/sacred-sites/repository";
import { documentId } from "@/src/lib/validation/values";

export async function PATCH(request: Request, context: { params: Promise<{ siteId: string }> }) {
  if (!hasAllowedOrigin(request)) return noStoreJson({ error: "Invalid origin" }, 403);
  const actor = await getAuthorizedAdmin(sacredSiteManagerRoles);
  if (!actor) return noStoreJson({ error: "Forbidden" }, 403);
  try {
    const siteId = documentId((await context.params).siteId, "Sacred Site ID");
    const updated = await updateSacredSite(
      actor.uid,
      siteId,
      parseSacredSiteInput(await request.json()),
    );
    return updated
      ? noStoreJson({ ok: true })
      : noStoreJson({ error: "Sacred Site not found" }, 404);
  } catch (error) {
    return apiError(error);
  }
}
