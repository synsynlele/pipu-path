"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSupabasePublicEnvironment } from "@/lib/config/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { publicAuthError } from "./errors";
import { resolveTrustedRequestOrigin } from "./request-origin";
import type { FormState } from "./form-state";
import { postAuthDestination, safeNextPath } from "./redirects";
import { allowAuthAttempt } from "../infrastructure/rate-limit";
import { getAuthenticatedHomeState } from "../infrastructure/progress-dal";

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

async function requestHeaders() {
  return headers();
}

async function requestIdentity() {
  const values = await requestHeaders();
  const forwarded = values.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || values.get("x-real-ip") || "local";
}

async function requestOrigin() {
  const { appUrl } = requireSupabasePublicEnvironment();
  return resolveTrustedRequestOrigin(await requestHeaders(), appUrl);
}

export async function signUpAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!(await allowAuthAttempt("signup", await requestIdentity())))
    return { status: "error", message: publicAuthError("rate") };
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const client = await createServerSupabaseClient();
  const origin = await requestOrigin();
  const { error } = await client.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding/identity`,
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
  if (!(await allowAuthAttempt("signin", await requestIdentity())))
    return { status: "error", message: publicAuthError("rate") };
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error);
  const client = await createServerSupabaseClient();
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error)
    return { status: "error", message: publicAuthError(error.message) };
  const state = await getAuthenticatedHomeState(client);
  redirect(
    postAuthDestination(
      state?.destination.path ?? "/app",
      formData.get("next")?.toString(),
    ),
  );
}

export async function signInWithGoogleAction(next = "/app") {
  const client = await createServerSupabaseClient();
  const callbackUrl = new URL("/auth/callback", await requestOrigin());
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
  if (!(await allowAuthAttempt("recovery", await requestIdentity())))
    return { status: "error", message: publicAuthError("rate") };
  const parsed = z
    .object({ email: z.email() })
    .safeParse(Object.fromEntries(formData));
  if (parsed.success) {
    const client = await createServerSupabaseClient();
    const origin = await requestOrigin();
    await client.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
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
