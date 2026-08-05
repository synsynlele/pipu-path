import "server-only";

import { createClient } from "@supabase/supabase-js";
import { requireSupabasePublicEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";
import { authRateLimitFingerprint } from "../domain/rate-limit-key";

const logger = createLogger();
const allowedActions = new Set(["signin", "signup", "recovery"]);

export async function allowAuthAttempt(
  action: string,
  requestIdentity: string,
  limit = 8,
  windowSeconds = 60,
) {
  if (!allowedActions.has(action)) return false;

  const { url, anonKey } = requireSupabasePublicEnvironment();
  const client = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await client.rpc(
    "consume_stage10_auth_rate_limit" as never,
    {
      action_input: action,
      key_hash_input: authRateLimitFingerprint(action, requestIdentity),
      limit_input: limit,
      window_seconds_input: windowSeconds,
    } as never,
  );

  if (error) {
    logger.warn("auth_rate_limit_check_failed", { action });
    return false;
  }

  return data === true;
}
