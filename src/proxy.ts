import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { requireSupabasePublicEnvironment } from "@/lib/config/env";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

const authRoutes = ["/login", "/signup"];
const protectedPrefixes = [
  "/app",
  "/build",
  "/connect",
  "/continue",
  "/discover",
  "/onboarding",
  "/mission",
  "/journey",
  "/quests",
  "/projects",
  "/portfolio",
  "/profile",
  "/guardian",
  "/institution",
  "/passport",
];
const publicProofPattern = /^\/proof\/([a-z0-9-]+)$/;
const publicPassportSharePattern =
  /^\/passport\/share\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function hasPublishedProjectProof(slug: string) {
  const { url, anonKey } = requireSupabasePublicEnvironment();
  const client = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
  const { data, error } = await client.rpc("get_stage9_public_portfolio", {
    slug_input: slug,
  });
  return !error && Array.isArray(data) && data.length > 0;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicProofMatch = path.match(publicProofPattern);

  if (publicProofMatch) {
    const published = await hasPublishedProjectProof(publicProofMatch[1]);
    if (!published) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/proof-unavailable";
      destination.search = "";
      return NextResponse.rewrite(destination, { status: 404 });
    }
    return NextResponse.next();
  }

  if (publicPassportSharePattern.test(path)) {
    return NextResponse.next();
  }

  const { response, user } = await refreshSupabaseSession(request);
  // Session refresh can rotate or clear cookies. Redirect responses must
  // deliver those changes too, otherwise the next page sees stale auth.
  function sessionRedirect(destination: URL) {
    const redirected = NextResponse.redirect(destination);
    response.cookies.getAll().forEach((cookie) => {
      redirected.cookies.set(cookie);
    });
    return redirected;
  }

  if (!user && protectedPrefixes.some((prefix) => path.startsWith(prefix))) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/login";
    destination.searchParams.set("next", path);
    return sessionRedirect(destination);
  }

  if (user && (path === "/" || authRoutes.includes(path))) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/continue";
    if (
      path === "/login" &&
      request.nextUrl.searchParams.get("next") === "/account-deletion"
    )
      destination.pathname = "/account-deletion";
    destination.search = "";
    return sessionRedirect(destination);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|apple-icon|pwa/).*)",
  ],
};
