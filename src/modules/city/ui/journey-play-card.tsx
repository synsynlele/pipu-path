import "./adventure-theme.css";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import {
  adventureTrail,
  type TrailStep,
  type TrailStepState,
} from "../domain/adventure-trail";
import { cityContinuation, type QuestLink } from "../domain/continuation";
import { CityIcon, type IconName } from "./city-art";
import { CinematicImage } from "./cinematic-art";
import { adventureScenes } from "./adventure-scenes";

const stepIcons: Record<TrailStep["id"], IconName> = {
  play: "play",
  act: "art",
  prove: "proof",
  grow: "spark",
};
const stateLabels: Record<TrailStepState, string> = {
  practice: "Practice",
  ready: "Ready",
  current: "Now",
  next: "Next",
  saved: "Saved",
  waiting: "Later",
};

function TrailNode({ step, index }: { step: TrailStep; index: number }) {
  const active = step.state === "current";
  const earned = step.state === "saved";
  const waiting = step.state === "waiting";
  const tile =
    "relative flex min-h-32 flex-col items-center rounded-2xl border px-1.5 py-3 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6848dc] sm:min-h-40 sm:px-3";
  const colour = earned
    ? "border-[#8acfb7] bg-[#e8faf3] text-[#205c4c]"
    : active
      ? "border-[#8c71e8] bg-[#eee9ff] text-[#39237b]"
      : waiting
        ? "border-[#e5e4ed] bg-[#f6f6fa] text-[#85869a]"
        : "border-[#ded5f1] bg-white text-[#493785]";
  const contents = (
    <>
      <span
        className="absolute top-2 left-2 text-[10px] font-bold opacity-60"
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        className={
          "mt-2 grid size-12 place-items-center rounded-2xl sm:size-14 " +
          (earned ? "bg-[#c8f0df]" : active ? "bg-[#d8cafa]" : "bg-[#eeeaf6]")
        }
      >
        <CityIcon name={stepIcons[step.id]} className="size-7 sm:size-8" />
      </span>
      <strong className="mt-2 block text-xs leading-4 sm:text-sm">
        {step.label}
      </strong>
      <span className="mt-1 text-[10px] leading-4 font-semibold sm:text-xs">
        {stateLabels[step.state]}
      </span>
      <span className="sr-only">{step.hint}</span>
    </>
  );
  return (
    <li className="min-w-0">
      {step.href ? (
        <Link
          href={step.href}
          aria-label={
            step.label + ": " + stateLabels[step.state] + ". " + step.hint
          }
          aria-current={active ? "step" : undefined}
          className={tile + " " + colour}
        >
          {contents}
        </Link>
      ) : (
        <div
          aria-label={step.label + ": " + step.hint}
          className={tile + " " + colour}
        >
          {contents}
        </div>
      )}
    </li>
  );
}

/** One visual route, shared by Home, Journey, Quest and Build. Quest owns progress. */
export function JourneyPlayCard({
  quest = null,
  journeyTitle,
}: {
  quest?: QuestLink | null;
  journeyTitle?: string;
}) {
  const next = cityContinuation(quest?.status === "locked" ? null : quest);
  const trail = adventureTrail(quest);
  const proofSaved =
    quest?.status === "evidence_submitted" || quest?.status === "completed";

  return (
    <section
      aria-label="Your playable PipuPath journey"
      className="adventure-light adventure-journey pp-app-card my-5 overflow-hidden"
    >
      <div className="relative isolate min-h-48 overflow-hidden bg-[#201b59] p-5 text-white sm:min-h-56 sm:p-7">
        <CinematicImage src={adventureScenes.city} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#171331]/95 via-[#181432]/70 to-[#181432]/20" />
        <div className="relative max-w-md">
          <p className="text-xs font-bold tracking-widest text-[#f4d69b] uppercase">
            {journeyTitle ?? "Your PipuPath adventure"}
          </p>
          <h2 className="mt-2 text-2xl leading-tight font-bold sm:text-3xl">
            Your journey is the game.
          </h2>
          <p className="mt-3 line-clamp-2 text-sm text-indigo-100">
            {quest?.title ??
              "Explore the city, then choose what you want to build in real life."}
          </p>
          <p className="mt-4 inline-flex rounded-full border border-white/30 bg-[#201b59]/70 px-3 py-1.5 text-xs font-semibold">
            {proofSaved
              ? "Real-world proof saved"
              : "Make moves in the world, not just on screen"}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#25284a] sm:text-base">
            Your adventure path
          </h3>
          <span className="text-xs font-medium text-[#636782]">
            Real actions unlock growth
          </span>
        </div>
        <ol
          aria-label="Adventure route"
          className="grid grid-cols-4 gap-1.5 sm:gap-3"
        >
          {trail.map((step, index) => (
            <TrailNode key={step.id} step={step} index={index} />
          ))}
        </ol>
        <Link
          href="/build/adventures"
          className="adventure-hub-link relative isolate flex min-h-[7rem] items-center justify-between gap-3 overflow-hidden rounded-2xl border border-[#b6a8d7] bg-[#172a40] p-4 text-white shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6848dc]"
        >
          <CinematicImage
            src={adventureScenes.garden}
            sizes="(max-width: 768px) 100vw, 720px"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#10243b]/95 via-[#10243b]/75 to-[#10243b]/30" />
          <span className="relative flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/30 bg-white/15 text-[#f5d28e]">
              <CityIcon name="play" className="size-6" />
            </span>
            <span>
              <strong className="block text-sm">
                Follow my adventure path
              </strong>
              <span className="mt-1 block text-xs text-indigo-100">
                Start with one mission, then follow your worlds.
              </span>
            </span>
          </span>
          <span
            className="relative shrink-0 font-bold text-[#f5d28e]"
            aria-hidden="true"
          >
            →
          </span>
        </Link>
        <p className="text-xs leading-5 text-[#626a80]">
          Explore is an optional practice game. Only your saved Quest proof and
          reflection change your actual progress.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <ButtonLink
            href={next.focus === "play" ? "/build/adventures" : next.actionHref}
            className="w-full justify-center rounded-full sm:w-auto"
          >
            {next.focus === "play"
              ? "My adventure path →"
              : next.actionLabel}
          </ButtonLink>
          <ButtonLink
            variant="secondary"
            href={next.focus === "play" ? next.actionHref : next.playHref}
            className="w-full justify-center rounded-full sm:w-auto"
          >
            {next.focus === "play"
              ? "Go to my real-world Quest"
              : "Replay city practice"}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
