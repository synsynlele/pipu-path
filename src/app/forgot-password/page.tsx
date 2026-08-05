import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/shells/auth-shell";
import { requestPasswordResetAction } from "@/modules/identity/application/auth-actions";
import { AuthForm } from "@/modules/identity/ui/auth-form";
export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recover your account"
      description="We will send recovery instructions if the address belongs to an account."
    >
      <AuthForm
        action={requestPasswordResetAction}
        submitLabel="Send recovery email"
        password={false}
      />
      <p className="text-muted mt-6 text-center text-sm">
        <Link href="/login">Return to sign in</Link>
      </p>
    </AuthShell>
  );
}
