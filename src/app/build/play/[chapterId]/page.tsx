import { notFound, redirect } from "next/navigation";
import { requireAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";
import { getGameChapter } from "@/modules/city/domain/chapters";

/** Retired challenge bookmarks recover to the replacement campaign. */
export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  await requireAuthenticatedHomeState();
  const { chapterId } = await params;
  if (!getGameChapter(chapterId)) notFound();
  redirect("/build/adventures");
}
