import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  marketplaceApplicationSchema,
  opportunityApplicationStatusSchema,
  marketplaceCatalogSchema,
  marketplaceCapabilitySelectionSchema,
  marketplaceEvidenceSelectionSchema,
  marketplaceInstitutionVerificationSelectionSchema,
  marketplacePortfolioProofSelectionSchema,
  opportunityProviderRoleSchema,
  opportunityProviderStatusSchema,
  opportunityProviderWorkspaceSchema,
  type MarketplaceApplication,
  type MarketplaceApplicationDraftInput,
  type MarketplaceApplicationStatus,
  type OpportunityProviderInput,
  type OpportunityProviderRole,
  type OpportunityProviderStatus,
} from "../domain/marketplace-contract";
import type { OpportunityAdminInput } from "../domain/opportunity-contract";

type RpcError = { message?: string; code?: string } | null;
type RpcResult = { data: unknown; error: RpcError };
type UntypedRpcClient = {
  rpc(name: string, args?: Record<string, unknown>): Promise<RpcResult>;
};

function asRpcClient(client: unknown) {
  return client as UntypedRpcClient;
}

async function marketplaceRpc() {
  return asRpcClient(await createServerSupabaseClient());
}

function throwRpcError(error: RpcError, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : null;
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export async function getMarketplaceCatalog() {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("get_stage20_marketplace_catalog");
  if (result.error) {
    throwRpcError(result.error, "MARKETPLACE_CATALOG_UNAVAILABLE");
  }
  const parsed = marketplaceCatalogSchema.safeParse(result.data);
  if (!parsed.success) throw new Error("MARKETPLACE_CATALOG_INVALID");
  return parsed.data;
}

export type BuilderApplicationWorkspace = {
  canEdit: boolean;
  opportunity: {
    id: string;
    title: string;
    providerId: string;
    providerName: string;
    category: string;
    summary: string;
    eligibilitySummary: string;
    benefitSummary: string;
    deadlineDate: string | null;
  };
  provider: {
    id: string;
    organisationName: string;
    organisationType: string;
    officialWebsite: string;
    officialDomain: string;
    countryCode: string;
    publicDescription: string;
    status: OpportunityProviderStatus;
  };
  application: null | {
    id: string;
    status: MarketplaceApplicationStatus;
    displayName: string;
    builderSummary: string | null;
    selectedPathName: string | null;
    applicationNote: string | null;
    consentPolicyVersion: string | null;
    submittedAt: string | null;
    viewedAt: string | null;
    decidedAt: string | null;
    withdrawnAt: string | null;
    selectedClaimIds: string[];
    selectedEvidenceIds: string[];
    selectedInstitutionVerificationIds: string[];
    selectedPortfolioIds: string[];
  };
  eligibleCapabilities: Array<{
    claimId: string;
    capabilityKey: string;
    capabilityLabel: string;
    capabilityLevel: string;
  }>;
  eligibleEvidence: Array<{
    evidenceId: string;
    claimId: string;
    sourceType: string;
    sourceTitle: string;
    evidenceSummary: string;
    sourceHref: string;
  }>;
  eligibleInstitutionVerifications: Array<{
    verificationId: string;
    capabilityKey: string;
    capabilityLabel: string;
    institutionName: string;
    confirmedAt: string;
  }>;
  eligiblePortfolioProofs: Array<{
    portfolioId: string;
    slug: string;
    publicTitle: string;
    publicSummary: string;
    proofHref: string;
  }>;
};

function parseBuilderApplicationWorkspace(
  value: unknown,
): BuilderApplicationWorkspace {
  const row = object(value);
  const opportunity = object(row.opportunity);
  const provider = object(row.provider);
  const providerStatus = opportunityProviderStatusSchema.safeParse(
    provider.status,
  );
  if (typeof row.canEdit !== "boolean") {
    throw new Error("MARKETPLACE_APPLICATION_WORKSPACE_INVALID");
  }
  const canEdit = row.canEdit;

  const opportunityId = text(opportunity.id);
  const title = text(opportunity.title);
  const providerId = text(opportunity.providerId);
  const providerName = text(opportunity.providerName);
  const category = text(opportunity.category);
  const summary = text(opportunity.summary);
  const eligibilitySummary = text(opportunity.eligibilitySummary);
  const benefitSummary = text(opportunity.benefitSummary);
  const providerOrganisationName = text(provider.organisationName);
  const providerOrganisationType = text(provider.organisationType);
  const providerWebsite = text(provider.officialWebsite);
  const providerDomain = text(provider.officialDomain);
  const providerCountryCode = text(provider.countryCode);
  const providerDescription = text(provider.publicDescription);

  if (
    !opportunityId ||
    !title ||
    !providerId ||
    !providerName ||
    !category ||
    !summary ||
    !eligibilitySummary ||
    !benefitSummary ||
    !providerOrganisationName ||
    !providerOrganisationType ||
    !providerWebsite ||
    !providerDomain ||
    !providerCountryCode ||
    !providerDescription ||
    !providerStatus.success
  ) {
    throw new Error("MARKETPLACE_APPLICATION_WORKSPACE_INVALID");
  }

  const applicationRow = object(row.application);
  const applicationId = text(applicationRow.id);
  const applicationStatus = opportunityApplicationStatusSchema.safeParse(
    applicationRow.status,
  );
  const application =
    applicationId && applicationStatus.success
      ? {
          id: applicationId,
          status: applicationStatus.data,
          displayName: text(applicationRow.displayName) ?? "Builder",
          builderSummary: text(applicationRow.builderSummary),
          selectedPathName: text(applicationRow.selectedPathName),
          applicationNote: text(applicationRow.applicationNote),
          consentPolicyVersion: text(applicationRow.consentPolicyVersion),
          submittedAt: text(applicationRow.submittedAt),
          viewedAt: text(applicationRow.viewedAt),
          decidedAt: text(applicationRow.decidedAt),
          withdrawnAt: text(applicationRow.withdrawnAt),
          selectedClaimIds: stringArray(applicationRow.selectedClaimIds),
          selectedEvidenceIds: stringArray(applicationRow.selectedEvidenceIds),
          selectedInstitutionVerificationIds: stringArray(
            applicationRow.selectedInstitutionVerificationIds,
          ),
          selectedPortfolioIds: stringArray(
            applicationRow.selectedPortfolioIds,
          ),
        }
      : null;

  const eligibleCapabilities = Array.isArray(row.eligibleCapabilities)
    ? row.eligibleCapabilities.flatMap((item) => {
        const parsed = marketplaceCapabilitySelectionSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];
  const eligibleEvidence = Array.isArray(row.eligibleEvidence)
    ? row.eligibleEvidence.flatMap((item) => {
        const parsed = marketplaceEvidenceSelectionSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];
  const eligibleInstitutionVerifications = Array.isArray(
    row.eligibleInstitutionVerifications,
  )
    ? row.eligibleInstitutionVerifications.flatMap((item) => {
        const parsed =
          marketplaceInstitutionVerificationSelectionSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];
  const eligiblePortfolioProofs = Array.isArray(row.eligiblePortfolioProofs)
    ? row.eligiblePortfolioProofs.flatMap((item) => {
        const parsed = marketplacePortfolioProofSelectionSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];

  return {
    canEdit,
    opportunity: {
      id: opportunityId,
      title,
      providerId,
      providerName,
      category,
      summary,
      eligibilitySummary,
      benefitSummary,
      deadlineDate: text(opportunity.deadlineDate),
    },
    provider: {
      id: providerId,
      organisationName: providerOrganisationName,
      organisationType: providerOrganisationType,
      officialWebsite: providerWebsite,
      officialDomain: providerDomain,
      countryCode: providerCountryCode,
      publicDescription: providerDescription,
      status: providerStatus.data,
    },
    application,
    eligibleCapabilities,
    eligibleEvidence,
    eligibleInstitutionVerifications,
    eligiblePortfolioProofs,
  };
}

export async function getBuilderApplicationWorkspace(opportunityId: string) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("get_stage20_builder_application_workspace", {
    opportunity_id_input: opportunityId,
  });
  if (result.error) {
    throwRpcError(
      result.error,
      "MARKETPLACE_APPLICATION_WORKSPACE_UNAVAILABLE",
    );
  }
  return parseBuilderApplicationWorkspace(result.data);
}

export async function saveMarketplaceApplicationDraft(
  input: MarketplaceApplicationDraftInput,
) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("save_stage20_opportunity_application_draft", {
    opportunity_id_input: input.opportunityId,
    builder_summary_input: input.builderSummary,
    selected_path_name_input: input.selectedPathName,
    application_note_input: input.applicationNote,
    claim_ids_input: input.claimIds,
    evidence_ids_input: input.evidenceIds,
    institution_verification_ids_input: input.institutionVerificationIds,
    portfolio_ids_input: input.portfolioIds,
  });
  if (result.error || typeof result.data !== "string") {
    throwRpcError(result.error, "MARKETPLACE_APPLICATION_SAVE_FAILED");
  }
  return result.data;
}

export async function submitMarketplaceApplication(applicationId: string) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("submit_stage20_opportunity_application", {
    application_id_input: applicationId,
    consent_policy_version_input: "opportunity-marketplace-application-v1",
  });
  if (result.error) {
    throwRpcError(result.error, "MARKETPLACE_APPLICATION_SUBMIT_FAILED");
  }
}

export async function withdrawMarketplaceApplication(applicationId: string) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("withdraw_stage20_opportunity_application", {
    application_id_input: applicationId,
  });
  if (result.error) {
    throwRpcError(result.error, "MARKETPLACE_APPLICATION_WITHDRAW_FAILED");
  }
}

export async function getProviderWorkspace(providerId: string) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("get_stage20_provider_workspace", {
    provider_id_input: providerId,
  });
  if (result.error) {
    throwRpcError(result.error, "OPPORTUNITY_PROVIDER_WORKSPACE_UNAVAILABLE");
  }
  const parsed = opportunityProviderWorkspaceSchema.safeParse(result.data);
  if (!parsed.success)
    throw new Error("OPPORTUNITY_PROVIDER_WORKSPACE_INVALID");
  return parsed.data;
}

