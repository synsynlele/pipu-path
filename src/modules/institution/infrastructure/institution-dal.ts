import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  InstitutionRole,
  InstitutionVerificationStatus,
} from "../domain/institution-contract";

type QueryError = { message?: string } | null;
type RpcResult = { data: unknown; error: QueryError };
type UntypedClient = {
  rpc(name: string, args?: Record<string, unknown>): Promise<RpcResult>;
};

function asUntypedClient(client: unknown) {
  return client as UntypedClient;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : null;
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function role(value: unknown): InstitutionRole | null {
  return ["owner", "verifier", "analyst"].includes(String(value))
    ? (value as InstitutionRole)
    : null;
}

function verificationStatus(value: unknown): InstitutionVerificationStatus {
  return ["pending", "confirmed", "declined", "withdrawn", "revoked"].includes(
    String(value),
  )
    ? (value as InstitutionVerificationStatus)
    : "pending";
}

export type InstitutionWorkspaceChoice = {
  workspaceId: string;
  organisationName: string;
  role: InstitutionRole;
};

export type InstitutionAggregate = {
  reportingEligible: boolean;
  cohortMemberCount: number;
  activeProfileCount: number;
  pathSelectedCount: number;
  questParticipantCount: number;
  evidenceBackedQuestParticipantCount: number;
  projectParticipantCount: number;
  projectCompletionParticipantCount: number;
  continuationEligibleCount: number;
  continuingCycleParticipantCount: number;
};

export type InstitutionVerificationQueueItem = {
  id: string;
  builderDisplayName: string | null;
  builderUsername: string | null;
  capabilityKey: string;
  capabilityLabel: string;
  capabilityLevel: string;
  sourceTitle: string;
  sourceSummary: string;
  sourceType: string;
  sourceOccurredAt: string;
  status: InstitutionVerificationStatus;
  requestNote: string | null;
  responseNote: string | null;
  requestedAt: string;
  respondedAt: string | null;
  verifierDisplayName: string | null;
  actionable: boolean;
};

export type InstitutionWorkspaceDetail = {
  workspaceId: string;
  organisationName: string;
  role: InstitutionRole;
  reportingMinimum: number;
  windowDays: number;
  analyticsAllowed: boolean;
  verificationAllowed: boolean;
  aggregate: InstitutionAggregate | null;
  verificationQueue: InstitutionVerificationQueueItem[];
};

export type InstitutionWorkspaceState =
  | { access: "unauthenticated" }
  | { access: "forbidden" }
  | {
      access: "granted";
      choices: InstitutionWorkspaceChoice[];
      selected: InstitutionWorkspaceDetail;
    };

export type InstitutionEligibleEvidence = {
  claimId: string;
  evidenceId: string;
  capabilityKey: string;
  capabilityLabel: string;
  capabilityLevel: string;
  sourceTitle: string;
  sourceSummary: string;
  sourceType: string;
  sourceOccurredAt: string;
};

export type BuilderInstitutionVerificationHistory = {
  id: string;
  workspaceId: string;
  organisationName: string;
  capabilityKey: string;
  capabilityLabel: string;
  capabilityLevel: string;
  sourceTitle: string;
  sourceSummary: string;
  sourceType: string;
  status: InstitutionVerificationStatus;
  requestNote: string | null;
  responseNote: string | null;
  requestedAt: string;
  respondedAt: string | null;
  verifierDisplayName: string | null;
};

export type BuilderInstitutionVerificationWorkspace = {
  connected: boolean;
  workspaceId: string | null;
  organisationName: string | null;
  consentPolicyVersion: string | null;
  eligibleEvidence: InstitutionEligibleEvidence[];
  history: BuilderInstitutionVerificationHistory[];
};

function parseChoices(value: unknown): InstitutionWorkspaceChoice[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = object(item);
    const workspaceId = text(row.workspace_id);
    const organisationName = text(row.organisation_name);
    const memberRole = role(row.role);
    return workspaceId && organisationName && memberRole
      ? [{ workspaceId, organisationName, role: memberRole }]
      : [];
  });
}

