import type { Metadata } from "next";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { generateBuilderGuideAction } from "@/modules/builder-guide/application/builder-guide-actions";
import type { GrowthPackKind } from "@/modules/builder-guide/domain/builder-guide-contract";
import {
  getBuilderGuideContext,
  getBuilderGuideHistory,
} from "@/modules/builder-guide/infrastructure/builder-guide-dal";

export const metadata: Metadata = {
  title: "Growth Library",
  robots: { index: false, follow: false },
};

const errorMessages: Record<string, string> = {
  guide_profile_required:
    "Build or refresh your Living Builder Profile before PipuPath recommends learning support.",
  guide_consent_required:
    "Growth Pack generation needs your current AI processing consent.",
  guide_unavailable:
    "Growth Pack generation is not available for this account at the moment.",
  guide_rate_limited:
    "You have reached today's Builder Guide refresh limit. Use the Growth Pack you already have until your development context changes or the limit resets.",
  guide_output_invalid:
    "PipuPath could not safely ground those learning suggestions in your current evidence. Please try again.",
  guide_output_unsafe:
    "Those learning suggestions did not meet PipuPath's safety rules. Please try again.",
  guide_save_failed:
    "Your Growth Pack could not be saved. Please try again.",
  invalid_question: "That Growth Pack request could not be understood.",
};

const kindLabels: Record<GrowthPackKind, string> = {
  book: "Read",
  course: "Learn",
  skill: "Practise",
  practice: "Try",
};

const kindIcons: Record<GrowthPackKind, string> = {
  book: "▤",
  course: "◫",
  skill: "◇",
  practice: "↗",
};

