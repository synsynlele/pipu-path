import { NextRequest, NextResponse } from "next/server";

import { requireSupabasePublicEnvironment } from "@/lib/config/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { resolveTrustedRequestOrigin } from "@/modules/identity/application/request-origin";
import { safeNextPath } from "@/modules/identity/application/redirects";

export async function GET(request: NextRequest) {
  const { appUrl } = requireSupabasePublicEnvironment();
  const origin = resolveTrustedRequestOrigin(request.headers, appUrl);
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set(
    "next",
    safeNextPath(request.nextUrl.searchParams.get("next")),
  );

  const client = await createServerSupabaseClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/auth/error", origin));
  }

  return NextResponse.redirect(data.url);
}
