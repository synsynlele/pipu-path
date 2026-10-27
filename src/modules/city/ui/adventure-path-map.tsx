"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adventureScenes } from "./adventure-scenes";
import { CinematicImage, GardenSymbol, type GardenSymbolName } from "./cinematic-art";
import {
  projectAdventureMap,
  recommendedPathWorld,
  type PathMission,
  type PathWorld,
} from "../domain/adventure-map";
import { worldPresentations } from "./world-presentation";
import "./adventure-path.css";

const sceneIcons: Record<string, GardenSymbolName[]> = {
  neighbourhood: ["invite", "tool", "truck"],
  city: ["tool"],
  "neighbourhood-garden-v1": ["seed", "water", "people"],
  "river-renewal-v1": ["water", "shield", "seed"],
  "learning-district-v1": ["book", "people", "wifi"],
  "makers-market-v1": ["tool", "sun", "book"],
  "food-rescue-v1": ["food", "shield", "truck"],
};

const offsets = [108, 234, 171, 108, 234, 171];

function windingLine(length: number) {
  const commands = [];
  for (let index = 0; index < length - 1; index++) {
    const fromX = offsets[index % offsets.length];
    const toX = offsets[(index + 1) % offsets.length];
    const top = index * 133 + 48;
    const bottom = (index + 1) * 133 + 48;
    commands.push(
      `M ${fromX} ${top} C ${fromX} ${top + 55}, ${toX} ${bottom - 55}, ${toX} ${bottom}`,
    );
  }
  return commands;
}

function NodeMark({
  world,
  stageIndex,
  mission,
  suggested,
}: {
  world: PathWorld;
  stageIndex: number;
  mission: PathMission;
  suggested: boolean;
}) {
  const icon = sceneIcons[world.id]?.[stageIndex] ?? "tool";
  const done = mission.state === "done";
  const current = mission.state === "current";
  const button = (
    <>
      {suggested && current && (
        <span className="adventure-next-label" aria-hidden="true">
          {world.hasProgress ? "CONTINUE" : "START"}
        </span>
      )}
      <span
        className={`adventure-stage-disc ${done ? "adventure-stage-done" : current ? "adventure-stage-current" : "adventure-stage-locked"}`}
      >
        {done ? (
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="size-9" aria-hidden="true">
            <path d="m7 16 6 6 13-14" />
          </svg>
        ) : current ? (
          <GardenSymbol name={icon} className="size-8 sm:size-9" />
        ) : (
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="size-7" aria-hidden="true">
            <rect x="7" y="14" width="18" height="14" rx="3" />
            <path d="M11 14v-4a5 5 0 0 1 10 0v4" />
          </svg>
        )}
      </span>
      <strong className={`adventure-stage-title ${current ? "text-white" : done ? "text-[#aee3cc]" : "text-[#b7c6d4]"}`}>
        {mission.title}
      </strong>
      <span className={`adventure-stage-label ${current ? "text-[#f5d891]" : "text-[#a2b3c3]"}`}>
        {done ? "Complete" : current ? "Play now" : "Up next"}
      </span>
    </>
  );

  return (
    <li className="adventure-stage-row" key={mission.id}>
      {current && mission.href ? (
        <Link
          id={suggested ? "adventure-current-step" : undefined}
          href={mission.href}
          aria-current={suggested ? "step" : undefined}
          aria-label={`${world.title}, ${mission.title}: Play now`}
          className="adventure-stage-control adventure-stage-link"
          style={{ left: `${(offsets[stageIndex % offsets.length] / 360) * 100}%` }}
        >
          {button}
        </Link>
      ) : (
        <div
          aria-label={`${world.title}, ${mission.title}: ${done ? "Completed practice" : "Finish the previous mission first"}`}
          className="adventure-stage-control"
          style={{ left: `${(offsets[stageIndex % offsets.length] / 360) * 100}%` }}
        >
          {button}
        </div>
      )}
    </li>
  );
}

