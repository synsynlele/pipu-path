import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export const productEventNames = [
  "possible_paths_generated",
  "possible_paths_viewed",
  "path_selected",
  "path_changed",
  "pathway_started",
  "first_value_challenge_started",
  "first_value_challenge_completed",
  "feature_viewed",
  "collaboration_invited",
  "collaboration_accepted",
  "collaboration_contribution_added",
  "collaboration_completed",
  "builder_guide_generated",
  "builder_guide_feedback",
  "opportunity_saved",
  "opportunity_unsaved",
  "opportunity_external_clicked",
  "opportunity_applied",
  "opportunity_outcome_recorded",
  "capability_verification_requested",
  "capability_verification_confirmed",
] as const;

export type ProductEventName = (typeof productEventNames)[number];

export const productFeatureKeys = [
  "home",
  "profile",
  "journey",
  "build",
  "portfolio",
  "connect",
  "guide",
  "opportunities",
] as const;

export type ProductFeatureKey = (typeof productFeatureKeys)[number];

type QueryError = { message?: string } | null;
type QueryResult = { data: unknown; error: QueryError };
type UntypedQuery = {
  insert(values: Record<string, unknown>): UntypedQuery;
  select(columns?: string): UntypedQuery;
  single(): Promise<QueryResult>;
};
type UntypedClient = { from(table: string): UntypedQuery };

function asProductEventsClient(client: unknown) {
  return client as UntypedClient;
}

export async function recordProductEventForUser(
  userId: string,
  eventName: ProductEventName,
  metadata: Record<string, unknown> = {},
  featureKey?: ProductFeatureKey,
) {
  const service = asProductEventsClient(createServiceRoleSupabaseClient());
  const { error } = await service
    .from("product_events")
    .insert({
      user_id: userId,
      event_name: eventName,
      feature_key: featureKey ?? null,
      metadata,
    })
    .select("id")
    .single();
  return !error;
}

async function currentUserId() {
  const server = await createServerSupabaseClient();
  const {
    data: { user },
  } = await server.auth.getUser();
  return user?.id ?? null;
}

export async function recordCurrentUserProductEvent(
  eventName: ProductEventName,
  metadata: Record<string, unknown> = {},
) {
  const userId = await currentUserId();
  if (!userId) return false;
  return recordProductEventForUser(userId, eventName, metadata);
}

export async function recordCurrentUserFeatureView(
  featureKey: ProductFeatureKey,
) {
  const userId = await currentUserId();
  if (!userId) return false;

  return recordProductEventForUser(
    userId,
    "feature_viewed",
    { telemetryVersion: "stage14-v1" },
    featureKey,
  );
}
