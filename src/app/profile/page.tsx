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
  type BuilderCapabilityLevel,
} from "@/modules/living-builder-profile/domain/living-profile-contract";
import { getLivingBuilderProfile } from "@/modules/living-builder-profile/infrastructure/living-profile-dal";

export const metadata: Metadata = {
  title: "Living Builder Profile",
  robots: { index: false, follow: false },
};

function capabilityNodeClass(level: BuilderCapabilityLevel) {
  if (level === "repeatedly_demonstrated") {
    return "border-gold/35 bg-gold/8 text-gold";
  }
  if (level === "demonstrated") {
    return "border-primary/30 bg-primary-soft text-primary";
  }
  return "border-border bg-background text-muted";
}

export default async function LivingBuilderProfilePage() {
  const [baseline, profile] = await Promise.all([
    getCurrentHumanPotentialProfile(),
    getLivingBuilderProfile(),
  ]);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-12 lg:px-10"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-6 text-white sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -top-28 -right-20 size-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute right-12 -bottom-36 size-72 rounded-full bg-[#4f7cff]/18 blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#f3c86b] uppercase">
            Builder identity · Skill Tree
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Watch potential turn into evidence.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
            Discovery suggests what may be possible. Quests, Projects and
            confirmed collaboration show what you are actually demonstrating
            over time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {baseline ? (
              <form action={refreshLivingBuilderProfileAction}>
                <Button type="submit" variant="premium">
                  {profile ? "Refresh Skill Tree" : "Build My Skill Tree"}
                </Button>
              </form>
            ) : (
              <ButtonLink href="/onboarding/discovery" variant="premium">
                Complete Discovery
              </ButtonLink>
            )}
            {profile ? (
              <ButtonLink href="/profile/verification" variant="secondary">
                Verification
              </ButtonLink>
            ) : null}
            <ButtonLink href="/passport" variant="secondary">
              Builder Passport
            </ButtonLink>
          </div>
        </div>
      </section>

      <div className="border-gold/20 bg-gold/5 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 sm:px-5">
        <div>
          <p className="text-navy text-sm font-semibold">
            Private development space
          </p>
          <p className="text-muted mt-0.5 text-xs">
            Capability claims come from completed evidence. Nothing here becomes
            public automatically.
          </p>
        </div>
        {baseline ? (
          <Link
            href="/onboarding/discovery/profile"
            className="text-primary text-xs font-semibold"
          >
            View Discovery baseline →
          </Link>
        ) : null}
      </div>

      {!baseline ? (
        <Surface className="mt-6 p-6 sm:p-8">
          <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
            Skill Tree locked
          </p>
          <h2 className="text-navy mt-2 text-2xl font-semibold">
            Discovery creates the starting point.
          </h2>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
            Complete your private Human Potential Profile first. The Skill Tree
            will then grow only from real evidence.
          </p>
          <ButtonLink href="/onboarding/discovery" className="mt-5">
            Begin Discovery
          </ButtonLink>
        </Surface>
      ) : !profile ? (
        <Surface className="border-primary/20 bg-primary-soft/25 mt-6 p-6 sm:p-8">
          <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
            Evidence scan ready
          </p>
          <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight">
            Build your first evidence-backed Skill Tree.
          </h2>
          <p className="text-muted mt-3 max-w-3xl text-sm leading-6">
            PipuPath will use only completed Quests with evidence and
            reflection, completed Projects and mutually confirmed collaboration.
            If the proof is not there yet, no capability will be invented.
          </p>
          <form action={refreshLivingBuilderProfileAction} className="mt-5">
            <Button type="submit">Build My Skill Tree →</Button>
          </form>
        </Surface>
      ) : (
        <>
          <section className="mt-7" aria-labelledby="skill-tree-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-gold text-xs font-semibold tracking-[0.15em] uppercase">
                  Evidence-backed Skill Tree
                </p>
                <h2
                  id="skill-tree-heading"
                  className="text-navy mt-2 text-3xl font-semibold tracking-tight"
                >
                  What your work currently supports
                </h2>
              </div>
              <span className="text-muted text-xs">
                Snapshot v{profile.version} · rules {profile.rulesVersion}
              </span>
            </div>

            {profile.capabilities.length === 0 ? (
              <Surface className="mt-5 p-6 sm:p-8">
                <div className="mx-auto grid max-w-2xl place-items-center text-center">
                  <span className="border-border bg-background text-muted grid size-16 place-items-center rounded-full border-2 text-xl">
                    ?
                  </span>
                  <h3 className="text-navy mt-4 text-2xl font-semibold">
                    No capability has enough proof yet.
                  </h3>
                  <p className="text-muted mt-2 text-sm leading-6">
                    This is not failure. Clear more real-world Quests, complete
                    a Project or collaborate, then refresh the tree.
                  </p>
                  <ButtonLink href="/build" className="mt-5">
                    Go Build Something →
                  </ButtonLink>
                </div>
              </Surface>
            ) : (
              <div className="mt-6">
                <div className="mx-auto flex w-fit flex-col items-center">
                  <div className="border-gold/30 bg-gold/8 text-gold grid size-16 place-items-center rounded-full border-2 text-sm font-bold">
                    YOU
                  </div>
                  <span aria-hidden="true" className="bg-border h-8 w-px" />
                </div>

                <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <span
                    aria-hidden="true"
                    className="bg-border absolute top-0 left-[16.66%] hidden h-px w-[66.68%] lg:block"
                  />
                  {profile.capabilities.map((capability) => (
                    <details
                      key={capability.id}
                      className="border-border bg-panel group open:border-primary/25 relative rounded-2xl border p-5"
                    >
                      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <div className="flex items-start gap-4">
                          <span
                            className={`grid size-12 shrink-0 place-items-center rounded-full border-2 text-sm font-bold ${capabilityNodeClass(capability.level)}`}
                            aria-hidden="true"
                          >
                            ◈
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-muted text-[0.68rem] font-semibold tracking-wide uppercase">
                              {capabilityLevelLabel(capability.level)}
                            </p>
                            <h3 className="text-navy mt-1 text-xl font-semibold">
                              {capability.label}
                            </h3>
                            <p className="text-muted mt-1 text-xs">
                              {capability.evidenceCount} evidence{" "}
                              {capability.evidenceCount === 1
                                ? "record"
                                : "records"}
                            </p>
                          </div>
                          <span
                            aria-hidden="true"
                            className="text-muted mt-1 transition-transform group-open:rotate-45 motion-reduce:transition-none"
                          >
                            +
                          </span>
                        </div>
                      </summary>

                      <div className="border-border mt-5 border-t pt-5">
                        <p className="text-primary text-xs font-semibold tracking-[0.13em] uppercase">
                          Evidence behind this branch
                        </p>
                        <div className="mt-3 space-y-3">
                          {capability.evidence.map((evidence) => (
                            <Link
                              key={evidence.id}
                              href={evidence.href}
                              className="border-border hover:border-primary/30 block rounded-xl border p-3 transition-colors"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-navy text-sm font-semibold">
                                  {evidence.sourceTitle}
                                </span>
                                <span className="text-muted text-[0.68rem]">
                                  {capabilityVerificationLabel(
                                    evidence.verification,
                                  )}
                                </span>
                              </div>
                              <p className="text-muted mt-2 text-xs leading-5">
                                {evidence.summary}
                              </p>
                            </Link>
                          ))}
                        </div>

                        <form
                          action={recordLivingBuilderCapabilityFeedbackAction}
                          className="border-border mt-5 border-t pt-4"
                        >
                          <input
                            type="hidden"
                            name="claim_id"
                            value={capability.id}
                          />
                          <label
                            htmlFor={`context-${capability.id}`}
                            className="text-navy text-sm font-semibold"
                          >
                            Does this branch represent you?
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
                            <p className="text-muted mt-3 text-xs leading-5">
                              Latest feedback:{" "}
                              {capability.feedback.type.replaceAll("_", " ")}
                              {capability.feedback.contextNote
                                ? ` — ${capability.feedback.contextNote}`
                                : ""}
                            </p>
                          ) : null}
                        </form>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </section>

          <details className="border-border bg-panel mt-7 rounded-2xl border p-5 sm:p-6">
            <summary className="text-navy cursor-pointer text-sm font-semibold">
              Skill Tree history · {profile.history.length}{" "}
              {profile.history.length === 1 ? "snapshot" : "snapshots"}
            </summary>
            <p className="text-muted mt-3 max-w-3xl text-sm leading-6">
              Refreshes create new private versions instead of rewriting your
              history. You can see how demonstrated capability changes as
              evidence accumulates.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profile.history.map((version) => (
                <div
                  key={version.id}
                  className="border-border rounded-xl border p-4 text-sm"
                >
                  <strong className="text-navy">
                    Version {version.version}
                  </strong>
                  <span className="text-muted mt-1 block text-xs">
                    {version.capabilityCount} capability{" "}
                    {version.capabilityCount === 1 ? "claim" : "claims"} ·{" "}
                    {version.status}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </>
      )}
    </main>
  );
}
