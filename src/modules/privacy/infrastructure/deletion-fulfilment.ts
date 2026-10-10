import "server-only";
import { assertPrivacyDrillRequest, privacyDrillScope } from "./privacy-config";
import { z } from "zod";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

type Result = { data: unknown; error: { status?: number } | null };
export type DeletionClient = {
  rpc(name: string, args: Record<string, string>): Promise<Result>;
  auth: {
    admin: {
      updateUserById(
        id: string,
        attributes: { ban_duration: string },
      ): Promise<Result>;
      deleteUser(id: string): Promise<Result>;
    };
  };
  storage: {
    from(bucket: string): { remove(paths: string[]): Promise<Result> };
  };
};
const leaseSchema = z.object({ userId: z.uuid(), leaseToken: z.uuid() });
const filesSchema = z
  .array(z.object({ bucket: z.string().min(1), path: z.string().min(1) }))
  .max(100);

// Injectable adapter allows destructive boundaries to be tested without touching
// real accounts. The action authorises and confirms review before invoking this.
export async function runDeletionJob(
  requestId: string,
  operatorId: string,
  client: DeletionClient,
): Promise<void> {
  assertPrivacyDrillRequest(requestId);
  z.uuid().parse(requestId);
  z.uuid().parse(operatorId);
  const claimed = await client.rpc("claim_account_deletion_job", {
    request_id_input: requestId,
    operator_id_input: operatorId,
  });
  if (claimed.error) throw new Error("PRIVACY_REVIEW_OR_RETRY_REQUIRED");
  const lease = leaseSchema.parse(claimed.data);
  const args = {
    request_id_input: requestId,
    lease_token_input: lease.leaseToken,
  };
  async function rpc(name: string) {
    const result = await client.rpc(name, args);
    if (result.error) throw new Error("PRIVACY_PROCESSING_FAILED");
    return result.data;
  }
  try {
    const scope = privacyDrillScope();
    if (scope && scope.userId !== lease.userId)
      throw new Error("PRIVACY_DRILL_USER_DENIED");
    const ban = await client.auth.admin.updateUserById(lease.userId, {
      ban_duration: "876000h",
    });
    // An interrupted run may already have removed the Auth user.
    if (ban.error && ban.error.status !== 404)
      throw new Error("PRIVACY_PROCESSING_FAILED");
    await rpc("purge_account_deletion_data");
    let batches = 0;
    for (;;) {
      const files = filesSchema.parse(
        await rpc("account_deletion_storage_batch"),
      );
      if (files.length === 0) break;
      // Bound a web request. Large accounts resume from the remaining objects.
      if (++batches > 20) throw new Error("PRIVACY_RETRY_REQUIRED");
      const grouped = new Map<string, string[]>();
      for (const file of files)
        grouped.set(file.bucket, [
          ...(grouped.get(file.bucket) ?? []),
          file.path,
        ]);
      for (const [bucket, paths] of grouped) {
        const removed = await client.storage.from(bucket).remove(paths);
        if (removed.error) throw new Error("PRIVACY_PROCESSING_FAILED");
      }
    }
    const removed = await client.auth.admin.deleteUser(lease.userId);
    if (removed.error && removed.error.status !== 404)
      throw new Error("PRIVACY_PROCESSING_FAILED");
    // SQL checks Auth absence, every direct identity FK and owned Storage before
    // atomically fulfilling the request and discarding the job's target ID.
    await rpc("finish_account_deletion_job");
  } catch {
    await client.rpc("fail_account_deletion_job", args).catch(() => undefined);
    throw new Error("PRIVACY_DELETION_NOT_CONFIRMED");
  }
}

export async function fulfilDeletionRequest(
  requestId: string,
  operatorId: string,
) {
  if (process.env.PRIVACY_FULFILMENT_ENABLED !== "true")
    throw new Error("PRIVACY_FULFILMENT_DISABLED");
  await runDeletionJob(
    requestId,
    operatorId,
    createServiceRoleSupabaseClient() as unknown as DeletionClient,
  );
}

export async function takeOverDeletionReview(
  requestId: string,
  operatorId: string,
) {
  assertPrivacyDrillRequest(requestId);
  const client = createServiceRoleSupabaseClient() as unknown as DeletionClient;
  const { error } = await client.rpc("take_over_account_deletion_review", {
    request_id_input: z.uuid().parse(requestId),
    operator_id_input: z.uuid().parse(operatorId),
  });
  if (error) throw new Error("PRIVACY_REVIEW_UNAVAILABLE");
}
