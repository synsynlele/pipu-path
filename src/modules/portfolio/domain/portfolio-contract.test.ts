import { describe, expect, it } from "vitest";
import {
  isAdultPortfolioAge,
  portfolioDraftInputSchema,
  portfolioPublishInputSchema,
  portfolioStatusLabel,
} from "./portfolio-contract";

const validDraft = {
  projectId: "11111111-1111-4111-8111-111111111111",
  builderName: "Tosin A.",
  publicTitle: "Neighbourhood Reading Starter",
  publicSummary:
    "I designed and tested a small reading activity using materials already available in my community.",
  publicProblem:
    "Some younger learners had few simple opportunities to practise reading aloud with useful feedback.",
  publicAudience: "Nearby primary-school learners and their caregivers.",
  publicOutcome:
    "A short reusable reading session was prepared, tested and improved after participant feedback.",
  impactSignal:
    "Three learners completed the activity and a caregiver confirmed that it was useful.",
  milestoneSummaries: [
    "I confirmed one repeated reading challenge through short conversations.",
    "I prepared the smallest usable reading session with available materials.",
    "I tested the session and improved one weak point using real feedback.",
  ],
  proofLink: "https://example.com/reading-proof",
};

describe("Stage 9 selective Project portfolio contract", () => {
  it("accepts a truthful public-safe draft", () => {
    expect(portfolioDraftInputSchema.safeParse(validDraft).success).toBe(true);
  });

  it("requires exactly three public milestone summaries", () => {
    expect(
      portfolioDraftInputSchema.safeParse({
        ...validDraft,
        milestoneSummaries: validDraft.milestoneSummaries.slice(0, 2),
      }).success,
    ).toBe(false);
  });

  it("rejects insecure public proof links", () => {
    expect(
      portfolioDraftInputSchema.safeParse({
        ...validDraft,
        proofLink: "http://example.com/proof",
      }).success,
    ).toBe(false);
  });

  it("requires explicit versioned publication consent", () => {
    expect(
      portfolioPublishInputSchema.safeParse({
        portfolioId: validDraft.projectId,
        projectId: "22222222-2222-4222-8222-222222222222",
        consentConfirmed: false,
        consentVersion: "project-portfolio-v1",
      }).success,
    ).toBe(false);
  });

  it("limits the MVP public capability to adults", () => {
    expect(isAdultPortfolioAge("18_24")).toBe(true);
    expect(isAdultPortfolioAge("25_plus")).toBe(true);
    expect(isAdultPortfolioAge("16_17")).toBe(false);
    expect(isAdultPortfolioAge("unknown")).toBe(false);
  });

  it("uses honest lifecycle labels", () => {
    expect(portfolioStatusLabel("draft")).toBe("Draft");
    expect(portfolioStatusLabel("published")).toBe("Published");
    expect(portfolioStatusLabel("withdrawn")).toBe("Withdrawn");
  });
});
