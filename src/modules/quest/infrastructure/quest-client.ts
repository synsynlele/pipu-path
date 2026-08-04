import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  readServerEnvironment,
  requireSupabasePublicEnvironment,
} from "@/lib/config/env";

export async function createQuestServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabasePublicEnvironment();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies; Proxy refreshes them.
        }
      },
    },
  });
}

export function createQuestServiceClient() {
  const environment = readServerEnvironment();
  if (
    !environment.NEXT_PUBLIC_SUPABASE_URL ||
    !environment.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Supabase service environment is not configured.");
  }

  return createClient(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
