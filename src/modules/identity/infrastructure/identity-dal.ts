import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// React cache is request-scoped: never persist identity across users or requests.
export const getIdentityState = cache(async () => {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return { user: null, profile: null, checkpoint: null };

  const [{ data: profile }, { data: checkpoint }] = await Promise.all([
    client.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    client
      .from("onboarding_checkpoints")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  return { user, profile, checkpoint };
});

export type GuardianAuthorizationState = {
  required: boolean;
  status:
    | "not_required"
    | "pending"
    | "granted"
    | "parent_declared"
    | "expired"
    | "missing";
  requestId: string | null;
  code: string | null;
  expiresAt: string | null;
};

type RpcResult = { data: unknown; error: { message?: string } | null };
type UntypedRpc = (
  functionName: string,
  args?: Record<string, unknown>,
) => PromiseLike<RpcResult>;

export async function guardianAuthorizationGrantedForUser(userId: string) {
  const { user } = await getIdentityState();
  if (!user || user.id !== userId) return false;
  const state = await getGuardianAuthorizationState();
  return state?.status === "granted" || state?.status === "parent_declared";
}

export async function currentIdentityNeedsGuardianAuthorization() {
  const state = await getIdentityState();
  if (!state.user || !state.profile?.is_minor) return false;
  return !(await guardianAuthorizationGrantedForUser(state.user.id));
}

export const getGuardianAuthorizationState = cache(
  async (): Promise<GuardianAuthorizationState | null> => {
    const client = await createServerSupabaseClient();
    const { user } = await getIdentityState();
    if (!user) return null;
    const rpc = client.rpc.bind(client) as unknown as UntypedRpc;
    const { data, error } = await rpc("get_guardian_authorization_state");
    if (error || !data || typeof data !== "object") {
      throw new Error(error?.message ?? "GUARDIAN_STATE_UNAVAILABLE");
    }
    return data as GuardianAuthorizationState;
  },
);

export async function requireAuthenticatedIdentity() {
  const state = await getIdentityState();
  if (!state.user) redirect("/login?next=/app");
  if (!state.profile || state.checkpoint?.status !== "completed")
    redirect("/onboarding/identity");
  if (
    state.profile.is_minor &&
    !(await guardianAuthorizationGrantedForUser(state.user.id))
  ) {
    redirect("/onboarding/guardian");
  }
  return {
    user: state.user,
    profile: state.profile,
    checkpoint: state.checkpoint,
  };
}

export type GuardianManagedBuilder = {
  requestId: string;
  minorName: string;
  ageBand: string;
  schoolNetworkEnabled: boolean;
};

export async function listGuardianManagedBuilders() {
  const client = await createServerSupabaseClient();
  const rpc = client.rpc.bind(client) as unknown as UntypedRpc;
  const { data, error } = await rpc("list_guardian_authorizations");
  if (error || !Array.isArray(data)) {
    throw new Error(error?.message ?? "GUARDIAN_LIST_UNAVAILABLE");
  }
  return data as GuardianManagedBuilder[];
}
