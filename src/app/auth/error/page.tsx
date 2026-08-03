import { AuthShell } from "@/components/shells/auth-shell";
import { ButtonLink } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <AuthShell
      title="Authentication could not be completed"
      description="The link may be invalid, expired, cancelled, or already used."
    >
      <ButtonLink href="/login" className="w-full">
        Return to sign in
      </ButtonLink>
    </AuthShell>
  );
}
Ÿ®8