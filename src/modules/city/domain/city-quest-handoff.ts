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
      "I want to find out why an everyday item is unused and sketch a safe repair or reuse plan.",
  },
  "clinic-power": {
    topic: "health",
    title: "Help people find essential services",
    focus:
      "I want to draw a simple, approved route to a familiar local service with a trusted adult.",
  },
  "shared-services": {
    topic: "school",
    title: "Keep learning possible",
    focus:
      "I want to help classmates continue learning when supplies are interrupted using a simple paper plan.",
  },
  "backup-water": {
    topic: "water",
    title: "Use water more wisely",
    focus:
      "I want to observe water use at home or school with permission and test a simple reminder to reduce waste.",
  },
  "shared-recovery": {
    topic: "market",
    title: "Reduce avoidable waste",
    focus:
      "I want to observe, with a trusted adult, where useful supplies are wasted and try a simple tracking idea.",
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
