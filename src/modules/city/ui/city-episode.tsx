"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  builds,
  episode,
  evaluateFestival,
  limits,
  roles,
  type BuildId,
  type Role,
} from "../domain/festival";
import {
  BuildMiniature,
  CityBackdrop,
  CityIcon,
  type IconName,
} from "./city-art";
import { evaluateCityThroughEngine } from "../domain/game-engine";
import "./city.css";

export type CityContext = {
  questId: string;
  questTitle: string;
  journeyTitle: string;
  returnHref: string;
  returnLabel: string;
  outcome: string;
};
const voices = [
  {
    name: "Ada",
    icon: "access",
    line: "Leave a clear path. I want to join in too.",
    detail:
      "I want to come. But my chair needs a clear, level path to every activity.",
    color: "#c3b5ef",
  },
  {
    name: "Timi",
    icon: "music",
    line: "Give us something worth staying for.",
    detail:
      "Give us something to do together. A square full of stalls alone won't bring me back.",
    color: "#9cdbca",
  },
  {
    name: "Mama Jo",
    icon: "signs",
    line: "Make sure people can find us.",
    detail:
      "A wonderful event is useless if nobody knows where it is. Help people find us.",
    color: "#edc28e",
  },
] as const;
const roleClues: Record<Role, string> = {
  maker: "Supplies, setup hours and helpers are three different limits.",
  designer:
    "Invitations bring people here. Paths let them join in. Those are different jobs.",
  organiser:
    "Every neighbour needs something different. Make room for each one.",
};
const roleIcons: Record<Role, IconName> = {
  maker: "supplies",
  designer: "art",
  organiser: "people",
};
const titles = [
  "Someone left you the keys.",
  "Who is this place for?",
  "Choose your approach.",
  "Make tonight worth coming to.",
  "See what made the difference.",
  "Rain changes everything.",
  "Your next move is real.",
];

