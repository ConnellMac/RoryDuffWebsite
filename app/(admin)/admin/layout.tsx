import type { ReactNode } from "react";
import { requireAdmin } from "@/src/lib/auth/session";

export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <section>
      <p>Authorized administration boundary</p>
      {children}
    </section>
  );
}
