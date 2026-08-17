import type { Metadata } from "next";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getCurrentHumanPotentialProfile } from "@/modules/human-potential/infrastructure/profile-dal";
import {
  recordLivingBuilderCapabilityFeedbackAction,
  refreshLivingBuilderProfileAction,
} from "@/modules/living-builder-profile/application/living-profile-actions";
import {
  capabilityLevelLabel,
  capabilityVerificationLabel,
} from "@/modules/living-builder-profile/domain/living-profile-contract";
import { getLivingBuilderProfile } from "@/modules/living-builder-profile/infrastructure/living-profile-dal";

export const metadata: Metadata = {
  title: "Living Builder Profile",
  robots: { index: false, follow: false },
};

export default async function LivingBuilderProfilePage() {
  const [baseline, profile] = await Promise.all([
    getCurrentHumanPotentialProfile(),
    getLivingBuilderProfile(),
  ]);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <section className="border-gold/20 bg-panel relative overflow-hidden rounded-[2rem] border px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="bg-gold/10 absolute -top-24 -right-20 h-64 w-64 rounded-full blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
            Living Builder Profile
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Your potential is a starting point. Your evidence keeps the profile
            alive.
          </h1>
          <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
            Discovery records what may be inside you. Completed Quests, Projects
            and mutually confirmed collaboration show what you are actually
            demonstrating over time.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {baseline ? (
              <ButtonLink
                href="/onboarding/discovery/profile"
                variant="secondary"
              >
                View Discovery baseline
              </ButtonLink>
            ) : (
              <ButtonLink href="/onboarding/discovery">
                Complete Discovery
              </ButtonLink>
            )}
            {baseline ? (
              <form action={refreshLivingBuilderProfileAction}>
                <Button type="submit">
                  {profile
                    ? "Refresh from my evidence"
                    : "Build from my evidence"}
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </section>

      <Surface className="border-gold/30 bg-gold/5 mt-8 p-6 sm:p-8">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
          Private by design
        </p>
        <p className="text-muted mt-3 max-w-4xl leading-7">
          Nothing on this page becomes public automatically. PipuPath keeps the
          Discovery profile as your baseline and records only completed action
          evidence behind capability claims. No AI personality label is created
          here.
        </p>
      </Surface>

      {!baseline ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">
            A Discovery baseline is required first.
          </h2>
          <p className="text-muted mt-3 max-w-2xl leading-7">
            The Living Builder Profile extends your existing Human Potential
            Profile; it never replaces the evidence that began your journey.
          </p>
        </Surface>
      ) : !profile ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <h2 className="text-3xl font-semibold tracking-tight">
            Build the first evidence snapshot.
          </h2>
          <p className="text-muted mt-4 max-w-3xl leading-7">
            PipuPath will look only at completed Quests with evidence and
            reflection, completed Builder Projects and completed mutually
            confirmed collaboration. If there is not enough evidence yet, it
            will say so rather than inventing a capability.
          </p>
        </Surface>
      ) : (
        <>
          <section className="mt-10" aria-labelledby="capabilities-heading">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-3xl">
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  Evidence-backed capability record
                </p>
                <h2
                  id="capabilities-heading"
                  className="mt-3 text-3xl font-semibold tracking-tight"
                >
                  What your completed work currently supports.
                </h2>
              </div>
              <p className="text-muted text-sm">
                Version {profile.version} · rules {profile.rulesVersion}
              </p>
            </div>

            {profile.capabilities.length === 0 ? (
              <Surface className="mt-6 p-6 sm:p-8">
                <h3 className="text-xl font-semibold">
                  No capability claim yet.
                </h3>
                <p className="text-muted mt-3 leading-7">
                  Complete a Quest with evidence and reflection, finish a
                  Builder Project, or complete a mutually confirmed
                  collaboration. Your next refresh can then use that proof.
                </p>
                <ButtonLink href="/build" className="mt-5">
                  Continue building
                </ButtonLink>
              </Surface>
            ) : (
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {profile.capabilities.map((capability) => (
                  <Surface key={capability.id} className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                          {capabilityLevelLabel(capability.level)}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold">
                          {capability.label}
                        </h3>
                      </div>
                      <span className="border-border rounded-full border px-3 py-1.5 text-xs font-semibold">
                        {capability.evidenceCount} evidence{" "}
                        {capability.evidenceCount === 1 ? "record" : "records"}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {capability.evidence.map((evidence) => (
                        <Link
                          key={evidence.id}
                          href={evidence.href}
                          className="border-border hover:border-gold/40 block rounded-2xl border p-4 transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold">
                              {evidence.sourceTitle}
                            </span>
                            <span className="text-muted text-xs">
                              {capabilityVerificationLabel(
                                evidence.verification,
                              )}
                            </span>
                          </div>
                          <p className="text-muted mt-2 text-sm leading-6">
                            {evidence.summary}
                          </p>
                        </Link>
                      ))}
                    </div>

                    <form
                      action={recordLivingBuilderCapabilityFeedbackAction}
                      className="border-border mt-6 border-t pt-5"
                    >
                      <input
                        type="hidden"
                        name="claim_id"
                        value={capability.id}
                      />
                      <label
                        htmlFor={`context-${capability.id}`}
                        className="text-sm font-semibold"
                      >
                        Does this capability claim represent you?
                      </label>
                      <textarea
                        id={`context-${capability.id}`}
                        name="context_note"
                        rows={2}
                        maxLength={600}
                        placeholder="Add context if the claim needs it."
                        className="border-border bg-background text-foreground mt-3 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="submit"
                          name="feedback_type"
                          value="accurate"
                          variant="secondary"
                        >
                          Accurate
                        </Button>
                        <Button
                          type="submit"
                          name="feedback_type"
                          value="needs_context"
                          variant="secondary"
                        >
                          Needs context
                        </Button>
                        <Button
                          type="submit"
                          name="feedback_type"
                          value="not_representative"
                          variant="ghost"
                        >
                          Not representative
                        </Button>
                      </div>
                      {capability.feedback ? (
                        <p className="text-muted mt-3 text-sm">
                          Latest feedback:{" "}
                          {capability.feedback.type.replaceAll("_", " ")}
                          {capability.feedback.contextNote
                            ? ` — ${capability.feedback.contextNote}`
                            : ""}
                        </p>
                      ) : null}
                    </form>
                  </Surface>
                ))}
              </div>
            )}
          </section>

          <Surface className="mt-10 p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Profile history
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Versioned, not overwritten.
            </h2>
            <p className="text-muted mt-3 max-w-3xl leading-7">
              Each refresh creates a new private snapshot. Older versions remain
              as historical evidence of how your demonstrated capability record
              changed.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profile.history.map((version) => (
                <div
                  key={version.id}
                  className="border-border rounded-2xl border p-4 text-sm"
                >
                  <strong>Version {version.version}</strong>
                  <span className="text-muted mt-1 block">
                    {version.capabilityCount} capability{" "}
                    {version.capabilityCount === 1 ? "claim" : "claims"} ·{" "}
                    {version.status}
                  </span>
                </div>
              ))}
            </div>
          </Surface>
        </>
      )}
    </main>
  );
}
