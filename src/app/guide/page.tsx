import type { Metadata } from "next";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { recordCurrentUserFeatureView } from "@/modules/analytics/infrastructure/product-events";
import {
  generateBuilderGuideAction,
  recordBuilderGuideFeedbackAction,
} from "@/modules/builder-guide/application/builder-guide-actions";
import type { BuilderGuideIntent } from "@/modules/builder-guide/domain/builder-guide-contract";
import {
  getBuilderGuideContext,
  getBuilderGuideHistory,
} from "@/modules/builder-guide/infrastructure/builder-guide-dal";

export const metadata: Metadata = {
  title: "Your Builder Guide",
  robots: { index: false, follow: false },
};

const questions: Array<{
  intent: BuilderGuideIntent;
  title: string;
  description: string;
}> = [
  {
    intent: "next_move",
    title: "What should I do next?",
    description:
      "Find the nearest proof-bearing action already supported by your current PipuPath state.",
  },
  {
    intent: "improvement",
    title: "Where am I improving?",
    description:
      "Interpret your strongest completed evidence without turning one result into a permanent label.",
  },
  {
    intent: "missing_evidence",
    title: "What evidence am I missing?",
    description:
      "Find where another real-world test would make your capability record more trustworthy.",
  },
  {
    intent: "weekly_focus",
    title: "What should I focus on this week?",
    description:
      "Reduce your current development work to one useful focus that can produce evidence.",
  },
];

const errorMessages: Record<string, string> = {
  guide_profile_required:
    "Build or refresh your Living Builder Profile before using evidence-aware guidance.",
  guide_consent_required:
    "Your Builder Guide needs your current AI processing consent before it can generate new guidance.",
  guide_unavailable:
    "The Builder Guide is not available for this account at the moment.",
  guide_rate_limited:
    "You have reached today's Guide refresh limit. Use the guidance you already have until your development context changes or the limit resets.",
  guide_output_invalid:
    "PipuPath could not safely ground that recommendation in your evidence. Please try again.",
  guide_output_unsafe:
    "That recommendation did not meet PipuPath's safety rules. Please try again.",
  guide_save_failed:
    "Your recommendation could not be saved. Please try again.",
  feedback_invalid: "That feedback could not be understood.",
  feedback_save_failed: "Your feedback could not be saved. Please try again.",
  invalid_question: "Choose one of the four Builder Guide questions.",
};

function intentLabel(intent: BuilderGuideIntent) {
  return (
    questions.find((question) => question.intent === intent)?.title ?? intent
  );
}

