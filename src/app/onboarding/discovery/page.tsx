import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  openDiscoveryReviewAction,
  startDiscoveryAction,
} from "@/modules/discovery/application/discovery-actions";
import { missingRequiredQuestions } from "@/modules/discovery/domain/discovery";
import { getDiscoveryState } from "@/modules/discovery/infrastructure/discovery-dal";
import { DiscoveryProgress } from "@/modules/discovery/ui/discovery-progress";
import { DiscoveryTransitionForm } from "@/modules/discovery/ui/discovery-transition-form";

export const metadata: Metadata = {
  title: "Discovery",
  robots: { index: false, follow: false },
};

export default async function DiscoveryIntroductionPage() {
  const state = await getDiscoveryState();
  const session = state.session;
  const missing = session
    ? missingRequiredQuestions(state.questions, state.answers)
    : [];
  const current = state.questions.find(
    (question) => question.stableKey === session?.current_question_key,
  );

  return (
    <main
      id="main-content"
      className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
        Discovery
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
        A conversation about what may be worth exploring.
      </h1>
      <p className="text-muted mt-5 max-w-2xl text-lg leading-8">
        Discovery gathers your own evidence. It will not label you or pretend
        one answer reveals your purpose. You can pause, return and edit.
      </p>

      <Surface className="mt-10 p-6 sm:p-8">
        {!session ? (
          <>
            <h2 className="text-xl font-semibold">Before you begin</h2>
            <ul className="text-muted mt-4 space-y-2 leading-7">
              <li>Seven short sections, one focused question at a time.</li>
              <li>Your answers remain private and save to your account.</li>
              <li>Sensitive reflection is optional and may be skipped.</li>
              <li>No AI interpretation happens in this stage.</li>
            </ul>
            <form action={startDiscoveryAction} className="mt-7">
              <button
                type="submit"
                className="bg-gold hover:bg-gold-light inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-[#100f0c]"
              >
                Begin Discovery
              </button>
            </form>
          </>
        ) : session.status === "completed" ? (
          <>
            <h2 className="text-xl font-semibold">Discovery completed</h2>
            <p className="text-muted mt-3 leading-7">
              Your answers are preserved with question-set version{" "}
              {session.question_set_version}. No potential profile has been
              generated.
            </p>
            <ButtonLink href="/onboarding/discovery/complete" className="mt-6">
              View completion
            </ButtonLink>
          </>
        ) : (
          <>
            <DiscoveryProgress
              value={session.progress_percent}
              label="Discovery progress"
            />
            <p className="text-muted mt-5 leading-7">
              {session.status === "review"
                ? "Your answers are ready for final review."
                : `${state.answers.length} answers saved. ${missing.length} required questions remain.`}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {session.status === "review" ? (
                <ButtonLink href="/onboarding/discovery/review">
                  Continue review
                </ButtonLink>
              ) : missing.length === 0 ? (
                <DiscoveryTransitionForm
                  action={openDiscoveryReviewAction}
                  sessionId={session.id}
                  version={session.version}
                  label="Review my answers"
                  pendingLabel="Preparing review…"
                />
              ) : current ? (
                <ButtonLink
                  href={`/onboarding/discovery/${current.sectionKey}?question=${current.stableKey}`}
                >
                  Continue Discovery
                </ButtonLink>
              ) : null}
            </div>
          </>
        )}
      </Surface>
    </main>
  );
}
