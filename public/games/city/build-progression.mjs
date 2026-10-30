// Lightweight skill-adaptive recommendations. No age gates or opaque scores.
// Users can always override the recommendation and choose any challenge.
import { LAB_MISSIONS, labMission, evaluateLab, sanitizeLab } from "./build-lab.mjs";

const DIFFICULTY = Object.freeze({
  "workshop-link": 1,
  "clinic-power": 2,
  "shared-services": 2,
  "shared-recovery": 3,
  "backup-water": 4,
});
export function challengeDifficulty(id) {
  return DIFFICULTY[id] ?? 1;
}
export function skillRecommendation(input) {
  const lab = sanitizeLab(input);
  const completed = LAB_MISSIONS.filter(
    (m) =>
      lab.tested.includes(m.id) &&
      evaluateLab(m, lab.boards[m.id]).success &&
      lab.faults[m.id] === null,
  );
  const clean = completed.filter((m) => {
    const attempt = lab.attempts[m.id];
    return attempt.tests === 1 && attempt.successes === 1 && attempt.hints === 0;
  }).length;
  const retries = completed.reduce(
    (total, m) =>
      total + Math.max(0, lab.attempts[m.id].tests - lab.attempts[m.id].successes),
    0,
  );
  const tier =
    completed.length >= 4 && clean >= 2
      ? "City Architect"
      : completed.length >= 2
        ? "Problem Solver"
        : "Explorer";
  const remaining = LAB_MISSIONS.filter((m) => !completed.some((d) => d.id === m.id));
  const comfortable = clean >= 2 && retries <= 1;
  // Successful, independent builders are invited to a harder *authored*
  // problem. Others receive the gentlest next problem and optional support.
  const sorted = remaining.sort((a, b) =>
    comfortable
      ? challengeDifficulty(b.id) - challengeDifficulty(a.id)
      : challengeDifficulty(a.id) - challengeDifficulty(b.id),
  );
  const next = sorted[0] ?? null;
  return {
    tier,
    completed: completed.length,
    clean,
    retries,
    recommendedId: next?.id ?? null,
    recommendedTitle: next?.title ?? "All city prototypes built",
    message: next
      ? comfortable
        ? "You're solving confidently. Try a harder, reviewed system challenge."
        : "Build your next working system. You can retry and ask for hints."
      : "Your five structures are working. Rebuild any network to improve it.",
  };
}
