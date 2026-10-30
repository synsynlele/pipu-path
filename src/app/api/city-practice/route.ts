import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { guardianAuthorizationGrantedForUser } from "@/modules/identity/infrastructure/identity-dal";
import { sanitizePractice } from "../../../../public/games/city/practice-save.mjs";

export const dynamic = "force-dynamic";

type CityRow = {
  user_id: string;
  revision: number;
  state: Record<string, unknown>;
  updated_at: string;
};
type Table = {
  Row: CityRow;
  Insert: Partial<CityRow>;
  Update: Partial<CityRow>;
  Relationships: [];
};
type CityDb = {
  public: {
    Tables: { city_practice_saves: Table };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

function db() {
  return createServiceRoleSupabaseClient() as unknown as SupabaseClient<CityDb>;
}
const fail = (status: number, message: string) =>
  NextResponse.json({ ok: false, message }, { status });
const noStore = { "Cache-Control": "private, no-store" };

async function getActor() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("account_status,is_minor,safeguarding_review_required")
    .eq("id", user.id)
    .maybeSingle();
  if (
    profileError ||
    !profile ||
    profile.account_status !== "active" ||
    profile.safeguarding_review_required
  )
    return null;
  if (profile.is_minor && !(await guardianAuthorizationGrantedForUser(user.id)))
    return null;
  return user.id;
}

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  return (
    (!origin || origin === req.nextUrl.origin) &&
    req.headers.get("sec-fetch-site") !== "cross-site"
  );
}

export async function GET() {
  try {
    const userId = await getActor();
    if (!userId) return fail(401, "Sign in to back up your city.");
    const { data, error } = await db()
      .from("city_practice_saves")
      .select("revision,state,updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return fail(503, "Account backup is unavailable.");
    const safe = data ? sanitizePractice(data.state) : null;
    if (data && !safe)
      return fail(409, "Your saved city needs review before restoring.");
    return NextResponse.json(
      {
        ok: true,
        revision: data?.revision ?? null,
        state: safe,
        updatedAt: data?.updated_at ?? null,
      },
      { headers: noStore },
    );
  } catch {
    return fail(503, "Could not load your account backup.");
  }
}

export async function PUT(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, "Untrusted request origin.");
  if (!req.headers.get("content-type")?.includes("application/json"))
    return fail(415, "JSON is required.");
  try {
    const userId = await getActor();
    if (!userId) return fail(401, "Sign in to back up your city.");
    const raw = await req.text();
    if (raw.length > 20000) return fail(413, "The city snapshot is too large.");
    const body = JSON.parse(raw) as {
      state?: unknown;
      expectedRevision?: unknown;
    };
    const safe = sanitizePractice(body.state);
    if (!safe || JSON.stringify(safe).length > 17500)
      return fail(400, "The city snapshot is invalid.");
    const expected = body.expectedRevision;
    if (
      expected !== null &&
      (!Number.isInteger(expected) || Number(expected) < 1)
    )
      return fail(400, "Save version is invalid.");
    const client = db();
    if (expected === null) {
      const { data, error } = await client
        .from("city_practice_saves")
        .insert({ user_id: userId, revision: 1, state: safe })
        .select("revision")
        .single();
      if (error?.code === "23505")
        return fail(
          409,
          "An account backup already exists. Reload and choose which city to keep.",
        );
      if (error || !data)
        return fail(503, "Could not create the account backup.");
      return NextResponse.json(
        { ok: true, revision: data.revision },
        { headers: noStore },
      );
    }
    const revision = Number(expected);
    if (revision >= 2147483647)
      return fail(409, "Backup version limit reached.");
    const { data, error } = await client
      .from("city_practice_saves")
      .update({
        revision: revision + 1,
        state: safe,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("revision", revision)
      .select("revision")
      .maybeSingle();
    if (error) return fail(503, "Could not update the account backup.");
    if (!data)
      return fail(
        409,
        "A newer backup exists on another device. Reload before replacing it.",
      );
    return NextResponse.json(
      { ok: true, revision: data.revision },
      { headers: noStore },
    );
  } catch {
    return fail(400, "The backup request was invalid.");
  }
}

export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return fail(403, "Untrusted request origin.");
  try {
    const userId = await getActor();
    if (!userId) return fail(401, "Sign in to manage your backup.");
    const { error } = await db()
      .from("city_practice_saves")
      .delete()
      .eq("user_id", userId);
    if (error) return fail(503, "Could not delete the account backup.");
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch {
    return fail(503, "Could not delete the account backup.");
  }
}
