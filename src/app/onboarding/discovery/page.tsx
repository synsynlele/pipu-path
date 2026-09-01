import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
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

export default async function DiscoveryIntroductionPage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string }>;
}) {
  const [state, query] = await Promise.all([getDiscoveryState(), searchParams]);
  const session = state.session;
  const missing = session
    ? missingRequiredQuestions(state.questions, state.answers)
    : [];
  const current = state.questions.find(
    (question) => question.stableKey === session?.current_question_key,
  );

  if (
    query.resume === "1" &&
    session?.status === "in_progress" &&
    missing.length > 0 &&
    current
  ) {
    redirect(
      `/onboarding/discovery/${current.sectionKey}?question=${current.stableKey}`,
    );
  }

  return (
    <OnboardingShell
      activeStep={2}
      title="Now discover the patterns worth exploring."
      description="This is a private conversation about what energises you, what you notice and what may be worth testing in real life. PipuPath does not reduce you to a label."
    >
      <Surface className="p-5 sm:p-7">
        {!session ? (
          <>
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="bg-primary-soft text-primary-light grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold"
              >
                2
              </span>
              <div>
                <h2 className="text-navy text-lg font-semibold">
                  Discovery takes one question at a time.
                </h2>
                <p className="text-muted mt-1 text-sm leading-6">
                  Seven short sections. Pause whenever you need to; your answers
                  save to your private account.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <DiscoveryPromise
                title="Private by default"
                detail="Your answers are not a public profile."
              />
              <DiscoveryPromise
                title="No instant labels"
                detail="One answer never becomes your identity."
              />
              <DiscoveryPromise
                title="Sensitive is optional"
                detail="Optional reflection can be skipped."
              />
              <DiscoveryPromise
                title="No AI judgement here"
                detail="Discovery first gathers your own evidence."
              />
            </div>

            <form action={startDiscoveryAction} className="mt-7">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-light inline-flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white sm:w-auto"
              >
                Begin Discovery →
              </button>
            </form>
          </>
        ) : session.status === "completed" ? (
          <>
            <p className="text-success text-xs font-semibold tracking-[0.14em] uppercase">
              Discovery complete
            </p>
            <h2 className="text-navy mt-2 text-xl font-semibold">
              Your answers are safely preserved.
            </h2>
            <p className="text-muted mt-3 leading-7">
              PipuPath has your Discovery evidence from question-set version{" "}
              {session.question_set_version}. Continue to the next step when you
              are ready.
            </p>
            <ButtonLink href="/onboarding/discovery/complete" className="mt-6">
              Continue →
            </ButtonLink>
          </>
        ) : (
          <>
            <DiscoveryProgress
              value={session.progress_percent}
              label="Discovery progress"
            />
            <div className="mt-5 flex items-start gap-3">
              <span
                aria-hidden="true"
                className="bg-primary-soft text-primary-light grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold"
              >
                {session.progress_percent}%
              </span>
              <div>
                <h2 className="text-navy font-semibold">
                  {session.status === "review"
                    ? "Your Discovery is ready for review."
                    : "Pick up exactly where you stopped."}
                </h2>
                <p className="text-muted mt-1 text-sm leading-6">
                  {session.status === "review"
                    ? "Review your own answers before PipuPath moves forward."
                    : `${state.answers.length} answers saved. ${missing.length} required questions remain.`}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {session.status === "review" ? (
                <ButtonLink href="/onboarding/discovery/review">
                  Continue review →
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
                  Continue Discovery →
                </ButtonLink>
              ) : null}
            </div>
          </>
        )}
      </Surface>
    </OnboardingShell>
  );
}

function DiscoveryPromise({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="border-border bg-panel-raised/65 rounded-2xl border p-4">
      <p className="text-navy text-sm font-semibold">{title}</p>
      <p className="text-muted mt-1 text-xs leading-5">{detail}</p>
    </div>
  );
}
