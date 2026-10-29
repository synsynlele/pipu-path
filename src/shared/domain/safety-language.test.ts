import { describe, expect, it } from "vitest";
import { containsUnqualifiedClaim } from "./safety-language";
const unsafe = /\b(dangerous|contact strangers|borrow money|diagnosis)\b/i;
describe("explicit safety cautions", () => {
  it.each([
    "Avoid dangerous activities.",
    "Do not contact strangers.",
    "This is not a diagnosis.",
    "No need to borrow money.",
    "Never attempt dangerous work.",
  ])("accepts a clear caution: %s", (text) => {
    expect(containsUnqualifiedClaim(text, unsafe)).toBe(false);
  });
  it.each([
    "Try dangerous work.",
    "Do not avoid dangerous work.",
    "Avoid dangerous work. Contact strangers.",
    "Do not contact strangers; borrow money.",
    "Not only dangerous work is useful.",
    "This is not a diagnosis. Here is your diagnosis.",
  ])("still rejects an unsafe assertion: %s", (text) => {
    expect(containsUnqualifiedClaim(text, unsafe)).toBe(true);
  });
});
