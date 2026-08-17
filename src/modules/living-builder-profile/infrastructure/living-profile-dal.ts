import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import type {
  BuilderCapabilityFeedbackType,
  BuilderCapabilityLevel,
  BuilderCapabilityEvidenceSource,
  BuilderCapabilityVerification,
} from "../domain/living-profile-contract";

export type LivingBuilderEvidence = {
  id: string;
  sourceType: BuilderCapabilityEvidenceSource;
  sourceId: string;
  sourceTitle: string;
  summary: string;
  verification: BuilderCapabilityVerification;
  strength: number;
  occurredAt: string;
  href: string;
};

export type LivingBuilderCapability = {
  id: string;
  key: string;
  label: string;
  level: BuilderCapabilityLevel;
  evidenceCount: number;
  totalStrength: number;
  verificationSummary: {
    pipupathAction?: number;
    mutualCollaboration?: number;
    sourceTypes?: number;
  };
  feedback: {
    type: BuilderCapabilityFeedbackType;
    contextNote: string | null;
    createdAt: string;
  } | null;
  evidence: LivingBuilderEvidence[];
};

export type LivingBuilderProfile = {
  id: string;
  version: number;
  rulesVersion: string;
  evidenceCutoffAt: string;
  createdAt: string;
  sourceHumanPotentialProfileId: string;
  capabilities: LivingBuilderCapability[];
  history: Array<{
    id: string;
    version: number;
    status: "active" | "superseded";
    rulesVersion: string;
    evidenceCutoffAt: string;
    createdAt: string;
    capabilityCount: number;
  }>;
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

export async function getLivingBuilderProfile(): Promise<LivingBuilderProfile | null> {
  await requireAuthenticatedIdentity();
  const { data, error } = await invoke("get_stage16_living_builder_profile");
  if (error) throw new Error(error.message ?? "BUILDER_PROFILE_UNAVAILABLE");
  if (!data) return null;
  if (typeof data !== "object") throw new Error("BUILDER_PROFILE_UNAVAILABLE");
  return data as LivingBuilderProfile;
}

export async function refreshLivingBuilderProfile() {
  await requireAuthenticatedIdentity();
  return invoke("refresh_stage16_living_builder_profile");
}

export async function recordLivingBuilderCapabilityFeedback(
  claimId: string,
  feedbackType: BuilderCapabilityFeedbackType,
  contextNote?: string | null,
) {
  await requireAuthenticatedIdentity();
  return invoke("record_stage16_capability_feedback", {
    claim_id_input: claimId,
    feedback_type_input: feedbackType,
    context_note_input: contextNote ?? null,
  });
}
