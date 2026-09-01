import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

function isMissingRefreshToken(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "refresh_token_not_found"
  );
}

function clearSupabaseAuthCookies(
  request: NextRequest,
  response: NextResponse,
) {
  request.cookies
    .getAll()
    .filter(
      ({ name }) => name.startsWith("sb-") && name.includes("-auth-token"),
    )
    .forEach(({ name }) => {
      request.cookies.set(name, "");
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
      });
    });
}

export async function refreshSupabaseSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { response: NextResponse.next(), user: null };

  let response = NextResponse.next({ request });
  const client = createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    const {
      data: { user },
    } = await client.auth.getUser();
    return { response, user };
  } catch (error) {
    if (!isMissingRefreshToken(error)) throw error;

    clearSupabaseAuthCookies(request, response);
    return { response, user: null };
  }
}
