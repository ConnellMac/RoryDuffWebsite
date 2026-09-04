import Link from "next/link";
import { AuthForm } from "@/src/components/auth-form";
export default function ForgotPasswordPage() {
  return (
    <>
      <AuthForm mode="reset" />
      <p>
        <Link href="/login">Return to login</Link>
      </p>
    </>
  );
}
