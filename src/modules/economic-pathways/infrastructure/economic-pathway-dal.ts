import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { getCurrentHumanPotentialProfile } from "@/modules/human-potential/infrastructure/profile-dal";
import {
  economicPathwayContextSchema,
  economicPathwayOutputSchema,
  type EconomicPathwayContext,
  type PossiblePath,
} from "../domain/economic-pathway-contract";

type QueryError = { message?: string } | null;
type QueryResult = { data: unknown; error: QueryError };
type UntypedQuery = {
  select(columns?: string): UntypedQuery;
  insert(values: Record<string, unknown>): UntypedQuery;
  upsert(
    values: Record<string, unknown>,
    options?: Record<string, unknown>,
  ): UntypedQuery;
  update(values: Record<string, unknown>): UntypedQuery;
  eq(column: string, value: unknown): UntypedQuery;
  order(column: string, options?: { ascending?: boolean }): UntypedQuery;
  limit(count: number): UntypedQuery;
  maybeSingle(): Promise<QueryResult>;
  single(): Promise<QueryResult>;
};
type UntypedClient = { from(table: string): UntypedQuery };

export function asEconomicPathwayClient(client: unknown) {
  return client as UntypedClient;
}

export async function getEconomicPathwayContext(): Promise<EconomicPathwayContext | null> {
  const [{ profile: identityProfile }, profile] = await Promise.all([
    requireAuthenticatedIdentity(),
    getCurrentHumanPotentialProfile(),
  ]);
  if (!profile) return null;

  return economicPathwayContextSchema.parse({
    profileId: profile.id,
    summary: profile.summary,
    ageBand: identityProfile.age_band,
    lifeStage: identityProfile.life_stage,
    isMinor: identityProfile.is_minor ?? false,
    safeguardingReviewRequired:
      identityProfile.safeguarding_review_required ?? false,
    sections: Object.entries(profile.sections).map(([key, insights]) => ({
      key,
      insights: insights.map((insight) => ({
        id: insight.id,
        title: insight.title,
        summary: insight.summary,
        description: insight.description,
      })),
    })),
  });
}

export type EconomicPathwayState = {
  id: string;
  profileId: string;
  possiblePaths: ReturnType<typeof economicPathwayOutputSchema.parse>["possiblePaths"];
  earnFromStrengths: ReturnType<
    typeof economicPathwayOutputSchema.parse
  >["earnFromStrengths"];
  selectedPathKey: string | null;
  selectedPath: PossiblePath | null;
  generatedAt: string;
};

export async function getCurrentEconomicPathwayState(
  profileId?: string,
): Promise<EconomicPathwayState | null> {
  const { user } = await requireAuthenticatedIdentity();
  const rawClient = await createServerSupabaseClient();
  const client = asEconomicPathwayClient(rawClient);
  let query = client
    .from("economic_pathway_recommendations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);
  if (profileId) query = query.eq("human_potential_profile_id", profileId);
  const { data } = await query.maybeSingle();
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const parsed = economicPathwayOutputSchema.safeParse({
    schemaVersion: row.schema_version,
    possiblePaths: row.possible_paths,
    earnFromStrengths: row.earn_from_strengths,
  });
  if (!parsed.success) return null;

  const selectedPathKey =
    typeof row.selected_path_key === "string" ? row.selected_path_key : null;
  return {
    id: String(row.id),
    profileId: String(row.human_potential_profile_id),
    possiblePaths: parsed.data.possiblePaths,
    earnFromStrengths: parsed.data.earnFromStrengths,
    selectedPathKey,
    selectedPath:
      parsed.data.possiblePaths.find((path) => path.key === selectedPathKey) ?? null,
    generatedAt:
      typeof row.generated_at === "string" ? row.generated_at : String(row.created_at),
  };
}

export const productEventNames = [
  "possible_paths_generated",
  "possible_paths_viewed",
  "path_selected",
  "path_changed",
  "pathway_started",
  "first_value_challenge_started",
  "first_value_challenge_completed",
] as const;
export type ProductEventName = (typeof productEventNames)[number];

export async function recordProductEventForUser(
  userId: string,
  eventName: ProductEventName,
  metadata: Record<string, unknown> = {},
) {
  const service = asEconomicPathwayClient(createServiceRoleSupabaseClient());
  const { error } = await service
    .from("product_events")
    .insert({ user_id: userId, event_name: eventName, metadata })
    .select("id")
    .single();
  return !error;
}
