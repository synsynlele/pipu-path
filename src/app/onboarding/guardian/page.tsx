import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Surface } from "@/components/ui/surface";
import { ParentApprovalForm } from "@/modules/identity/ui/parent-approval-form";
import {
  getGuardianAuthorizationState,
  getIdentityState,
} from "@/modules/identity/infrastructure/identity-dal";

export const metadata: Metadata = {
  title: "Guardian approval",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function GuardianOnboardingPage() {
  const identity = await getIdentityState();
  if (!identity.user) redirect("/login?next=/onboarding/guardian");
  if (!identity.profile || identity.checkpoint?.status !== "completed") {
    redirect("/onboarding/identity");
  }
  if (!identity.profile.is_minor) redirect("/real-quests");

  const guardian = await getGuardianAuthorizationState();
  if (guardian?.status === "granted" || guardian?.status === "parent_declared")
    redirect("/real-quests");

  return (
    <OnboardingShell
      activeStep={1}
      title="Ask your parent to approve, then keep building."
      description="Hand this device to your parent or legal guardian. They can approve private learning here once."
    >
      <Surface className="space-y-5 p-5 sm:p-7">
        <ParentApprovalForm />

        <div className="border-border bg-panel-raised rounded-xl border p-4 text-sm leading-6">
          <p className="font-semibold">What stays protected</p>
          <p className="text-muted mt-1">
            External AI is disabled for under-18 accounts.
          </p>
          <ul className="text-muted mt-2 list-disc space-y-1 pl-5">
            <li>Public networking remains adult-only.</li>
            <li>School networking is for eligible ages 13–17 only.</li>
            <li>Guardian approval and school membership are required.</li>
            <li>Under-13s cannot join school networking.</li>
          </ul>
          <p className="text-muted mt-2">
            Your journey continues after approval with youth-safe guidance.
          </p>
        </div>
      </Surface>
    </OnboardingShell>
  );
}
