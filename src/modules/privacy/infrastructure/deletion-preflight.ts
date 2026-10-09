import "server-only";
import { z } from "zod";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

const inventorySchema = z.object({
  requestId: z.uuid(),
  status: z.enum(["pending", "reviewing"]),
  accountPresent: z.boolean(),
  storageObjects: z.number().int().nonnegative(),
  relations: z.array(
    z.object({
      table: z.string(),
      column: z.string(),
      count: z.number().int().positive(),
      rule: z.enum([
        "cascade",
        "set_null",
        "restrict",
        "set_default",
        "no_action",
      ]),
    }),
  ),
  scope: z.literal("direct_identity_dependencies_only"),
  deleted: z.literal(false),
  readyToDelete: z.literal(false),
});
export type DeletionInventory = z.infer<typeof inventorySchema>;

export async function getDeletionInventory(
  requestId: string,
): Promise<DeletionInventory> {
  z.uuid().parse(requestId);
  const client = createServiceRoleSupabaseClient() as unknown as {
    rpc(
      name: string,
      args: { request_id_input: string },
    ): Promise<{ data: unknown; error: unknown }>;
  };
  const { data, error } = await client.rpc("account_deletion_preflight", {
    request_id_input: requestId,
  });
  if (error) throw new Error("PRIVACY_PREFLIGHT_UNAVAILABLE");
  const parsed = inventorySchema.safeParse(data);
  if (!parsed.success || parsed.data.requestId !== requestId) {
    throw new Error("PRIVACY_PREFLIGHT_UNAVAILABLE");
  }
  return parsed.data;
}
