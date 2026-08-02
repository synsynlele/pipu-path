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

function MissionDetails({ mission }: { mission: DisplayMission }) {
  const fields = [
    ["Mission Statement", mission.mission_statement],
    ["Who This Helps", mission.who_this_helps],
    ["First Meaningful Outcome", mission.first_meaningful_outcome],
    ["Suggested Time Horizon", horizonLabels[mission.time_horizon]],
    ["Success Signal", mission.success_signal],
    ["Current Caution", mission.current_caution],
    ["Why This Fits You", mission.why_this_fits],
  ];
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {fields.map(([label, value], index) => (
        <div
          key={label}
          className={index === fields.length - 1 ? "sm:col-span-2" : ""}
        >
          <h3 className="text-gold text-xs font-semibold tracking-wide uppercase">
            {label}
          </h3>
          <p className="text-muted mt-2 leading-7">{value}</p>
        </div>
      ))}
    </div>
  );
}

export default async function MissionPage() {
  const context = await getMissionProfileContext();
  const state = await getCurrentMissionState(context?.profileId);
  const attemptsRemaining = Math.max(0, 3 - state.attempts);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Your practical Builder Mission
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        Turn what you know into useful action.
      </h1>
      <p className="text-muted mt-5 max-w-2xl text-lg leading-8">
        This mission is a practical direction to explore. It is not a permanent
        decision. Start small, learn from real action and refine it as you learn
        more.
      </p>

      {!context ? (
        <Surface className="mt-10 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Your profile comes first</h2>
          <p className="text-muted mt-3 leading-7">
            Complete your Human Potential Profile before PipuPath shapes a
            mission from it.
          </p>
          <ButtonLink href="/onboarding/discovery/profile" className="mt-6">
            Complete my profile
          </ButtonLink>
        </Surface>
      ) : state.active ? (
        <Surface className="mt-10 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Active Mission
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {state.active.title}
          </h2>
          <MissionDetails mission={state.active} />
          <ButtonLink href="/mission/complete" className="mt-8">
            Build My Journey
          </ButtonLink>
        </Surface>
      ) : state.draft ? (
        <Surface className="mt-10 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Mission Review
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {state.draft.title}
          </h2>
          <MissionDetails mission={state.draft} />
          <div className="mt-8 flex flex-wrap gap-3">
            <form action={activateMissionAction}>
              <input type="hidden" name="missionId" value={state.draft.id} />
              <Button type="submit">Accept Mission</Button>
            </form>
            <MissionGenerationForm
              kind="regenerate"
              attemptsRemaining={attemptsRemaining}
            />
          </div>
          <MissionRefinementForm
            missionId={state.draft.id}
            attemptsRemaining={attemptsRemaining}
          />
        </Surface>
      ) : (
        <Surface className="mt-10 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">
            Your profile shows possible directions
          </h2>
          <p className="text-muted mt-3 max-w-2xl leading-7">
            PipuPath can now turn your completed Human Potential Profile into
            one practical mission you can begin exploring.
          </p>
          <div className="mt-7">
            <MissionGenerationForm
              kind="initial"
              attemptsRemaining={attemptsRemaining}
            />
          </div>
        </Surface>
      )}
    </main>
  );
}
