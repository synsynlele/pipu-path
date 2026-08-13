import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getCurrentEconomicPathwayState } from "@/modules/economic-pathways/infrastructure/economic-pathway-dal";
import { getCurrentHumanPotentialProfile } from "@/modules/human-potential/infrastructure/profile-dal";

export const metadata: Metadata = {
  title: "Profile and path saved",
  robots: { index: false, follow: false },
};

export default async function ProfileCompletePage() {
  const profile = await getCurrentHumanPotentialProfile();
  if (!profile) redirect("/onboarding/discovery/profile");
  const pathways = await getCurrentEconomicPathwayState(profile.id);
  if (!pathways?.selectedPath) redirect("/onboarding/discovery/profile");

  return (
    <main
      id="main-content"
      className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Profile and path saved
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Test the path. Let evidence teach you.
      </h1>
      <Surface className="mt-10 p-6 sm:p-8">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
          Selected Possible Path
        </p>
        <h2 className="mt-3 text-2xl font-semibold">
          {pathways.selectedPath.pathName}
        </h2>
        <p className="text-muted mt-3 leading-8">
          This is a direction to explore, not a permanent decision. PipuPath can
          now turn it into one practical mission, then a 30-Day Pathway that
          helps you learn, practise, build and test with real evidence.
        </p>
      </Surface>
      <ButtonLink href="/mission" className="mt-8">
        Build My Practical Mission
      </ButtonLink>
      <ButtonLink
        href="/onboarding/discovery/profile"
        variant="secondary"
        className="mt-4"
      >
        Review my profile and paths
      </ButtonLink>
    </main>
  );
}
