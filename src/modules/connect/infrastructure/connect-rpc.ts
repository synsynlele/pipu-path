import "server-only";

import {
  readServerEnvironment,
  requireSupabasePublicEnvironment,
} from "@/lib/config/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function parseRpcResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.text()).slice(0, 240);
    throw new Error(body || `CONNECT_RPC_${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function callAuthenticatedConnectRpc<T>(
  name: string,
  body: Record<string, unknown> = {},
): Promise<T> {
  const client = await createServerSupabaseClient();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) throw new Error("CONNECT_ACCESS_DENIED");
  const { url, anonKey } = requireSupabasePublicEnvironment();
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return parseRpcResponse<T>(response);
}

export async function callServiceRoleStage11Rpc<T>(
  name: string,
  body: Record<string, unknown> = {},
): Promise<T> {
  const { url } = requireSupabasePublicEnvironment();
  const serviceRoleKey = readServerEnvironment().SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_REQUIRED");
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return parseRpcResponse<T>(response);
}
