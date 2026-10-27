"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { evaluateGame, type GameChapter } from "../domain/game-engine";
import { CinematicImage, GardenSymbol } from "./cinematic-art";
import { getWorldPresentation } from "./world-presentation";
import { chapterWithDisruption, disruptions } from "../domain/disruptions";
import { emptyGardenPlot, evaluateGardenLayout, gardenPieces, type GardenPlotState } from "../domain/garden-layout";
import { GardenPlot } from "./garden-plot";
import { LessonPath } from "./lesson-path";
import "./adventure-theme.css";

type GaugeTone = "gold" | "teal" | "blue";
function ResourceGauge({
  label,
  used,
  limit,
  tone,
}: {
  label: string;
  used: number;
  limit: number;
  tone: GaugeTone;
}) {
  const over = used > limit;
  const percentage = Math.min(
    100,
    Math.round((used / Math.max(1, limit)) * 100),
  );
  const tones: Record<GaugeTone, string> = {
    gold: "bg-[#f2c679]",
    teal: "bg-[#7ad5b8]",
    blue: "bg-[#8acaf4]",
  };
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-xl border px-2 py-3 sm:rounded-2xl sm:p-4 ${over ? "border-rose-300/50 bg-[#422b34]" : "border-white/15 bg-white/10"}`}
    >
      <span className="block text-[0.65rem] font-semibold text-[#c8dceb] sm:text-xs">
        {label}
      </span>
      <strong className="mt-1 block truncate text-base font-extrabold text-white tabular-nums sm:text-xl">
        {used}
        <span className="font-normal text-[#b0c5d3]"> / {limit}</span>
      </strong>
      <div
        role="progressbar"
        aria-label={`${label} used`}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none ${over ? "bg-rose-300" : tones[tone]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {over && (
        <span className="mt-1 block text-[0.6rem] leading-3 text-rose-200">
          Over limit
        </span>
      )}
    </div>
  );
}

function ImpactBar({
  label,
  value,
  goal,
  color,
}: {
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const percentage = Math.min(
    100,
    Math.round((value / Math.max(1, goal)) * 100),
  );
  return (
    <div className="min-w-0 rounded-2xl border border-white/15 bg-white/5 p-3">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <span className="min-w-0 text-xs leading-4 font-semibold text-[#cbdde9]">
          {label}
        </span>
        <span className="shrink-0 text-xs font-bold tabular-nums">
          {value} / {goal}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={Math.min(value, goal)}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"
      >
        <div
          className="h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function ChapterChallenge({ chapter }: { chapter: GameChapter }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [twistActive, setTwistActive] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lastTrial, setLastTrial] = useState<{
    reach: number;
    benefit: number;
  } | null>(null);
  const [comparison, setComparison] = useState<{
    reach: number;
    benefit: number;
  } | null>(null);
  const twist = disruptions[chapter.id];
  const playable =
    twistActive && sceneIndex === 0 ? chapterWithDisruption(chapter) : chapter;
  const [selected, setSelected] = useState<string[]>([]);
  const [gardenPlot, setGardenPlot] = useState<GardenPlotState>(emptyGardenPlot);
  const [checked, setChecked] = useState(false);
  const [previous, setPrevious] = useState<{
    name: string;
    choices: number;
  } | null>(null);
  const scenario = playable.scenarios[sceneIndex];
  const world = getWorldPresentation(chapter.id);
  const scene = world?.scenes[scenario.id];
  const result = evaluateGame(playable, scenario.id, selected);
  const isGarden = chapter.id === "neighbourhood-garden-v1";
  const layout = isGarden ? evaluateGardenLayout(selected, gardenPlot, scenario.id) : { success: true, problems: [] as string[] };
  const planWorks = result.success && layout.success;
  const isLast = sceneIndex === chapter.scenarios.length - 1;
  const successful = checked && planWorks;
  const failed = checked && !planWorks;
  const cover = scene?.image ?? world?.image ?? "";
  const impactColor = world?.accent ?? "#ecca83";
  const titleOnWin =
    chapter.id === "neighbourhood-garden-v1"
      ? "The garden comes alive."
      : "Your plan makes a difference.";

  function testPlan() {
    setComparison(lastTrial);
    setLastTrial({ reach: result.totals.visitors, benefit: result.totals.joy });
    setAttempts((count) => count + 1);
    setChecked(true);
  }

  function faceChange() {
    setTwistActive(true);
    requestAnimationFrame(() => {
      const heading = document.getElementById("disruption-heading");
      heading?.focus();
      heading?.scrollIntoView?.({ block: "start", behavior: "instant" });
    });
    setChecked(false);
    setLastTrial(null);
    setComparison(null);
  }

  function toggle(id: string) {
    setSelected((choices) =>
      choices.includes(id)
        ? choices.filter((choice) => choice !== id)
        : [...choices, id],
    );
    setChecked(false);
  }

  function next() {
    if (!planWorks || !checked || isLast) return;
    setPrevious({ name: scenario.label, choices: selected.length });
    setSceneIndex((index) => index + 1);
    setSelected([]);
    setGardenPlot(emptyGardenPlot());
    setChecked(false);
    setAttempts(0);
    setLastTrial(null);
    setComparison(null);
    document.getElementById("main-content")?.scrollIntoView?.({
      block: "start",
      behavior: "instant",
    });
  }

  return (
    <main
      id="main-content"
      className="adventure-dark w-full max-w-full min-w-0 overflow-x-clip bg-[#071a29] pb-16 text-white"
    >
      <div className="mx-auto w-full max-w-5xl min-w-0 space-y-5 px-3 pt-3 sm:px-6 sm:pt-6">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-bold">
          <Link
            href="/build/adventures"
            className="inline-flex min-h-11 min-w-0 items-center text-[#c3d7e6] hover:text-white"
          >
            ← All adventures
          </Link>
          <span className="max-w-full rounded-full border border-[#edc778]/40 bg-[#f3d58b]/10 px-3 py-2 text-center text-[0.65rem] text-[#f9d88f] sm:text-xs">
            Practice world · No XP awarded
          </span>
        </div>

        <section className="relative isolate min-w-0 overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#244b42] shadow-[0_20px_55px_-26px_rgba(0,0,0,.85)] sm:rounded-[1.8rem]">
          <div className="relative flex min-h-[19rem] flex-col justify-end p-4 sm:min-h-[25rem] sm:p-8">
            {cover && (
              <CinematicImage src={cover} priority className="object-center" />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#061820]/95 via-[#09202a]/70 to-[#071b2a]/15" />
            <div className="relative max-w-2xl min-w-0">
              <p className="text-[0.65rem] font-bold tracking-[.14em] text-[#f5d08d] uppercase sm:tracking-[.2em]">
                {world?.category ?? "Real-life practice"} · Scene{" "}
                {sceneIndex + 1} of {chapter.scenarios.length}
              </p>
              <h1 className="adventure-photo-copy mt-2 max-w-full text-[1.8rem] leading-[1.08] font-extrabold tracking-tight break-words drop-shadow-lg sm:mt-3 sm:text-[3.25rem]">
                {chapter.title}
              </h1>
              <p className="adventure-photo-copy mt-3 max-w-xl text-[0.83rem] leading-5 text-[#e4edf0] sm:text-base sm:leading-6">
                {scene?.intro ?? chapter.description}
              </p>
              <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2 text-[0.7rem] font-bold">
                <span className="max-w-full rounded-full border border-white/25 bg-black/35 px-3 py-2 backdrop-blur-md">
                  {scenario.label}
                </span>
                <span className="rounded-full border border-white/25 bg-black/35 px-3 py-2 backdrop-blur-md">
                  {selected.length} selected
                </span>
              </div>
            </div>
          </div>
        </section>

        <LessonPath
          title="Your story missions"
          nodes={chapter.scenarios.map((item, index) => ({
            id: item.id,
            title: item.label,
            state:
              index < sceneIndex || (index === sceneIndex && successful && isLast)
                ? "done"
                : index === sceneIndex
                  ? "current"
                  : "locked",
          }))}
        />

        {twistActive && sceneIndex === 0 && twist && (
          <section
            role="status"
            aria-label="Situation changed"
            className="adventure-event rounded-2xl border p-4"
          >
            <p className="text-xs font-bold tracking-widest uppercase">
              Plot twist · Your plan is still here
            </p>
            <h2
              id="disruption-heading"
              tabIndex={-1}
              className="mt-2 scroll-mt-24 text-xl font-bold outline-none"
            >
              {twist.title}
            </h2>
            <p className="mt-2 text-sm leading-6">{twist.message}</p>
            <p className="mt-2 text-sm font-semibold">{twist.consequence}</p>
          </section>
        )}

        {previous && (
          <p className="rounded-xl border border-[#b7dcbe]/20 bg-[#15322f] px-4 py-3 text-xs leading-5 text-[#cbe6d3]">
            <strong>Situation changed.</strong> Last scene: {previous.name} with{" "}
            {previous.choices} choices. Your plan has reset so you can respond
            to this new challenge.
          </p>
        )}

        <section
          aria-labelledby="briefing-heading"
          className="min-w-0 rounded-[1.35rem] border border-[#f0cb7d]/25 bg-gradient-to-br from-[#1b3240] to-[#14252e] p-4 sm:p-6"
        >
          <p className="text-[0.68rem] font-extrabold tracking-[.15em] text-[#f3c981] uppercase">
            Your mission briefing
          </p>
          <h2
            id="briefing-heading"
            className="mt-1 text-lg leading-tight font-extrabold sm:text-xl"
          >
            {scene?.challenge ?? chapter.description}
          </h2>
          {scene && (
            <div className="mt-4 flex min-w-0 items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
              <span
                className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-[#33536a] text-base font-bold text-[#f2d18e]"
                aria-hidden="true"
              >
                {scene.person.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold">
                  {scene.person}{" "}
                  <span className="font-normal text-[#a9c6d9]">
                    · {scene.role}
                  </span>
                </p>
                <p className="mt-1 text-sm leading-5 text-[#e5f0ef]">
                  “
                  {failed
                    ? result.problems[0]
                    : successful
                      ? scene.goodNews
                      : scene.quote}
                  ”
                </p>
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="resources-heading" className="min-w-0">
          <div className="mb-3 flex min-w-0 flex-wrap items-end justify-between gap-2">
            <h2 id="resources-heading" className="text-lg font-bold sm:text-xl">
              Your resources
            </h2>
            <span className="text-xs text-[#a9c4d2]">
              Balance all three limits
            </span>
          </div>
          <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:gap-3">
            <ResourceGauge
              label="Supplies"
              tone="gold"
              used={result.totals.cost}
              limit={scenario.budget.cost}
            />
            <ResourceGauge
              label="Hours"
              tone="teal"
              used={result.totals.time}
              limit={scenario.budget.time}
            />
            <ResourceGauge
              label="Helpers"
              tone="blue"
              used={result.totals.crew}
              limit={scenario.budget.crew}
            />
          </div>
        </section>

        <section aria-labelledby="choices-heading" className="min-w-0">
          <div className="mb-4 flex min-w-0 flex-wrap items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-[.15em] text-[#e9be79] uppercase">
                Make your move
              </p>
              <h2
                id="choices-heading"
                className="mt-1 text-xl font-bold sm:text-2xl"
              >
                {isGarden ? "Build your layout" : "What will you do?"}
              </h2>
            </div>
            <p className="text-xs text-[#b4cbdb]">{isGarden ? "Move pieces around the garden" : "Tap a scene to select it"}</p>
          </div>
          {isGarden ? (
            <GardenPlot
              choices={chapter.choices}
              plot={gardenPlot}
              onChange={(next) => {
                setGardenPlot(next);
                setSelected(gardenPieces(next));
                setChecked(false);
              }}
            />
          ) : (
          <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
            {chapter.choices.map((choice, index) => {
              const active = selected.includes(choice.id);
              const blocked =
                scenario.unavailableChoices?.includes(choice.id) ?? false;
              const icon = world?.actionIcons[index] ?? "seed";
              const image = index % 2 === 0 ? world?.secondImage : world?.image;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => toggle(choice.id)}
                  aria-pressed={active}
                  disabled={blocked && !active}
                  aria-describedby={
                    blocked ? `blocked-${choice.id}` : undefined
                  }
                  className={`adventure-choice group relative isolate flex min-h-[10rem] max-w-full min-w-0 flex-col justify-between overflow-hidden rounded-[1.1rem] border-2 p-2.5 text-left shadow-lg transition-[border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffdc96] active:scale-[.98] motion-reduce:transition-none sm:min-h-[13rem] sm:rounded-[1.3rem] sm:p-4 ${active ? "border-[#f1ce85]" : "border-white/15 hover:border-white/50"}`}
                >
                  {image && (
                    <CinematicImage
                      src={image}
                      sizes="(max-width: 640px) 48vw, 30vw"
                      className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07151c]/95 via-[#07151c]/60 to-[#07151c]/35" />
                  <span className="relative flex min-w-0 items-start justify-between gap-1">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/20 bg-black/45 text-[#f8d38c] sm:size-12">
                      <GardenSymbol name={icon} className="size-5 sm:size-7" />
                    </span>
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold ${active ? "border-[#f6d38a] bg-[#f6d38a] text-[#153229]" : "border-white/50 bg-black/25"}`}
                      aria-hidden="true"
                    >
                      {active ? "✓" : "+"}
                    </span>
                  </span>
                  <span className="adventure-choice-copy relative block min-w-0">
                    <strong className="block text-[0.78rem] leading-[1.13rem] break-words sm:text-base sm:leading-5">
                      {choice.label}
                    </strong>
                    <span className="mt-2 block text-[0.61rem] leading-4 text-[#d1dce3] sm:text-xs">
                      {blocked
                        ? "Unavailable · remove to replace"
                        : `${choice.visitors} reach · ${choice.joy} benefit`}
                      <br />
                      {choice.cost} supplies · {choice.time}h · {choice.crew}{" "}
                      helpers
                    </span>
                  </span>
                  {blocked && (
                    <span id={`blocked-${choice.id}`} className="sr-only">
                      Unavailable in this situation. Remove it from your plan.
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          )}
        </section>

        <section
          aria-labelledby="impact-heading"
          className="min-w-0 rounded-2xl border border-[#eac980]/20 bg-[#122e39] p-3 sm:p-5"
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="impact-heading" className="text-base font-bold sm:text-lg">
              Your plan&apos;s potential
            </h2>
            <span className="text-[0.65rem] leading-4 text-[#a7c4d1]">
              Fictional game estimates, not real impact
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <ImpactBar
              label={world?.reachLabel ?? "People reached"}
              value={result.totals.visitors}
              goal={scenario.minimumVisitors}
              color="#8bdbb9"
            />
            <ImpactBar
              label={world?.benefitLabel ?? "Community benefit"}
              value={result.totals.joy}
              goal={scenario.minimumJoy}
              color={impactColor}
            />
          </div>
        </section>

        <section
          aria-labelledby="test-heading"
          className="min-w-0 rounded-[1.4rem] border border-white/15 bg-[#142d39] p-4 sm:p-6"
        >
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 id="test-heading" className="text-lg font-bold">
                Ready to test your plan?
              </h2>
              <p className="mt-1 text-sm leading-5 text-[#b9d0df]">
                Every choice has a cost. See what happens when you put them
                together.
              </p>
            </div>
            <Button
              className="adventure-action min-h-12 w-full shrink-0 rounded-full bg-[#edc477] px-6 font-bold text-[#1c2c35] hover:bg-[#ffda91] sm:w-auto"
              onClick={testPlan}
              disabled={selected.length === 0}
            >
              Test my plan →
            </Button>
          </div>
          {checked && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-4 min-w-0 rounded-2xl border p-4 ${result.success ? "border-[#60cfa5]/40 bg-[#114338]" : "border-[#ecc185]/40 bg-[#46372d]"}`}
            >
              <p className="mb-2 text-xs font-semibold">
                Attempt {attempts} · {selected.length} actions
              </p>
              {comparison && (
                <p className="mb-3 text-xs">
                  Compared with your last test: reach{" "}
                  {result.totals.visitors - comparison.reach >= 0 ? "+" : ""}
                  {result.totals.visitors - comparison.reach}; benefit{" "}
                  {result.totals.joy - comparison.benefit >= 0 ? "+" : ""}
                  {result.totals.joy - comparison.benefit}.
                </p>
              )}
              <h3 className="text-base font-bold">
                {successful
                  ? titleOnWin
                  : "Not quite. Try another combination."}
              </h3>
              <p className="mt-1 text-sm leading-5 text-[#dce9e7]">
                {successful
                  ? (scene?.goodNews ?? "You found a working plan.")
                  : "The world changed. Rebalance your choices and try again."}
              </p>
              {(result.problems.length > 0 || layout.problems.length > 0) && (
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-5 text-[#f9dfbe]">
                  {[...result.problems, ...layout.problems].map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              )}
              {successful && (
                <div className="mt-4">
                  {sceneIndex === 0 && twist && !twistActive ? (
                    <div className="rounded-xl border border-white/25 bg-[#0c2e27] p-4">
                      <p className="mb-3 text-sm font-semibold">
                        {scene?.nextTeaser ?? "Something is about to change."}{" "}
                        Can your plan adapt?
                      </p>
                      <Button
                        onClick={faceChange}
                        className="adventure-action w-full rounded-full sm:w-auto"
                      >
                        See what happens next →
                      </Button>
                    </div>
                  ) : !isLast ? (
                    <Button
                      onClick={next}
                      className="adventure-action min-h-11 w-full rounded-full bg-[#efd18b] px-5 text-[#1b2b35] sm:w-auto"
                    >
                      {chapter.id === "neighbourhood-garden-v1" &&
                      sceneIndex === 0
                        ? "Face the dry week →"
                        : "Next situation →"}
                    </Button>
                  ) : (
                    <Link
                      href="/quests"
                      className="adventure-action inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#efd18b] px-5 text-center text-sm font-bold text-[#1b2b35] sm:w-auto"
                    >
                      Find a real-world Quest →
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <p className="pb-3 text-xs leading-5 text-[#9bb5c5]">
          PipuPath Adventures are fictional practice. They never create Quest
          evidence or grant verified XP. Real progress comes from taking action,
          uploading honest proof and reflecting.
        </p>
      </div>
    </main>
  );
}
