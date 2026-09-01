import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { Surface } from "@/components/ui/surface";
import { requireActiveDiscovery } from "@/modules/discovery/infrastructure/discovery-dal";
import { DiscoveryProgress } from "@/modules/discovery/ui/discovery-progress";
import { DiscoveryQuestionForm } from "@/modules/discovery/ui/discovery-question-form";

export const metadata: Metadata = {
  title: "Discovery question",
  robots: { index: false, follow: false },
};

export default async function DiscoverySectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ question?: string; edit?: string }>;
}) {
  const [{ section }, query, state] = await Promise.all([
    params,
    searchParams,
    requireActiveDiscovery(),
  ]);
  const requestedKey = query.question ?? state.session.current_question_key;
  const question = state.questions.find(
    (candidate) =>
      candidate.sectionKey === section && candidate.stableKey === requestedKey,
  );

  if (!question) {
    const current = state.questions.find(
      (candidate) => candidate.stableKey === state.session.current_question_key,
    );
    if (current) {
      redirect(
        `/onboarding/discovery/${current.sectionKey}?question=${current.stableKey}`,
      );
    }
    notFound();
  }

  const index = state.questions.findIndex(
    (candidate) => candidate.id === question.id,
  );
  const previous = index > 0 ? state.questions[index - 1] : null;
  const answer = state.answers.find(
    (candidate) => candidate.questionId === question.id,
  );

  return (
    <OnboardingShell
      activeStep={2}
      title={question.sectionTitle}
      description="Stay with one honest answer at a time. There is no perfect response and no score to chase."
    >
      <DiscoveryProgress
        value={state.session.progress_percent}
        label="Discovery progress"
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-primary-light text-xs font-semibold tracking-[0.12em] uppercase">
          Question {index + 1} of {state.questions.length}
        </p>
        <span className="text-muted text-xs">
          {state.session.progress_percent}% saved
        </span>
      </div>
      <Surface className="mt-4 p-5 sm:p-7">
        <DiscoveryQuestionForm
          sessionId={state.session.id}
          version={state.session.version}
          question={question}
          answer={answer}
          previousHref={
            previous
              ? `/onboarding/discovery/${previous.sectionKey}?question=${previous.stableKey}`
              : "/onboarding/discovery"
          }
          returnTo={query.edit === "review" ? "review" : "flow"}
        />
      </Surface>
    </OnboardingShell>
  );
}
