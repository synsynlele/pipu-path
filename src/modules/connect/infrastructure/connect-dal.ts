import "server-only";

import type {
  BuilderDetail,
  ConnectState,
  DiscoverableBuilder,
} from "../domain/connect-contract";
import { callAuthenticatedConnectRpc } from "./connect-rpc";

export async function getConnectHomeState(search?: string) {
  const state = await callAuthenticatedConnectRpc<ConnectState>(
    "get_stage11_connect_state",
  );
  const normalizedSearch = search?.trim().toLowerCase() ?? "";
  const discover = normalizedSearch
    ? state.discover.filter((builder) =>
        [
          builder.username,
          builder.preferredName,
          builder.missionTitle ?? "",
          builder.missionStatement ?? "",
          builder.canHelpWith,
          builder.needsHelpWith,
          ...builder.interests,
          ...builder.capabilities,
        ].some((value) => value.toLowerCase().includes(normalizedSearch)),
      )
    : state.discover;
  return { ...state, discover };
}

export async function getBuilderConnectProfile(username: string) {
  try {
    return await callAuthenticatedConnectRpc<BuilderDetail>(
      "get_stage11_builder_detail",
      { username_input: username },
    );
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    if (
      text.includes("CONNECT_BUILDER_NOT_FOUND") ||
      text.includes("CONNECT_ADULT_REQUIRED")
    ) {
      return null;
    }
    throw error;
  }
}

export function builderMatchesSearch(
  builder: DiscoverableBuilder,
  search: string,
) {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return true;
  return [
    builder.username,
    builder.preferredName,
    builder.missionTitle ?? "",
    builder.missionStatement ?? "",
    builder.canHelpWith,
    builder.needsHelpWith,
    ...builder.interests,
    ...builder.capabilities,
  ].some((value) => value.toLowerCase().includes(normalized));
}
