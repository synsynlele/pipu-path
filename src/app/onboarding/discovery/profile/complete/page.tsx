import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getCurrentHumanPotentialProfile } from "@/modules/human-potential/infrastructure/profile-dal";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile saved",
  robots: { index: false, follow: false },
};

export default async function ProfileCompletePage() {
  const profile = await getCurrentHumanPotentialProfile();
  if (!profile) redirect("/onboarding/discovery/profile");

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Profile saved
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Keep testing what feels true.
      </h1>
      <Surface className="mt-10 p-6 sm:p-8">
        <p className="text-muted leading-8">
          Your private profile and feedback are saved. Stage 5, Journeys, has
          not been built yet, so PipuPath will not pretend you can begin one.
        </p>
      </Surface>
      <ButtonLink href="/onboarding/discovery/profile" className="mt-8">
        Review my profile
      </ButtonLink>
      <ButtonLink href="/app" variant="secondary" className="mt-4">
        Return to dashboard
      </ButtonLink>
    </main>
  );
}