export function CityEpisode({
  context = null,
}: {
  context?: CityContext | null;
}) {
  const [stage, setStage] = useState(0);
  const [role, setRole] = useState<Role>("maker");
  const [heard, setHeard] = useState<number[]>([]);
  const [plan, setPlan] = useState<BuildId[]>([]);
  const [result, setResult] = useState<ReturnType<
    typeof evaluateFestival
  > | null>(null);
  const [firstPlan, setFirstPlan] = useState<BuildId[]>([]);
  const [reflection, setReflection] = useState("");
  const [experiment, setExperiment] = useState(
    "Sketch a better layout for a familiar space.",
  );
  const heading = useRef<HTMLHeadingElement>(null);
  const weather = stage >= 5 ? "rain" : "clear";
  const totals = evaluateFestival(plan, weather);
  const engineResult = evaluateCityThroughEngine(plan, weather);
  const budget = limits[weather];
  // Shared chapter engine decides success; the legacy evaluator supplies
  // detailed neighbour feedback until all chapters adopt scenario messages.
  const chapterSuccess = engineResult.success;
  if (chapterSuccess !== totals.success) {
    throw new Error("Game chapter rules do not match the city episode");
  }
  const isTrial = stage === 3 || stage === 5;
  function move(next: number) {
    setStage(next);
    setResult(null);
    if (next === 5) setPlan([]);
    requestAnimationFrame(() => {
      heading.current?.focus();
      heading.current?.scrollIntoView?.({
        block: "start",
        behavior: "instant",
      });
    });
  }
  function toggle(id: BuildId) {
    setPlan((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    setResult(null);
  }
  function download() {
    const report = {
      episode: episode.id,
      kind: "Practice plan — not verified real-world evidence",
      questId: context?.questId ?? null,
      chosenRole: role,
      firstPlan,
      rainPlan: plan,
      reflection,
      proposedExperiment: experiment,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pipupath-my-city-experiment.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }
  function replay() {
    setHeard([]);
    setPlan([]);
    setFirstPlan([]);
    setReflection("");
    setExperiment("Sketch a better layout for a familiar space.");
    move(0);
  }
  return (
    <main
      id="main-content"
      className="w-full bg-[#f7f8fc] pb-10 text-[#25284a]"
    >
      <header className="bg-[#201b59] px-4 py-4 text-white sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Link
            href={context?.returnHref ?? "/build"}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-indigo-100"
          >
            ← {context ? "Back to my Quest" : "Back to Build"}
          </Link>
          <p className="text-xs font-semibold text-indigo-100">
            The Unbuilt City · 01
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-5xl space-y-4 px-3 pt-4 sm:px-6">
        <nav
          aria-label="Your connected adventure"
          className="flex items-center justify-between gap-2 rounded-2xl border border-[#e1ddef] bg-white px-3 py-3 text-xs font-semibold"
        >
          {(
            [
              ["play", "Play", true],
              ["art", "Act", false],
              ["proof", "Prove", false],
              ["spark", "Grow", false],
            ] as const
          ).map(([icon, label, current]) => (
            <span
              key={label}
              aria-current={current ? "step" : undefined}
              className={`flex items-center gap-1.5 ${current ? "text-[#6343cc]" : "text-[#69728a]"}`}
            >
              <CityIcon name={icon} className="size-4" />
              {label}
            </span>
          ))}
        </nav>
        {context && (
          <p className="truncate text-xs text-[#626a80]">
            {context.journeyTitle} <span aria-hidden="true">/</span>{" "}
            {context.questTitle}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#6848dc] uppercase">
              {stage === 5
                ? "Night 02 · On your own"
                : `Part ${stage + 1} of 7 · ${episode.stages[stage]}`}
            </p>
            <h1 className="sr-only">{episode.title}</h1>
            <h2
              ref={heading}
              tabIndex={-1}
              className="mt-2 scroll-mt-24 text-2xl font-bold tracking-tight outline-none sm:text-3xl"
            >
              {titles[stage]}
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-[#ece8fa] p-3 text-[#6848dc]">
            <CityIcon name={stage === 5 ? "shelter" : "spark"} />
          </span>
        </div>
        <ol aria-label="Episode progress" className="flex gap-1.5">
          {episode.stages.map((label, i) => (
            <li
              key={label}
              aria-current={i === stage ? "step" : undefined}
              className={`h-1 flex-1 rounded-full ${i <= stage ? "bg-[#b39143]" : "bg-[#ded9ec]"}`}
            >
              <span className="sr-only">
                {label}
                {i < stage ? " — visited" : ""}
              </span>
            </li>
          ))}
        </ol>

        {stage === 0 && (
          <>
            <CityBackdrop>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
                <p className="text-xs font-bold tracking-widest text-[#f1d295] uppercase">
                  Your city. Your next possibility.
                </p>
                <p className="mt-2 max-w-md text-3xl font-bold sm:text-5xl">
                  One night.
                  <br />
                  Make it matter.
                </p>
                <p className="mt-3 max-w-sm text-sm leading-6">
                  This square could become a car park.
                  <br />
                  Give the neighbourhood a reason to keep it.
                </p>
                <Button onClick={() => move(1)} className="mt-5 rounded-full">
                  Meet the neighbours →
                </Button>
              </div>
            </CityBackdrop>
            <p className="text-center text-xs text-[#626a80]">
              Tap. Build. Test. Then take an idea into your life.
            </p>
          </>
        )}

        {stage === 1 && (
          <section className="pp-app-card p-4 sm:p-6">
            <p className="mb-4 text-sm text-[#626a80]">
              Tap each neighbour. What matters to them?
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {voices.map((voice, index) => (
                <button
                  key={voice.name}
                  type="button"
                  aria-expanded={heard.includes(index)}
                  onClick={() =>
                    setHeard((current) =>
                      current.includes(index) ? current : [...current, index],
                    )
                  }
                  className="city-voice min-h-44 rounded-3xl border border-[#ded9ed] p-4 text-left focus-visible:outline-2 focus-visible:outline-[#6848dc]"
                  style={{
                    background: `linear-gradient(145deg, ${voice.color}66, #fff)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Portrait index={index} />
                    <span>
                      <strong className="block text-lg">{voice.name}</strong>
                      <span className="mt-1 flex items-center gap-1 text-xs text-[#62547d]">
                        <CityIcon name={voice.icon} className="size-4" />
                        {heard.includes(index) ? "Heard" : "Tap to listen"}
                      </span>
                    </span>
                  </div>
                  <p className="mt-4 rounded-2xl bg-white p-3 text-sm leading-6 font-medium">
                    {heard.includes(index)
                      ? `“${voice.line}”`
                      : "What would bring you here?"}
                  </p>
                  <span className="sr-only">
                    {heard.includes(index) ? voice.detail : ""}
                  </span>
                </button>
              ))}
            </div>
            <Button
              disabled={heard.length < 3}
              onClick={() => move(2)}
              className="mt-5 w-full rounded-full sm:w-auto"
            >
              I&apos;ve heard everyone →
            </Button>
          </section>
        )}

        {stage === 2 && (
          <section className="pp-app-card p-4 sm:p-6">
            <p className="text-sm text-[#626a80]">
              One approach to try. You can switch on a replay.
            </p>
            <fieldset className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
              <legend className="sr-only">Choose your role</legend>
              {roles.map((item) => (
                <label
                  key={item.id}
                  className={`relative flex cursor-pointer flex-col items-center rounded-3xl border p-3 text-center ${role === item.id ? "border-[#6848dc] bg-[#efeafa] ring-2 ring-[#6848dc]/20" : "border-[#ded9ed] bg-white"}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={item.id}
                    checked={role === item.id}
                    onChange={() => setRole(item.id)}
                    className="absolute top-3 right-3 accent-[#6848dc]"
                  />
                  <CityIcon
                    name={roleIcons[item.id]}
                    className="my-5 size-10 text-[#6343cc]"
                  />
                  <strong className="text-sm sm:text-base">{item.title}</strong>
                  <span className="sr-only">{item.detail}</span>
                </label>
              ))}
            </fieldset>
            <p className="mt-5 flex gap-3 rounded-2xl bg-[#eee9fb] p-4 text-sm leading-6">
              <CityIcon
                name="spark"
                className="size-5 shrink-0 text-[#6343cc]"
              />
              <span>{roleClues[role]}</span>
            </p>
            <Button
              onClick={() => move(3)}
              className="mt-5 w-full rounded-full sm:w-auto"
            >
              Open the square →
            </Button>
          </section>
        )}

        {isTrial && (
          <>
            <p className="text-sm text-[#626a80]">
              {stage === 3
                ? "Plan together if you can. Tap a site to add or remove it."
                : "Try it yourself. Less supplies. Rain cover needed."}
            </p>
            <div className="grid grid-cols-3 gap-2" aria-label="Resources used">
              {(
                [
                  ["supplies", "Supplies", totals.cost, budget.cost],
                  ["clock", "Hours", totals.time, budget.time],
                  ["people", "Helpers", totals.crew, budget.crew],
                ] as const
              ).map(([icon, label, used, max]) => (
                <div
                  key={label}
                  className={`rounded-2xl border bg-white p-3 ${used > max ? "border-red-500 text-red-700" : "border-[#ded9ed]"}`}
                >
                  <span className="flex items-center gap-1.5 text-xs">
                    <CityIcon name={icon} className="size-4" />
                    {label}
                  </span>
                  <strong className="mt-1 block text-xl">
                    {used}
                    <span className="text-xs font-normal"> / {max}</span>
                  </strong>
                  <div
                    aria-hidden="true"
                    className="mt-2 h-1 rounded-full bg-[#e9e5f0]"
                  >
                    <div
                      className={`h-full rounded-full ${used > max ? "bg-red-500" : "bg-[#7b61c8]"}`}
                      style={{ width: `${Math.min((used / max) * 100, 100)}%` }}
                    />
                  </div>
                  {used > max && (
                    <span className="text-xs">Over the limit</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Plan targets">
              <Target
                icon="people"
                text={`${totals.visitors} / 24 visitors`}
                met={totals.visitors >= 24}
              />
              <Target
                icon="spark"
                text={`${totals.joy} / 4 enjoyment`}
                met={totals.joy >= 4}
              />
              <Target
                icon="access"
                text="Access"
                met={plan.includes("access")}
              />
              <Target
                icon="signs"
                text="Invitations"
                met={plan.includes("signs")}
              />
              {weather === "rain" && (
                <Target
                  icon="shelter"
                  text="Cover"
                  met={plan.includes("shelter")}
                />
              )}
            </div>
            <CityBackdrop
              rainy={weather === "rain"}
              celebrating={!!result?.success}
            >
              <div className="absolute top-3 left-3 rounded-full bg-[#201b59]/90 px-3 py-2 text-xs font-semibold text-white">
                {weather === "rain" ? "Rainy night" : "Clear evening"} · Tap a
                site
              </div>
              <div
                className="city-sites absolute inset-x-3 top-[20%] bottom-[9%] grid grid-cols-3 grid-rows-2 gap-1 sm:inset-x-12 sm:top-[22%] sm:bottom-[13%] sm:gap-4"
                aria-label="Build sites"
              >
                {builds.map((build) => (
                  <button
                    key={build.id}
                    type="button"
                    aria-label={`${build.title}. ${build.cost} supplies, ${build.time} hours, ${build.crew} helpers. ${build.visitors} visitors, ${build.joy} enjoyment.`}
                    aria-pressed={plan.includes(build.id)}
                    onClick={() => toggle(build.id)}
                    className={`city-site group relative flex min-h-11 min-w-0 flex-col items-center justify-end rounded-2xl border py-2 focus-visible:outline-4 focus-visible:outline-white ${plan.includes(build.id) ? "border-[#eaca88] bg-[#261c50]/80 text-white" : "border-white/40 bg-[#201b59]/60 text-white"}`}
                  >
                    <span
                      className="absolute top-1 right-2 text-sm text-[#ffe0a5]"
                      aria-hidden="true"
                    >
                      {plan.includes(build.id) ? "✓" : "+"}
                    </span>
                    <span
                      className={
                        plan.includes(build.id) ? "city-built" : "opacity-70"
                      }
                    >
                      <BuildMiniature id={build.id} />
                    </span>
                    <span className="px-1 text-center text-[10px] leading-4 font-semibold sm:text-sm">
                      {build.title}
                    </span>
                    <span
                      className="mt-1 flex gap-2 text-[10px] text-[#eee5ff] sm:text-xs"
                      aria-hidden="true"
                    >
                      <span className="flex gap-0.5">
                        <CityIcon name="supplies" className="size-3" />
                        {build.cost}
                      </span>
                      <span className="flex gap-0.5">
                        <CityIcon name="clock" className="size-3" />
                        {build.time}
                      </span>
                      <span className="flex gap-0.5">
                        <CityIcon name="people" className="size-3" />
                        {build.crew}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              {result && (
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-1 pb-3"
                  aria-hidden="true"
                >
                  {Array.from({ length: result.success ? 14 : 4 }, (_, i) => (
                    <span
                      key={i}
                      className="city-resident"
                      style={{
                        animationDelay: `${i * 0.13}s`,
                        background: ["#ecbe79", "#9fd2c4", "#b3a1e2"][i % 3],
                      }}
                    />
                  ))}
                </div>
              )}
            </CityBackdrop>
            <details className="rounded-2xl border border-[#ded9ed] bg-white p-3 text-xs leading-6">
              <summary className="cursor-pointer font-semibold">
                What do the icons and numbers mean?
              </summary>
              <p className="mt-2">
                Box = supplies. Clock = setup hours. People = helpers. Add sites
                to reach 24 visitors and 4 enjoyment. Include paths and
                invitations; add cover when it rains. Stay within all three
                resource limits. These are fictional game rules.
              </p>
              <ul className="mt-2">
                {builds.map((b) => (
                  <li key={b.id}>
                    <strong>{b.title}:</strong> {b.detail} +{b.visitors}{" "}
                    visitors · +{b.joy} enjoyment.
                  </li>
                ))}
              </ul>
            </details>
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={!plan.length}
                onClick={() => setResult(evaluateFestival(plan, weather))}
                className="flex-1 gap-2 rounded-full sm:flex-none"
              >
                <CityIcon name="play" className="size-5" />
                Open the gates →
              </Button>
              <Button
                variant="secondary"
                disabled={!plan.length}
                onClick={() => {
                  setPlan([]);
                  setResult(null);
                }}
                className="rounded-full"
              >
                Clear plan
              </Button>
            </div>
            {result && (
              <section
                role="status"
                className={`rounded-3xl border p-5 ${result.success ? "border-[#8dc9b7] bg-[#eaf7f0]" : "border-[#ddc58d] bg-[#fff8e9]"}`}
              >
                <div className="flex items-center gap-3">
                  <CityIcon
                    name={result.success ? "spark" : "art"}
                    className="size-9 shrink-0"
                  />
                  <div>
                    <h3 className="text-lg font-bold">
                      {result.success
                        ? "The square comes alive."
                        : "Something needs another look."}
                    </h3>
                    <p className="mt-1 text-xs">
                      {result.visitors} visitors · {result.joy} enjoyment ·{" "}
                      {result.success ? "All needs met" : "Adjust and retry"}
                    </p>
                  </div>
                </div>
                {result.problems.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm leading-6">
                    {result.problems.map((p) => (
                      <li key={p}>• {p}</li>
                    ))}
                  </ul>
                )}
                <Button
                  onClick={() => {
                    if (stage === 3) setFirstPlan([...plan]);
                    move(stage === 3 ? 4 : 6);
                  }}
                  className="mt-4 rounded-full"
                >
                  {stage === 3
                    ? "See what this teaches →"
                    : "Reflect on this attempt →"}
                </Button>
              </section>
            )}
          </>
        )}

        {stage === 4 && (
          <section className="pp-app-card p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["people", "Listen", "Every person adds a requirement."],
                  [
                    "supplies",
                    "Balance",
                    "Supplies, hours and helpers each have a limit.",
                  ],
                  ["play", "Test", "Change one choice. Compare what happens."],
                ] as const
              ).map(([icon, title, line]) => (
                <div key={title} className="rounded-3xl bg-[#f0ebfb] p-5">
                  <CityIcon
                    name={icon}
                    className="mb-4 size-10 text-[#6848dc]"
                  />
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#626a80]">
                    {line}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6">
              {evaluateFestival(firstPlan, "clear").success
                ? "Your plan worked. Now find out which choices survive a change."
                : "A busy square needs more than an attraction. Paths and invitations matter too."}
            </p>
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer font-semibold">
                Show a working example
              </summary>
              <p className="mt-2 leading-6">
                Music + Make & share + paths + invitations: 9 supplies, 7 hours,
                6 helpers. Rain changes what you need.
              </p>
            </details>
            <Button onClick={() => move(5)} className="mt-5 rounded-full">
              Try a different night →
            </Button>
          </section>
        )}

        {stage === 6 && (
          <section className="pp-app-card space-y-5 p-5 sm:p-7">
            <div className="flex items-center gap-4 rounded-3xl bg-[#eee9fb] p-4">
              <CityIcon
                name="art"
                className="size-10 shrink-0 text-[#6848dc]"
              />
              <div>
                <p className="text-xs font-semibold text-[#6848dc]">
                  PLAY → ACT
                </p>
                <h3 className="mt-1 font-bold">
                  {context?.questTitle ?? "Try a small idea in your world."}
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#626a80]">
                  {context?.outcome ??
                    "Ask someone you know. Make one improvement. Get their feedback."}
                </p>
              </div>
            </div>
            <label
              htmlFor="city-reflection"
              className="block text-sm font-semibold"
            >
              What did you change, and whose need did it help?
              <textarea
                id="city-reflection"
                maxLength={1200}
                rows={2}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#bdb7df] bg-white p-3 text-[#25284a]"
                placeholder="One sentence is enough."
              />
            </label>
            {!context && (
              <fieldset className="space-y-2">
                <legend className="mb-3 text-sm font-semibold">
                  Choose a small real-world experiment
                </legend>
                {[
                  "Sketch a better layout for a familiar space.",
                  "Make a clearer invitation for a small activity.",
                  "Plan a no-cost activity with someone you know.",
                ].map((item) => (
                  <label
                    key={item}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-[#ded9ed] p-3 text-sm"
                  >
                    <input
                      type="radio"
                      name="experiment"
                      checked={experiment === item}
                      onChange={() => setExperiment(item)}
                      className="accent-[#6848dc]"
                    />
                    {item}
                  </label>
                ))}
              </fieldset>
            )}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {(
                [
                  ["people", "Ask"],
                  ["art", "Make"],
                  ["proof", "Bring proof"],
                ] as const
              ).map(([icon, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#ded9ed] p-3"
                >
                  <CityIcon
                    name={icon}
                    className="mx-auto mb-2 size-7 text-[#6848dc]"
                  />
                  {label}
                </div>
              ))}
            </div>
            <ButtonLink
              href={context?.returnHref ?? "/quests"}
              className="w-full gap-2 rounded-full"
            >
              <CityIcon name="art" className="size-5" />
              {context?.returnLabel ?? "Open my real-world Quests →"}
            </ButtonLink>
            <p className="text-xs leading-5 text-[#626a80]">
              Use your actual Quest steps. A game plan is practice; bring back
              proof only after a real attempt. No spending or strangers
              required. Ask a trusted adult before changing shared spaces.
            </p>
            <details className="text-xs leading-6">
              <summary className="cursor-pointer font-semibold">
                Keep this practice plan
              </summary>
              <Button
                onClick={download}
                variant="secondary"
                className="mt-3 rounded-full"
              >
                Download my experiment
              </Button>
              <p className="mt-2">
                This page does not upload your reflection or create a Quest. The
                download is practice, not evidence.
              </p>
            </details>
            <Button
              variant="secondary"
              onClick={replay}
              className="rounded-full"
            >
              Replay with another role
            </Button>
          </section>
        )}
        <details className="px-2 text-xs leading-6 text-[#626a80]">
          <summary className="cursor-pointer">About this chapter</summary>
          <p>
            Fictional practice. No XP or ability score. Decisions and notes stay
            in this tab; refreshing starts again. Real-world proof and
            reflection remain in your Quest.
          </p>
        </details>
      </div>
    </main>
  );
}
function Target({
  icon,
  text,
  met,
}: {
  icon: IconName;
  text: string;
  met: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1.5 text-[11px] font-medium ${met ? "border-[#8dc9b7] bg-[#eaf7f0] text-[#235845]" : "border-[#ded9ed] bg-white text-[#626a80]"}`}
    >
      <CityIcon name={icon} className="size-3.5" />
      {text}
      <span className="sr-only">{met ? " — met" : " — needed"}</span>
    </span>
  );
}
function Portrait({ index }: { index: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 80"
      className="size-16 shrink-0 rounded-2xl"
    >
      <rect
        width="80"
        height="80"
        rx="20"
        fill={["#78609f", "#347b73", "#b57d53"][index]}
      />
      <path
        d="M10 80c0-26 60-26 60 0"
        fill={["#e6b97b", "#d9ae69", "#a5d8cb"][index]}
      />
      <ellipse
        cx="40"
        cy="35"
        rx="18"
        ry="22"
        fill={["#b97f59", "#895634", "#a76c46"][index]}
      />
      <path
        d={
          index === 2
            ? "M20 36C9 0 69-9 63 35L52 19 23 36"
            : "M20 33C10 1 65-3 60 32L49 20 21 34"
        }
        fill="#292033"
      />
      <path
        d="M32 35h2m12 0h2m-13 12q5 4 10 0"
        stroke="#342037"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {index === 2 && (
        <path d="M19 21q20-24 43 0" stroke="#e7be83" strokeWidth="10" />
      )}
    </svg>
  );
}
