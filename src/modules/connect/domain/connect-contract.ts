import { z } from "zod";

export const connectProfileInputSchema = z.object({
  interests: z.array(z.string().trim().min(2).max(80)).max(8),
  capabilities: z.array(z.string().trim().min(2).max(80)).max(8),
  canHelpWith: z.string().trim().max(320),
  needsHelpWith: z.string().trim().max(320),
  contactEmail: z.union([z.literal(""), z.string().email().max(254)]),
  contactWhatsapp: z.string().trim().max(32),
  visibility: z.enum(["private", "discoverable"]),
});

export const connectActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("send"), targetUserId: z.uuid() }),
  z.object({ action: z.literal("accept"), connectionId: z.uuid() }),
  z.object({ action: z.literal("decline"), connectionId: z.uuid() }),
  z.object({ action: z.literal("cancel"), connectionId: z.uuid() }),
  z.object({ action: z.literal("remove"), connectionId: z.uuid() }),
  z.object({ action: z.literal("block"), targetUserId: z.uuid() }),
  z.object({ action: z.literal("unblock"), targetUserId: z.uuid() }),
]);

export const contactShareInputSchema = z.object({
  connectionId: z.uuid(),
  shareEmail: z.boolean(),
  shareWhatsapp: z.boolean(),
});

export const reportBuilderInputSchema = z.object({
  targetUserId: z.uuid(),
  reasonCode: z.enum([
    "spam",
    "harassment",
    "unsafe_contact",
    "impersonation",
    "other",
  ]),
  detail: z.string().trim().max(500),
});

export function commaSeparatedValues(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}
