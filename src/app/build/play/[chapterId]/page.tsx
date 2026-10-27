import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";
import { getGameChapter } from "@/modules/city/domain/chapters";
import { ChapterChallenge } from "@/modules/city/ui/chapter-challenge";

export const metadata: Metadata = {
  title: "PipuPath Adventures",
  robots: { index: false, follow: false },
};

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  await requireAuthenticatedHomeState();
  const { chapterId } = await params;
  // The original city has its own rich seven-stage experience.
  // New data-driven chapters are routed through this reusable runner.
  const chapter = getGameChapter(chapterId);
  if (!chapter || chapter.id === "unbuilt-city-night-market-v1") notFound();
  return <ChapterChallenge chapter={chapter} />;
}
