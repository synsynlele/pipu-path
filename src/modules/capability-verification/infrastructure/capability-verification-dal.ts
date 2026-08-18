import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CapabilityVerificationStatus } from "../domain/capability-verification-contract";

type QueryError = { message?: string } | null;
type RpcResult = { data: unknown; error: QueryError };
type UntypedClient = {
  rpc(name: string, args?: Record<string, unknown>): Promise<RpcResult>;
};

export type EligibleVerificationEvidence = {
  claimId: string;
  evidenceId: string;
  capabilityKey: string;
  capabilityLabel: string;
  level: "practicing" | "demonstrated" | "repeatedly_demonstrated";
  sourceTitle: string;
  sourceSummary: string;
  collaborationId: string;
  verifierUserId: string;
  verifierDisplayName: string | null;
  verifierUsername: string | null;
};

export type VerifiedCapabilitySummary = {
  capabilityKey: string;
  capabilityLabel: string;
  confirmedCount: number;
};

export type OutgoingVerification = {
  id: string;
  capabilityKey: string;
  capabilityLabel: string;
  sourceTitle: string;
  sourceSummary: string;
  status: CapabilityVerificationStatus;
  requestNote: string | null;
  responseNote: string | null;
  requestedAt: string;
  respondedAt: string | null;
  verifierDisplayName: string | null;
  verifierUsername: string | null;
  actionable: boolean;
};

export type IncomingVerification = {
  id: string;
  capabilityKey: string;
  capabilityLabel: string;
  sourceTitle: string;
  sourceSummary: string;
  status: CapabilityVerificationStatus;
  requestNote: string | null;
  responseNote: string | null;
  requestedAt: string;
  respondedAt: string | null;
  builderDisplayName: string | null;
  builderUsername: string | null;
  actionable: boolean;
};

export type CapabilityVerificationWorkspace = {
  eligibleEvidence: EligibleVerificationEvidence[];
  verifiedCapabilities: VerifiedCapabilitySummary[];
  outgoing: OutgoingVerification[];
  incoming: IncomingVerification[];
};

function asUntypedClient(client: unknown) {
  return client as UntypedClient;
}

function emptyWorkspace(): CapabilityVerificationWorkspace {
  return {
    eligibleEvidence: [],
    verifiedCapabilities: [],
    outgoing: [],
    incoming: [],
  };
}

export async function runCapabilityVerificationRpc(
  name: string,
  args: Record<string, unknown> = {},
) {
  const client = asUntypedClient(await createServerSupabaseClient());
  return client.rpc(name, args);
}

export async function getCapabilityVerificationWorkspace() {
  const result = await runCapabilityVerificationRpc(
    "get_stage18_capability_verification_workspace",
  );
  if (result.error || !result.data || typeof result.data !== "object") {
    return emptyWorkspace();
  }
  const value = result.data as Partial<CapabilityVerificationWorkspace>;
  return {
    eligibleEvidence: Array.isArray(value.eligibleEvidence)
      ? value.eligibleEvidence
      : [],
    verifiedCapabilities: Array.isArray(value.verifiedCapabilities)
      ? value.verifiedCapabilities
      : [],
    outgoing: Array.isArray(value.outgoing) ? value.outgoing : [],
    incoming: Array.isArray(value.incoming) ? value.incoming : [],
  };
}
