import { z } from "zod";

export const builderNetworkPostKinds = [
  "build_update",
  "milestone",
  "help_request",
  "insight",
] as const;

export const builderNetworkReactionCodes = [
  "useful",
  "can_help",
  "keep_building",
] as const;

export const builderNetworkReportReasons = [
  "spam",
  "harassment",
  "unsafe_contact",
  "impersonation",
  "inappropriate_content",
  "other",
] as const;

export type BuilderNetworkPostKind = (typeof builderNetworkPostKinds)[number];
export type BuilderNetworkReactionCode =
  (typeof builderNetworkReactionCodes)[number];

export const joinBuilderNetworkSchema = z.object({
  policyAccepted: z.literal("on"),
});

export const createBuilderNetworkPostSchema = z.object({
  kind: z.enum(builderNetworkPostKinds),
  body: z.string().trim().min(20).max(1000),
  projectId: z.union([z.literal(""), z.uuid()]).optional(),
});

export const builderNetworkCommentSchema = z.object({
  postId: z.uuid(),
  body: z.string().trim().min(2).max(500),
});

export const builderNetworkReactionSchema = z.object({
  postId: z.uuid(),
  reaction: z.enum(builderNetworkReactionCodes),
});

export const builderNetworkConnectionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send"), targetUserId: z.uuid() }),
  z.object({ action: z.literal("accept"), connectionId: z.uuid() }),
  z.object({ action: z.literal("decline"), connectionId: z.uuid() }),
  z.object({ action: z.literal("cancel"), connectionId: z.uuid() }),
  z.object({ action: z.literal("remove"), connectionId: z.uuid() }),
  z.object({ action: z.literal("block"), targetUserId: z.uuid() }),
]);

export const builderNetworkConversationSchema = z.object({
  targetUserId: z.uuid(),
});

export const builderNetworkMessageSchema = z.object({
  conversationId: z.uuid(),
  body: z.string().trim().min(1).max(1200),
});

export const builderNetworkReportSchema = z.object({
  targetUserId: z.uuid(),
  reasonCode: z.enum(builderNetworkReportReasons),
  detail: z.string().trim().max(500),
  postId: z.union([z.literal(""), z.uuid()]).optional(),
  commentId: z.union([z.literal(""), z.uuid()]).optional(),
  messageId: z.union([z.literal(""), z.uuid()]).optional(),
});

export const schoolBuilderNetworkSettingsSchema = z.object({
  workspaceId: z.uuid(),
  networkEnabled: z.boolean(),
  crossSchoolEnabled: z.boolean(),
  directMessagesEnabled: z.boolean(),
});

export function builderNetworkPostKindLabel(kind: BuilderNetworkPostKind) {
  switch (kind) {
    case "build_update":
      return "Build update";
    case "milestone":
      return "Milestone";
    case "help_request":
      return "I need help";
    case "insight":
      return "Builder insight";
  }
}

export function builderNetworkReactionLabel(
  reaction: BuilderNetworkReactionCode,
) {
  switch (reaction) {
    case "useful":
      return "Useful";
    case "can_help":
      return "I can help";
    case "keep_building":
      return "Keep building";
  }
}
