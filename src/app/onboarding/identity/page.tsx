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
  if (state.checkpoint?.status === "completed") redirect("/continue");

  return (
    <OnboardingShell
      activeStep={1}
      title="First, let PipuPath know you."
      description="Set up the minimum private identity PipuPath needs to guide you safely. This is not a public profile."
    >
      <Surface className="p-5 sm:p-7">
        <div className="border-border mb-6 flex items-start gap-3 border-b pb-5">
          <span
            aria-hidden="true"
            className="bg-primary-soft text-primary-light grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold"
          >
            1
          </span>
          <div>
            <h2 className="text-navy font-semibold">Your private identity</h2>
            <p className="text-muted mt-1 text-sm leading-5">
              Choose how PipuPath should address you and confirm the consent
              needed to continue.
            </p>
          </div>
        </div>
        <CheckpointForm />
      </Surface>
    </OnboardingShell>
  );
}
