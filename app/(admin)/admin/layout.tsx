import type { ReactNode } from "react";
import Link from "next/link";
import { LogoutButton } from "@/src/components/logout-button";
import { requireAdmin } from "@/src/lib/auth/session";

export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <section>
      <p>
        <Link href="/admin">Administration</Link> ·{" "}
        <Link href="/admin/sacred-sites">Sacred Sites</Link> ·{" "}
        <Link href="/admin/cohorts">Cohorts</Link>
      </p>
      <LogoutButton />
      {children}
    </section>
  );
}
