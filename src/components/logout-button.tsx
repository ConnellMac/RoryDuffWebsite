"use client";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { clearServerSession } from "@/src/lib/auth/client-session";
import { clientAuth } from "@/src/lib/firebase/client";
export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await Promise.all([signOut(clientAuth), clearServerSession()]);
        router.replace("/login");
      }}
    >
      Log out
    </button>
  );
}