export async function saveProviderOpportunity(
  providerId: string,
  input: OpportunityAdminInput,
) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("upsert_stage20_provider_opportunity", {
    provider_id_input: providerId,
    opportunity_id_input: input.id,
    title_input: input.title,
    category_input: input.category,
    summary_input: input.summary,
    eligibility_summary_input: input.eligibilitySummary,
    benefit_summary_input: input.benefitSummary,
    min_age_input: input.minAge,
    max_age_input: input.maxAge,
    geography_scope_input: input.geographyScope,
    country_codes_input: input.countryCodes,
    geography_label_input: input.geographyLabel,
    delivery_mode_input: input.deliveryMode,
    pathway_tags_input: input.pathwayTags,
    capability_tags_input: input.capabilityTags,
    official_url_input: input.officialUrl,
    deadline_date_input: input.deadlineDate,
  });
  if (result.error || typeof result.data !== "string") {
    throwRpcError(result.error, "PROVIDER_OPPORTUNITY_SAVE_FAILED");
  }
  return result.data;
}

function parseSharedApplication(value: unknown): MarketplaceApplication | null {
  const row = object(value);
  const packet = {
    displayName: row.displayName,
    builderSummary: row.builderSummary ?? null,
    selectedPathName: row.selectedPathName ?? null,
    applicationNote: row.applicationNote ?? null,
    capabilities: row.capabilities ?? [],
    evidence: row.evidence ?? [],
    institutionVerifications: row.institutionVerifications ?? [],
    portfolioProofs: row.portfolioProofs ?? [],
  };
  const parsed = marketplaceApplicationSchema.safeParse({
    id: row.id,
    opportunityId: row.opportunityId,
    providerId: row.providerId,
    status: row.status,
    packet,
    submittedAt: row.submittedAt ?? null,
    viewedAt: row.viewedAt ?? null,
    decidedAt: row.decidedAt ?? null,
    withdrawnAt: row.withdrawnAt ?? null,
  });
  return parsed.success ? parsed.data : null;
}

