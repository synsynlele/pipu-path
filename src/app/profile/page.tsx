import type { Metadata } from "next";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { getCurrentHumanPotentialProfile } from "@/modules/human-potential/infrastructure/profile-dal";
import { getBuilderLevelProgress } from "@/modules/identity/domain/builder-level";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";
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

export const dynamic = "force-dynamic";

function capabilityNodeClass(level: BuilderCapabilityLevel) {
  if (level === "repeatedly_demonstrated") {
    return "border-[#dec56c] bg-[#fff9e8] text-[#9a7520]";
  }
  if (level === "demonstrated") {
    return "border-[#cfc6fb] bg-[#f1edff] text-[#5b3be0]";
  }
  return "border-[#e3e4ec] bg-[#f7f8fb] text-[#737b91]";
}

export default async function LivingBuilderProfilePage() {
  const [baseline, profile, home] = await Promise.all([
    getCurrentHumanPotentialProfile(),
    getLivingBuilderProfile(),
    requireAuthenticatedHomeState(),
  ]);
  const level = getBuilderLevelProgress(home.totalXp);
  const capabilityCount = profile?.capabilities.length ?? 0;

  return (
    <main id="main-content" className="w-full pb-8">
      <section className="bg-[#201b59] px-4 pt-5 pb-12 text-white sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start justify-between gap-4 px-1">
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-[#d8ccff] uppercase">
                Living Builder identity
              </p>
              <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.04em] sm:text-4xl">
                {home.preferredName}
              </h1>
              <p className="mt-1 text-sm text-indigo-100/72">
                What you are becoming, backed by what you have actually done.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-indigo-50">
              {level.current} · {home.totalXp} XP
            </span>
          </div>

          <section className="pp-app-hero pp-mobile-section mt-5 p-5 sm:p-7">
            <div className="relative z-10 max-w-3xl">
              <div className="flex items-start gap-4">
                <span className="pp-story-ring shrink-0 rounded-full">
                  <span className="grid size-16 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-[#6d5df5] to-[#2b236e] text-xl font-bold text-white">
                    {home.preferredName.slice(0, 1).toUpperCase()}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold tracking-[0.12em] text-indigo-100 uppercase">
                    Your Builder signal
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                    {capabilityCount > 0
                      ? `${capabilityCount} evidence-backed ${capabilityCount === 1 ? "capability" : "capabilities"}`
                      : "Your evidence is still becoming a profile"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-indigo-50/76">
                    Discovery suggests possibilities. Quests, Projects and confirmed collaboration strengthen or change the picture over time.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {baseline ? (
                  <form action={refreshLivingBuilderProfileAction}>
                    <Button type="submit" variant="premium" className="rounded-full">
                      {profile ? "Refresh my profile" : "Build my profile"}
                    </Button>
                  </form>
                ) : (
                  <ButtonLink href="/onboarding/discovery" variant="premium" className="rounded-full">
                    Complete Discovery
                  </ButtonLink>
                )}
                <ButtonLink href="/passport" variant="secondary" className="rounded-full">
                  Passport
                </ButtonLink>
              </div>
            </div>
          </section>
        </div>
      </section>

      <div className="relative -mt-5 rounded-t-[2rem] bg-[#f7f8fc] pt-5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Builder identity spaces"
            className="pp-stage26-scroll -mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
          >
            <div className="flex w-max gap-2.5">
              <IdentityChip href="/onboarding/discovery/profile" icon="◇" label="Potential" />
              <IdentityChip href="/growth" icon="↗" label="Growth" />
              <IdentityChip href="/portfolio" icon="▣" label="Vault" />
              <IdentityChip href="/passport" icon="◎" label="Passport" />
              <IdentityChip href="/projects" icon="+" label="Projects" />
              {profile ? <IdentityChip href="/profile/verification" icon="✓" label="Verification" /> : null}
            </div>
          </nav>

          <section className="pp-app-card pp-mobile-section mt-5 flex items-start gap-3 p-4 sm:p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e7f8f5] text-lg text-[#159f8a]">
              ◉
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold text-[#282b4b]">Private by default</h2>
              <p className="mt-1 text-xs leading-5 text-[#7b8298]">
                Capability claims come from completed evidence. Nothing in your private development space becomes public automatically.
              </p>
            </div>
            {baseline ? (
              <Link href="/onboarding/discovery/profile" className="shrink-0 text-xs font-bold text-[#5b3be0]">
                Baseline →
              </Link>
            ) : null}
          </section>

          {!baseline ? (
            <section className="pp-app-card pp-mobile-section mt-4 p-6 text-center sm:p-8">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#f0ebff] text-2xl text-[#5b3be0]">◇</span>
              <p className="mt-4 text-xs font-bold tracking-[0.12em] text-[#6848dc] uppercase">Identity starting point</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#25284a]">Discovery creates your first private profile.</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#747b90]">
                Complete Discovery first. PipuPath will then let real-world evidence update the picture rather than freezing you inside a test result.
              </p>
              <ButtonLink href="/onboarding/discovery" className="mt-5 rounded-full">Begin Discovery</ButtonLink>
            </section>
          ) : !profile ? (
            <section className="pp-app-card pp-mobile-section mt-4 p-6 sm:p-8">
              <p className="text-xs font-bold tracking-[0.12em] text-[#16a28f] uppercase">Evidence scan ready</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#25284a]">Build your first evidence-backed Living Profile.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#747b90]">
                PipuPath uses completed Quests with evidence and reflection, completed Projects and mutually confirmed collaboration. If the proof is not there yet, no capability is invented.
              </p>
              <form action={refreshLivingBuilderProfileAction} className="mt-5">
                <Button type="submit" className="rounded-full">Build my Living Profile →</Button>
              </form>
            </section>
          ) : (
            <>
              <section className="pp-mobile-section mt-6" aria-labelledby="skill-tree-heading">
                <div className="flex items-end justify-between gap-4 px-1">
                  <div>
                    <p className="text-xs font-bold tracking-[0.12em] text-[#6848dc] uppercase">Evidence-backed capabilities</p>
                    <h2 id="skill-tree-heading" className="pp-section-title mt-1 text-xl sm:text-2xl">What your work currently supports</h2>
                  </div>
                  <span className="text-[0.68rem] font-semibold text-[#8a90a4]">v{profile.version}</span>
                </div>

                {profile.capabilities.length === 0 ? (
                  <div className="pp-app-card mt-3 p-6 text-center sm:p-8">
                    <span className="mx-auto grid size-16 place-items-center rounded-full border-2 border-[#e1e2ea] bg-[#f7f8fb] text-xl text-[#7e8498]">?</span>
                    <h3 className="mt-4 text-xl font-bold text-[#25284a]">No capability has enough proof yet.</h3>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#747b90]">Clear more real-world Quests, complete a Project or collaborate, then refresh the profile.</p>
                    <ButtonLink href="/build" className="mt-5 rounded-full">Go build something →</ButtonLink>
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {profile.capabilities.map((capability) => (
                      <details key={capability.id} className="pp-app-card group open:border-[#cfc6fb] p-5">
                        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                          <div className="flex items-start gap-3">
                            <span className={`grid size-12 shrink-0 place-items-center rounded-full border-2 text-sm font-bold ${capabilityNodeClass(capability.level)}`} aria-hidden="true">
                              ◈
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[0.66rem] font-bold tracking-[0.08em] text-[#868ca0] uppercase">{capabilityLevelLabel(capability.level)}</p>
                              <h3 className="mt-1 text-lg font-bold text-[#282b4b]">{capability.label}</h3>
                              <p className="mt-1 text-xs text-[#858b9f]">{capability.evidenceCount} evidence {capability.evidenceCount === 1 ? "record" : "records"}</p>
                            </div>
                            <span aria-hidden="true" className="mt-1 text-[#8d92a4] transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
                          </div>
                        </summary>

                        <div className="mt-5 border-t border-[#ececf3] pt-5">
                          <p className="text-xs font-bold tracking-[0.1em] text-[#6848dc] uppercase">Proof behind this signal</p>
                          <div className="mt-3 space-y-2.5">
                            {capability.evidence.map((evidence) => (
                              <Link key={evidence.id} href={evidence.href} className="block rounded-2xl border border-[#e8e8f0] bg-[#fafaff] p-3 transition-colors hover:border-[#cfc6fb]">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-bold text-[#303353]">{evidence.sourceTitle}</span>
                                  <span className="shrink-0 text-[0.64rem] font-semibold text-[#8a90a4]">{capabilityVerificationLabel(evidence.verification)}</span>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-[#767d93]">{evidence.summary}</p>
                              </Link>
                            ))}
                          </div>

                          <form action={recordLivingBuilderCapabilityFeedbackAction} className="mt-5 border-t border-[#ececf3] pt-4">
                            <input type="hidden" name="claim_id" value={capability.id} />
                            <label htmlFor={`context-${capability.id}`} className="text-sm font-bold text-[#303353]">Does this represent you?</label>
                            <textarea
                              id={`context-${capability.id}`}
                              name="context_note"
                              rows={2}
                              maxLength={600}
                              placeholder="Add context if this signal needs it."
                              className="mt-3 w-full rounded-2xl border border-[#e2e3eb] bg-white px-3 py-2 text-sm text-[#25284a]"
                            />
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button type="submit" name="feedback_type" value="accurate" variant="secondary" className="rounded-full">Accurate</Button>
                              <Button type="submit" name="feedback_type" value="needs_context" variant="secondary" className="rounded-full">Needs context</Button>
                              <Button type="submit" name="feedback_type" value="not_representative" variant="ghost" className="rounded-full">Not representative</Button>
                            </div>
                            {capability.feedback ? (
                              <p className="mt-3 text-xs leading-5 text-[#7d8398]">
                                Latest feedback: {capability.feedback.type.replaceAll("_", " ")}
                                {capability.feedback.contextNote ? ` — ${capability.feedback.contextNote}` : ""}
                              </p>
                            ) : null}
                          </form>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </section>

              <details className="pp-app-card pp-mobile-section mt-4 p-5 sm:p-6">
                <summary className="cursor-pointer text-sm font-bold text-[#303353]">
                  Profile history · {profile.history.length} {profile.history.length === 1 ? "snapshot" : "snapshots"}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#747b90]">
                  Refreshes create new private versions instead of rewriting your history, so you can see how demonstrated capability changes as evidence accumulates.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {profile.history.map((version) => (
                    <div key={version.id} className="rounded-2xl border border-[#e8e8f0] bg-[#fafaff] p-4 text-sm">
                      <strong className="text-[#303353]">Version {version.version}</strong>
                      <span className="mt-1 block text-xs text-[#7f859a]">
                        {version.capabilityCount} capability {version.capabilityCount === 1 ? "claim" : "claims"} · {version.status}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function IdentityChip({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="pp-soft-chip flex min-h-11 shrink-0 touch-manipulation items-center gap-2 rounded-full px-4 text-sm font-semibold transition-transform active:scale-[0.98]">
      <span className="text-[#5f46d6]" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
