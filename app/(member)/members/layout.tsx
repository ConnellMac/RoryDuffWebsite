import type { ReactNode } from "react";
import { LogoutButton } from "@/src/components/logout-button";
import { requireOnboardedMember } from "@/src/lib/auth/session";

export const dynamic = "force-dynamic";
export default async function MemberLayout({ children }: { children: ReactNode }) {
  await requireOnboardedMember();
  return (
    <section>
      <header>
        <p>Member area</p>
        <LogoutButton />
      </header>
      {children}
    </section>
  );
}
