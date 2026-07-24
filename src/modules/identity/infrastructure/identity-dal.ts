import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getIdentityState() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { user: null, profile: null, checkpoint: null };

  const [{ data: profile }, { data: checkpoint }] = await Promise.all([
    client.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    client
      .from("onboarding_checkpoints")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  return { user, profile, checkpoint };
}

export async function requireAuthenticatedIdentity() {
  const state = await getIdentityState();
  if (!state.user) redirect("/login?next=/app");
  if (!state.profile || state.checkpoint?.status !== "completed")
    redirect("/onboarding/identity");
  return {
    user: state.user,
    profile: state.profile,
    checkpoint: state.checkpoint,
  };
}
