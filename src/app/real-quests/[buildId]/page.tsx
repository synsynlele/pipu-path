import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getOwnedBuild } from "@/modules/real-build/infrastructure/dal";
import { difficultyLabel } from "@/modules/real-build/domain/build";
import { ImproveBuildForm } from "@/modules/real-build/ui/improve-form";
import { BuildAttemptForm } from "@/modules/real-build/ui/attempt-form";
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
  return (
    <main id="main-content">
      <Link href="/real-quests" className="inline-block py-3 text-sm font-bold">
        ← Real Quests
      </Link>
      <p className="mt-3 text-xs font-bold tracking-widest text-[#1d4ed8] uppercase">
        Level {build.difficulty}/5 · {difficultyLabel(build.difficulty)} ·{" "}
        {build.minutes} minutes
      </p>
      <div className="mt-4 rounded-xl border border-[#c8dbf7] bg-[#eef5ff] px-4 py-3">
        <p className="text-xs font-bold text-[#2059bd]">YOUR IMPROVEMENT GOAL</p>
        <p className="mt-1 text-sm leading-6">{build.focus}</p>
      </div>
      <h1 className="mt-3 text-3xl font-extrabold">{build.challenge.title}</h1>
      <p className="mt-3 text-sm leading-6 text-[#52647c]">
        {build.challenge.outcome}
      </p>
      <p className="mt-3 text-xs font-semibold text-[#536883]">
        Higher levels add comparison, testing and problem-solving—not unsafe
        tools or expenses.
      </p>
      {improvement ? (
        <section className="build-card mt-5">
          <h2 className="font-bold">Your planned improvement</h2>
          <p className="mt-3 text-sm leading-6 whitespace-pre-wrap">
            {improvement}
          </p>
          <p className="mt-3 text-xs text-[#52647c]">
            Use this lesson in a fresh attempt. Your previous evidence stays
            with the previous attempt.
          </p>
        </section>
      ) : null}
      <section className="build-card mt-6">
        <h2 className="text-lg font-extrabold">1. Try it in real life</h2>
        <ol className="mt-4 list-decimal space-y-4 pl-5 text-sm leading-6">
          {build.challenge.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        <details className="mt-5">
          <summary className="cursor-pointer text-sm font-bold text-[#1d4ed8]">
            Materials and safety
          </summary>
          <p className="mt-3 text-sm leading-6">
            {build.challenge.materials.join(", ") ||
              "Use what you already have."}
          </p>
          <p className="mt-3 text-sm leading-6">{build.challenge.safety}</p>
        </details>
      </section>
      {build.status === "active" ? (
        <BuildAttemptForm build={build} />
      ) : (
        <section className="build-card mt-5 space-y-4">
          <h2 className="text-xl font-bold">
            {build.status === "recorded"
              ? "Your attempt is recorded."
              : "This attempt was set aside."}
          </h2>
          <p className="text-sm leading-6 text-[#52647c]">
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
          {build.status === "recorded" ? (
            <ImproveBuildForm id={build.id} />
          ) : null}
          <Link
            href={`/real-quests?district=${encodeURIComponent(build.topic)}`}
            className="build-primary w-full"
          >
            Choose my next Quest →
          </Link>
          <p className="text-xs leading-5 text-[#52647c]">
            Your next challenge can use the same topic or a different one. Keep
            your next change in mind.
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
          <p className="mt-2 text-xs text-[#52647c]">
            This private link expires shortly. Reload to open it again.
          </p>
        </section>
      ) : null}
    </main>
  );
}