export async function getProviderApplications(providerId: string) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("get_stage20_provider_applications", {
    provider_id_input: providerId,
  });
  if (result.error) {
    throwRpcError(result.error, "PROVIDER_APPLICATION_QUEUE_UNAVAILABLE");
  }
  const row = object(result.data);
  const role = opportunityProviderRoleSchema.safeParse(row.role);
  if (!role.success) throw new Error("PROVIDER_APPLICATION_QUEUE_INVALID");
  const applications = Array.isArray(row.applications)
    ? row.applications.flatMap((item) => {
        const parsed = parseSharedApplication(item);
        return parsed ? [parsed] : [];
      })
    : [];
  return { providerId, role: role.data, applications };
}

export async function transitionProviderApplication(
  applicationId: string,
  status: MarketplaceApplicationStatus,
) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("transition_stage20_provider_application", {
    application_id_input: applicationId,
    status_input: status,
  });
  if (result.error) {
    throwRpcError(result.error, "PROVIDER_APPLICATION_TRANSITION_FAILED");
  }
}

export type AdminProviderMember = {
  userId: string;
  username: string | null;
  displayName: string | null;
  role: OpportunityProviderRole;
  status: "active" | "revoked";
  grantedAt: string;
  revokedAt: string | null;
};

export type AdminProvider = {
  id: string;
  organisationName: string;
  organisationType: string;
  officialWebsite: string;
  officialDomain: string;
  countryCode: string;
  publicDescription: string;
  status: OpportunityProviderStatus;
  reviewNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  members: AdminProviderMember[];
};

