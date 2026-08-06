import "server-only";

import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";

export type ConnectVisibility = "private" | "discoverable";
export type ConnectRelationship =
  | "none"
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"
  | "removed";

export type ConnectProfile = {
  interests: string[];
  capabilities: string[];
  canHelpWith: string;
  needsHelpWith: string;
  contactEmail: string | null;
  contactWhatsapp: string | null;
  visibility: ConnectVisibility;
};

export type BuilderCard = {
  userId: string;
  username: string;
  preferredName: string;
  missionTitle: string | null;
  missionStatement: string | null;
  interests: string[];
  capabilities: string[];
  canHelpWith: string;
  needsHelpWith: string;
  relationship: ConnectRelationship;
};

export type NetworkItem = {
  connectionId: string;
  userId: string;
  username: string;
  preferredName: string;
  status: ConnectRelationship;
  updatedAt: string;
  sharedEmail?: string | null;
  sharedWhatsapp?: string | null;
  myShareEmail?: boolean;
  myShareWhatsapp?: boolean;
};

export type ConnectState = {
  eligible: boolean;
  profile: ConnectProfile | null;
  discover: BuilderCard[];
  incoming: NetworkItem[];
  sent: NetworkItem[];
  connections: NetworkItem[];
  blocked: Array<{
    userId: string;
    username: string;
    preferredName: string;
  }>;
};

export type BuilderDetail = BuilderCard & {
  connectionId: string | null;
  requesterId: string | null;
};

type RpcResult = { data: unknown; error: { message?: string } | null };
type UntypedRpc = (
  functionName: string,
  args?: Record<string, unknown>,
) => PromiseLike<RpcResult>;

async function invokeConnectRpc(
  functionName: string,
  args?: Record<string, unknown>,
) {
  const client = await createServerSupabaseClient();
  const rpc = client.rpc.bind(client) as unknown as UntypedRpc;
  return rpc(functionName, args);
}

export async function runConnectRpc(
  functionName: string,
  args?: Record<string, unknown>,
) {
  await requireAuthenticatedIdentity();
  return invokeConnectRpc(functionName, args);
}

export async function getConnectState(): Promise<ConnectState> {
  await requireAuthenticatedIdentity();
  const { data, error } = await invokeConnectRpc("get_stage11_connect_state");
  if (error || !data || typeof data !== "object") {
    throw new Error(error?.message ?? "CONNECT_STATE_UNAVAILABLE");
  }
  return data as ConnectState;
}

export async function getBuilderDetail(username: string) {
  await requireAuthenticatedIdentity();
  const { data, error } = await invokeConnectRpc(
    "get_stage11_builder_detail",
    { username_input: username },
  );
  if (error || !data || typeof data !== "object") notFound();
  return data as BuilderDetail;
}
