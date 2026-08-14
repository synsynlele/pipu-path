import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { joinRequestSchema } from "@/modules/khpos-integration/domain/contract";

function friendly(message: string) {
  if (message.includes("KHPOS_COHORT_INVITE_INVALID"))
    return "This school cohort invitation is invalid or no longer active.";
  if (message.includes("KHPOS_COHORT_ALREADY_LINKED"))
    return "Your PipuPath account is already linked to another active school cohort.";
  if (message.includes("KHPOS_COHORT_ACCOUNT_INELIGIBLE"))
    return "This account cannot join an institutional cohort right now.";
  return "The school cohort request could not be completed.";
}

async function authenticatedClient() {
  const typed = await createServerSupabaseClient();
  const { data } = await typed.auth.getUser();
  if (!data.user) return null;
  return typed as unknown as SupabaseClient;
}

export async function GET() {
  const client = await authenticatedClient();
  if (!client)
    return NextResponse.json(
      { ok: false, error: "Sign in to manage your school cohort." },
      { status: 401 },
    );
  const { data, error } = await client.rpc(
    "get_stage13_khpos_school_cohort_membership",
  );
  if (error)
    return NextResponse.json(
      { ok: false, error: "School cohort status could not be loaded." },
      { status: 500 },
    );
  const row = Array.isArray(data) ? data[0] : null;
  return NextResponse.json({
    ok: true,
    membership: row
      ? {
          cohortId: row.cohort_id,
          organisationName: row.organisation_name,
          joinedAt: row.joined_at,
        }
      : null,
  });
}

export async function POST(request: Request) {
  const client = await authenticatedClient();
  if (!client)
    return NextResponse.json(
      { ok: false, error: "Sign in before joining a school cohort." },
      { status: 401 },
    );
  try {
    const { joinToken } = joinRequestSchema.parse(await request.json());
    const { data, error } = await client.rpc(
      "join_stage13_khpos_school_cohort",
      { join_token_input: joinToken },
    );
    if (error)
      return NextResponse.json(
        { ok: false, error: friendly(error.message) },
        { status: 400 },
      );
    return NextResponse.json({ ok: true, membership: data });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid school cohort invitation." },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const client = await authenticatedClient();
  if (!client)
    return NextResponse.json(
      { ok: false, error: "Sign in to manage your school cohort." },
      { status: 401 },
    );
  const { data, error } = await client.rpc(
    "withdraw_stage13_khpos_school_cohort",
  );
  if (error)
    return NextResponse.json(
      { ok: false, error: friendly(error.message) },
      { status: 400 },
    );
  return NextResponse.json({ ok: true, withdrawn: Boolean(data) });
}
