import type { z } from "zod";
import { interpretationInputSchema } from "../domain/contracts";

type ProviderInput = z.infer<typeof interpretationInputSchema>;
type EvidenceRecord = ProviderInput["evidence"][number];
type EvidenceCategory = EvidenceRecord["category"];

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 140);
}

function describeEvidence(evidence: EvidenceRecord) {
  if (typeof evidence.value === "string") {
    const value = cleanText(evidence.value);
    if (value) return `your response “${value}”`;
  }
  if (Array.isArray(evidence.value)) {
    const value = evidence.value.map(cleanText).filter(Boolean).slice(0, 4);
    if (value.length) return `your selections around ${value.join(", ")}`;
  }
  if (typeof evidence.value === "number") {
    return `your rating of ${evidence.value}`;
  }
  return `one of your ${evidence.category.replaceAll("_", " ")} responses`;
}

function pickEvidence(
  input: ProviderInput,
  preferredCategories: EvidenceCategory[],
  fallbackIndex: number,
) {
  return (
    input.evidence.find((evidence) =>
      preferredCategories.includes(evidence.category),
    ) ?? input.evidence[fallbackIndex % input.evidence.length]
  );
}

function createInsight({
  evidence,
  profileSection,
  insightType,
  insightKey,
  title,
  summary,
  explanation,
  confirmationQuestion,
  confidenceScore = 0.56,
}: {
  evidence: EvidenceRecord;
  profileSection:
    | "emerging_strengths"
    | "what_draws_you"
    | "problems_you_care_about"
    | "how_you_can_contribute"
    | "current_constraints"
    | "best_next_direction";
  insightType:
    | "strength_pattern"
    | "interest_pattern"
    | "capability_pattern"
    | "problem_orientation"
    | "contribution_orientation"
    | "constraint"
    | "readiness_pattern";
  insightKey: string;
  title: string;
  summary: string;
  explanation: string;
  confirmationQuestion: string;
  confidenceScore?: number;
}) {
  return {
    profileSection,
    insightType,
    insightKey,
    title,
    summary,
    explanation,
    confidenceLevel:
      confidenceScore >= 0.68 ? ("moderate" as const) : ("emerging" as const),
    confidenceScore,
    confidenceFactors: [
      "The pattern is grounded in a completed Discovery response.",
      "More real-world examples would make the interpretation stronger.",
    ],
    evidence: [
      {
        evidenceId: evidence.id,
        supportType: "supporting" as const,
        explanation: `This insight is connected to ${describeEvidence(evidence)}.`,
        weight: Math.min(0.82, Math.max(0.52, confidenceScore)),
      },
    ],
    uncertainties: [
      {
        type: "context_specific" as const,
        description:
          "This is a provisional interpretation of your current answers and may change as you gain new experience.",
      },
    ],
    confirmationQuestion,
    sensitivity: "standard" as const,
    ageAppropriate: true,
  };
}

