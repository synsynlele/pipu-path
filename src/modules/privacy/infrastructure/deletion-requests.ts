import "server-only";
import { assertPrivacyDrillRequest, privacyDrillScope } from "./privacy-config";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export type DeletionRequest = {
  id: string;
  user_id: string | null;
  status: "pending" | "reviewing" | "fulfilled";
  created_at: string;
  job?: {
    state: string;
    phase: string;
    attempts: number;
    updated_at: string;
  } | null;
};

// A server-only adapter until database types are regenerated after staging migration.
type Result = { data: unknown; error: { code?: string } | null };
type Query = PromiseLike<Result> & {
  select(columns: string): Query;
  insert(values: Record<string, unknown>): Query;
  update(values: Record<string, unknown>): Query;
  eq(column: string, value: unknown): Query;
  in(column: string, values: string[]): Query;
  order(column: string, options: { ascending: boolean }): Query;
  limit(value: number): Query;
  maybeSingle(): Promise<Result>;
};
type Client = { from(table: string): Query };
function requests() {
  return (createServiceRoleSupabaseClient() as unknown as Client).from(
    "account_deletion_requests",
  );
}

export async function getOwnDeletionRequest(userId: string) {
  const scope = privacyDrillScope();
  if (scope && scope.userId !== userId) return null;
  const result = await requests()
    .select("id,user_id,status,created_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (result.error) throw new Error("PRIVACY_REQUEST_READ_FAILED");
  return result.data as DeletionRequest | null;
}

export async function saveDeletionRequest(userId: string) {
  const scope = privacyDrillScope();
  if (scope && scope.userId !== userId)
    throw new Error("PRIVACY_DRILL_USER_DENIED");
  const existing = await getOwnDeletionRequest(userId);
  if (scope) {
    if (existing?.id !== scope.requestId)
      throw new Error("PRIVACY_DRILL_REQUEST_DENIED");
    return existing;
  }
  if (existing) return existing;
  const { data, error } = await requests()
    .insert({ user_id: userId })
    .select("id,user_id,status,created_at")
    .maybeSingle();
  // A unique user constraint makes concurrent submissions idempotent.
  if (error?.code === "23505") return getOwnDeletionRequest(userId);
  if (error || !data) throw new Error("PRIVACY_REQUEST_SAVE_FAILED");
  return data as DeletionRequest;
}

export async function listOpenDeletionRequests() {
  const scope = privacyDrillScope();
  let query = requests();
  if (scope) query = query.eq("id", scope.requestId);
  const { data, error } = await query
    .select(
      "id,user_id,status,created_at,job:account_deletion_jobs(state,phase,attempts,updated_at)",
    )
    .in("status", ["pending", "reviewing"])
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) throw new Error("PRIVACY_QUEUE_READ_FAILED");
  return (data ?? []) as DeletionRequest[];
}

export async function claimDeletionRequest(
  requestId: string,
  operatorId: string,
) {
  assertPrivacyDrillRequest(requestId);
  const { data, error } = await requests()
    .update({
      status: "reviewing",
      reviewed_by: operatorId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (error || !data) throw new Error("PRIVACY_REQUEST_CLAIM_FAILED");
}
