import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { activateMissionAction } from "@/modules/mission/application/mission-actions";
import {
  getCurrentMissionState,
  getMissionProfileContext,
} from "@/modules/mission/infrastructure/mission-dal";
import { MissionGenerationForm } from "@/modules/mission/ui/mission-generation-form";
import { MissionRefinementForm } from "@/modules/mission/ui/mission-refinement-form";

export const metadata: Metadata = {
  title: "My Practical Mission",
  robots: { index: false, follow: false },
};

const horizonLabels = {
  two_weeks: "Two weeks",
  four_weeks: "Four weeks",
  six_weeks: "Six weeks",
  eight_weeks: "Eight weeks",
};

type DisplayMission = NonNullable<
  Awaited<ReturnType<typeof getCurrentMissionState>>["draft"]
>;

function CampaignBrief({ mission }: { mission: DisplayMission }) {
  return (
    <>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="border-border bg-background rounded-2xl border p-4">
          <p className="text-muted text-xs font-semibold tracking-wide uppercase">
            Who it helps
          </p>
          <p className="text-navy mt-2 text-sm leading-6">
            {mission.who_this_helps}
          </p>
        </div>
        <div className="border-border bg-background rounded-2xl border p-4">
          <p className="text-muted text-xs font-semibold tracking-wide uppercase">
            First win
          </p>
          <p className="text-navy mt-2 text-sm leading-6">
            {mission.first_meaningful_outcome}
          </p>
        </div>
        <div className="border-border bg-background rounded-2xl border p-4">
          <p className="text-muted text-xs font-semibold tracking-wide uppercase">
            Time horizon
          </p>
          <p className="text-navy mt-2 text-sm font-semibold">
            {horizonLabels[mission.time_horizon]}
          </p>
        </div>
      </div>

      <details className="border-border mt-4 rounded-2xl border p-4">
        <summary className="text-navy cursor-pointer text-sm font-semibold">
          Open full Campaign brief
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["Success signal", mission.success_signal],
            ["Current caution", mission.current_caution],
            ["Why this fits you", mission.why_this_fits],
          ].map(([label, value], index) => (
            <div key={label} className={index === 2 ? "sm:col-span-2" : ""}>
              <h3 className="text-gold text-xs font-semibold tracking-wide uppercase">
                {label}
              </h3>
              <p className="text-muted mt-2 text-sm leading-6">{value}</p>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}

function ChangePathLink() {
  return (
    <ButtonLink
      href="/onboarding/discovery/profile"
      variant="secondary"
      className="mt-4"
    >
      Review / Change Path →
    </ButtonLink>
  );
}

export default async function MissionPage() {
  const context = await getMissionProfileContext();
  const state = await getCurrentMissionState(context?.profileId);
  const attemptsRemaining = Math.max(0, 3 - state.attempts);
  const mission = state.active ?? state.draft;

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
          className="absolute right-12 -bottom-36 size-72 rounded-full bg-[#f3c86b]/12 blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#f3c86b] uppercase">
            Mission · Your Campaign
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {mission?.title ?? "Choose a direction worth testing in real life."}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
            {mission?.mission_statement ??
              "A Campaign is not a permanent career decision. It is one meaningful direction you can test by creating value, learning and collecting evidence."}
          </p>
          {context?.selectedPath ? (
            <div className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-blue-50">
              <span className="text-[#f3c86b]">Path</span>
              <span className="truncate font-semibold">
                {context.selectedPath.pathName}
              </span>
            </div>
          ) : null}
        </div>
      </section>

      {!context ? (
        <Surface className="mt-6 p-6 sm:p-8">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            Campaign locked
          </p>
          <h2 className="text-navy mt-2 text-2xl font-semibold">
            Discover your starting point first.
          </h2>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
            Your Human Potential Profile gives the Mission evidence to work from
            instead of inventing a direction for you.
          </p>
          <ButtonLink href="/onboarding/discovery/profile" className="mt-5">
            Open My Potential Profile →
          </ButtonLink>
        </Surface>
      ) : state.active ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <Surface className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-success text-xs font-semibold tracking-[0.14em] uppercase">
                  Campaign active
                </p>
                <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                  This is the direction your next actions serve.
                </h2>
              </div>
              <span className="border-success/20 bg-success/10 text-success rounded-full border px-3 py-1.5 text-xs font-semibold">
                Active
              </span>
            </div>
            <CampaignBrief mission={state.active} />
            <ButtonLink href="/journey" className="mt-6">
              Enter Journey Map →
            </ButtonLink>
          </Surface>

          <div className="space-y-5">
            <Surface className="border-gold/25 bg-gold/5 p-5 sm:p-6">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Campaign rule
              </p>
              <p className="text-muted mt-2 text-sm leading-6">
                Do not prove that this is your forever path. Prove what you can
                learn, build and contribute next.
              </p>
            </Surface>
            {context.selectedPath ? (
              <Surface className="p-5 sm:p-6">
                <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                  Why this path is being tested
                </p>
                <p className="text-muted mt-2 text-sm leading-6">
                  {context.selectedPath.possibleInterpretation}
                </p>
                <ChangePathLink />
              </Surface>
            ) : null}
          </div>
        </section>
      ) : state.draft ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <Surface className="border-primary/20 p-5 sm:p-7">
            <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
              Campaign proposal
            </p>
            <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
              Does this feel worth testing?
            </h2>
            <CampaignBrief mission={state.draft} />
            <div className="mt-6 flex flex-wrap gap-3">
              <form action={activateMissionAction}>
                <input type="hidden" name="missionId" value={state.draft.id} />
                <Button type="submit">Start This Campaign →</Button>
              </form>
              <MissionGenerationForm
                kind="regenerate"
                attemptsRemaining={attemptsRemaining}
              />
            </div>
          </Surface>

          <aside className="space-y-5">
            <Surface className="p-5 sm:p-6">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                You still own the direction
              </p>
              <p className="text-muted mt-2 text-sm leading-6">
                PipuPath can shape the Campaign, but you choose whether it is a
                useful experiment.
              </p>
              {context.selectedPath ? <ChangePathLink /> : null}
            </Surface>
            <details className="border-border bg-panel rounded-2xl border p-5">
              <summary className="text-navy cursor-pointer text-sm font-semibold">
                Adjust this Campaign
              </summary>
              <div className="mt-4">
                <MissionRefinementForm
                  missionId={state.draft.id}
                  attemptsRemaining={attemptsRemaining}
                />
              </div>
            </details>
          </aside>
        </section>
      ) : !context.selectedPath ? (
        <Surface className="mt-6 p-6 sm:p-8">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            Choose your direction
          </p>
          <h2 className="text-navy mt-2 text-2xl font-semibold">
            Pick one Possible Path to test.
          </h2>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
            You are not choosing your whole future. You are choosing which
            possibility deserves the next real experiment.
          </p>
          <ButtonLink href="/onboarding/discovery/profile" className="mt-5">
            Explore Possible Paths →
          </ButtonLink>
        </Surface>
      ) : (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Surface className="border-gold/30 bg-gold/5 p-6 sm:p-8">
            <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
              Campaign generation
            </p>
            <h2 className="text-navy mt-2 text-3xl font-semibold tracking-tight">
              Turn {context.selectedPath.pathName} into one practical test.
            </h2>
            <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
              The Campaign will aim for a reachable useful outcome that develops
              capability and gives you evidence before you commit more time or
              resources.
            </p>
            <div className="mt-5">
              <MissionGenerationForm
                kind="initial"
                attemptsRemaining={attemptsRemaining}
              />
            </div>
          </Surface>
          <Surface className="p-5 sm:p-6">
            <p className="text-primary text-xs font-semibold tracking-wide uppercase">
              Selected path
            </p>
            <h3 className="text-navy mt-2 text-lg font-semibold">
              {context.selectedPath.pathName}
            </h3>
            <p className="text-muted mt-2 text-sm leading-6">
              {context.selectedPath.possibleInterpretation}
            </p>
            <ChangePathLink />
          </Surface>
        </section>
      )}
    </main>
  );
}
