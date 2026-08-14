import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readPublicEnvironment } from "@/lib/config/env";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import {
  aggregateSchema,
  KHPOS_CONTRACT_VERSION,
  suppressedAggregate,
  type CohortAggregate,
  type KhposSignalPayload,
} from "../domain/contract";

const KHPOS_RECEIVER_URL =
  process.env.KHPOS_INTEGRATION_RECEIVER_URL ??
  "https://www.kshc.name.ng/api/khpos/integrations/pipupath/receive";

export class KhposBridgeError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "KhposBridgeError";
  }
}

function service(): SupabaseClient {
  return createServiceRoleSupabaseClient() as unknown as SupabaseClient;
}

function ninetyDayWindow() {
  const end = new Date();
  const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
  return { start, end };
}

function signal(externalCohortId: string, aggregate: CohortAggregate): KhposSignalPayload {
  const { start, end } = ninetyDayWindow();
  return {
    contractVersion: KHPOS_CONTRACT_VERSION,
    externalCohortId,
    sourceGeneratedAt: end.toISOString(),
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    ...aggregate,
  };
}

async function postReceiver(body: Record<string, unknown>) {
  let response: Response;
  try {
    response = await fetch(KHPOS_RECEIVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new KhposBridgeError("KHP-OS could not be reached. No institutional connection was created.", 502);
  }
  const result = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    organisationId?: string;
  };
  if (!response.ok || !result.ok) {
    throw new KhposBridgeError(result.error ?? "KHP-OS rejected the institutional connection.", response.status || 502);
  }
  return result;
}

export async function bootstrapKhposSchoolCohort(input: {
  pairingToken: string;
  organisationName: string;
}) {
  const cohortId = randomUUID();
  const joinToken = randomBytes(32).toString("hex");
  const appUrl = readPublicEnvironment().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const invitationUrl = `${appUrl}/integrations/khpos#code=${encodeURIComponent(joinToken)}`;

  const response = await postReceiver({
    action: "pair",
    pairingToken: input.pairingToken,
    cohortName: input.organisationName,
    invitationUrl,
    signal: signal(cohortId, suppressedAggregate()),
  });
  const organisationId = response.organisationId ?? "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organisationId)) {
    throw new KhposBridgeError("KHP-OS returned an invalid organisation binding.", 502);
  }

  const client = service();
  const { error } = await client.from("khpos_school_cohorts").insert({
    id: cohortId,
    khpos_organisation_id: organisationId,
    organisation_name: input.organisationName,
    join_token_hash: await sha256(joinToken),
    contract_version: KHPOS_CONTRACT_VERSION,
    reporting_minimum: 5,
    status: "active",
  });
  if (error) {
    throw new KhposBridgeError("The PipuPath school cohort could not be persisted. Reconnect from KHP-OS to retry safely.", 500);
  }
  return { cohortId };
}

async function sha256(value: string) {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(value).digest("hex");
}

function mapAggregate(row: Record<string, unknown>): CohortAggregate {
  return aggregateSchema.parse({
    reportingEligible: row.reporting_eligible,
    cohortMemberCount: row.cohort_member_count,
    activeProfileCount: row.active_profile_count,
    pathSelectedCount: row.path_selected_count,
    questParticipantCount: row.quest_participant_count,
    evidenceBackedQuestParticipantCount: row.evidence_backed_quest_participant_count,
    projectParticipantCount: row.project_participant_count,
    projectCompletionParticipantCount: row.project_completion_participant_count,
    continuationEligibleCount: row.continuation_eligible_count,
    continuingCycleParticipantCount: row.continuing_cycle_participant_count,
  });
}

export async function syncKhposSchoolCohort(input: {
  externalCohortId: string;
  syncToken: string;
}) {
  const client = service();
  const { data: cohort, error: cohortError } = await client
    .from("khpos_school_cohorts")
    .select("id,status")
    .eq("id", input.externalCohortId)
    .eq("status", "active")
    .maybeSingle();
  if (cohortError || !cohort) throw new KhposBridgeError("PipuPath school cohort was not found.", 404);

  const { start, end } = ninetyDayWindow();
  const { data, error } = await client.rpc("get_stage13_khpos_cohort_aggregate_server", {
    cohort_id_input: input.externalCohortId,
    window_start_input: start.toISOString(),
    window_end_input: end.toISOString(),
  });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row || typeof row !== "object") {
    throw new KhposBridgeError("PipuPath could not calculate the privacy-safe cohort aggregate.", 500);
  }
  const aggregate = mapAggregate(row as Record<string, unknown>);
  const payload: KhposSignalPayload = {
    contractVersion: KHPOS_CONTRACT_VERSION,
    externalCohortId: input.externalCohortId,
    sourceGeneratedAt: end.toISOString(),
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    ...aggregate,
  };
  await postReceiver({ action: "sync", syncToken: input.syncToken, signal: payload });
  await client.from("khpos_school_cohorts").update({ last_synced_at: new Date().toISOString() }).eq("id", input.externalCohortId);
  return aggregate;
}
