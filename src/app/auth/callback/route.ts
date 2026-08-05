import { NextResponse, type NextRequest } from "next/server";
import { requireSupabasePublicEnvironment } from "@/lib/config/env";
import { createLogger } from "@/lib/observability/logger";
import { createOAuthCallbackClient } from "@/lib/supabase/oauth-callback";
import {
  postAuthDestination,
  safeNextPath,
} from "@/modules/identity/application/redirects";
import { resolveTrustedRequestOrigin } from "@/modules/identity/application/request-origin";
import { getAuthenticatedHomeState } from "@/modules/identity/infrastructure/progress-dal";

const logger = createLogger();

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const { appUrl } = requireSupabasePublicEnvironment();
  const trustedOrigin = resolveTrustedRequestOrigin(request.headers, appUrl);
  const requestedPath = safeNextPath(request.nextUrl.searchParams.get("next"));
  if (!code)
    return NextResponse.redirect(new URL("/auth/error", trustedOrigin));

  const { client, applyCookies } = createOAuthCallbackClient(request);
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) {
    logger.warn("oauth_callback_exchange_failed", { provider: "google" });
    return applyCookies(
      NextResponse.redirect(new URL("/auth/error", trustedOrigin)),
    );
  }

  const state = await getAuthenticatedHomeState(client);
  if (!state) {
    logger.warn("oauth_callback_session_missing", { provider: "google" });
    return applyCookies(
      NextResponse.redirect(new URL("/auth/error", trustedOrigin)),
    );
  }

  const destination = postAuthDestination(
    state.destination.path,
    requestedPath,
  );
  logger.info("oauth_callback_completed", {
    provider: "google",
    destinationStage: state.destination.stage,
  });
  return applyCookies(
    NextResponse.redirect(new URL(destination, trustedOrigin)),
  );
}
