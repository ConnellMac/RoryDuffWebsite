import Link from "next/link";
import { AuthForm } from "@/src/components/auth-form";
export default function SignupPage() {
  return (
    <>
      <AuthForm mode="signup" />
      <p>
        <Link href="/login">Already have an account?</Link>
      </p>
    </>
  );
}
