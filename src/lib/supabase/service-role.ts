import "server-only";

import { createClient } from "@supabase/supabase-js";
import { readServerEnvironment } from "@/lib/config/env";
import type { Database } from "./types";

export function createServiceRoleSupabaseClient() {
  const environment = readServerEnvironment();
  if (
    !environment.NEXT_PUBLIC_SUPABASE_URL ||
    !environment.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Supabase service environment is not configured.");
  }
  return createClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
