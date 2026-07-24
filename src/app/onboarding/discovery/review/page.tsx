import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { completeDiscoveryAction } from "@/modules/discovery/application/discovery-actions";
import { requireActiveDiscovery } from "@/modules/discovery/infrastructure/discovery-dal";
import { DiscoveryTransitionForm } from "@/modules/discovery/ui/discovery-transition-form";

export const metadata: Metadata = {
  title: "Review Discovery",
  robots: { index: false, follow: false },
};

export default async function DiscoveryReviewPage() {
  const state = await requireActiveDiscovery();
  if (state.session.status !== "review") redirect("/onboarding/discovery");
  const answers = new Map(
    state.answers.map((answer) => [answer.questionId, answer]),
  );
  const sections = Array.from(
    new Map(
      state.questions.map((question) => [
        question.sectionKey,
        question.sectionTitle,
      ]),
    ),
  );
  return (
    <main
      id="main-content"
      className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Review
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">
        Your answers, in your words.
      </h1>
      <p className="text-muted mt-4 leading-7">
        Edit anything that no longer feels accurate. Completing Discovery locks
        this version as the evidence prepared for Stage 4.
      </p>
      <div className="mt-10 space-y-8">
        {sections.map(([sectionKey, sectionTitle]) => (
          <section key={sectionKey} aria-labelledby={`${sectionKey}-title`}>
            <h2 id={`${sectionKey}-title`} className="text-xl font-semibold">
              {sectionTitle}
            </h2>
            <div className="mt-4 space-y-4">
              {state.questions
                .filter((question) => question.sectionKey === sectionKey)
                .map((question) => {
                  const answer = answers.get(question.id);
                  const value =
                    answer?.text ??
                    answer?.selectedOptions?.join(", ") ??
                    answer?.numeric?.toString() ??
                    (answer?.skipped ? "Skipped" : "Not answered");
                  return (
                    <Surface key={question.id} className="p-5">
                      <h3 className="font-medium">{question.prompt}</h3>
                      <p className="text-muted mt-2 leading-7 whitespace-pre-wrap">
                        {value}
                      </p>
                      <ButtonLink
                        href={`/onboarding/discovery/${question.sectionKey}?question=${question.stableKey}&edit=review`}
                        variant="secondary"
                        className="mt-4"
                      >
                        Edit answer
                      </ButtonLink>
                    </Surface>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
      <Surface className="mt-10 p-6">
        <h2 className="text-xl font-semibold">Complete Discovery</h2>
        <p className="text-muted mt-3 leading-7">
          This records your evidence and prepares a typed Stage 4 input. It does
          not generate strengths, purpose, a mission or a career recommendation.
        </p>
        <div className="mt-6">
          <DiscoveryTransitionForm
            action={completeDiscoveryAction}
            sessionId={state.session.id}
            version={state.session.version}
            label="Complete Discovery"
            pendingLabel="Completing…"
          />
        </div>
      </Surface>
    </main>
  );
}
