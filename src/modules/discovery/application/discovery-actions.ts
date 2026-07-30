"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateDiscoveryInput } from "../domain/discovery";
import { requireActiveDiscovery } from "../infrastructure/discovery-dal";
import { safeDiscoveryError } from "./discovery-errors";
import type { DiscoveryFormState } from "./discovery-form-state";

const ownershipSchema = z.object({
  session_id: z.uuid(),
  expected_version: z.coerce.number().int().positive(),
});

export async function startDiscoveryAction() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login?next=/onboarding/discovery");
  const { error } = await client.rpc("start_or_resume_discovery");
  if (error) redirect("/onboarding/discovery?error=unavailable");
  redirect("/onboarding/discovery");
}

export async function saveDiscoveryResponseAction(
  _previous: DiscoveryFormState,
  formData: FormData,
): Promise<DiscoveryFormState> {
  const parsed = ownershipSchema
    .extend({
      question_key: z.string().regex(/^[a-z][a-z0-9_]{2,49}$/),
      intent: z.enum(["save", "skip"]).default("save"),
      return_to: z.enum(["flow", "review"]).default("flow"),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      status: "error",
      code: "DISCOVERY_RESPONSE_INVALID",
      message: "Check your answer and try again.",
    };

  const state = await requireActiveDiscovery();
  if (state.session.id !== parsed.data.session_id)
    return {
      status: "error",
      code: "DISCOVERY_ACCESS_DENIED",
      message: "That Discovery session is not available.",
    };
  const question = state.questions.find(
    (candidate) => candidate.stableKey === parsed.data.question_key,
  );
  if (!question)
    return {
      status: "error",
      code: "DISCOVERY_QUESTION_NOT_ELIGIBLE",
      message: "That question is not available for your Discovery session.",
    };

  const text = formData.get("text_response")?.toString() ?? null;
  const selectedOptions = formData
    .getAll("selected_options")
    .map((value) => value.toString());
  const numericValue = formData.get("numeric_response")?.toString();
  const numeric = numericValue ? Number(numericValue) : null;
  const skipped = parsed.data.intent === "skip";
  const validation = validateDiscoveryInput(question, {
    text,
    selectedOptions,
    numeric,
    skipped,
  });
  if (validation)
    return {
      status: "error",
      code: validation,
      message:
        validation === "DISCOVERY_RESPONSE_TOO_LONG"
          ? "Shorten your answer and try again."
          : validation === "DISCOVERY_REQUIRED_RESPONSE_MISSING"
            ? "This question is required."
            : "Check your answer and try again.",
    };

  const client = await createServerSupabaseClient();
  const { data: savedVersion, error } = await client.rpc(
    "save_discovery_response",
    {
      session_id_input: state.session.id,
      question_key_input: question.stableKey,
      text_response_input: (skipped ? null : text) as unknown as string,
      selected_options_input: (skipped || !selectedOptions.length
        ? null
        : selectedOptions) as unknown as string[],
      numeric_response_input: (skipped ? null : numeric) as unknown as number,
      skip_input: skipped,
      expected_version_input: parsed.data.expected_version,
    },
  );
  if (error) {
    const safe = safeDiscoveryError(error.message, "DISCOVERY_SAVE_FAILED");
    return { status: "error", ...safe };
  }

  revalidatePath("/onboarding/discovery");
  if (parsed.data.return_to === "review") {
    const { error: reviewError } = await client.rpc("open_discovery_review", {
      session_id_input: state.session.id,
      expected_version_input: savedVersion,
    });
    if (reviewError) {
      const safe = safeDiscoveryError(
        reviewError.message,
        "DISCOVERY_SAVE_FAILED",
      );
      return { status: "error", ...safe };
    }
    return {
      status: "success",
      destination: "/onboarding/discovery/review",
    };
  }
  const { data: committedSession, error: cursorError } = await client
    .from("discovery_sessions")
    .select("current_question_key")
    .eq("id", state.session.id)
    .single();
  if (cursorError) {
    const safe = safeDiscoveryError(
      cursorError.message,
      "DISCOVERY_SAVE_FAILED",
    );
    return { status: "error", ...safe };
  }
  const nextQuestion = state.questions.find(
    (candidate) =>
      candidate.stableKey === committedSession.current_question_key,
  );
  if (!nextQuestion)
    return { status: "success", destination: "/onboarding/discovery" };
  return {
    status: "success",
    destination: `/onboarding/discovery/${nextQuestion.sectionKey}?question=${nextQuestion.stableKey}`,
  };
}

export async function openDiscoveryReviewAction(
  _previous: DiscoveryFormState,
  formData: FormData,
): Promise<DiscoveryFormState> {
  const parsed = ownershipSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      status: "error",
      code: "DISCOVERY_SESSION_NOT_FOUND",
      message: "Your Discovery session could not be found.",
    };
  const state = await requireActiveDiscovery();
  if (state.session.id !== parsed.data.session_id)
    return {
      status: "error",
      code: "DISCOVERY_ACCESS_DENIED",
      message: "That Discovery session is not available.",
    };
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("open_discovery_review", {
    session_id_input: state.session.id,
    expected_version_input: parsed.data.expected_version,
  });
  if (error) {
    const safe = safeDiscoveryError(
      error.message,
      "DISCOVERY_REQUIRED_RESPONSE_MISSING",
    );
    return { status: "error", ...safe };
  }
  revalidatePath("/onboarding/discovery");
  return { status: "success", destination: "/onboarding/discovery/review" };
}

export async function completeDiscoveryAction(
  _previous: DiscoveryFormState,
  formData: FormData,
): Promise<DiscoveryFormState> {
  const parsed = ownershipSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return {
      status: "error",
      code: "DISCOVERY_COMPLETION_FAILED",
      message: "Discovery could not be completed. Please try again.",
    };
  const state = await requireActiveDiscovery();
  if (state.session.id !== parsed.data.session_id)
    return {
      status: "error",
      code: "DISCOVERY_ACCESS_DENIED",
      message: "That Discovery session is not available.",
    };
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("complete_discovery", {
    session_id_input: state.session.id,
    expected_version_input: parsed.data.expected_version,
  });
  if (error) {
    const safe = safeDiscoveryError(
      error.message,
      "DISCOVERY_COMPLETION_FAILED",
    );
    return { status: "error", ...safe };
  }
  revalidatePath("/onboarding/discovery");
  return { status: "success", destination: "/onboarding/discovery/complete" };
}
