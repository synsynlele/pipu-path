import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { ensureGuardianAuthorizationAction } from "@/modules/identity/application/guardian-actions";
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
  if (!identity.profile.is_minor) redirect("/continue");

  const guardian = await getGuardianAuthorizationState();
  if (guardian?.status === "granted") redirect("/continue");

  return (
    <OnboardingShell
      activeStep={1}
      title="One adult approval, then keep building."
      description="PipuPath protects under-18 accounts with a parent or legal guardian approval gate."
    >
      <Surface className="space-y-5 p-5 sm:p-7">
        <div>
          <p className="text-muted text-sm font-semibold tracking-[0.12em] uppercase">
            Guardian code
          </p>
          {guardian?.status === "pending" && guardian.code ? (
            <>
              <p className="mt-3 font-mono text-3xl font-bold tracking-[0.18em]">
                {guardian.code}
              </p>
              <p className="text-muted mt-3 text-sm leading-6">
                Share this code privately with your parent or legal guardian.
                They must sign in to their own PipuPath account, declare an
                adult age band, and open the Guardian approval page to approve
                you. Do not post this code publicly.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted mt-2 text-sm leading-6">
                Create a fresh one-time code for your parent or legal guardian.
              </p>
              <form action={ensureGuardianAuthorizationAction} className="mt-4">
                <Button type="submit">Create guardian code</Button>
              </form>
            </>
          )}
        </div>

        <div className="border-border bg-panel-raised rounded-xl border p-4 text-sm leading-6">
          <p className="font-semibold">What stays protected</p>
          <p className="text-muted mt-1">
            External AI providers are disabled for under-18 accounts at launch.
            Builder Connect and collaboration remain adult-only. Your core
            PipuPath journey can continue after guardian approval using
            PipuPath&apos;s evidence-based youth-safe guidance.
          </p>
        </div>

        <p className="text-muted text-xs leading-5">
          After your guardian approves the code, refresh this page or sign in
          again.
        </p>
      </Surface>
    </OnboardingShell>
  );
}
