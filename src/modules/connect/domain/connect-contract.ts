import { z } from "zod";

export const connectionActions = [
  "accept",
  "decline",
  "cancel",
  "remove",
] as const;
export const reportReasons = [
  "spam",
  "harassment",
  "unsafe_contact",
  "impersonation",
  "other",
] as const;

const listItemSchema = z.string().trim().min(2).max(80);

export const networkProfileInputSchema = z.object({
  interests: z.array(listItemSchema).max(8),
  capabilities: z.array(listItemSchema).max(8),
  canHelpWith: z.string().trim().max(320),
  needsHelpWith: z.string().trim().max(320),
  contactEmail: z.union([z.email().max(254), z.literal("")]),
  contactWhatsapp: z.union([
    z.string().trim().min(7).max(32),
    z.literal(""),
  ]),
  discoverable: z.boolean(),
});

export const connectionRequestInputSchema = z.object({
  targetUserId: z.uuid(),
});

export const connectionResponseInputSchema = z.object({
  connectionId: z.uuid(),
  action: z.enum(connectionActions),
});

export const builderSafetyActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("block"), userId: z.uuid() }),
  z.object({ action: z.literal("unblock"), userId: z.uuid() }),
  z.object({
    action: z.literal("report"),
    userId: z.uuid(),
    reason: z.enum(reportReasons),
  }),
]);

export const contactShareInputSchema = z.object({
  connectionId: z.uuid(),
  shareEmail: z.boolean(),
  shareWhatsapp: z.boolean(),
});

export type ConnectProfile = {
  interests: string[];
  capabilities: string[];
  canHelpWith: string;
  needsHelpWith: string;
  contactEmail: string | null;
  contactWhatsapp: string | null;
  visibility: "private" | "discoverable";
};

export type DiscoverableBuilder = {
  userId: string;
  username: string;
  preferredName: string;
  missionTitle: string | null;
  missionStatement: string | null;
  interests: string[];
  capabilities: string[];
  canHelpWith: string;
  needsHelpWith: string;
  relationship: "none" | "pending" | "accepted" | "declined" | "cancelled" | "removed";
};

export type BuilderDetail = DiscoverableBuilder & {
  connectionId: string | null;
  requesterId: string | null;
};

export type ConnectionRequest = {
  connectionId: string;
  userId: string;
  username: string;
  preferredName: string;
  status: "pending";
  updatedAt: string;
};

export type AcceptedConnection = {
  connectionId: string;
  userId: string;
  username: string;
  preferredName: string;
  status: "accepted";
  updatedAt: string;
  sharedEmail: string | null;
  sharedWhatsapp: string | null;
  myShareEmail: boolean;
  myShareWhatsapp: boolean;
};

export type BlockedBuilder = {
  userId: string;
  username: string;
  preferredName: string;
};

export type ConnectState = {
  eligible: boolean;
  profile: ConnectProfile | null;
  discover: DiscoverableBuilder[];
  incoming: ConnectionRequest[];
  sent: ConnectionRequest[];
  connections: AcceptedConnection[];
  blocked: BlockedBuilder[];
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
