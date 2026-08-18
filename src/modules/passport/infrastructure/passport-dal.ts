import "server-only";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import {
  builderPassportIssueSchema,
  builderPassportShareCreateSchema,
  builderPassportStatusSchema,
  builderPassportTimestampSchema,
  publicBuilderPassportSchema,
  type BuilderPassportIssueInput,
  type PublicBuilderPassport,
} from "../domain/passport-contract";
import {
  generatePassportShareSecret,
  hashPassportShareSecret,
} from "./passport-security";

type RpcError = { message?: string; code?: string } | null;
type RpcResult = { data: unknown; error: RpcError };
type UntypedRpcClient = {
  rpc(name: string, args?: Record<string, unknown>): Promise<RpcResult>;
};

const nullableTrimmedText = z.string().nullable();

const passportWorkspaceSchema = z.object({
  adultEligible: z.boolean(),
  profile: z.object({
    displayName: nullableTrimmedText,
  }),
  activeProfileVersionId: z.uuid().nullable(),
  eligibleCapabilities: z.array(
    z.object({
      claimId: z.uuid(),
      capabilityKey: z.string(),
      capabilityLabel: z.string(),
      capabilityLevel: z.string(),
    }),
  ),
  eligibleEvidence: z.array(
    z.object({
      evidenceId: z.uuid(),
      claimId: z.uuid(),
      capabilityKey: z.string(),
      sourceType: z.string(),
      sourceTitle: z.string(),
      evidenceSummary: z.string(),
      verification: z.string(),
      occurredAt: builderPassportTimestampSchema,
    }),
  ),
  eligibleInstitutionVerifications: z.array(
    z.object({
      verificationId: z.uuid(),
      claimId: z.uuid(),
      capabilityKey: z.string(),
      capabilityLabel: z.string(),
      institutionName: z.string(),
      confirmedAt: builderPassportTimestampSchema,
    }),
  ),
  eligiblePortfolioProofs: z.array(
    z.object({
      portfolioId: z.uuid(),
      slug: z.string(),
      publicTitle: z.string(),
      publicSummary: z.string(),
      proofHref: z.string().regex(/^\/proof\//),
      publishedAt: builderPassportTimestampSchema,
    }),
  ),
  passports: z.array(
    z.object({
      id: z.uuid(),
      version: z.number().int().positive(),
      status: builderPassportStatusSchema,
      displayName: z.string(),
      publicSummary: z.string().nullable(),
      selectedPathName: z.string().nullable(),
      issuedAt: builderPassportTimestampSchema,
      supersededAt: builderPassportTimestampSchema.nullable(),
      revokedAt: builderPassportTimestampSchema.nullable(),
    }),
  ),
  shares: z.array(
    z.object({
      id: z.uuid(),
      passportId: z.uuid(),
      label: z.string().nullable(),
      expiresAt: builderPassportTimestampSchema,
      lastAccessedAt: builderPassportTimestampSchema.nullable(),
      accessCount: z.number().int().nonnegative(),
      revokedAt: builderPassportTimestampSchema.nullable(),
      createdAt: builderPassportTimestampSchema,
    }),
  ),
});

type BuilderPassportWorkspaceRaw = z.infer<typeof passportWorkspaceSchema>;
export type BuilderPassportWorkspace = Omit<
  BuilderPassportWorkspaceRaw,
  "shares"
> & {
  shares: Array<
    BuilderPassportWorkspaceRaw["shares"][number] & { active: boolean }
  >;
};

function asRpcClient(client: unknown) {
  return client as UntypedRpcClient;
}

function throwRpcError(error: RpcError, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

export async function getBuilderPassportWorkspace(): Promise<BuilderPassportWorkspace> {
  const client = asRpcClient(await createServerSupabaseClient());
  const result = await client.rpc("get_stage21_builder_passport_workspace");
  if (result.error) {
    throwRpcError(result.error, "PASSPORT_WORKSPACE_UNAVAILABLE");
  }
  const parsed = passportWorkspaceSchema.safeParse(result.data);
  if (!parsed.success) throw new Error("PASSPORT_WORKSPACE_INVALID");

  const currentTime = Date.now();
  return {
    ...parsed.data,
    shares: parsed.data.shares.map((share) => ({
      ...share,
      active:
        share.revokedAt === null &&
        new Date(share.expiresAt).getTime() > currentTime,
    })),
  };
}

export async function issueBuilderPassport(input: BuilderPassportIssueInput) {
  const parsed = builderPassportIssueSchema.parse(input);
  const client = asRpcClient(await createServerSupabaseClient());
  const result = await client.rpc("issue_stage21_builder_passport", {
    public_summary_input: parsed.publicSummary,
    selected_path_name_input: parsed.selectedPathName,
    claim_ids_input: parsed.claimIds,
    evidence_ids_input: parsed.evidenceIds,
    institution_verification_ids_input: parsed.institutionVerificationIds,
    portfolio_ids_input: parsed.portfolioIds,
    consent_policy_version_input: parsed.consentPolicyVersion,
  });
  if (result.error || typeof result.data !== "string") {
    throwRpcError(result.error, "PASSPORT_ISSUE_FAILED");
  }
  return result.data;
}

export async function revokeBuilderPassport(passportId: string) {
  const client = asRpcClient(await createServerSupabaseClient());
  const result = await client.rpc("revoke_stage21_builder_passport", {
    passport_id_input: z.uuid().parse(passportId),
  });
  if (result.error) throwRpcError(result.error, "PASSPORT_REVOKE_FAILED");
}

export async function createBuilderPassportShare(input: {
  passportId: string;
  label: string;
  expiresInDays: 1 | 7 | 30 | 90;
}) {
  const parsed = builderPassportShareCreateSchema.parse(input);
  const secret = generatePassportShareSecret();
  const secretHash = hashPassportShareSecret(secret);
  const client = asRpcClient(await createServerSupabaseClient());
  const result = await client.rpc("create_stage21_passport_share", {
    passport_id_input: parsed.passportId,
    secret_hash_input: secretHash,
    label_input: parsed.label,
    expires_in_days_input: parsed.expiresInDays,
  });
  if (result.error || typeof result.data !== "string") {
    throwRpcError(result.error, "PASSPORT_SHARE_CREATE_FAILED");
  }
  const shareId = z.uuid().parse(result.data);
  return {
    shareId,
    secret,
    relativeUrl: `/passport/share/${shareId}#${secret}`,
  };
}

export async function revokeBuilderPassportShare(shareId: string) {
  const client = asRpcClient(await createServerSupabaseClient());
  const result = await client.rpc("revoke_stage21_passport_share", {
    share_id_input: z.uuid().parse(shareId),
  });
  if (result.error) throwRpcError(result.error, "PASSPORT_SHARE_REVOKE_FAILED");
}

export async function consumePassportShareRateLimit(keyHash: string) {
  const client = asRpcClient(createServiceRoleSupabaseClient());
  const result = await client.rpc("consume_stage21_passport_rate_limit", {
    key_hash_input: keyHash,
    limit_input: 30,
    window_seconds_input: 60,
  });
  if (result.error) return false;
  return result.data === true;
}

export async function resolveBuilderPassportShare(
  shareId: string,
  secretHash: string,
): Promise<PublicBuilderPassport | null> {
  const client = asRpcClient(createServiceRoleSupabaseClient());
  const result = await client.rpc("resolve_stage21_passport_share", {
    share_id_input: z.uuid().parse(shareId),
    secret_hash_input: secretHash,
  });
  if (result.error || result.data === null) return null;
  const parsed = publicBuilderPassportSchema.safeParse(result.data);
  return parsed.success ? parsed.data : null;
}
