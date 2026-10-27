import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { cityContinuation, type QuestLink } from "../domain/continuation";
import { CityIcon } from "./city-art";

export function JourneyPlayCard({
  quest = null,
  journeyTitle,
}: {
  quest?: QuestLink | null;
  journeyTitle?: string;
}) {
  const next = cityContinuation(quest);
  return (
    <section
      aria-label="Play to real-world journey"
      className="pp-app-card my-5 overflow-hidden"
    >
      <div className="relative flex min-h-44 items-end bg-[#201b59] p-5 text-white sm:min-h-52">
        <Image
          src="/city/neighbourhood-dusk.webp"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 960px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#181432]/95 via-[#181432]/65 to-transparent" />
        <div className="relative max-w-sm">
          <p className="text-xs font-semibold tracking-widest text-[#edcf96] uppercase">
            {journeyTitle ?? "Your PipuPath adventure"}
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            Play an idea. Make it real.
          </h2>
          <p className="mt-2 text-sm text-indigo-100">
            Listen. Build a plan. See who it helps.
          </p>
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <ol
          aria-label="Adventure cycle"
          className="mb-4 grid grid-cols-4 gap-2 text-center text-xs font-semibold text-[#62547d]"
        >
          {(
            [
              ["play", "Play"],
              ["art", "Act"],
              ["proof", "Prove"],
              ["spark", "Grow"],
            ] as const
          ).map(([icon, label]) => (
            <li key={label} className="rounded-xl bg-[#f2eefb] p-2">
              <CityIcon name={icon} className="mx-auto mb-1 size-5" />
              {label}
            </li>
          ))}
        </ol>
        <p className="mb-3 text-sm font-semibold text-[#25284a]">
          {quest?.title ??
            "Explore the city, then choose a real-world challenge."}
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink
            href={next.focus === "play" ? next.playHref : next.actionHref}
            className="flex-1 rounded-full sm:flex-none"
          >
            {next.focus === "play" ? "Enter the city →" : next.actionLabel}
          </ButtonLink>
          <ButtonLink
            variant="secondary"
            href={next.focus === "play" ? next.actionHref : next.playHref}
            className="flex-1 rounded-full sm:flex-none"
          >
            {next.focus === "play"
              ? "Continue real-world action"
              : "Revisit the city"}
          </ButtonLink>
        </div>
        <p className="mt-3 text-xs leading-5 text-[#626a80]">
          A shared practice chapter for planning and listening. Your own Quest
          supplies the real goal. Proof and reflection earn progress.
        </p>
      </div>
    </section>
  );
}
