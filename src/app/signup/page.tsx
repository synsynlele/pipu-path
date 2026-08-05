import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/shells/auth-shell";
import { signUpAction } from "@/modules/identity/application/auth-actions";
import { AuthForm } from "@/modules/identity/ui/auth-form";
import { GoogleAuthForm } from "@/modules/identity/ui/google-auth-form";
export const metadata: Metadata = {
  title: "Start your journey",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Join PipuPath"
      description="Create a private account. Discovery begins only after your identity checkpoint."
    >
      <GoogleAuthForm next="/onboarding/identity" />
      <div className="text-muted my-5 text-center text-sm">or use email</div>
      <AuthForm action={signUpAction} submitLabel="Create account" />
      <p className="text-muted mt-6 text-center text-sm">
        Already registered? <Link href="/login">Sign in</Link>
      </p>
    </AuthShell>
  );
}
