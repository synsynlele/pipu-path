import { BuildHero } from "@/modules/real-build/ui/build-hero";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getOwnedBuild } from "@/modules/real-build/infrastructure/dal";
import {
  difficultyLabel,
  isRetiredPaperworkChallenge,
} from "@/modules/real-build/domain/build";
import { ImproveBuildForm } from "@/modules/real-build/ui/improve-form";
import { BuildAttemptForm } from "@/modules/real-build/ui/attempt-form";
import { BuildStageGuide } from "@/modules/real-build/ui/stage-guide";
import { TailorReviewedButton } from "@/modules/real-build/ui/tailor-reviewed-button";
export const metadata: Metadata = {
  title: "My real Quest",
  robots: { index: false, follow: false },
};
export const maxDuration = 60;
export default async function RealBuildPage({
  params,
}: {
  params: Promise<{ buildId: string }>;
}) {
  const { buildId } = await params;
  if (!z.uuid().safeParse(buildId).success) notFound();
  const detail = await getOwnedBuild(buildId);
  if (!detail) notFound();
  const { build, imageUrl, improvement } = detail;
  const retired = isRetiredPaperworkChallenge(build.challenge);
  return (
    <main id="main-content">
      <BuildHero
        eyebrow="YOUR SOLUTION QUEST"
        title={build.challenge.title}
        description={build.challenge.outcome}
      />
      <div className="journey-body">
        <Link
          href="/real-quests"
          className="inline-block py-3 text-sm font-bold"
        >
          ← Real Quests
        </Link>
        <p className="mt-3 text-xs font-bold tracking-widest text-[#6347dc] uppercase">
          Level {build.difficulty}/5 · {difficultyLabel(build.difficulty)} ·{" "}
          {build.minutes} minutes
        </p>
        <div className="mt-4 rounded-xl border border-[#e2daf7] bg-[#f4f0ff] px-4 py-3">
          <p className="text-xs font-bold text-[#5b3dd4]">
            YOUR IMPROVEMENT GOAL
          </p>
          <p className="mt-1 text-sm leading-6">{build.focus}</p>
        </div>
        {build.source === "reviewed" ? (
          <p className="mt-3 rounded-xl border border-[#e2daf7] bg-[#f4f0ff] p-3 text-sm leading-6 text-[#264e89]">
            Reviewed starter Quest · This practical activity was prepared by
            PipuPath rather than generated for your exact goal by AI. It may not
            fit your problem. You can ask AI to design a more specific Quest
            without losing any saved evidence.
          </p>
        ) : null}
        {build.source === "reviewed" && build.status === "active" ? (
          <TailorReviewedButton id={build.id} />
        ) : null}
        <p className="mt-3 text-xs font-semibold text-[#77788e]">
          Higher levels add comparison, testing and problem-solving—not unsafe
          tools or expenses.
        </p>
        {improvement ? (
          <section className="build-card mt-5">
            <h2 className="font-bold">Your planned improvement</h2>
            <p className="mt-3 text-sm leading-6 whitespace-pre-wrap">
              {improvement}
            </p>
            <p className="mt-3 text-xs text-[#77788e]">
              Use this lesson in a fresh attempt. Your previous evidence stays
              with the previous attempt.
            </p>
          </section>
        ) : null}
        <BuildStageGuide
          id={build.id}
          challenge={build.challenge}
          status={build.status}
        />
        <section className="build-card mt-5">
          <details>
            <summary className="cursor-pointer py-2 text-sm font-bold text-[#5b3dd4]">
              Materials and safety
            </summary>
            <p className="mt-3 text-sm leading-6">
              {build.challenge.materials.join(", ") ||
                "Use what you already have."}
            </p>
            <p className="mt-3 text-sm leading-6">{build.challenge.safety}</p>
          </details>
        </section>
        {retired && build.status === "active" ? (
          <p
            role="status"
            className="mt-5 rounded-xl border border-[#f4d49e] bg-[#fff8e9] p-4 text-sm leading-6 text-[#70471a]"
          >
            This older Quest focuses on planning instead of a real-world build.
            We no longer offer it. Open “This Quest is not right for me” below
            to set it aside without losing your history, then start a practical
            Quest.
          </p>
        ) : null}
        {build.status === "active" ? (
          <BuildAttemptForm build={build} retired={retired} />
        ) : (
          <section className="build-card mt-5 space-y-4">
            <h2 className="text-xl font-bold">
              {build.status === "recorded"
                ? "Your attempt is recorded."
                : "This attempt was set aside."}
            </h2>
            <p className="text-sm leading-6 text-[#77788e]">
              {build.status === "recorded"
                ? "You recorded what you tried and learned. This is your account, not independently verified progress."
                : "Your saved notes are preserved. You can choose another Quest."}
            </p>
            {build.draft.outcome ? (
              <p className="text-sm font-semibold">
                {build.draft.outcome === "worked"
                  ? "You reported: it worked."
                  : build.draft.outcome === "partly"
                    ? "You reported: part of it worked."
                    : "You reported: it did not work yet."}
              </p>
            ) : null}
            <h3 className="font-bold">What happened</h3>
            <p className="text-sm leading-6 whitespace-pre-wrap">
              {build.draft.evidence || "No evidence note saved."}
            </p>
            {build.draft.link ? (
              <a
                href={build.draft.link}
                rel="noreferrer noopener"
                target="_blank"
                className="inline-block py-3 text-sm font-bold"
              >
                Open my evidence link ↗
              </a>
            ) : null}
            <h3 className="font-bold">What I learned</h3>
            <p className="text-sm leading-6 whitespace-pre-wrap">
              {build.draft.reflection || "No reflection saved."}
            </p>
            <h3 className="font-bold">My next change</h3>
            <p className="text-sm leading-6 whitespace-pre-wrap">
              {build.draft.nextChange || "No next change saved."}
            </p>
            {build.status === "recorded" && !retired ? (
              <ImproveBuildForm id={build.id} />
            ) : null}
            <Link
              href={`/real-quests?district=${encodeURIComponent(build.topic)}`}
              className="build-primary w-full"
            >
              Choose my next Quest →
            </Link>
            <p className="text-xs leading-5 text-[#77788e]">
              Your next challenge can use the same topic or a different one.
              Keep your next change in mind.
            </p>
          </section>
        )}
        {build.image_path && !imageUrl ? (
          <p role="status" className="mt-4 text-sm">
            Your saved photo could not be opened. Reload to request a fresh
            private link.
          </p>
        ) : null}
        {imageUrl ? (
          <section className="build-card mt-5">
            <h2 className="font-bold">Your private photo</h2>
            <a
              href={imageUrl}
              rel="noreferrer noopener"
              target="_blank"
              className="mt-3 inline-block py-3 text-sm font-bold"
            >
              View saved photo ↗
            </a>
            <p className="mt-2 text-xs text-[#77788e]">
              This private link expires shortly. Reload to open it again.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
