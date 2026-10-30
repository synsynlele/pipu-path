import { cityInspiration } from "./city-inspiration";

/**
 * Reviewed, privacy-safe invitations from a simulated city prototype to a
 * real-world Quest. Only an allowlisted service ID crosses the iframe boundary.
 * These are suggestions, not completed quests, AI-generated assignments or XP.
 */
const reviewedHandoffs = {
  "workshop-link": {
    topic: "workshop",
    title: "Repair and reuse",
    focus:
      "I want to turn a clean unused everyday item into something useful and test it in real life.",
  },
  "clinic-power": {
    topic: "health",
    title: "Help people find essential services",
    focus:
      "I want to make a familiar shared service area easier to use with a safe practical change and test it.",
  },
  "shared-services": {
    topic: "school",
    title: "Keep learning possible",
    focus:
      "I want to teach someone a useful skill, test whether they can use it, and improve the method.",
  },
  "backup-water": {
    topic: "water",
    title: "Use water more wisely",
    focus:
      "I want to put a real water-saving routine into use with permission and measure one result.",
  },
  "shared-recovery": {
    topic: "market",
    title: "Reduce avoidable waste",
    focus:
      "I want to organise safe everyday supplies so fewer are wasted and test the new arrangement.",
  },
} as const;

export type CityHandoffService = keyof typeof reviewedHandoffs;

export function cityQuestHandoff(value: unknown) {
  if (typeof value !== "string") return null;
  if (!Object.prototype.hasOwnProperty.call(reviewedHandoffs, value))
    return null;
  const handoff = reviewedHandoffs[value as CityHandoffService];
  // Prevent an accidentally stale ID in this catalogue from misdirecting
  // a learner toward a nonexistent Quest topic.
  return cityInspiration(handoff.topic)
    ? { service: value as CityHandoffService, ...handoff }
    : null;
}

export const CITY_HANDOFF_SERVICES = Object.freeze(
  Object.keys(reviewedHandoffs) as CityHandoffService[],
);
