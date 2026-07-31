import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getStage4DiscoveryHandoff } from "@/modules/discovery/infrastructure/discovery-dal";
import { getCurrentHumanPotentialProfile } from "@/modules/human-potential/infrastructure/profile-dal";
import { ProfileFeedbackForm } from "@/modules/human-potential/ui/profile-feedback-form";
import { ProfileGenerationForm } from "@/modules/human-potential/ui/profile-generation-form";
import {
  humanPotentialProfileSectionKeys,
  type HumanPotentialProfileSectionKey,
} from "@/modules/human-potential/domain/profile-contract";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Human Potential Profile",
  robots: { index: false, follow: false },
};

const sectionCopy: Record<HumanPotentialProfileSectionKey, string> = {
  emerging_strengths: "Emerging Strengths",
  what_draws_you: "What Draws You",
  problems_you_care_about: "Problems You Care About",
  how_you_can_contribute: "How You Can Contribute",
  current_constraints: "Current Constraints",
  best_next_direction: "Best Next Direction",
};

export default async function HumanPotentialProfilePage() {
  const [handoff, profile] = await Promise.all([
    getStage4DiscoveryHandoff(),
    getCurrentHumanPotentialProfile(),
  ]);
  if (!handoff) redirect("/onboarding/discovery");

  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Your private Human Potential Profile
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        A starting point for your next steps.
      </h1>
      {!profile ? (
        <Surface className="mt-10 p-6 sm:p-8">
          <p className="text-muted max-w-2xl text-lg leading-8">
            Based on your Discovery answers, PipuPath can prepare a private,
            provisional profile. It is not a diagnosis, fixed identity, purpose
            or permanent career recommendation. You can disagree with any part.
          </p>
          <div className="mt-7">
            <ProfileGenerationForm />
          </div>
        </Surface>
      ) : (
        <>
          <Surface className="mt-10 p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Summary</h2>
            <p className="text-muted mt-3 max-w-3xl leading-8">
              {profile.summary}
            </p>
            <p className="text-muted mt-5 text-sm">
              Saved privately. Generated{" "}
              {new Date(profile.createdAt).toLocaleDateString()}.
            </p>
          </Surface>

          <div className="mt-8 space-y-6">
            {humanPotentialProfileSectionKeys.map((section) => (
              <section key={section} aria-labelledby={section}>
                <h2
                  id={section}
                  className="text-2xl font-semibold tracking-tight"
                >
                  {sectionCopy[section]}
                </h2>
                <div className="mt-4 space-y-4">
                  {profile.sections[section].map((insight) => (
                    <Surface key={insight.id} className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold">
                          {insight.title}
                        </h3>
                        <span className="text-gold text-xs font-semibold uppercase tracking-wide">
                          {insight.confidence} confidence
                        </span>
                      </div>
                      <p className="text-muted mt-3 leading-7">
                        {insight.summary}
                      </p>
                      <p className="text-muted mt-3 leading-7">
                        {insight.description}
                      </p>
                      <ProfileFeedbackForm insightId={insight.id} />
                    </Surface>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <ButtonLink
            href="/onboarding/discovery/profile/complete"
            className="mt-10"
          >
            Continue
          </ButtonLink>
        </>
      )}
    </main>
  );
}
