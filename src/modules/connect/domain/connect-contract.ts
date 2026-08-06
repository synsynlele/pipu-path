import { z } from "zod";

export const connectionReasons = [
  "collaborate",
  "learn",
  "support",
  "share_resources",
] as const;
export const connectionActions = [
  "accept",
  "decline",
  "cancel",
  "remove",
] as const;
export const reportReasons = [
  "unsafe_contact",
  "harassment",
  "false_identity",
  "inappropriate_content",
  "other",
] as const;

const listItemSchema = z.string().trim().min(2).max(80);

export const networkProfileInputSchema = z.object({
  headline: z.string().trim().min(10).max(160),
  canHelpWith: z.array(listItemSchema).min(1).max(6),
  needsHelpWith: z.array(listItemSchema).min(1).max(6),
  interests: z.array(listItemSchema).min(1).max(8),
  discoverable: z.boolean(),
});

export const connectionRequestInputSchema = z.object({
  recipientId: z.uuid(),
  reason: z.enum(connectionReasons),
});

export const connectionResponseInputSchema = z.object({
  requestId: z.uuid(),
  action: z.enum(connectionActions),
});

export const builderSafetyActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("block"), userId: z.uuid() }),
  z.object({
    action: z.literal("report"),
    userId: z.uuid(),
    reason: z.enum(reportReasons),
  }),
]);

export type BuilderDirectoryRow = {
  user_id: string;
  username: string;
  display_name: string;
  headline: string;
  can_help_with: string[];
  needs_help_with: string[];
  interests: string[];
  portfolio_slug: string | null;
  portfolio_title: string | null;
  relationship_status: string;
};

export type BuilderNetworkRow = {
  request_id: string;
  other_user_id: string;
  username: string;
  display_name: string;
  headline: string | null;
  relationship_status: "pending" | "accepted";
  direction: "incoming" | "outgoing";
  reason: (typeof connectionReasons)[number];
  created_at: string;
};

export function parseCommaSeparatedList(value: FormDataEntryValue | null) {
  return Array.from(
    new Set(
      String(value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function connectionReasonLabel(
  reason: (typeof connectionReasons)[number],
) {
  return {
    collaborate: "Collaborate on a practical build",
    learn: "Learn from this Builder",
    support: "Offer or receive support",
    share_resources: "Share useful resources",
  }[reason];
}
