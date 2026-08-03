import { NextResponse, type NextRequest } from "next/server";
import { refreshSupabaseSession } from "@/lib/supabase/proxy";

const authRoutes = ["/login", "/signup"];
const protectedPrefixes = ["/app", "/onboarding"];

export async function proxy(request: NextRequest) {
  const { response, user } = await refreshSupabaseSession(request);
  const path = request.nextUrl.pathname;

  if (!user && protectedPrefixes.some((prefix) => path.startsWith(prefix))) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/login";
    destination.searchParams.set("next", path);
    return NextResponse.redirect(destination);
  }
  if (user && authRoutes.includes(path)) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/app";
    destination.search = "";
    return NextResponse.redirect(destination);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
Ÿ®8