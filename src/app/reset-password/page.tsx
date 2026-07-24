import { AuthShell } from "@/components/shells/auth-shell";
import { PasswordUpdateForm } from "@/modules/identity/ui/password-update-form";

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
