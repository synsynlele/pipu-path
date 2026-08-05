import type { Metadata } from "next";
import { AuthShell } from "@/components/shells/auth-shell";
import { PasswordUpdateForm } from "@/modules/identity/ui/password-update-form";
export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      description="A valid recovery session is required to update your password."
    >
      <PasswordUpdateForm />
    </AuthShell>
  );
}
