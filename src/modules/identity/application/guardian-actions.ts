"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getIdentityState } from "../infrastructure/identity-dal";

const policyVersion = "2026-10-10-guardian-v1";

type RpcResult = { data: unknown; error: { message?: string } | null };
type UntypedRpc = (
  functionName: string,
  args?: Record<string, unknown>,
) => PromiseLike<RpcResult>;

async function invoke(functionName: string, args?: Record<string, unknown>) {
  const client = await createServerSupabaseClient();
  const rpc = client.rpc.bind(client) as unknown as UntypedRpc;
  return rpc(functionName, args);
}

export async function ensureGuardianAuthorizationAction() {
  const state = await getIdentityState();
  if (!state.user) redirect("/login?next=/onboarding/guardian");
  if (!state.profile || state.checkpoint?.status !== "completed") {
    redirect("/onboarding/identity");
  }
  if (!state.profile.is_minor) redirect("/continue");

  const { error } = await invoke("ensure_guardian_authorization_request");
  if (error) redirect("/onboarding/guardian?error=request_failed");
  revalidatePath("/onboarding/guardian");
  redirect("/onboarding/guardian");
}

const grantSchema = z.object({
  code: z
    .string()
    .trim()
    .transform((value) => value.replace(/[^a-z0-9]/gi, "").toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9]{16}$/)),
  relationship: z.enum(["parent", "legal_guardian"]),
  declaration: z.literal("on"),
});

export async function grantGuardianAuthorizationAction(formData: FormData) {
  const state = await getIdentityState();
  if (!state.user) redirect("/login?next=/guardian");
  if (!state.profile || state.checkpoint?.status !== "completed") {
    redirect("/onboarding/identity");
  }
  if (state.profile.is_minor) redirect("/onboarding/guardian");

  const parsed = grantSchema.safeParse({
    code: formData.get("code"),
    relationship: formData.get("relationship"),
    declaration: formData.get("declaration"),
  });
  if (!parsed.success) redirect("/guardian?error=invalid");

  const { error } = await invoke("grant_guardian_authorization", {
    request_code_input: parsed.data.code,
    policy_version_input: policyVersion,
    relationship_input: parsed.data.relationship,
  });
  if (error) redirect("/guardian?error=not_found");

  revalidatePath("/guardian");
  redirect("/guardian?status=approved");
}
