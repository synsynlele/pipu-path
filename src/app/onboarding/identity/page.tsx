import { redirect } from "next/navigation";
import { AuthShell } from "@/components/shells/auth-shell";
import { getIdentityState } from "@/modules/identity/infrastructure/identity-dal";
import { CheckpointForm } from "@/modules/identity/ui/checkpoint-form";

export default async function IdentityCheckpointPage() {
  const state = await getIdentityState();
  if (!state.user) redirect("/login?next=/onboarding/identity");
  if (state.checkpoint?.status === "completed") redirect("/app");
  return (
    <AuthShell
      title="Your identity checkpoint"
      description="Share only the minimum information needed to establish your private PipuPath identity."
    >
      <CheckpointForm />
    </AuthShell>
  );
}
Ÿ®8