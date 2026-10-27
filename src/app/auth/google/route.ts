import { NextRequest, NextResponse } from "next/server";

import { requireSupabasePublicEnvironment } from "@/lib/config/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  previewGoogleHandoffOrigin,
  resolveTrustedRequestOrigin,
} from "@/modules/identity/application/request-origin";
import { safeNextPath } from "@/modules/identity/application/redirects";

export async function GET(request: NextRequest) {
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const previewOrigin = previewGoogleHandoffOrigin(
    request.nextUrl.hostname,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_ENV,
  );
  if (previewOrigin) {
    const handoff = new URL("/auth/google", previewOrigin);
    handoff.searchParams.set("next", next);
    return NextResponse.redirect(handoff);
  }

  const { appUrl } = requireSupabasePublicEnvironment();
  const origin = resolveTrustedRequestOrigin(request.headers, appUrl);
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set(
    "next",
    next,
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