export function buildEvidenceBasedFallbackProfile(input: ProviderInput) {
  const strengthOne = pickEvidence(
    input,
    ["capability", "experience", "readiness"],
    0,
  );
  const strengthTwo = pickEvidence(
    input,
    ["value", "motivation", "interest"],
    1,
  );
  const interest = pickEvidence(input, ["interest", "motivation", "value"], 2);
  const problem = pickEvidence(
    input,
    ["value", "current_reality", "constraint", "interest"],
    3,
  );
  const contribution = pickEvidence(
    input,
    ["capability", "experience", "readiness"],
    4,
  );
  const constraint = pickEvidence(input, ["constraint", "current_reality"], 5);
  const direction = pickEvidence(
    input,
    ["readiness", "motivation", "interest", "capability"],
    6,
  );

  return {
    schemaVersion: "hpi-profile-v1" as const,
    summary:
      "Based on your completed Discovery answers, several early patterns are visible in what energises you, how you may contribute and what could help you move forward. This profile is provisional rather than a fixed label, and it should become more precise as you collect more real-world evidence.",
    insights: [
      createInsight({
        evidence: strengthOne,
        profileSection: "emerging_strengths",
        insightType: "strength_pattern",
        insightKey: "reflective_practical_strength",
        title: "Turning reflection into practical action",
        summary:
          "You may be able to notice what matters in a situation and move from thought toward a useful next action.",
        explanation: `Based on ${describeEvidence(strengthOne)}, there is an early sign that you do more than observe: you may naturally look for a practical way to respond, improve or contribute. Test this pattern by noticing the situations where people rely on you to create movement.`,
        confirmationQuestion:
          "What recent situation shows you turning an observation into a useful action?",
        confidenceScore: 0.62,
      }),
      createInsight({
        evidence: strengthTwo,
        profileSection: "emerging_strengths",
        insightType: "capability_pattern",
        insightKey: "values_guided_learning_strength",
        title: "Learning with a clear sense of value",
        summary:
          "You may learn and contribute best when the work connects with something you genuinely care about.",
        explanation: `Your evidence includes ${describeEvidence(strengthTwo)}. This suggests that meaning and values may strengthen your concentration, persistence and willingness to improve. The next step is to compare this pattern across different kinds of work.`,
        confirmationQuestion:
          "Which kind of meaningful work brings out your best effort most consistently?",
        confidenceScore: 0.58,
      }),
      createInsight({
        evidence: interest,
        profileSection: "what_draws_you",
        insightType: "interest_pattern",
        insightKey: "natural_interest_direction",
        title: "A direction that holds your attention",
        summary:
          "Your answers point toward a topic or activity that may hold your attention long enough for deeper learning.",
        explanation: `One useful clue is ${describeEvidence(interest)}. Rather than treating this as one fixed lifelong direction, use it as a direction for small experiments, conversations and projects that reveal what part of the interest is most energising.`,
        confirmationQuestion:
          "What part of this interest would you still enjoy exploring even without immediate recognition?",
        confidenceScore: 0.66,
      }),
      createInsight({
        evidence: problem,
        profileSection: "problems_you_care_about",
        insightType: "problem_orientation",
        insightKey: "problem_worth_improving",
        title: "A problem you may care about improving",
        summary:
          "You may be most motivated by problems that affect people, progress or the quality of an existing situation.",
        explanation: `The pattern is connected to ${describeEvidence(problem)}. This does not yet define one final mission, but it gives you a practical starting point: identify one specific group, one visible difficulty and one improvement that can be tested safely.`,
        confirmationQuestion:
          "Which specific group experiences this problem, and what would a small improvement look like?",
        confidenceScore: 0.57,
      }),
      createInsight({
        evidence: contribution,
        profileSection: "how_you_can_contribute",
        insightType: "contribution_orientation",
        insightKey: "practical_contribution_path",
        title: "A practical way to create value",
        summary:
          "You may create value by applying what you know to a real need and improving it through feedback.",
        explanation: `Based on ${describeEvidence(contribution)}, a useful contribution path is to build one small solution, explanation, service or improvement for people you can reach. Evidence from use will reveal whether your strongest role is guiding, organising, creating, analysing or delivering.`,
        confirmationQuestion:
          "What useful result could you create for one reachable person or group this month?",
        confidenceScore: 0.64,
      }),
      createInsight({
        evidence: constraint,
        profileSection: "current_constraints",
        insightType: "constraint",
        insightKey: "current_growth_constraint",
        title: "A current constraint to design around",
        summary:
          "Your progress may improve when one present constraint is treated as a design condition rather than a personal failure.",
        explanation: `Your Discovery evidence includes ${describeEvidence(constraint)}. The constructive response is to reduce the constraint into one controllable part, choose the smallest workable step and seek support only where it removes a clearly defined bottleneck.`,
        confirmationQuestion:
          "Which part of this constraint can you influence directly during the next seven days?",
        confidenceScore: 0.6,
      }),
      createInsight({
        evidence: direction,
        profileSection: "best_next_direction",
        insightType: "readiness_pattern",
        insightKey: "small_evidence_building_experiment",
        title: "Run one small evidence-building experiment",
        summary:
          "Your best next direction may be a small real-world experiment that converts an interest or capability into visible evidence.",
        explanation: `This direction fits ${describeEvidence(direction)} because it avoids waiting for complete certainty. Choose one useful outcome, one reachable person or group and one short time window. Build the smallest version, observe the response and record what should improve next.`,
        confirmationQuestion:
          "What is the smallest useful experiment you can complete within the next two weeks?",
        confidenceScore: 0.7,
      }),
    ],
  };
}
