import Link from "next/link";
import { AuthForm } from "@/src/components/auth-form";
export default function LoginPage() {
  return (
    <>
      <AuthForm mode="login" />
      <p>
        <Link href="/signup">Create an account</Link> ·{" "}
        <Link href="/forgot-password">Forgot password?</Link>
      </p>
    </>
  );
}
