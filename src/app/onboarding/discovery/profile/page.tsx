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
  current_constraints: "What May Hold You Back",
  best_next_direction: "Best Next Direction",
};

const sectionEyebrow: Record<HumanPotentialProfileSectionKey, string> = {
  emerging_strengths: "What may already be working",
  what_draws_you: "Where your energy tends to go",
  problems_you_care_about: "What may matter enough to act on",
  how_you_can_contribute: "Where you may create value",
  current_constraints: "What to work around or strengthen",
  best_next_direction: "A useful experiment from here",
};

function confidenceLabel(confidence: string) {
  return `${confidence.replaceAll("_", " ")} confidence`;
}

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
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <div className="grid gap-7 lg:grid-cols-[1.45fr_0.55fr] lg:items-end">
        <div>
          <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
            Your private Human Potential Profile
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            See the pattern. Choose what to test.
          </h1>
          <p className="text-muted mt-4 max-w-2xl text-base leading-7 sm:text-lg">
            A provisional map built from your Discovery evidence—not a label,
            diagnosis or prediction.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          {[
            "Private",
            "Provisional",
            "Evidence-led",
          ].map((label) => (
            <span
              key={label}
              className="border-border bg-panel text-muted rounded-full border px-3 py-1.5 text-xs font-semibold"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {!profile ? (
        <Surface className="mt-9 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Ready to connect the evidence
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Turn your Discovery answers into a useful starting map.
            </h2>
            <p className="text-muted mt-3 max-w-2xl leading-7">
              PipuPath will look for patterns across your answers and keep the
              result private. You can disagree with any part.
            </p>
          </div>
          <ProfileGenerationForm />
        </Surface>
      ) : (
        <>
          <Surface className="mt-9 overflow-hidden p-0">
            <div className="grid lg:grid-cols-[1.4fr_0.6fr]">
              <div className="p-6 sm:p-8">
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  The pattern so far
                </p>
                <p className="mt-3 max-w-3xl text-xl leading-8 font-medium sm:text-2xl sm:leading-9">
                  {profile.summary}
                </p>
              </div>
              <div className="border-border border-t p-6 lg:border-t-0 lg:border-l sm:p-8">
                <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                  Interpretation source
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {profile.generationMode === "openai"
                    ? "AI interpretation"
                    : profile.generationMode === "evidence_fallback"
                      ? "Evidence-based backup"
                      : "Evidence interpretation"}
                </p>
                <p className="text-muted mt-2 text-sm leading-6">
                  {profile.generationMode === "openai"
                    ? "AI connected patterns across your private Discovery evidence."
                    : profile.generationMode === "evidence_fallback"
                      ? "The AI service was unavailable or too slow, so PipuPath protected your flow with its evidence-based backup."
                      : "Built from your completed Discovery evidence."}
                </p>
                <p className="text-muted mt-4 text-xs">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
                {profile.generationMode === "evidence_fallback" ? (
                  <div className="mt-5">
                    <ProfileGenerationForm buttonLabel="Retry AI interpretation" />
                  </div>
                ) : null}
              </div>
            </div>
          </Surface>

          <section className="mt-10" aria-labelledby="potential-map">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
                  Your Potential Map
                </p>
                <h2
                  id="potential-map"
                  className="mt-2 text-3xl font-semibold tracking-tight"
                >
                  Six signals worth noticing
                </h2>
              </div>
              <p className="text-muted max-w-md text-sm leading-6">
                Keep what feels true. Open any card when you want the reasoning
                behind it.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {humanPotentialProfileSectionKeys.map((section) => (
                <Surface key={section} className="p-5 sm:p-6">
                  <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                    {sectionEyebrow[section]}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">
                    {sectionCopy[section]}
                  </h3>
                  <div className="mt-4 space-y-4">
                    {profile.sections[section].map((insight) => (
                      <article
                        key={insight.id}
                        className="border-border/80 border-t pt-4 first:border-t-0 first:pt-0"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h4 className="max-w-[20rem] font-semibold">
                            {insight.title}
                          </h4>
                          <span className="text-gold text-[0.68rem] font-semibold tracking-wide uppercase">
                            {confidenceLabel(insight.confidence)}
                          </span>
                        </div>
                        <p className="text-muted mt-2 text-sm leading-6">
                          {insight.summary}
                        </p>
                        <details className="group mt-3">
                          <summary className="text-gold cursor-pointer list-none text-sm font-semibold marker:hidden">
                            Why PipuPath sees this +
                          </summary>
                          <div className="border-border mt-3 border-t pt-3">
                            <p className="text-muted text-sm leading-6">
                              {insight.description}
                            </p>
                            <ProfileFeedbackForm
                              insightId={insight.id}
                              savedFeedback={insight.feedback}
                            />
                          </div>
                        </details>
                      </article>
                    ))}
                  </div>
                </Surface>
              ))}
            </div>
          </section>

          <section className="mt-12" aria-labelledby="possible-paths">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
                  Explore, do not predict
                </p>
                <h2
                  id="possible-paths"
                  className="mt-2 text-3xl font-semibold tracking-tight"
                >
                  Paths to Test
                </h2>
              </div>
              <p className="text-muted max-w-md text-sm leading-6">
                Choose one direction to test with learning and real evidence.
                You can change it later.
              </p>
            </div>

            {!pathways ? (
              <Surface className="mt-6 grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h3 className="text-xl font-semibold">
                    Turn self-knowledge into practical directions.
                  </h3>
                  <p className="text-muted mt-2 max-w-2xl leading-7">
                    PipuPath will connect several profile signals into paths you
                    can test—not permanent careers or predictions.
                  </p>
                </div>
                <EconomicPathwayGenerationForm />
              </Surface>
            ) : (
              <>
                {pathways.selectedPath ? (
                  <Surface className="border-gold/40 bg-gold/5 mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                      <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                        Your path to test
                      </p>
                      <p className="mt-1 text-xl font-semibold">
                        {pathways.selectedPath.pathName}
                      </p>
                    </div>
                    <ButtonLink
                      href="/onboarding/discovery/profile/complete"
                      variant="premium"
                      className="w-full sm:w-auto"
                    >
                      Continue to Mission →
                    </ButtonLink>
                  </Surface>
                ) : null}

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  {pathways.possiblePaths.map((path) => (
                    <Surface
                      key={path.key}
                      className={
                        pathways.selectedPathKey === path.key
                          ? "border-gold/50 bg-gold/5 p-5 sm:p-6"
                          : "p-5 sm:p-6"
                      }
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                            Path to test
                          </p>
                          <h3 className="mt-1 text-2xl font-semibold">
                            {path.pathName}
                          </h3>
                        </div>
                        {pathways.selectedPathKey === path.key ? (
                          <span className="border-gold/30 bg-gold/10 text-gold rounded-full border px-3 py-1 text-xs font-semibold uppercase">
                            Selected
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                            Pattern
                          </p>
                          <p className="mt-1 text-sm leading-6">
                            {path.observedPattern}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                            Test next
                          </p>
                          <p className="mt-1 text-sm leading-6">
                            {path.howToTest}
                          </p>
                        </div>
                      </div>

                      <details className="mt-5">
                        <summary className="text-gold cursor-pointer list-none text-sm font-semibold marker:hidden">
                          See why it fits +
                        </summary>
                        <div className="border-border mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2">
                          <div>
                            <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                              Interpretation
                            </p>
                            <p className="mt-1 text-sm leading-6">
                              {path.possibleInterpretation}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                              Why it fits
                            </p>
                            <p className="mt-1 text-sm leading-6">
                              {path.whyItFits}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                              Skills to build
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {path.skillsNeeded.map((skill) => (
                                <span
                                  key={skill}
                                  className="border-border bg-background/40 rounded-full border px-2.5 py-1 text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                              Proof to look for
                            </p>
                            <p className="mt-1 text-sm leading-6">
                              {path.evidenceNeeded}
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                              How it could create value
                            </p>
                            <ul className="mt-2 grid gap-2 text-sm leading-6 sm:grid-cols-2">
                              {path.valueOrIncome.map((item) => (
                                <li
                                  key={item}
                                  className="border-border/70 border-l-2 pl-3"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </details>

                      <PathSelectionForm
                        recommendationId={pathways.id}
                        pathKey={path.key}
                        selected={pathways.selectedPathKey === path.key}
                      />
                    </Surface>
                  ))}
                </div>
              </>
            )}
          </section>

          {pathways ? (
            <section className="mt-12" aria-labelledby="earn-from-strengths">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
                    Create value first
                  </p>
                  <h2
                    id="earn-from-strengths"
                    className="mt-2 text-3xl font-semibold tracking-tight"
                  >
                    Ways to Create Value
                  </h2>
                </div>
                <p className="text-muted max-w-md text-sm leading-6">
                  Small experiments that can turn capability into usefulness,
                  proof and—where appropriate—income.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pathways.earnFromStrengths.map((item) => (
                  <Surface key={item.key} className="p-5 sm:p-6">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-muted mt-3 text-xs font-semibold tracking-wide uppercase">
                      What you could offer
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {item.whatYouCouldOffer}
                    </p>
                    <div className="border-gold/25 bg-gold/5 mt-4 rounded-2xl border p-4">
                      <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                        First experiment
                      </p>
                      <p className="mt-1 text-sm leading-6">
                        {item.firstExperiment}
                      </p>
                    </div>
                    <details className="mt-4">
                      <summary className="text-gold cursor-pointer list-none text-sm font-semibold marker:hidden">
                        What else to know +
                      </summary>
                      <dl className="border-border mt-4 space-y-4 border-t pt-4 text-sm">
                        <div>
                          <dt className="font-semibold">Who may need it</dt>
                          <dd className="text-muted mt-1 leading-6">
                            {item.whoMayNeedIt}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold">Learn first</dt>
                          <dd className="text-muted mt-1 leading-6">
                            {item.learnFirst}
                          </dd>
                        </div>
                        <div>
                          <dt className="font-semibold">Evidence of improvement</dt>
                          <dd className="text-muted mt-1 leading-6">
                            {item.evidenceOfImprovement}
                          </dd>
                        </div>
                      </dl>
                    </details>
                  </Surface>
                ))}
              </div>
            </section>
          ) : null}

          {pathways?.selectedPath ? (
            <Surface className="mt-10 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-muted text-xs font-semibold tracking-wide uppercase">
                  Ready for action
                </p>
                <p className="mt-1 font-semibold">
                  Turn {pathways.selectedPath.pathName} into a practical mission.
                </p>
              </div>
              <ButtonLink
                href="/onboarding/discovery/profile/complete"
                variant="premium"
                className="w-full sm:w-auto"
              >
                Continue →
              </ButtonLink>
            </Surface>
          ) : pathways ? (
            <p className="text-muted mt-8 max-w-2xl text-sm leading-6">
              Choose one Path to Test when you are ready. It is an experiment,
              not a permanent decision.
            </p>
          ) : null}
        </>
      )}
    </main>
  );
}
