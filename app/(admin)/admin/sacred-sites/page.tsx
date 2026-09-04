import { AdminSacredSites } from "@/src/components/admin-sacred-sites";
import { requireAdminRole, sacredSiteManagerRoles } from "@/src/lib/auth/authorization";
import { listSacredSites } from "@/src/lib/sacred-sites/repository";

export default async function SacredSitesAdminPage() {
  await requireAdminRole(sacredSiteManagerRoles);
  return (
    <article>
      <h1>Sacred Sites</h1>
      <AdminSacredSites sites={await listSacredSites()} />
    </article>
  );
}
