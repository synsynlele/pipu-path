import "@/modules/city/ui/adventure-theme.css";
import type { Metadata } from "next";
import Link from "next/link";
import { getBuilderLevelProgress } from "@/modules/identity/domain/builder-level";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";
import { adventureTrail } from "@/modules/city/domain/adventure-trail";
import { cityContinuation } from "@/modules/city/domain/continuation";
import { CinematicImage } from "@/modules/city/ui/cinematic-art";
import { adventureScenes } from "@/modules/city/ui/adventure-scenes";
import { getGameChapter } from "@/modules/city/domain/chapters";
import {
  worldDirectory,
  worldPresentations,
} from "@/modules/city/ui/world-presentation";
import { CityIcon, type IconName } from "@/modules/city/ui/city-art";

export const metadata: Metadata = {
  title: "Adventure Hub",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const stageIcons: Record<string, IconName> = {
  play: "play",
  act: "art",
  prove: "proof",
  grow: "spark",
};

function AdventureTile({
  number,
  title,
  detail,
  src,
  href,
  label,
  locked = false,
}: {
  number: string;
  title: string;
  detail: string;
  src: string;
  href?: string;
  label: string;
  locked?: boolean;
}) {
  const content = (
    <div
      className={`group relative isolate flex min-h-[17rem] max-w-full min-w-0 flex-col justify-between overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#102338] p-5 text-white shadow-[0_18px_50px_-30px_rgba(0,0,0,.8)] sm:min-h-[20rem] ${locked ? "opacity-75" : "transition-transform duration-300 hover:-translate-y-1"}`}
    >
      <CinematicImage
        src={src}
        sizes="(max-width: 700px) 100vw, 33vw"
        className={`transition-transform duration-500 group-hover:scale-105 ${locked ? "grayscale" : ""}`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#071323]/50 via-[#071323]/10 to-[#061221]/95" />
      <div className="relative flex items-start justify-between gap-3">
        <span className="rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-[0.65rem] font-bold tracking-[.12em] uppercase backdrop-blur-md">
          {number}
        </span>
        <span
          className={`rounded-full px-3 py-1.5 text-[0.65rem] font-bold tracking-wider uppercase ${locked ? "bg-white/20" : "bg-[#e2b963] text-[#151f2d]"}`}
        >
          {label}
        </span>
      </div>
      <div className="relative">
        <h3 className="adventure-photo-copy text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
          {title}
        </h3>
        <p className="adventure-photo-copy mt-2 max-w-[19rem] text-sm leading-5 text-white/85">
          {detail}
        </p>
        <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#f5d38b]">
          {locked ? "Coming later" : "Enter adventure"}
          <span aria-hidden="true">{locked ? "·" : "→"}</span>
        </span>
      </div>
    </div>
  );
  return href && !locked ? (
    <Link
      href={href}
      aria-label={`Enter ${title}`}
      className="block max-w-full min-w-0 rounded-[1.5rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e8bd68]"
    >
      {content}
    </Link>
  ) : (
    <div aria-label={`${title}, coming later`}>{content}</div>
  );
}

export default async function AdventureHubPage() {
  const state = await requireAuthenticatedHomeState();
  const quest = state.quest?.status === "locked" ? null : state.quest;
  const next = cityContinuation(quest);
  const steps = adventureTrail(quest);
  const level = getBuilderLevelProgress(state.totalXp);
  const questReady = quest?.status === "evidence_submitted";
  const primaryLabel = questReady
    ? "Reflect on your Quest"
    : quest?.status === "active"
      ? "Continue your real Quest"
      : "Enter The Unbuilt City";
  const primaryHref =
    questReady || quest?.status === "active" ? next.actionHref : next.playHref;

  return (
    <main
      id="main-content"
      className="adventure-dark min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-[#09172a] pb-14 text-white"
    >
      <div className="mx-auto w-full max-w-6xl min-w-0 space-y-8 px-3 pt-4 sm:px-7 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
          <Link
            href="/build"
            className="inline-flex min-h-11 items-center text-[#c5d4e7] hover:text-white"
          >
            ← Back to Build
          </Link>
          <Link
            href="/profile"
            className="rounded-full border border-[#e2b963]/50 bg-[#e2b963]/10 px-3 py-2 text-[#f5d38b]"
          >
            {level.current} · {state.totalXp} earned XP
          </Link>
        </div>
        <section
          aria-label="Your adventure world"
          className="relative isolate overflow-hidden rounded-[2rem] border border-white/15 bg-[#122c42] shadow-[0_24px_80px_-35px_rgba(0,0,0,.9)]"
        >
          <div className="relative min-h-[23rem] p-6 sm:min-h-[29rem] sm:p-10">
            <CinematicImage
              src={adventureScenes.city}
              priority
              className="object-[55%_center]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#08152c]/95 via-[#091b31]/75 to-[#08192e]/20" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09172a]/55 via-transparent to-transparent" />
            <div className="relative flex h-full min-h-[20rem] max-w-[30rem] flex-col items-start justify-center sm:min-h-[23rem]">
              <p className="text-[0.7rem] font-extrabold tracking-[.23em] text-[#e2bc72] uppercase">
                PipuPath · A game of life
              </p>
              <h1 className="mt-4 text-[2.3rem] leading-[1.03] font-black tracking-[-.045em] sm:text-[3.6rem]">
                Your world.
                <br />
                <span className="text-[#ffd27a]">Your move.</span>
              </h1>
              <p className="mt-4 max-w-[25rem] text-sm leading-6 text-[#e0ecf6] sm:text-base">
                Explore bold worlds. Solve meaningful challenges. Then take what
                you learn into real life.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={primaryHref}
                  className="adventure-action inline-flex min-h-12 items-center rounded-full bg-[#efbe60] px-5 text-sm font-extrabold text-[#132033] shadow-lg transition hover:bg-[#ffd88a]"
                >
                  {primaryLabel}{" "}
                  <span className="ml-2" aria-hidden="true">
                    →
                  </span>
                </Link>
                <Link
                  href={next.actionHref}
                  className="inline-flex min-h-12 items-center rounded-full border border-white/35 bg-black/30 px-5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-black/50"
                >
                  My real-world Quest
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="journey-route-heading">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold tracking-[.16em] text-[#edc87e] uppercase">
                The path that matters
              </p>
              <h2
                id="journey-route-heading"
                className="mt-1 text-xl font-bold sm:text-2xl"
              >
                Explore. Act. Prove. Grow.
              </h2>
            </div>
            <span className="text-xs text-[#a7b7c7]">
              Progress comes from real Quest records
            </span>
          </div>
          <ol className="mt-4 grid min-w-0 grid-cols-4 gap-1.5 sm:gap-4">
            {steps.map((step, index) => {
              const done = step.state === "saved";
              const now = step.state === "current";
              const tile = `flex min-h-28 min-w-0 max-w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-3 text-center sm:min-h-32 sm:gap-2 sm:rounded-2xl sm:px-2 ${done ? "border-[#61c7a4]/50 bg-[#113a38]" : now ? "border-[#e5b662]/60 bg-[#3d342b]" : "border-white/15 bg-white/5"}`;
              const inner = (
                <>
                  <span
                    className={`grid size-10 place-items-center rounded-xl sm:size-12 ${now ? "bg-[#f2c66e]/25 text-[#f5d18e]" : done ? "bg-[#59c5a3]/20 text-[#8be2c8]" : "bg-white/10 text-[#cad7e9]"}`}
                  >
                    <CityIcon name={stageIcons[step.id]} className="size-6" />
                  </span>
                  <strong className="text-xs sm:text-sm">
                    {index + 1}. {step.label}
                  </strong>
                  <span className="text-[0.64rem] font-semibold text-[#b7c7d8]">
                    {done
                      ? "Saved"
                      : now
                        ? "Now"
                        : step.state === "waiting"
                          ? "Later"
                          : step.state === "practice"
                            ? "Practice"
                            : "Ready"}
                  </span>
                </>
              );
              return (
                <li key={step.id}>
                  {step.href ? (
                    <Link
                      href={step.href}
                      aria-label={step.hint}
                      aria-current={now ? "step" : undefined}
                      className={
                        tile +
                        " focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5d18e]"
                      }
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className={tile}>{inner}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="worlds-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold tracking-[.16em] text-[#edc87e] uppercase">
                Choose your world
              </p>
              <h2
                id="worlds-heading"
                className="mt-1 text-xl font-bold sm:text-2xl"
              >
                Playable adventures
              </h2>
            </div>
            <p className="max-w-xs text-xs text-[#a7b7c7]">
              Six playable worlds. Each world is practice—your real-world
              actions are what count.
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            <AdventureTile
              number="Adventure 01"
              title="The Unbuilt City"
              detail="Turn an empty square into somewhere people belong."
              src={adventureScenes.city}
              href={next.playHref}
              label="Play now"
            />
            {worldDirectory.map(({ id, number }) => {
              const chapter = getGameChapter(id);
              const visual = worldPresentations[id];
              if (!chapter || !visual) return null;
              return (
                <AdventureTile
                  key={id}
                  number={`Adventure ${number}`}
                  title={chapter.title}
                  detail={visual.tagline}
                  src={visual.image}
                  href={`/build/play/${id}`}
                  label="Play now"
                />
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl border border-[#bca366]/25 bg-gradient-to-r from-[#172942] to-[#192b3f] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="max-w-xl">
            <p className="text-xs font-bold tracking-widest text-[#efc87f] uppercase">
              Your impact happens in real life
            </p>
            <h2 className="mt-2 text-lg font-bold">
              {quest?.title ?? "Choose a Quest that matters to you."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#bbcee0]">
              {questReady
                ? "Your proof was saved. Reflection is your next step."
                : quest?.status === "completed"
                  ? "Your completed Quest is recorded in PipuPath."
                  : "Try something useful, bring back honest proof, and reflect on what changed. Practice games never award verified XP."}
            </p>
          </div>
          <Link
            href={next.actionHref}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full border border-[#efc87f]/60 px-5 text-sm font-semibold text-[#ffdd99]"
          >
            Open real Quest →
          </Link>
        </section>
        <p className="pb-2 text-center text-xs text-[#8095ae]">
          Adventure photography: Unsplash. Experiences are practice simulations,
          not evidence of real-world completion.
        </p>
      </div>
    </main>
  );
}
