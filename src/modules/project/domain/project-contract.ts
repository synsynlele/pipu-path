import { z } from "zod";

const conciseText = (label: string, minimum: number, maximum: number) =>
  z
    .string()
    .trim()
    .min(minimum, `${label} needs a little more detail.`)
    .max(maximum, `${label} is too long.`);

export const projectMilestoneInputSchema = z.object({
  title: conciseText("Milestone title", 3, 100),
  intendedOutcome: conciseText("Milestone outcome", 10, 500),
  completionSignal: conciseText("Completion signal", 10, 400),
  sequenceOrder: z.number().int().min(1).max(3),
});

export const projectCreateInputSchema = z.object({
  sourceQuestId: z.uuid(),
  title: conciseText("Project title", 3, 100),
  problemStatement: conciseText("Problem statement", 20, 800),
  peopleServed: conciseText("People served", 10, 400),
  desiredOutcome: conciseText("Desired outcome", 20, 800),
  smallestUsefulVersion: conciseText("Smallest useful version", 20, 800),
  successSignal: conciseText("Success signal", 10, 500),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid target date."),
  milestones: z
    .array(projectMilestoneInputSchema)
    .length(3, "A Builder Project needs exactly three milestones.")
    .superRefine((milestones, context) => {
      milestones.forEach((milestone, index) => {
        if (milestone.sequenceOrder !== index + 1) {
          context.addIssue({
            code: "custom",
            message: "Project milestones must remain in order.",
          });
        }
      });
    }),
});

export const projectUpdateInputSchema = z.object({
  projectId: z.uuid(),
  milestoneId: z.uuid(),
  progressNote: conciseText("Progress update", 20, 2000),
  proofText: conciseText("Project proof", 20, 2000),
  proofLink: z
    .string()
    .trim()
    .max(500, "The proof link is too long.")
    .refine(
      (value) => value.length === 0 || /^https?:\/\//i.test(value),
      "Use a complete http or https link.",
    ),
  nextStep: conciseText("Next step", 10, 1000),
  marksMilestoneComplete: z.boolean(),
});

export type ProjectCreateInput = z.infer<typeof projectCreateInputSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateInputSchema>;
export type BuilderProjectStatus = "active" | "completed" | "archived";
export type BuilderProjectMilestoneStatus =
  | "locked"
  | "available"
  | "active"
  | "completed";

export type ProjectErrorCode =
  | "PROJECT_ACCESS_DENIED"
  | "PROJECT_COMPLETED_QUEST_REQUIRED"
  | "PROJECT_PROOF_REQUIRED"
  | "PROJECT_JOURNEY_REQUIRED"
  | "PROJECT_ALREADY_ACTIVE"
  | "PROJECT_SOURCE_ALREADY_USED"
  | "PROJECT_TARGET_DATE_INVALID"
  | "PROJECT_MILESTONES_INVALID"
  | "PROJECT_INPUT_INVALID"
  | "PROJECT_ACTIVE_REQUIRED"
  | "PROJECT_MILESTONE_NOT_AVAILABLE"
  | "PROJECT_UPDATE_INVALID"
  | "PROJECT_MILESTONE_ALREADY_COMPLETED";

export function calculateProjectProgress(
  statuses: BuilderProjectMilestoneStatus[],
) {
  if (statuses.length === 0) return 0;
  const completed = statuses.filter((status) => status === "completed").length;
  return Math.round((completed / statuses.length) * 100);
}

export function projectStatusLabel(status: BuilderProjectStatus) {
  return {
    active: "In progress",
    completed: "Completed",
    archived: "Archived",
  }[status];
}

export function projectMilestoneStatusLabel(
  status: BuilderProjectMilestoneStatus,
) {
  return {
    locked: "Locked",
    available: "Ready",
    active: "In progress",
    completed: "Completed",
  }[status];
}
