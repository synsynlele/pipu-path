import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";
import { requireSupabasePublicEnvironment } from "@/lib/config/env";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export function createOAuthCallbackClient(request: NextRequest) {
  const { url, anonKey } = requireSupabasePublicEnvironment();
  const pendingCookies: PendingCookie[] = [];

  const client = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        pendingCookies.splice(0, pendingCookies.length, ...cookiesToSet);
      },
    },
  });

  return {
    client,
    applyCookies(response: NextResponse) {
      pendingCookies.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options),
      );
      return response;
    },
  };
}
