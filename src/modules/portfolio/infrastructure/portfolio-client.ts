import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { requireSupabasePublicEnvironment } from "@/lib/config/env";

export async function createPortfolioServerClient() {
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

export function createPublicPortfolioClient() {
  const { url, anonKey } = requireSupabasePublicEnvironment();
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
