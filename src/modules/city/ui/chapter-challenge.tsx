"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { evaluateGame, type GameChapter } from "../domain/game-engine";
import { gardenChoiceArt, adventureScenes } from "./adventure-scenes";
import { CinematicImage, GardenSymbol } from "./cinematic-art";

function ResourceGauge({
  label,
  value,
  limit,
  kind,
}: {
  label: string;
  value: number;
  limit: number;
  kind: "gold" | "teal" | "blue";
}) {
  const overflow = value > limit;
  const percentage = Math.min(100, Math.round((value / limit) * 100));
  const shades = {
    gold: "bg-[#f3c16e]",
    teal: "bg-[#73d8b8]",
    blue: "bg-[#8fcbf1]",
  };
  return (
    <div
      className={`rounded-2xl border p-3 sm:p-4 ${overflow ? "border-[#f5ac86] bg-[#512f31]" : "border-white/15 bg-white/10"}`}
    >
      <div className="flex items-center justify-between gap-1 text-xs font-semibold text-[#dce7f2]">
        <span>{label}</span>
        <span className="font-bold whitespace-nowrap text-white">
          {value} / {limit}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} used`}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={value}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none ${overflow ? "bg-[#ff8e7d]" : shades[kind]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {overflow && (
        <span className="mt-1 block text-[.66rem] text-[#ffe1c8]">
          Over your limit
        </span>
      )}
    </div>
  );
}

export function ChapterChallenge({ chapter }: { chapter: GameChapter }) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const scenario = chapter.scenarios[scenarioIndex];
  const result = evaluateGame(chapter, scenario.id, selected);
  const isFinal = scenarioIndex === chapter.scenarios.length - 1;
  const isDry = scenario.id === "heat";

  function toggle(id: string) {
    setSelected((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
    setChecked(false);
  }
  function next() {
    setScenarioIndex((index) => index + 1);
    setSelected([]);
    setChecked(false);
  }
  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#071a29] pb-16 text-white"
    >
      <div className="mx-auto max-w-5xl space-y-5 px-4 pt-4 sm:px-7 sm:pt-7">
        <div className="flex items-center justify-between gap-3 text-xs font-bold">
          <Link
            href="/build/adventures"
            className="inline-flex min-h-11 items-center text-[#c3d7e6] hover:text-white"
          >
            ← All adventures
          </Link>
          <span className="rounded-full border border-[#edc778]/40 bg-[#f3d58b]/10 px-3 py-2 text-[#f9d88f]">
            Practice world · No XP awarded
          </span>
        </div>

        <section className="relative isolate overflow-hidden rounded-[1.8rem] border border-white/15 bg-[#254e3b] shadow-[0_20px_55px_-26px_rgba(0,0,0,.85)]">
          <div className="relative flex min-h-[20rem] flex-col justify-end p-5 sm:min-h-[25rem] sm:p-8">
            <CinematicImage
              src={
                isDry ? adventureScenes.gardenDetail : adventureScenes.garden
              }
              priority
              className={
                isDry ? "object-[center_56%] saturate-75" : "object-center"
              }
            />
            <div
              className={`pointer-events-none absolute inset-0 ${isDry ? "bg-gradient-to-t from-[#201b15]/95 via-[#3b2c1c]/65 to-[#17271d]/20" : "bg-gradient-to-t from-[#081c21]/95 via-[#071d28]/55 to-[#0c2630]/5"}`}
            />
            <div className="relative max-w-2xl">
              <p className="text-[.67rem] font-bold tracking-[.2em] text-[#eec87f] uppercase">
                Adventure 02 <span className="mx-2 text-white/40">/</span> Scene{" "}
                {scenarioIndex + 1} of {chapter.scenarios.length}
              </p>
              <h1 className="mt-3 text-[2rem] leading-[1.06] font-extrabold tracking-tight drop-shadow-lg sm:text-[3.25rem]">
                {chapter.title}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#e1efe8] sm:text-base">
                {isDry
                  ? "The first planting worked. But a dry week is coming. Can your garden survive with fewer supplies?"
                  : "An abandoned corner could become a place where everyone belongs. You have one day to make a plan."}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="rounded-full border border-white/25 bg-black/35 px-3 py-2 backdrop-blur-md">
                  {scenario.label}
                </span>
                <span className="rounded-full border border-white/25 bg-black/35 px-3 py-2 backdrop-blur-md">
                  {selected.length} choices selected
                </span>
              </div>
            </div>
          </div>
          <div
            className="relative flex gap-1.5 bg-black/40 px-5 py-3 sm:px-8"
            role="group"
            aria-label="Scene progress"
          >
            {chapter.scenarios.map((item, index) => (
              <span
                key={item.id}
                aria-current={index === scenarioIndex ? "step" : undefined}
                className={`h-1.5 flex-1 rounded-full ${index <= scenarioIndex ? "bg-[#f3c779]" : "bg-white/20"}`}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="resources-heading">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <h2 id="resources-heading" className="text-lg font-bold sm:text-xl">
              Your resources
            </h2>
            <span className="text-xs text-[#a9c4d2]">
              Stay within your limits
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <ResourceGauge
              label="Supplies"
              kind="gold"
              value={result.totals.cost}
              limit={scenario.budget.cost}
            />
            <ResourceGauge
              label="Hours"
              kind="teal"
              value={result.totals.time}
              limit={scenario.budget.time}
            />
            <ResourceGauge
              label="Helpers"
              kind="blue"
              value={result.totals.crew}
              limit={scenario.budget.crew}
            />
          </div>
        </section>

        <section aria-labelledby="build-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#e9be79] uppercase">
                Make your move
              </p>
              <h2
                id="build-heading"
                className="mt-1 text-xl font-bold sm:text-2xl"
              >
                What will you build?
              </h2>
            </div>
            <span className="text-xs text-[#b4cbdb]">
              Tap a scene card to choose
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {chapter.choices.map((choice) => {
              const active = selected.includes(choice.id);
              const art = gardenChoiceArt[choice.id] ?? gardenChoiceArt.seeds;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => toggle(choice.id)}
                  aria-pressed={active}
                  className={`group relative isolate flex min-h-[11.5rem] flex-col justify-between overflow-hidden rounded-[1.3rem] border-2 p-3 text-left shadow-lg transition-[border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffdc96] active:scale-[.98] motion-reduce:transition-none sm:min-h-[14rem] sm:p-4 ${active ? "border-[#f1ce85]" : "border-white/15 hover:border-white/50"}`}
                >
                  <CinematicImage
                    src={art.image}
                    sizes="(max-width: 640px) 50vw, 30vw"
                    className="transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07151c]/95 via-[#07151c]/55 to-[#07151c]/30" />
                  <div className="relative flex justify-between gap-1">
                    <span
                      className={`grid size-10 place-items-center rounded-xl border border-white/20 bg-black/45 sm:size-12`}
                      style={{ color: art.accent }}
                    >
                      <GardenSymbol
                        name={art.symbol}
                        className="size-6 sm:size-7"
                      />
                    </span>
                    <span
                      className={`grid size-6 place-items-center rounded-full border text-xs font-bold ${active ? "border-[#f6d38a] bg-[#f6d38a] text-[#153229]" : "border-white/50 bg-black/25 text-white"}`}
                      aria-hidden="true"
                    >
                      {active ? "✓" : "+"}
                    </span>
                  </div>
                  <span className="relative block">
                    <strong className="block text-[.85rem] leading-5 sm:text-base">
                      {choice.label}
                    </strong>
                    <span className="mt-2 block text-[.68rem] text-[#c4d5dc]">
                      {choice.cost} supplies · {choice.time}h · {choice.crew}{" "}
                      helpers
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section
          className="rounded-[1.5rem] border border-white/15 bg-[#142d39] p-4 sm:p-6"
          aria-label="Test your garden plan"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Ready to open the garden?</h2>
              <p className="mt-1 text-sm leading-5 text-[#b9d0df]">
                Try your choices. If something is missing, make another move.
              </p>
            </div>
            <Button
              className="min-h-12 rounded-full bg-[#edc477] px-6 font-bold text-[#1c2c35] hover:bg-[#ffda91]"
              onClick={() => setChecked(true)}
              disabled={selected.length === 0}
            >
              Test my plan →
            </Button>
          </div>
          {checked && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-4 rounded-2xl border p-4 ${result.success ? "border-[#60cfa5]/40 bg-[#114338]" : "border-[#ecc185]/40 bg-[#46372d]"}`}
            >
              <h3 className="text-base font-bold">
                {result.success
                  ? "The garden comes alive."
                  : "Not quite. The neighbourhood needs more."}
              </h3>
              <p className="mt-1 text-sm text-[#dce9e7]">
                {result.success
                  ? "Your plan works with the resources you have. Ready for the next situation?"
                  : "Review the clues below, adjust your choices, and try again."}
              </p>
              {result.problems.length > 0 && (
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[#f9dfbe]">
                  {result.problems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
              )}
              {result.success && (
                <div className="mt-4">
                  {!isFinal ? (
                    <Button
                      onClick={next}
                      className="rounded-full bg-[#efd18b] px-5 text-[#1b2b35]"
                    >
                      Face the dry week →
                    </Button>
                  ) : (
                    <Link
                      href="/quests"
                      className="inline-flex min-h-11 items-center rounded-full bg-[#efd18b] px-5 text-sm font-bold text-[#1b2b35]"
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
          This scene is practice only. No verified XP or Quest evidence is
          created here. To progress, take a real-world action, submit proof and
          reflect in your Quest.
        </p>
      </div>
    </main>
  );
}
