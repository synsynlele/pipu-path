import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentEconomicPathwayState } from "@/modules/economic-pathways/infrastructure/economic-pathway-dal";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { getLivingBuilderProfile } from "@/modules/living-builder-profile/infrastructure/living-profile-dal";
import {
  matchOpportunity,
  opportunityAdminStateSchema,
  opportunityCatalogSchema,
  rankOpportunityMatches,
  type OpportunityAdminInput,
  type OpportunityMatchContext,
  type OpportunityOutcome,
} from "../domain/opportunity-contract";

type RpcError = { message?: string; code?: string } | null;
type RpcResult = { data: unknown; error: RpcError };
type UntypedRpcClient = {
  rpc(name: string, args?: Record<string, unknown>): Promise<RpcResult>;
};

function asRpcClient(client: unknown) {
  return client as UntypedRpcClient;
}

async function authenticatedRpc() {
  const client = await createServerSupabaseClient();
  return asRpcClient(client);
}

function throwRpcError(error: RpcError, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

export async function getOpportunityWorkspace() {
  const { profile } = await requireAuthenticatedIdentity();
  const rpc = await authenticatedRpc();
  const [pathway, livingProfile, catalogResult] = await Promise.all([
    getCurrentEconomicPathwayState(),
    getLivingBuilderProfile(),
    rpc.rpc("get_stage18_opportunity_catalog"),
  ]);

  if (catalogResult.error) {
    throwRpcError(catalogResult.error, "OPPORTUNITY_CATALOG_UNAVAILABLE");
  }
  const parsedCatalog = opportunityCatalogSchema.safeParse(catalogResult.data);
  if (!parsedCatalog.success) throw new Error("OPPORTUNITY_CATALOG_INVALID");

  const context: OpportunityMatchContext = {
    ageBand: profile.age_band,
    isMinor: profile.is_minor,
    countryCode: profile.country_code,
    selectedPathName: pathway?.selectedPath?.pathName ?? null,
    selectedPathSkills: pathway?.selectedPath?.skillsNeeded ?? [],
    capabilities:
      livingProfile?.capabilities.map((capability) => ({
        label: capability.label,
        level: capability.level,
      })) ?? [],
  };

  const matches = rankOpportunityMatches(
    parsedCatalog.data.flatMap((opportunity) => {
      const match = matchOpportunity(context, opportunity);
      return match ? [match] : [];
    }),
  );

  return {
    context,
    selectedPathName: pathway?.selectedPath?.pathName ?? null,
    matches,
  };
}

export async function getOpportunityAdminWorkspace() {
  await requireAuthenticatedIdentity();
  const rpc = await authenticatedRpc();
  const result = await rpc.rpc("get_stage18_admin_opportunities");
  if (result.error) {
    throwRpcError(result.error, "OPPORTUNITY_ADMIN_UNAVAILABLE");
  }
  const parsed = opportunityAdminStateSchema.safeParse(result.data);
  if (!parsed.success) throw new Error("OPPORTUNITY_ADMIN_STATE_INVALID");
  return parsed.data;
}

export async function saveOpportunityAdmin(input: OpportunityAdminInput) {
  const rpc = await authenticatedRpc();
  const result = await rpc.rpc("upsert_stage18_opportunity", {
    opportunity_id_input: input.id,
    title_input: input.title,
    provider_name_input: input.providerName,
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
  if (result.error) throwRpcError(result.error, "OPPORTUNITY_SAVE_FAILED");
  return result.data;
}

export async function reviewOpportunityAdmin(
  opportunityId: string,
  approved: boolean,
  notes: string,
) {
  const rpc = await authenticatedRpc();
  const result = await rpc.rpc("review_stage18_opportunity", {
    opportunity_id_input: opportunityId,
    approved_input: approved,
    review_notes_input: notes,
  });
  if (result.error) throwRpcError(result.error, "OPPORTUNITY_REVIEW_FAILED");
}

export async function setOpportunityPublicationAdmin(
  opportunityId: string,
  publish: boolean,
) {
  const rpc = await authenticatedRpc();
  const result = await rpc.rpc("set_stage18_opportunity_publication", {
    opportunity_id_input: opportunityId,
    publish_input: publish,
  });
  if (result.error) {
    throwRpcError(result.error, "OPPORTUNITY_PUBLICATION_FAILED");
  }
}

export async function setOpportunitySaved(
  opportunityId: string,
  saved: boolean,
) {
  const rpc = await authenticatedRpc();
  const result = await rpc.rpc("set_stage18_opportunity_saved", {
    opportunity_id_input: opportunityId,
    saved_input: saved,
  });
  if (result.error) throwRpcError(result.error, "OPPORTUNITY_STATE_FAILED");
}

export async function markOpportunityApplied(opportunityId: string) {
  const rpc = await authenticatedRpc();
  const result = await rpc.rpc("mark_stage18_opportunity_applied", {
    opportunity_id_input: opportunityId,
  });
  if (result.error) throwRpcError(result.error, "OPPORTUNITY_APPLY_FAILED");
}

export async function recordOpportunityOutcome(
  opportunityId: string,
  outcome: OpportunityOutcome,
) {
  const rpc = await authenticatedRpc();
  const result = await rpc.rpc("record_stage18_opportunity_outcome", {
    opportunity_id_input: opportunityId,
    outcome_input: outcome,
  });
  if (result.error) throwRpcError(result.error, "OPPORTUNITY_OUTCOME_FAILED");
}

export async function getOpportunityOfficialUrl(opportunityId: string) {
  const rpc = await authenticatedRpc();
  const result = await rpc.rpc("get_stage18_opportunity_link", {
    opportunity_id_input: opportunityId,
  });
  if (result.error || typeof result.data !== "string") {
    throwRpcError(result.error, "OPPORTUNITY_NOT_AVAILABLE");
  }
  return result.data;
}
