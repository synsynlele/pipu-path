import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import type {
  BuilderDirectoryRow,
  BuilderNetworkRow,
} from "../domain/connect-contract";
import { callAuthenticatedConnectRpc } from "./connect-rpc";

export type OwnNetworkProfile = {
  user_id: string;
  headline: string;
  can_help_with: string[];
  needs_help_with: string[];
  interests: string[];
  is_discoverable: boolean;
  consent_version: string | null;
};

export function isConnectEligible(profile: {
  age_band: string;
  safeguarding_review_required: boolean;
  account_status: string;
  username: string | null;
}) {
  return (
    ["18_24", "25_plus"].includes(profile.age_band) &&
    !profile.safeguarding_review_required &&
    profile.account_status === "active" &&
    Boolean(profile.username)
  );
}

export async function getConnectHomeState(search?: string) {
  const { user, profile } = await requireAuthenticatedIdentity();
  const eligible = isConnectEligible(profile);
  if (!eligible) {
    return {
      eligible: false as const,
      profile: null,
      builders: [] as BuilderDirectoryRow[],
      network: [] as BuilderNetworkRow[],
    };
  }

  const client = await createServerSupabaseClient();
  // Stage 11 migration is deployed in the same release; generated types refresh follows migration verification.
  // @ts-expect-error Stage 11 table is not present in the pre-migration generated type snapshot.
  const ownProfileQuery = client
    .from("builder_network_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const [ownProfileResult, builders, network] = await Promise.all([
    ownProfileQuery,
    callAuthenticatedConnectRpc<BuilderDirectoryRow[]>(
      "search_stage11_builders",
      { search_input: search?.trim() || null, limit_input: 24 },
    ),
    callAuthenticatedConnectRpc<BuilderNetworkRow[]>("get_stage11_my_network"),
  ]);

  return {
    eligible: true as const,
    profile: (ownProfileResult.data as OwnNetworkProfile | null) ?? null,
    builders,
    network,
  };
}

export async function getBuilderConnectProfile(username: string) {
  const { profile } = await requireAuthenticatedIdentity();
  if (!isConnectEligible(profile)) return null;
  const rows = await callAuthenticatedConnectRpc<BuilderDirectoryRow[]>(
    "get_stage11_builder",
    { username_input: username },
  );
  return rows[0] ?? null;
}
