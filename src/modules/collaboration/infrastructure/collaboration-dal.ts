import "server-only";

import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import type { BuilderCollaborationStatus } from "../domain/collaboration-contract";

export type CollaborationPerson = {
  userId: string;
  username: string;
  preferredName: string;
};

export type CollaborationItem = {
  id: string;
  projectId: string;
  projectTitle: string;
  owner: CollaborationPerson;
  collaborator: CollaborationPerson;
  objective: string;
  roleNeeded: string;
  expectedContribution: string;
  ownerContribution: string;
  commitmentNote: string;
  status: BuilderCollaborationStatus;
  invitedAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  ownerConfirmed: boolean;
  collaboratorConfirmed: boolean;
  myRole: "owner" | "collaborator";
};

export type CollaborationState = {
  eligible: boolean;
  activeProject: { id: string; title: string } | null;
  availableConnections: CollaborationPerson[];
  incoming: CollaborationItem[];
  sent: CollaborationItem[];
  active: CollaborationItem[];
  completed: CollaborationItem[];
};

export type CollaborationContribution = {
  id: string;
  contributor: CollaborationPerson;
  contributionSummary: string;
  evidenceNote: string;
  evidenceLink: string | null;
  nextStep: string;
  createdAt: string;
};

export type CollaborationDetail = {
  collaboration: CollaborationItem;
  contributions: CollaborationContribution[];
};

type RpcResult = { data: unknown; error: { message?: string } | null };
type UntypedRpc = (
  functionName: string,
  args?: Record<string, unknown>,
) => PromiseLike<RpcResult>;

async function invoke(functionName: string, args?: Record<string, unknown>) {
  const client = await createServerSupabaseClient();
  const rpc = client.rpc.bind(client) as unknown as UntypedRpc;
  return rpc(functionName, args);
}

export async function runCollaborationRpc(
  functionName: string,
  args?: Record<string, unknown>,
) {
  await requireAuthenticatedIdentity();
  return invoke(functionName, args);
}

export async function getCollaborationState(): Promise<CollaborationState> {
  await requireAuthenticatedIdentity();
  const { data, error } = await invoke("get_stage15_collaboration_state");
  if (error || !data || typeof data !== "object") {
    throw new Error(error?.message ?? "COLLABORATION_STATE_UNAVAILABLE");
  }
  return data as CollaborationState;
}

export async function getCollaborationDetail(collaborationId: string) {
  await requireAuthenticatedIdentity();
  const { data, error } = await invoke("get_stage15_collaboration_detail", {
    collaboration_id_input: collaborationId,
  });
  if (error || !data || typeof data !== "object") notFound();
  return data as CollaborationDetail;
}
