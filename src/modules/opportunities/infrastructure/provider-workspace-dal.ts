import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  opportunityProviderRoleSchema,
  opportunityProviderStatusSchema,
  type OpportunityProviderRole,
  type OpportunityProviderStatus,
} from "../domain/marketplace-contract";

type RpcResult = {
  data: unknown;
  error: { message?: string } | null;
};
type UntypedClient = {
  rpc(name: string, args?: Record<string, unknown>): Promise<RpcResult>;
};

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : null;
}

export type ProviderWorkspaceChoice = {
  providerId: string;
  organisationName: string;
  status: OpportunityProviderStatus;
  role: OpportunityProviderRole;
  joinedAt: string;
};

export async function listProviderWorkspaceChoices(): Promise<
  ProviderWorkspaceChoice[]
> {
  const client =
    (await createServerSupabaseClient()) as unknown as UntypedClient;
  const result = await client.rpc("list_stage20_provider_workspaces");
  if (result.error) throw new Error("PROVIDER_WORKSPACE_LIST_UNAVAILABLE");
  if (!Array.isArray(result.data)) return [];

  return result.data.flatMap((item) => {
    const row = object(item);
    const providerId = text(row.providerId);
    const organisationName = text(row.organisationName);
    const joinedAt = text(row.joinedAt);
    const status = opportunityProviderStatusSchema.safeParse(row.status);
    const role = opportunityProviderRoleSchema.safeParse(row.role);
    if (
      !providerId ||
      !organisationName ||
      !joinedAt ||
      !status.success ||
      !role.success
    ) {
      return [];
    }
    return [
      {
        providerId,
        organisationName,
        joinedAt,
        status: status.data,
        role: role.data,
      },
    ];
  });
}