function parseAggregate(value: unknown): InstitutionAggregate | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = object(value);
  return {
    reportingEligible: row.reportingEligible === true,
    cohortMemberCount: number(row.cohortMemberCount),
    activeProfileCount: number(row.activeProfileCount),
    pathSelectedCount: number(row.pathSelectedCount),
    questParticipantCount: number(row.questParticipantCount),
    evidenceBackedQuestParticipantCount: number(
      row.evidenceBackedQuestParticipantCount,
    ),
    projectParticipantCount: number(row.projectParticipantCount),
    projectCompletionParticipantCount: number(
      row.projectCompletionParticipantCount,
    ),
    continuationEligibleCount: number(row.continuationEligibleCount),
    continuingCycleParticipantCount: number(
      row.continuingCycleParticipantCount,
    ),
  };
}

function parseQueue(value: unknown): InstitutionVerificationQueueItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = object(item);
    const id = text(row.id);
    const capabilityKey = text(row.capabilityKey);
    const capabilityLabel = text(row.capabilityLabel);
    const capabilityLevel = text(row.capabilityLevel);
    const sourceTitle = text(row.sourceTitle);
    const sourceSummary = text(row.sourceSummary);
    const sourceType = text(row.sourceType);
    const sourceOccurredAt = text(row.sourceOccurredAt);
    const requestedAt = text(row.requestedAt);
    if (
      !id ||
      !capabilityKey ||
      !capabilityLabel ||
      !capabilityLevel ||
      !sourceTitle ||
      !sourceSummary ||
      !sourceType ||
      !sourceOccurredAt ||
      !requestedAt
    ) {
      return [];
    }
    return [
      {
        id,
        builderDisplayName: text(row.builderDisplayName),
        builderUsername: text(row.builderUsername),
        capabilityKey,
        capabilityLabel,
        capabilityLevel,
        sourceTitle,
        sourceSummary,
        sourceType,
        sourceOccurredAt,
        status: verificationStatus(row.status),
        requestNote: text(row.requestNote),
        responseNote: text(row.responseNote),
        requestedAt,
        respondedAt: text(row.respondedAt),
        verifierDisplayName: text(row.verifierDisplayName),
        actionable: row.actionable === true,
      },
    ];
  });
}

function parseWorkspaceDetail(value: unknown): InstitutionWorkspaceDetail | null {
  const row = object(value);
  const workspaceId = text(row.workspaceId);
  const organisationName = text(row.organisationName);
  const memberRole = role(row.role);
  if (!workspaceId || !organisationName || !memberRole) return null;
  return {
    workspaceId,
    organisationName,
    role: memberRole,
    reportingMinimum: number(row.reportingMinimum),
    windowDays: number(row.windowDays) || 90,
    analyticsAllowed: row.analyticsAllowed === true,
    verificationAllowed: row.verificationAllowed === true,
    aggregate: parseAggregate(row.aggregate),
    verificationQueue: parseQueue(row.verificationQueue),
  };
}

