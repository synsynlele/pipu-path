"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSupabasePublicEnvironment } from "@/lib/config/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { publicAuthError } from "./errors";
import type { FormState } from "./form-state";
import { safeNextPath } from "./redirects";
import { allowAttempt } from "../infrastructure/rate-limit";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(10).max(128),
});

function invalid(state: z.ZodError): FormState {
  return {
    status: "error",
    message: "Check the highlighted information.",
    fieldErrors: z.flattenError(state).fieldErrors,
  };
}

async function requestKey(action: string) {
  const values = await headers();
  return `${action}:${values.get("x-forwarded-for") ?? "local"}`;
}

export async function signUpAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!allowAttempt(await requestKey("signup")))
    return { status: "error", message: publicAuthError("rate") };
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const client = await createServerSupabaseClient();
  const { appUrl } = requireSupabasePublicEnvironment();
  const { error } = await client.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?next=/onboarding/identity`,
    },
  });
  if (error)
    return { status: "error", message: publicAuthError(error.message) };
  return {
    status: "success",
    message: "Check your email and confirm your account before signing in.",
  };
}

export async function signInAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!allowAttempt(await requestKey("signin")))
    return { status: "error", message: publicAuthError("rate") };
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const client = await createServerSupabaseClient();
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error)
    return { status: "error", message: publicAuthError(error.message) };
  redirect(safeNextPath(formData.get("next")?.toString()));
}

export async function signInWithGoogleAction(next = "/app") {
  const client = await createServerSupabaseClient();
  const { appUrl } = requireSupabasePublicEnvironment();
  const callbackUrl = new URL("/auth/callback", appUrl);
  callbackUrl.searchParams.set("next", safeNextPath(next));

  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });

  if (error || !data.url) redirect("/auth/error");
  redirect(data.url);
}

export async function requestPasswordResetAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!allowAttempt(await requestKey("recovery")))
    return { status: "error", message: publicAuthError("rate") };
  const parsed = z
    .object({ email: z.email() })
    .safeParse(Object.fromEntries(formData));
  if (parsed.success) {
    const client = await createServerSupabaseClient();
    const { appUrl } = requireSupabasePublicEnvironment();
    await client.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
    });
  }
  return {
    status: "success",
    message: "If an account exists, a recovery email has been sent.",
  };
}

export async function updatePasswordAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = z
    .object({ password: z.string().min(10).max(128) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const client = await createServerSupabaseClient();
  const { error } = await client.auth.updateUser({
    password: parsed.data.password,
  });
  if (error)
    return { status: "error", message: publicAuthError(error.message) };
  return { status: "success", message: "Password updated. You can continue." };
}

export async function signOutAction() {
  const client = await createServerSupabaseClient();
  await client.auth.signOut();
  redirect("/login");
}
Ÿ®8