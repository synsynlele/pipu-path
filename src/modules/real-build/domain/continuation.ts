import { z } from "zod";
import { challengeSchema, draftSchema } from "./build";

// A private, explicitly requested brief. Never place this in the shared template pool.
export const continuationSchema = z
  .object({
    previousSolution: challengeSchema,
    reportedOutcome: z.enum(["worked", "partly", "not_yet"]),
    whatWasDone: z.string().trim().min(20).max(3000),
    whatWasLearned: z.string().trim().min(10).max(2000),
    plannedChange: z.string().trim().min(10).max(1000),
  })
  .strict();
export type BuildContinuation = z.infer<typeof continuationSchema>;

export function continuationBrief(
  challenge: unknown,
  draft: unknown,
): BuildContinuation {
  const saved = draftSchema.parse(draft);
  return continuationSchema.parse({
    previousSolution: challengeSchema.parse(challenge),
    reportedOutcome: saved.outcome,
    whatWasDone: saved.evidence,
    whatWasLearned: saved.reflection,
    plannedChange: saved.nextChange,
  });
}
