import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { retakeDiscoveryAction } from "@/modules/discovery/application/discovery-actions";
import { getDiscoveryState } from "@/modules/discovery/infrastructure/discovery-dal";

export const metadata: Metadata = {
  title: "Retake Discovery",
  robots: { index: false, follow: false },
};

export default async function RetakeDiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [state, query] = await Promise.all([getDiscoveryState(), searchParams]);
  const session = state.session;

  if (!session) redirect("/onboarding/discovery");

  const active = session.status !== "completed";
  const continueHref =
    session.status === "review"
      ? "/onboarding/discovery/review"
      : "/onboarding/discovery";

  return (
    <OnboardingShell
      activeStep={2}
      title="Retake your Discovery."
      description="People grow. Your interests, experiences and direction can change, so PipuPath lets you create a new Discovery without erasing where you started."
    >
      <Surface className="p-5 sm:p-7">
        {active ? (
          <>
            <p className="text-primary-light text-xs font-semibold tracking-[0.14em] uppercase">
              Discovery already in progress
            </p>
            <h2 className="text-navy mt-2 text-xl font-semibold">
              Continue the Discovery you already started.
            </h2>
            <p className="text-muted mt-3 leading-7">
              PipuPath keeps one active Discovery at a time so your answers stay
              coherent and easy to resume.
            </p>
            <ButtonLink href={continueHref} className="mt-6">
              {session.status === "review"
                ? "Continue review →"
                : "Continue Discovery →"}
            </ButtonLink>
          </>
        ) : (
          <>
            <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
              A new snapshot, not a reset
            </p>
            <h2 className="text-navy mt-2 text-xl font-semibold">
              Your earlier answers and profile will remain preserved.
            </h2>
            <p className="text-muted mt-3 max-w-2xl leading-7">
              Starting again creates a new Discovery session. When you finish,
              you can build an updated Potential Profile from the latest answers
              while your previous profile remains part of your history.
            </p>

            {query.error === "unavailable" ? (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                PipuPath could not start a new Discovery right now. Your
                existing profile is unchanged. Please try again.
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <form action={retakeDiscoveryAction}>
                <Button type="submit">Start new Discovery →</Button>
              </form>
              <ButtonLink href="/profile" variant="secondary">
                Keep my current profile
              </ButtonLink>
            </div>
          </>
        )}
      </Surface>
    </OnboardingShell>
  );
}