export default async function GrowthLibraryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const context = await getBuilderGuideContext();
  const history = context ? await getBuilderGuideHistory(context, 20) : [];
  const growthRuns = history.filter(
    (run) => run.intent === "growth_support" || run.advice.growthPack.length > 0,
  );
  const requestedRun = typeof params.run === "string" ? params.run : null;
  const activeRun =
    (requestedRun
      ? growthRuns.find((run) => run.id === requestedRun)
      : null) ??
    growthRuns[0] ??
    null;
  const library = growthRuns
    .flatMap((run) =>
      run.advice.growthPack.map((item, index) => ({
        ...item,
        key: `${run.id}-${index}`,
        runId: run.id,
        createdAt: run.createdAt,
      })),
    )
    .slice(0, 18);
  const errorKey = typeof params.error === "string" ? params.error : null;
  const errorMessage = errorKey ? errorMessages[errorKey] : null;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] px-6 py-10 text-white shadow-[0_30px_80px_-48px_rgba(79,124,255,0.8)] sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="absolute -top-28 -right-16 size-72 rounded-full bg-[#4f7cff]/20 blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#f3c86b] uppercase">
            Growth Library
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Learn only what helps the next real move.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50/80">
            PipuPath can suggest a book, course, skill or practice because it
            supports your current Campaign, Quest, Build or evidence gap. The
            resource is fuel for action—not a substitute for it.
          </p>
        </div>
      </section>

      <Surface className="border-gold/30 bg-gold/5 mt-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Build a Growth Pack
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              What should I learn, read or practise next?
            </h2>
            <p className="text-muted mt-3 leading-7">
              The Builder Guide will use your current private evidence to choose
              up to three useful learning supports. Course availability, fees,
              age rules and provider details must still be verified at the
              official source.
            </p>
          </div>
          {context ? (
            <form action={generateBuilderGuideAction}>
              <input type="hidden" name="intent" value="growth_support" />
              <input type="hidden" name="returnTo" value="/growth" />
              <Button type="submit">Build My Growth Pack</Button>
            </form>
          ) : null}
        </div>
      </Surface>

      {errorMessage ? (
        <Surface className="mt-6 border-amber-500/40 p-5" role="alert">
          <p className="font-semibold">Growth Pack generation did not finish.</p>
          <p className="text-muted mt-2 text-sm leading-6">{errorMessage}</p>
        </Surface>
      ) : null}

      {!context ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">
            Your evidence foundation comes first.
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            PipuPath will not recommend random self-help content from a blank
            profile. Complete Discovery and build or refresh your Living Builder
            Profile so learning support can be tied to real evidence.
          </p>
          <ButtonLink href="/profile" className="mt-5">
            Open Living Builder Profile
          </ButtonLink>
        </Surface>
      ) : activeRun ? (
        <section className="mt-10" aria-labelledby="growth-pack-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Current Growth Pack
              </p>
              <h2
                id="growth-pack-heading"
                className="mt-3 text-3xl font-semibold tracking-tight"
              >
                {activeRun.advice.title}
              </h2>
            </div>
            <Link
              href={`/guide?run=${encodeURIComponent(activeRun.id)}`}
              className="text-primary text-sm font-semibold"
            >
              See the full Guide reasoning →
            </Link>
          </div>
          <p className="text-muted mt-4 max-w-4xl leading-7">
            {activeRun.advice.summary}
          </p>

          {activeRun.advice.growthPack.length > 0 ? (
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {activeRun.advice.growthPack.map((item, index) => (
                <Surface key={`${activeRun.id}-${index}`} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span
                      aria-hidden="true"
                      className="border-primary/15 bg-primary-soft text-primary grid size-11 place-items-center rounded-xl border text-lg"
                    >
                      {kindIcons[item.kind]}
                    </span>
                    <span className="text-primary text-xs font-semibold tracking-wide uppercase">
                      {kindLabels[item.kind]}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                  {item.source ? (
                    <p className="text-muted mt-1 text-sm">{item.source}</p>
                  ) : null}
                  <p className="text-muted mt-4 text-sm leading-6">
                    {item.whyNow}
                  </p>
                  <div className="border-border mt-5 border-t pt-4">
                    <p className="text-xs font-semibold tracking-wide uppercase">
                      Use it like this
                    </p>
                    <p className="text-muted mt-2 text-sm leading-6">
                      {item.howToUse}
                    </p>
                  </div>
                  <p className="text-muted mt-4 text-xs leading-5">
                    {item.verificationNote}
                  </p>
                </Surface>
              ))}
            </div>
          ) : (
            <Surface className="mt-6 p-6">
              <p className="text-muted leading-7">
                This historical Guide run predates Growth Packs. Generate a new
                Growth Pack to receive contextual learning support.
              </p>
            </Surface>
          )}
        </section>
      ) : (
        <Surface className="mt-10 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">No Growth Pack yet.</h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            Generate one when you need learning support for the current
            adventure. PipuPath will keep the recommendations with their Guide
            history so you can revisit what was useful later.
          </p>
        </Surface>
      )}

      {library.length > 0 ? (
        <section className="mt-12" aria-labelledby="growth-library-heading">
          <div className="max-w-3xl">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Saved Growth Library
            </p>
            <h2
              id="growth-library-heading"
              className="mt-3 text-3xl font-semibold tracking-tight"
            >
              Learning suggestions from earlier chapters.
            </h2>
            <p className="text-muted mt-3 leading-7">
              Recommendations stay attached to the development context that
              produced them. Revisit them when useful; do not treat an old
              recommendation as permanently correct.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {library.map((item) => (
              <Link
                key={item.key}
                href={`/growth?run=${encodeURIComponent(item.runId)}`}
                className="border-border hover:border-gold/40 rounded-2xl border p-5 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-primary text-xs font-semibold tracking-wide uppercase">
                    {kindLabels[item.kind]}
                  </span>
                  <span className="text-muted text-xs">
                    {new Date(item.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <strong className="mt-3 block text-lg">{item.title}</strong>
                {item.source ? (
                  <span className="text-muted mt-1 block text-sm">
                    {item.source}
                  </span>
                ) : null}
                <span className="text-muted mt-3 line-clamp-3 block text-sm leading-6">
                  {item.whyNow}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-muted mt-10 text-center text-xs leading-5">
        Learning resources are suggestions, not endorsements or guarantees.
        Verify current details and turn learning into real-world evidence.
      </p>
    </main>
  );
}
