import { redirect } from "next/navigation";
import { OnboardingForm } from "@/src/components/onboarding-form";
import { getSession } from "@/src/lib/auth/session";
export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.email_verified) redirect("/login");
  return <OnboardingForm />;
}