function parseBuilderWorkspace(
  value: unknown,
): BuilderInstitutionVerificationWorkspace {
  const row = object(value);
  const eligibleEvidence = Array.isArray(row.eligibleEvidence)
    ? row.eligibleEvidence.flatMap((item) => {
        const evidence = object(item);
        const claimId = text(evidence.claimId);
        const evidenceId = text(evidence.evidenceId);
        const capabilityKey = text(evidence.capabilityKey);
        const capabilityLabel = text(evidence.capabilityLabel);
        const capabilityLevel = text(evidence.capabilityLevel);
        const sourceTitle = text(evidence.sourceTitle);
        const sourceSummary = text(evidence.sourceSummary);
        const sourceType = text(evidence.sourceType);
        const sourceOccurredAt = text(evidence.sourceOccurredAt);
        if (
          !claimId ||
          !evidenceId ||
          !capabilityKey ||
          !capabilityLabel ||
          !capabilityLevel ||
          !sourceTitle ||
          !sourceSummary ||
          !sourceType ||
          !sourceOccurredAt
        ) {
          return [];
        }
        return [
          {
            claimId,
            evidenceId,
            capabilityKey,
            capabilityLabel,
            capabilityLevel,
            sourceTitle,
            sourceSummary,
            sourceType,
            sourceOccurredAt,
          },
        ];
      })
    : [];

  const history = Array.isArray(row.history)
    ? row.history.flatMap((item) => {
        const entry = object(item);
        const id = text(entry.id);
        const workspaceId = text(entry.workspaceId);
        const organisationName = text(entry.organisationName);
        const capabilityKey = text(entry.capabilityKey);
        const capabilityLabel = text(entry.capabilityLabel);
        const capabilityLevel = text(entry.capabilityLevel);
        const sourceTitle = text(entry.sourceTitle);
        const sourceSummary = text(entry.sourceSummary);
        const sourceType = text(entry.sourceType);
        const requestedAt = text(entry.requestedAt);
        if (
          !id ||
          !workspaceId ||
          !organisationName ||
          !capabilityKey ||
          !capabilityLabel ||
          !capabilityLevel ||
          !sourceTitle ||
          !sourceSummary ||
          !sourceType ||
          !requestedAt
        ) {
          return [];
        }
        return [
          {
            id,
            workspaceId,
            organisationName,
            capabilityKey,
            capabilityLabel,
            capabilityLevel,
            sourceTitle,
            sourceSummary,
            sourceType,
            status: verificationStatus(entry.status),
            requestNote: text(entry.requestNote),
            responseNote: text(entry.responseNote),
            requestedAt,
            respondedAt: text(entry.respondedAt),
            verifierDisplayName: text(entry.verifierDisplayName),
          },
        ];
      })
    : [];

  return {
    connected: row.connected === true,
    workspaceId: text(row.workspaceId),
    organisationName: text(row.organisationName),
    consentPolicyVersion: text(row.consentPolicyVersion),
    eligibleEvidence,
    history,
  };
}

export async function runInstitutionRpc(
  name: string,
  args: Record<string, unknown> = {},
) {
  const client = asUntypedClient(await createServerSupabaseClient());
  return client.rpc(name, args);
}

export async function getInstitutionWorkspaceState(
  requestedWorkspaceId?: string,
  windowDays = 90,
): Promise<InstitutionWorkspaceState> {
  const server = await createServerSupabaseClient();
  const {
    data: { user },
  } = await server.auth.getUser();
  if (!user) return { access: "unauthenticated" };

  const client = asUntypedClient(server);
  const listResult = await client.rpc("list_stage19_institution_workspaces");
  if (listResult.error) throw new Error("INSTITUTION_WORKSPACE_LOAD_FAILED");
  const choices = parseChoices(listResult.data);
  if (!choices.length) return { access: "forbidden" };

  const choice =
    choices.find((item) => item.workspaceId === requestedWorkspaceId) ?? choices[0];
  const detailResult = await client.rpc("get_stage19_institution_workspace", {
    workspace_id_input: choice.workspaceId,
    window_days_input: Math.min(Math.max(Math.trunc(windowDays), 1), 180),
  });
  if (detailResult.error) throw new Error("INSTITUTION_WORKSPACE_LOAD_FAILED");
  const selected = parseWorkspaceDetail(detailResult.data);
  if (!selected) throw new Error("INSTITUTION_WORKSPACE_LOAD_FAILED");

  return { access: "granted", choices, selected };
}

export async function getBuilderInstitutionVerificationWorkspace() {
  const result = await runInstitutionRpc(
    "get_stage19_builder_institution_verification_workspace",
  );
  if (result.error) {
    return parseBuilderWorkspace(null);
  }
  return parseBuilderWorkspace(result.data);
}
