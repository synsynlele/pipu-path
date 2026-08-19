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
      className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
            Profile → Path → Mission
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            You have a direction. Now test it in the real world.
          </h1>
          <p className="text-muted mt-4 max-w-2xl text-base leading-7 sm:text-lg">
            Your profile is a starting map and this path is an experiment. The
            next step is to turn it into one practical mission that produces
            evidence.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/mission"
              variant="premium"
              className="w-full sm:w-auto"
            >
              Build My Practical Mission →
            </ButtonLink>
            <ButtonLink
              href="/onboarding/discovery/profile"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Review Profile
            </ButtonLink>
          </div>
        </div>

        <Surface className="border-gold/35 bg-gold/5 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Your Path to Test
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {pathways.selectedPath.pathName}
          </h2>
          <p className="text-muted mt-4 leading-7">
            {pathways.selectedPath.whyItFits}
          </p>
          <div className="border-border mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
            <div>
              <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                First test
              </p>
              <p className="mt-1 text-sm leading-6">
                {pathways.selectedPath.howToTest}
              </p>
            </div>
            <div>
              <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                Proof to look for
              </p>
              <p className="mt-1 text-sm leading-6">
                {pathways.selectedPath.evidenceNeeded}
              </p>
            </div>
          </div>
        </Surface>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          ["01", "Mission", "Choose one useful outcome."],
          ["02", "Journey", "Practise through focused action."],
          ["03", "Evidence", "Let real proof refine the path."],
        ].map(([number, title, copy]) => (
          <div
            key={number}
            className="border-border bg-panel/55 rounded-2xl border p-4"
          >
            <p className="text-gold font-mono text-xs">{number}</p>
            <p className="mt-2 font-semibold">{title}</p>
            <p className="text-muted mt-1 text-sm leading-6">{copy}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
