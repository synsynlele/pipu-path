import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getStage4DiscoveryHandoff } from "@/modules/discovery/infrastructure/discovery-dal";
import {
  getCurrentEconomicPathwayState,
  recordProductEventForUser,
} from "@/modules/economic-pathways/infrastructure/economic-pathway-dal";
import { EconomicPathwayGenerationForm } from "@/modules/economic-pathways/ui/economic-pathway-generation-form";
import { PathSelectionForm } from "@/modules/economic-pathways/ui/path-selection-form";
import {
  humanPotentialProfileSectionKeys,
  type HumanPotentialProfileSectionKey,
} from "@/modules/human-potential/domain/profile-contract";
import { getCurrentHumanPotentialProfile } from "@/modules/human-potential/infrastructure/profile-dal";
import { ProfileFeedbackForm } from "@/modules/human-potential/ui/profile-feedback-form";
import { ProfileGenerationForm } from "@/modules/human-potential/ui/profile-generation-form";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";

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
  const [{ user }, handoff, profile] = await Promise.all([
    requireAuthenticatedIdentity(),
    getStage4DiscoveryHandoff(),
    getCurrentHumanPotentialProfile(),
  ]);
  if (!handoff) redirect("/onboarding/discovery");

  const pathways = profile
    ? await getCurrentEconomicPathwayState(profile.id)
    : null;
  if (pathways) {
    await recordProductEventForUser(user.id, "possible_paths_viewed", {
      recommendationId: pathways.id,
      profileId: pathways.profileId,
    });
  }

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
                        <span className="text-gold text-xs font-semibold tracking-wide uppercase">
                          {insight.confidence} confidence
                        </span>
                      </div>
                      <p className="text-muted mt-3 leading-7">
                        {insight.summary}
                      </p>
                      <p className="text-muted mt-3 leading-7">
                        {insight.description}
                      </p>
                      <ProfileFeedbackForm
                        insightId={insight.id}
                        savedFeedback={insight.feedback}
                      />
                    </Surface>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-12" aria-labelledby="possible-paths">
            <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
              Explore, do not predict
            </p>
            <h2
              id="possible-paths"
              className="mt-3 text-3xl font-semibold tracking-tight"
            >
              Possible Paths
            </h2>
            <p className="text-muted mt-3 max-w-3xl leading-7">
              These are realistic directions suggested by patterns in your
              profile. None is your destiny or permanent career. Choose one to
              test through learning and real evidence.
            </p>

            {!pathways ? (
              <Surface className="mt-6 p-6 sm:p-8">
                <h3 className="text-xl font-semibold">
                  Turn self-knowledge into directions you can test
                </h3>
                <p className="text-muted mt-3 max-w-2xl leading-7">
                  PipuPath will connect several pieces of your profile rather
                  than simply repeat your answers. Each path includes what to
                  learn, a small test and the evidence that would make the path
                  more credible.
                </p>
                <div className="mt-6">
                  <EconomicPathwayGenerationForm />
                </div>
              </Surface>
            ) : (
              <div className="mt-6 grid gap-5">
                {pathways.possiblePaths.map((path) => (
                  <Surface
                    key={path.key}
                    className={
                      pathways.selectedPathKey === path.key
                        ? "border-gold/50 bg-gold/5 p-6 sm:p-8"
                        : "p-6 sm:p-8"
                    }
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                          Path to test
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold">
                          {path.pathName}
                        </h3>
                      </div>
                      {pathways.selectedPathKey === path.key ? (
                        <span className="border-gold/30 bg-gold/10 text-gold rounded-full border px-3 py-1 text-xs font-semibold uppercase">
                          Selected
                        </span>
                      ) : null}
                    </div>
                    <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold">Observed Pattern</dt>
                        <dd className="text-muted mt-2 leading-7">
                          {path.observedPattern}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Possible Interpretation</dt>
                        <dd className="text-muted mt-2 leading-7">
                          {path.possibleInterpretation}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Why It Fits You</dt>
                        <dd className="text-muted mt-2 leading-7">
                          {path.whyItFits}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Skills You Need</dt>
                        <dd className="text-muted mt-2 leading-7">
                          {path.skillsNeeded.join(", ")}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold">How You Can Test It</dt>
                        <dd className="text-muted mt-2 leading-7">
                          {path.howToTest}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Evidence Needed</dt>
                        <dd className="text-muted mt-2 leading-7">
                          {path.evidenceNeeded}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-5">
                      <h4 className="font-semibold">
                        Possible Ways It Can Create Value or Income
                      </h4>
                      <ul className="text-muted mt-2 list-disc space-y-2 pl-5 leading-7">
                        {path.valueOrIncome.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <PathSelectionForm
                      recommendationId={pathways.id}
                      pathKey={path.key}
                      selected={pathways.selectedPathKey === path.key}
                    />
                  </Surface>
                ))}
              </div>
            )}
          </section>

          {pathways ? (
            <section className="mt-12" aria-labelledby="earn-from-strengths">
              <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
                Create value first
              </p>
              <h2
                id="earn-from-strengths"
                className="mt-3 text-3xl font-semibold tracking-tight"
              >
                Earn From Your Strengths
              </h2>
              <p className="text-muted mt-3 max-w-3xl leading-7">
                The aim is not quick money. It is to learn how your capabilities
                can become useful to somebody, build proof and eventually earn
                where that is appropriate for your age and situation.
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {pathways.earnFromStrengths.map((item) => (
                  <Surface key={item.key} className="p-6">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <dl className="mt-5 space-y-4">
                      <div>
                        <dt className="font-semibold">What you could offer</dt>
                        <dd className="text-muted mt-1 leading-7">
                          {item.whatYouCouldOffer}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Who may need it</dt>
                        <dd className="text-muted mt-1 leading-7">
                          {item.whoMayNeedIt}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold">
                          What you need to learn first
                        </dt>
                        <dd className="text-muted mt-1 leading-7">
                          {item.learnFirst}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold">A small first experiment</dt>
                        <dd className="text-muted mt-1 leading-7">
                          {item.firstExperiment}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold">
                          Evidence that you are getting better
                        </dt>
                        <dd className="text-muted mt-1 leading-7">
                          {item.evidenceOfImprovement}
                        </dd>
                      </div>
                    </dl>
                  </Surface>
                ))}
              </div>
            </section>
          ) : null}

          {pathways?.selectedPath ? (
            <ButtonLink
              href="/onboarding/discovery/profile/complete"
              className="mt-10"
            >
              Continue With {pathways.selectedPath.pathName}
            </ButtonLink>
          ) : (
            <p className="text-muted mt-10 max-w-2xl text-sm leading-6">
              Explore and choose one Possible Path before PipuPath shapes your
              next practical mission.
            </p>
          )}
        </>
      )}
    </main>
  );
}