export async function getAdminProviderRegistry() {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("get_stage20_admin_provider_registry");
  if (result.error) {
    throwRpcError(result.error, "ADMIN_PROVIDER_REGISTRY_UNAVAILABLE");
  }
  const row = object(result.data);
  const providers = Array.isArray(row.providers)
    ? row.providers.flatMap((item) => {
        const provider = object(item);
        const status = opportunityProviderStatusSchema.safeParse(
          provider.status,
        );
        const id = text(provider.id);
        const organisationName = text(provider.organisationName);
        const organisationType = text(provider.organisationType);
        const officialWebsite = text(provider.officialWebsite);
        const officialDomain = text(provider.officialDomain);
        const countryCode = text(provider.countryCode);
        const publicDescription = text(provider.publicDescription);
        const createdAt = text(provider.createdAt);
        const updatedAt = text(provider.updatedAt);
        if (
          !status.success ||
          !id ||
          !organisationName ||
          !organisationType ||
          !officialWebsite ||
          !officialDomain ||
          !countryCode ||
          !publicDescription ||
          !createdAt ||
          !updatedAt
        ) {
          return [];
        }
        const members = Array.isArray(provider.members)
          ? provider.members.flatMap((memberValue) => {
              const member = object(memberValue);
              const memberRole = opportunityProviderRoleSchema.safeParse(
                member.role,
              );
              const memberStatus = member.status;
              const userId = text(member.userId);
              const grantedAt = text(member.grantedAt);
              if (
                !memberRole.success ||
                (memberStatus !== "active" && memberStatus !== "revoked") ||
                !userId ||
                !grantedAt
              ) {
                return [];
              }
              return [
                {
                  userId,
                  username: text(member.username),
                  displayName: text(member.displayName),
                  role: memberRole.data,
                  status: memberStatus,
                  grantedAt,
                  revokedAt: text(member.revokedAt),
                } satisfies AdminProviderMember,
              ];
            })
          : [];
        return [
          {
            id,
            organisationName,
            organisationType,
            officialWebsite,
            officialDomain,
            countryCode,
            publicDescription,
            status: status.data,
            reviewNotes: text(provider.reviewNotes),
            reviewedAt: text(provider.reviewedAt),
            createdAt,
            updatedAt,
            members,
          } satisfies AdminProvider,
        ];
      })
    : [];
  return { role: text(row.role), providers };
}

export async function saveOpportunityProvider(input: OpportunityProviderInput) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("upsert_stage20_opportunity_provider", {
    provider_id_input: input.id,
    organisation_name_input: input.organisationName,
    organisation_type_input: input.organisationType,
    official_website_input: input.officialWebsite,
    official_domain_input: input.officialDomain,
    country_code_input: input.countryCode,
    public_description_input: input.publicDescription,
  });
  if (result.error || typeof result.data !== "string") {
    throwRpcError(result.error, "OPPORTUNITY_PROVIDER_SAVE_FAILED");
  }
  return result.data;
}

export async function setOpportunityProviderStatus(
  providerId: string,
  status: OpportunityProviderStatus,
  notes: string,
) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("set_stage20_opportunity_provider_status", {
    provider_id_input: providerId,
    status_input: status,
    review_notes_input: notes,
  });
  if (result.error) {
    throwRpcError(result.error, "OPPORTUNITY_PROVIDER_STATUS_FAILED");
  }
}

export async function setOpportunityProviderMember(input: {
  providerId: string;
  username: string;
  role: OpportunityProviderRole;
  active: boolean;
}) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("set_stage20_opportunity_provider_member", {
    provider_id_input: input.providerId,
    username_input: input.username,
    role_input: input.role,
    active_input: input.active,
  });
  if (result.error) {
    throwRpcError(result.error, "OPPORTUNITY_PROVIDER_MEMBER_FAILED");
  }
}

export async function getAdminMarketplaceApplications(providerId?: string) {
  const rpc = await marketplaceRpc();
  const result = await rpc.rpc("get_stage20_admin_applications", {
    provider_id_input: providerId ?? null,
  });
  if (result.error) {
    throwRpcError(result.error, "ADMIN_MARKETPLACE_APPLICATIONS_UNAVAILABLE");
  }
  const row = object(result.data);
  const applications = Array.isArray(row.applications)
    ? row.applications.flatMap((item) => {
        const parsed = parseSharedApplication(item);
        return parsed ? [parsed] : [];
      })
    : [];
  return { role: text(row.role), applications };
}
