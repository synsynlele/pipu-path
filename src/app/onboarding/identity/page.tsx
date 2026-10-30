import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Surface } from "@/components/ui/surface";
import { getIdentityState } from "@/modules/identity/infrastructure/identity-dal";
import { CheckpointForm } from "@/modules/identity/ui/checkpoint-form";

export const metadata: Metadata = {
  title: "Identity setup",
  robots: { index: false, follow: false },
};

export default async function IdentityCheckpointPage() {
  const state = await getIdentityState();
  if (!state.user) redirect("/login?next=/onboarding/identity");
  if (state.checkpoint?.status === "completed") redirect("/real-quests");

  return (
    <OnboardingShell
      activeStep={1}
      title="Let’s get you ready to build."
      description="Tell us what to call you, then choose your privacy settings."
    >
      <Surface className="p-5 sm:p-7">
        <CheckpointForm />
      </Surface>
    </OnboardingShell>
  );
}