export default async function BuilderGuidePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const context = await getBuilderGuideContext();
  await recordCurrentUserFeatureView("guide");
  const history = context ? await getBuilderGuideHistory(context) : [];
  const requestedRun = typeof params.run === "string" ? params.run : null;
  const activeRun =
    (requestedRun ? history.find((run) => run.id === requestedRun) : null) ??
    history[0] ??
    null;
  const errorKey = typeof params.error === "string" ? params.error : null;
  const errorMessage = errorKey ? errorMessages[errorKey] : null;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <section className="border-gold/20 bg-panel relative overflow-hidden rounded-[2rem] border px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="bg-gold/10 absolute -top-24 -right-20 h-64 w-64 rounded-full blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
            Your Builder Guide
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Ask what matters next. Get guidance grounded in what you have
            actually done.
          </h1>
          <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
            The Guide uses your Discovery baseline, Living Builder Profile and
            current PipuPath work. It interprets evidence; it does not define
            your identity or decide your future for you.
          </p>
        </div>
      </section>

      <Surface className="border-gold/30 bg-gold/5 mt-8 p-6 sm:p-8">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
          Evidence before advice
        </p>
        <p className="text-muted mt-3 max-w-4xl leading-7">
          No unrestricted chatbot lives here. Choose one development question.
          PipuPath will use only bounded private context and will tell you what
          it is uncertain about.
        </p>
      </Surface>

      {errorMessage ? (
        <Surface className="mt-6 border-amber-500/40 p-5" role="alert">
          <p className="font-semibold">
            The Guide could not complete that request.
          </p>
          <p className="text-muted mt-2 text-sm leading-6">{errorMessage}</p>
        </Surface>
      ) : null}

      {!context ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">
            Build your evidence foundation first.
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            The Personal Builder Guide starts from your Living Builder Profile,
            not from a blank chat box. Build or refresh that profile after you
            have completed evidence in PipuPath.
          </p>
          <ButtonLink href="/profile" className="mt-5">
            Open Living Builder Profile
          </ButtonLink>
        </Surface>
      ) : (
        <>
          <section className="mt-10" aria-labelledby="guide-questions-heading">
            <div className="max-w-3xl">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Four useful questions
              </p>
              <h2
                id="guide-questions-heading"
                className="mt-3 text-3xl font-semibold tracking-tight"
              >
                Choose the kind of guidance you need now.
              </h2>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {questions.map((question) => (
                <Surface key={question.intent} className="p-6">
                  <h3 className="text-xl font-semibold">{question.title}</h3>
                  <p className="text-muted mt-3 text-sm leading-6">
                    {question.description}
                  </p>
                  <form action={generateBuilderGuideAction} className="mt-5">
                    <input
                      type="hidden"
                      name="intent"
                      value={question.intent}
                    />
                    <Button type="submit" variant="secondary">
                      Ask the Guide
                    </Button>
                  </form>
                </Surface>
              ))}
            </div>
          </section>

          {activeRun ? (
            <section
              className="mt-10"
              aria-labelledby="current-guidance-heading"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                    Current guidance
                  </p>
                  <h2
                    id="current-guidance-heading"
                    className="mt-3 text-3xl font-semibold tracking-tight"
                  >
                    {activeRun.advice.title}
                  </h2>
                </div>
                <span className="border-border text-muted rounded-full border px-3 py-1.5 text-xs">
                  {activeRun.provider === "openai"
                    ? "AI-generated from private evidence"
                    : "Evidence-rule fallback"}
                </span>
              </div>

              <Surface className="mt-6 p-6 sm:p-8">
                <p className="text-muted text-lg leading-8">
                  {activeRun.advice.summary}
                </p>

                {activeRun.advice.evidenceObservations.length > 0 ? (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold">Evidence I used</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {activeRun.advice.evidenceObservations.map(
                        (observation) => {
                          const claim = context.livingProfile.capabilities.find(
                            (item) => item.id === observation.claimId,
                          );
                          return (
                            <Link
                              key={observation.claimId}
                              href="/profile"
                              className="border-border hover:border-gold/40 rounded-2xl border p-4 transition-colors"
                            >
                              <strong>
                                {claim?.label ?? "Profile evidence"}
                              </strong>
                              <p className="text-muted mt-2 text-sm leading-6">
                                {observation.observation}
                              </p>
                            </Link>
                          );
                        },
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                  <div className="border-border rounded-2xl border p-5">
                    <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                      Focus
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      {activeRun.advice.focus.label}
                    </h3>
                    <p className="text-muted mt-3 text-sm leading-6">
                      {activeRun.advice.focus.rationale}
                    </p>
                  </div>
                  <div className="border-gold/30 bg-gold/5 rounded-2xl border p-5">
                    <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                      Next action
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      {activeRun.advice.nextAction.title}
                    </h3>
                    <p className="text-muted mt-3 text-sm leading-6">
                      {activeRun.advice.nextAction.instruction}
                    </p>
                    <p className="mt-4 text-sm">
                      <strong>Evidence to create:</strong>{" "}
                      <span className="text-muted">
                        {activeRun.advice.nextAction.evidenceToCreate}
                      </span>
                    </p>
                    <ButtonLink
                      href={activeRun.destinationHref}
                      className="mt-5"
                    >
                      Take the next action
                    </ButtonLink>
                  </div>
                </div>

                {activeRun.advice.challenge ? (
                  <div className="border-border mt-6 border-t pt-6">
                    <h3 className="font-semibold">Your challenge</h3>
                    <p className="text-muted mt-2 leading-7">
                      {activeRun.advice.challenge}
                    </p>
                  </div>
                ) : null}

                <div className="border-border mt-6 border-t pt-6">
                  <h3 className="font-semibold">What I am uncertain about</h3>
                  <p className="text-muted mt-2 leading-7">
                    {activeRun.advice.uncertainty}
                  </p>
                </div>

                <form
                  action={recordBuilderGuideFeedbackAction}
                  className="border-border mt-7 border-t pt-6"
                >
                  <input type="hidden" name="runId" value={activeRun.id} />
                  <label
                    htmlFor="guide-feedback-note"
                    className="text-sm font-semibold"
                  >
                    Was this useful? Add context if you want PipuPath to learn
                    about the guidance experience.
                  </label>
                  <textarea
                    id="guide-feedback-note"
                    name="note"
                    rows={2}
                    maxLength={600}
                    defaultValue={activeRun.feedback?.note ?? ""}
                    placeholder="Optional feedback about this recommendation."
                    className="border-border bg-background text-foreground mt-3 w-full rounded-xl border px-3 py-2 text-sm"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="submit"
                      name="verdict"
                      value="helpful"
                      variant="secondary"
                    >
                      Helpful
                    </Button>
                    <Button
                      type="submit"
                      name="verdict"
                      value="not_helpful"
                      variant="ghost"
                    >
                      Not helpful
                    </Button>
                  </div>
                  {activeRun.feedback ? (
                    <p className="text-muted mt-3 text-sm">
                      Latest feedback:{" "}
                      {activeRun.feedback.verdict.replaceAll("_", " ")}
                    </p>
                  ) : null}
                </form>
              </Surface>
            </section>
          ) : (
            <Surface className="mt-10 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold">No Guide run yet.</h2>
              <p className="text-muted mt-3 max-w-3xl leading-7">
                Choose one question above. The Guide will create a private,
                evidence-aware recommendation and preserve its provenance so you
                can revisit what it advised at that point in your development.
              </p>
            </Surface>
          )}

          {history.length > 1 ? (
            <section className="mt-10" aria-labelledby="guide-history-heading">
              <h2 id="guide-history-heading" className="text-2xl font-semibold">
                Recent guidance
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {history.map((run) => (
                  <Link
                    key={run.id}
                    href={`/guide?run=${encodeURIComponent(run.id)}`}
                    className="border-border hover:border-gold/40 rounded-2xl border p-4 transition-colors"
                  >
                    <span className="text-gold text-xs font-semibold tracking-wide uppercase">
                      {intentLabel(run.intent)}
                    </span>
                    <strong className="mt-2 block">{run.advice.title}</strong>
                    <span className="text-muted mt-2 block text-xs">
                      {new Date(run.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <p className="text-muted mt-8 text-center text-xs leading-5">
        Builder Guide recommendations are guidance, not authority. Your choices,
        circumstances and real-world evidence remain decisive.
      </p>
    </main>
  );
}
