import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { realWorldMove } from "@/modules/city/domain/real-world-move";
import {
  cityInspiration,
  cityInterests,
} from "@/modules/city/domain/city-inspiration";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";

export const metadata: Metadata = {
  title: "Real Quests",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function RealQuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string }>;
}) {
  const [state, params] = await Promise.all([
    requireAuthenticatedHomeState(),
    searchParams,
  ]);
  const move = realWorldMove(state),
    idea = cityInspiration(params.district);
  return (
    <main
      id="main-content"
      className="mx-auto max-w-2xl px-4 py-7 pb-14 sm:px-8"
    >
      <p className="text-primary text-xs font-bold tracking-widest uppercase">
        PipuPath · Real Quests
      </p>
      <h1 className="text-navy mt-3 text-3xl font-extrabold sm:text-4xl">
        Build something real.
      </h1>
      <p className="text-muted mt-3 text-sm leading-6">
        One useful action. Honest proof. A better next attempt.
      </p>
      <div
        aria-label="Your building journey"
        className="text-muted mt-5 flex flex-wrap gap-2 text-xs font-semibold"
      >
        <span>Prepare</span>
        <span aria-hidden="true">→</span>
        <span>Try</span>
        <span aria-hidden="true">→</span>
        <span>Proof & reflection</span>
        <span aria-hidden="true">→</span>
        <span>Put it to use</span>
      </div>
      <section
        aria-labelledby="next-move"
        className="border-border bg-panel mt-6 rounded-3xl border p-6 shadow-sm"
      >
        <p className="text-primary text-xs font-bold tracking-widest uppercase">
          Your next move
        </p>
        <h2 id="next-move" className="text-navy mt-3 text-2xl font-bold">
          {move.title}
        </h2>
        <p className="text-muted mt-3 text-sm leading-6">{move.detail}</p>
        <ButtonLink href={move.href} className="mt-5 min-h-12 rounded-full">
          {move.label} →
        </ButtonLink>
      </section>
      <details className="border-border bg-panel mt-5 rounded-2xl border p-5">
        <summary className="text-navy cursor-pointer font-bold">
          {idea
            ? `Inspired by ${idea.title}`
            : "Find inspiration from your city"}
        </summary>
        {idea ? (
          <p className="text-muted mt-4 text-sm leading-6">{idea.idea}</p>
        ) : null}
        <form method="get" className="mt-4">
          <label
            htmlFor="city-interest"
            className="text-navy text-sm font-semibold"
          >
            Which need matters to you?
          </label>
          <select
            id="city-interest"
            name="district"
            defaultValue={idea?.id ?? ""}
            className="border-border bg-panel text-navy mt-2 min-h-12 w-full rounded-xl border p-3"
          >
            <option value="">Choose a need</option>
            {cityInterests.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="text-primary mt-3 min-h-11 font-bold"
          >
            Explore this idea →
          </button>
        </form>
        <p className="text-muted mt-3 text-xs leading-5">
          Inspiration earns no XP. Your personal Quest has its own actions,
          proof and reflection.
        </p>
      </details>
      {state.project?.status === "completed" ? (
        <section className="border-border bg-panel mt-5 rounded-2xl border p-5">
          <h2 className="text-navy font-bold">Put your build to use</h2>
          <p className="text-muted mt-2 text-sm leading-6">
            {state.project.title}
          </p>
          <ButtonLink
            href={`/projects/${encodeURIComponent(state.project.id)}`}
            className="mt-3"
          >
            Review my completed build →
          </ButtonLink>
          <p className="text-muted mt-3 text-xs">
            Choose what to share. Your private proof stays private until you
            deliberately publish selected work.
          </p>
        </section>
      ) : null}
      <details className="border-border bg-panel mt-4 rounded-2xl border p-5">
        <summary className="text-navy cursor-pointer font-bold">
          How this works
        </summary>
        <p className="text-muted mt-3 text-sm leading-6">
          Tell us a little about yourself. Choose a direction, follow a small
          plan, then try your Quest in real life. Bring back what really
          happened, reflect and improve. Build a Project when you are ready;
          find help when you need it.
        </p>
        <p className="text-muted mt-3 text-sm leading-6">
          You can save and return. Opening a suggestion or finishing a game does
          not complete real-world work.
        </p>
      </details>
      {state.project ? (
        <details className="border-border bg-panel mt-4 rounded-2xl border p-5">
          <summary className="text-navy cursor-pointer font-bold">
            Need help with your build?
          </summary>
          <div className="mt-3 flex flex-wrap gap-5 text-sm font-bold">
            <Link href="/guide" className="text-primary min-h-11 py-3">
              Ask for guidance
            </Link>
            <Link href="/connect" className="text-primary min-h-11 py-3">
              Find someone to help
            </Link>
          </div>
        </details>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-5 text-sm font-bold">
        <Link href="/build/play" className="text-primary min-h-11 py-3">
          Return to the city
        </Link>
        <Link href="/profile" className="text-primary min-h-11 py-3">
          My work & account
        </Link>
      </div>
    </main>
  );
}
