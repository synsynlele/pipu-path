import "server-only";

import { randomUUID } from "node:crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { getStage4DiscoveryHandoff } from "@/modules/discovery/infrastructure/discovery-dal";
import { normalizeCompletedDiscoveryHandoff } from "./evidence-normalization";

export type HpiApplicationResult<T> =
  { ok: true; value: T } | { ok: false; code: string; message: string };

const safeMessages: Record<string, string> = {
  HPI_DISCOVERY_INCOMPLETE:
    "Complete Discovery before preparing interpretation.",
  HPI_CONSENT_REQUIRED: "Human Potential interpretation requires your consent.",
  HPI_SAFEGUARDING_RESTRICTION:
    "Interpretation is not available for this account at the moment.",
  HPI_REQUEST_ALREADY_EXISTS:
    "An interpretation request is already being prepared.",
};

function safeError(
  error: { message: string } | null,
): HpiApplicationResult<never> {
  const code =
    error?.message.match(/HPI_[A-Z_]+/)?.[0] ??
    "HPI_INTERPRETATION_NOT_ALLOWED";
  return {
    ok: false,
    code,
    message: safeMessages[code] ?? "Interpretation could not be prepared.",
  };
}

export async function normalizeCurrentDiscoveryEvidence(): Promise<
  HpiApplicationResult<{ normalizedCount: number; localEvidenceCount: number }>
> {
  const { user } = await requireAuthenticatedIdentity();
  const handoff = await getStage4DiscoveryHandoff();
  if (!handoff) return safeError({ message: "HPI_DISCOVERY_INCOMPLETE" });

  // This pure projection is deliberately retained for contract verification; the
  // controlled RPC remains the only persistent write path.
  const localEvidence = normalizeCompletedDiscoveryHandoff(user.id, handoff);
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc(
    "normalize_stage4_discovery_evidence",
  );
  if (error) return safeError(error);
  return {
    ok: true,
    value: { normalizedCount: data, localEvidenceCount: localEvidence.length },
  };
}

export async function createCurrentInterpretationRequest({\n  schemaVersion = "hpi-output-v1",\n  promptVersion = "placeholder-v1",\n}: {\n  schemaVersion?: string;\n  promptVersion?: string;\n} = {}): Promise<
  HpiApplicationResult<{ requestId: string }>
> {
  const normalized = await normalizeCurrentDiscoveryEvidence();
  if (!normalized.ok) return normalized;
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc(
    "create_stage4_interpretation_request",
    {
      idempotency_key_input: randomUUID(),
      interpretation_schema_version_input: schemaVersion,
      prompt_version_input: promptVersion,
    },
  );
  if (error) return safeError(error);
  return { ok: true, value: { requestId: data } };
}
