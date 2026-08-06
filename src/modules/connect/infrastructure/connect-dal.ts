import "server-only";

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
  const { profile } = await requireAuthenticatedIdentity();
  const eligible = isConnectEligible(profile);
  if (!eligible) {
    return {
      eligible: false as const,
      profile: null,
      builders: [] as BuilderDirectoryRow[],
      network: [] as BuilderNetworkRow[],
    };
  }

  const [ownProfileRows, builders, network] = await Promise.all([
    callAuthenticatedConnectRpc<OwnNetworkProfile[]>(
      "get_stage11_own_network_profile",
    ),
    callAuthenticatedConnectRpc<BuilderDirectoryRow[]>(
      "search_stage11_builders",
      { search_input: search?.trim() || null, limit_input: 24 },
    ),
    callAuthenticatedConnectRpc<BuilderNetworkRow[]>("get_stage11_my_network"),
  ]);

  return {
    eligible: true as const,
    profile: ownProfileRows[0] ?? null,
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
