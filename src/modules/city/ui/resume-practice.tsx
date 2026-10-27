"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { gameChapters } from "../domain/chapters";
import {
  parsePracticeCheckpoint,
  practiceHasProgress,
  practiceStorageKey,
} from "../domain/practice-checkpoint";

type ResumeDetails = {
  href: string;
  title: string;
  scene: string;
  progress: string;
};

export function ResumePractice({ userId }: { userId: string }) {
  const [resume, setResume] = useState<ResumeDetails | null>(null);

  useEffect(() => {
    try {
      const candidates = gameChapters
        // The Unbuilt City has its own seven-step runner and no local chapter save.
        .filter((chapter) => chapter.id !== "unbuilt-city-night-market-v1")
        .map((chapter) => {
          const checkpoint = parsePracticeCheckpoint(
            localStorage.getItem(practiceStorageKey(userId, chapter.id)),
            chapter,
          );
          return { chapter, checkpoint };
        })
        .filter(
          ({ checkpoint }) => checkpoint && practiceHasProgress(checkpoint),
        )
        .sort(
          (a, b) =>
            (b.checkpoint?.updatedAt ?? 0) -
            (a.checkpoint?.updatedAt ?? 0),
        );
      const latest = candidates[0];
      if (latest?.checkpoint) {
        const { chapter, checkpoint } = latest;
        setResume({
          href: `/build/play/${chapter.id}`,
          title: chapter.title,
          scene: chapter.scenarios[checkpoint.sceneIndex]?.label ?? "Your mission",
          progress: `Mission ${checkpoint.sceneIndex + 1} of ${chapter.scenarios.length}`,
        });
      }
    } catch {
      // Device storage can be blocked. The rest of the Adventure Hub still works.
    }
  }, [userId]);

  if (!resume) return null;

  return (
    <section aria-label="Resume your practice" className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e6c078]/45 bg-gradient-to-r from-[#183c3c] to-[#10283b] p-4 text-white sm:p-6">
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-widest text-[#f3cd8f]">
          Pick up where you left off
        </p>
        <h2 className="mt-1 text-lg font-extrabold sm:text-xl">{resume.title}</h2>
        <p className="mt-1 text-xs leading-5 text-[#d3e3e9]">
          {resume.progress} · {resume.scene} · Device-only practice save
        </p>
      </div>
      <Link
        href={resume.href}
        className="adventure-action inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-full px-5 text-sm font-extrabold sm:w-auto"
      >
        Continue this adventure →
      </Link>
    </section>
  );
}