function WorldUnit({ world, recommended }: { world: PathWorld; recommended: boolean }) {
  const cover =
    world.id === "neighbourhood"
      ? "/city/neighbourhood-dusk.webp"
      : world.id === "city"
        ? adventureScenes.city
        : (worldPresentations[world.id]?.image ?? adventureScenes.garden);
  const paths = windingLine(world.missions.length);
  const routeHeight = world.missions.length * 133;

  return (
    <section
      id={`adventure-world-${world.id}`}
      aria-label={world.title}
      className="adventure-world-unit min-w-0"
    >
      <div className="adventure-unit-banner relative isolate overflow-hidden rounded-[1.35rem] border border-[#9ab1bf]/25 bg-[#193e4a] p-4 text-white sm:rounded-[1.6rem] sm:p-5">
        <CinematicImage src={cover} sizes="(max-width: 640px) 100vw, 680px" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#091d2e]/95 via-[#0a2431]/85 to-[#0a2431]/45" />
        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 max-w-[25rem] flex-1">
            <p className="text-[0.68rem] font-bold tracking-[.12em] text-[#f3d086] uppercase">
              {world.eyebrow}
            </p>
            <h2 className="mt-2 text-xl leading-tight font-extrabold tracking-tight sm:text-2xl">
              {world.title}
            </h2>
            <p className="mt-2 text-xs leading-5 text-[#e0e9ec] sm:text-sm">{world.description}</p>
          </div>
          <Link
            href={world.href}
            className="adventure-unit-enter inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-[#f5d28e]/70 bg-[#eec779] px-4 text-xs font-extrabold text-[#142a33] transition hover:bg-[#ffe2a2]"
            aria-label={`Enter ${world.title}`}
          >
            {world.hasProgress ? "Continue world" : "Enter world"} →
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-3 max-w-[360px]">
        <div
          className="adventure-route relative w-full"
          style={{ height: routeHeight }}
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 360 ${routeHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {paths.map((command, index) => (
              <path
                key={index}
                d={command}
                fill="none"
                stroke={index < world.completed ? "#65c99e" : "#708a9b"}
                strokeWidth="7"
                strokeDasharray="3 12"
                strokeLinecap="round"
                opacity={index < world.completed ? "0.88" : "0.55"}
              />
            ))}
          </svg>
          <ol className="relative m-0 list-none p-0">
            {world.missions.map((mission, index) => (
              <NodeMark
                key={mission.id}
                world={world}
                stageIndex={index}
                mission={mission}
                suggested={recommended && mission.state === "current"}
              />
            ))}
          </ol>
        </div>
      </div>
      <p className="mb-2 text-center text-[0.68rem] leading-5 text-[#b3c8d2]">
        {world.completed > 0
          ? `${world.completed} of ${world.missions.length} practice missions completed on this device`
          : "Start this world whenever you're ready"}
      </p>
    </section>
  );
}

/**
 * A scrollable Duolingo-style practice path. No fabricated scores, streaks or
 * server unlocks; subsequent mission states come only from validated saves.
 */
export function AdventurePathMap({
  userId,
  cityHref = "/build/play",
}: {
  userId: string;
  cityHref?: string;
}) {
  const [worlds, setWorlds] = useState(() =>
    projectAdventureMap(userId, () => null, cityHref),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setWorlds(
        projectAdventureMap(userId, (key) => localStorage.getItem(key), cityHref),
      );
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, [userId, cityHref]);

  const recommended = recommendedPathWorld(worlds);
  const totalMissions = worlds.reduce((n, world) => n + world.missions.length, 0);
  const completed = worlds.reduce((n, world) => n + world.completed, 0);

  function goToNextMission() {
    document.getElementById("adventure-current-step")?.scrollIntoView?.({
      behavior: "smooth",
      block: "center",
    });
  }

  return (
    <div className="adventure-map min-w-0">
      <section
        className="adventure-map-overview min-w-0 overflow-hidden rounded-3xl border border-[#e7c880]/35 bg-gradient-to-br from-[#173b43] to-[#102635] p-4 sm:p-6"
        aria-labelledby="adventure-map-heading"
      >
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-bold tracking-[.19em] text-[#f1d08c] uppercase">
              PipuPath · Your game-of-life path
            </p>
            <h1 id="adventure-map-heading" className="mt-2 text-[1.75rem] leading-tight font-black tracking-tight text-white sm:text-3xl">
              One mission at a time.
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#d1e0e9]">
              Follow the winding path. Play a challenge, solve it, then take the next step.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-white/20 bg-black/20 px-3 py-2 text-center">
            <strong className="block text-lg font-extrabold tabular-nums text-[#f4d696]">{completed} <span className="text-xs font-normal text-[#cfdddf]">/ {totalMissions}</span></strong>
            <span className="text-[0.65rem] font-semibold text-[#d6e3e8]">Practice steps</span>
          </div>
        </div>
        <button
          type="button"
          onClick={goToNextMission}
          className="adventure-map-jump mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f1cb78] px-5 text-sm font-extrabold text-[#132b35] transition hover:bg-[#ffe19b] sm:w-auto"
        >
          <span aria-hidden="true">⌖</span> Jump to my next mission
        </button>
        <p className="mt-3 text-[0.7rem] leading-5 text-[#b7cbd4]">
          {hydrated
            ? "Worlds are open to explore. Later steps in each world are completed in order."
            : "Checking optional practice saves on this device…"}
        </p>
      </section>

      <nav aria-label="Adventure worlds" className="mt-4 flex min-w-0 gap-2 overflow-x-auto pb-2">
        {worlds.map((world, i) => (
          <a
            key={world.id}
            href={`#adventure-world-${world.id}`}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-[#7896aa]/40 bg-[#173449] px-4 text-[0.72rem] font-semibold whitespace-nowrap text-[#e1eef3] hover:border-[#f0cb83]"
          >
            {String(i + 1).padStart(2, "0")} · {world.title}
          </a>
        ))}
      </nav>

      <div className="mt-6 space-y-7" aria-label="Winding mission trail">
        {worlds.map((world) => (
          <WorldUnit
            key={world.id}
            world={world}
            recommended={world.id === recommended}
          />
        ))}
      </div>
      <p className="mt-7 rounded-2xl border border-white/15 bg-[#132b39] p-4 text-center text-xs leading-5 text-[#c4d7df]">
        Practice levels are not verified XP. Turn learning into real-world action through your PipuPath Quest. Progress appears here only when device saving is enabled.
      </p>
    </div>
  );
}
