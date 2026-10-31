import { ADVANCED_CHAPTERS } from "./advanced.mjs";
export const CHAPTER_LABELS = [
  "Foundations",
  "Connected City",
  "Opportunities",
  "Resilience",
  ...ADVANCED_CHAPTERS.map((c) => c.title),
];
export function chapterMenuItems({
  firstDone = false,
  foundationsDone = false,
  day = 0,
  crises = 0,
  records = 0,
  hasAdvanced = false,
  result = false,
  baseChapter = 1,
  hasResilience = false,
} = {}) {
  const current = hasAdvanced
    ? Math.min(12, 5 + Math.floor(Math.max(0, records - (result ? 1 : 0)) / 2))
    : hasResilience
      ? 4
      : foundationsDone
        ? 3
        : baseChapter;
  return CHAPTER_LABELS.map((title, i) => {
    const chapter = i + 1;
    const completed =
      chapter === 1
        ? firstDone
        : chapter === 2
          ? foundationsDone
          : chapter === 3
            ? day === 7
            : chapter === 4
              ? crises === 3
              : records >= (chapter - 4) * 2;
    const unlocked =
      chapter === 1 ||
      (chapter === 2
        ? firstDone
        : chapter === 3
          ? foundationsDone
          : chapter === 4
            ? day === 7
            : crises === 3 && records >= (chapter - 5) * 2);
    const status = !unlocked
      ? "Locked"
      : completed
        ? "Completed"
        : chapter === current
          ? "Current"
          : "Ready";
    return {
      chapter,
      title,
      completed,
      unlocked,
      current: chapter === current,
      status,
    };
  });
}
