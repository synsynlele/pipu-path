import "server-only";

import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import type {
  BuilderNetworkPostKind,
  BuilderNetworkReactionCode,
} from "../domain/builder-network-contract";

type RpcResult = { data: unknown; error: { message?: string } | null };
type UntypedRpc = (
  functionName: string,
  args?: Record<string, unknown>,
) => PromiseLike<RpcResult>;

export type BuilderNetworkPerson = {
  userId: string;
  username: string;
  preferredName: string;
};

export type BuilderNetworkComment = {
  id: string;
  body: string;
  createdAt: string;
  author: BuilderNetworkPerson;
};

export type BuilderNetworkFeedItem = {
  id: string;
  kind: BuilderNetworkPostKind;
  body: string;
  createdAt: string;
  author: BuilderNetworkPerson;
  schoolName: string | null;
  project: { id: string; title: string } | null;
  myReaction: BuilderNetworkReactionCode | null;
  reactions: { useful: number; canHelp: number; keepBuilding: number };
  comments: BuilderNetworkComment[];
  commentCount: number;
};

export type BuilderNetworkBuilder = BuilderNetworkPerson & {
  missionTitle: string | null;
  missionStatement: string | null;
  schoolName: string | null;
  relationship: "none" | "pending" | "accepted" | "declined" | "cancelled" | "removed";
};

export type BuilderNetworkRelationship = BuilderNetworkPerson & {
  connectionId: string;
  updatedAt: string;
  canMessage?: boolean;
};

export type BuilderWorldState = {
  eligible: boolean;
  joined: boolean;
  scope: "adult" | "school" | null;
  schoolName: string | null;
  feed: BuilderNetworkFeedItem[];
  builders: BuilderNetworkBuilder[];
  incoming: BuilderNetworkRelationship[];
  sent: BuilderNetworkRelationship[];
  connections: BuilderNetworkRelationship[];
  unreadMessages: number;
};

export type BuilderNetworkConversationListItem = {
  conversationId: string;
  otherUser: BuilderNetworkPerson;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type BuilderNetworkConversation = {
  conversationId: string;
  otherUser: BuilderNetworkPerson;
  messages: Array<{
    id: string;
    senderId: string;
    body: string;
    createdAt: string;
  }>;
};

export type SchoolBuilderNetworkSettings = {
  workspaceId: string;
  role: "owner" | "verifier" | "analyst";
  networkEnabled: boolean;
  crossSchoolEnabled: boolean;
  directMessagesEnabled: boolean;
  policyVersion: string;
};

async function invokeBuilderNetworkRpc(
  functionName: string,
  args?: Record<string, unknown>,
) {
  const client = await createServerSupabaseClient();
  const rpc = client.rpc.bind(client) as unknown as UntypedRpc;
  return rpc(functionName, args);
}

export async function runBuilderNetworkRpc(
  functionName: string,
  args?: Record<string, unknown>,
) {
  await requireAuthenticatedIdentity();
  return invokeBuilderNetworkRpc(functionName, args);
}

export async function getBuilderWorldState(): Promise<BuilderWorldState> {
  await requireAuthenticatedIdentity();
  const { data, error } = await invokeBuilderNetworkRpc(
    "get_stage29_builder_world",
    { limit_input: 24 },
  );
  if (error || !data || typeof data !== "object") {
    throw new Error(error?.message ?? "BUILDER_NETWORK_STATE_UNAVAILABLE");
  }
  return data as BuilderWorldState;
}

export async function getBuilderNetworkConversations(): Promise<
  BuilderNetworkConversationListItem[]
> {
  await requireAuthenticatedIdentity();
  const { data, error } = await invokeBuilderNetworkRpc(
    "get_stage29_builder_network_conversations",
  );
  if (error || !Array.isArray(data)) {
    throw new Error(error?.message ?? "BUILDER_NETWORK_MESSAGES_UNAVAILABLE");
  }
  return data as BuilderNetworkConversationListItem[];
}

export async function getBuilderNetworkConversation(conversationId: string) {
  await requireAuthenticatedIdentity();
  const { data, error } = await invokeBuilderNetworkRpc(
    "get_stage29_builder_network_conversation",
    { conversation_id_input: conversationId },
  );
  if (error || !data || typeof data !== "object") notFound();
  return data as BuilderNetworkConversation;
}

export async function getSchoolBuilderNetworkSettings(workspaceId: string) {
  await requireAuthenticatedIdentity();
  const { data, error } = await invokeBuilderNetworkRpc(
    "get_stage29_school_network_settings",
    { workspace_id_input: workspaceId },
  );
  if (error || !data || typeof data !== "object") notFound();
  return data as SchoolBuilderNetworkSettings;
}
