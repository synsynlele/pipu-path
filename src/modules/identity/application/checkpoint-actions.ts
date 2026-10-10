"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FormState } from "./form-state";
import { ageBands, isMinor, normalizeUsername } from "../domain/identity";

const schema = z.object({
  preferred_name: z.string().trim().min(1).max(80),
  username: z
    .string()
    .transform(normalizeUsername)
    .pipe(z.string().regex(/^[a-z][a-z0-9_]{2,29}$/)),
  age_band: z.enum(ageBands),
  accept_terms: z.literal("on"),
  accept_privacy: z.literal("on"),
  accept_ai: z.string().optional(),
});

export async function completeIdentityAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Complete every required identity and consent field.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  const minor = isMinor(parsed.data.age_band);
  if (!minor && parsed.data.accept_ai !== "on") {
    return {
      status: "error",
      message: "Adults must consent to AI processing before continuing.",
      fieldErrors: { accept_ai: ["AI processing consent is required."] },
    };
  }

  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await client.rpc("complete_identity_checkpoint", {
    preferred_name_input: parsed.data.preferred_name,
    username_input: parsed.data.username,
    age_band_input: parsed.data.age_band,
    policy_version_input: "2026-07-24",
    accept_terms: true,
    accept_privacy: true,
    accept_ai: !minor,
  });
  if (error) {
    return {
      status: "error",
      message: error.message.includes("username")
        ? "That username is unavailable."
        : "Your identity checkpoint could not be saved.",
    };
  }
  redirect("/continue");
}
