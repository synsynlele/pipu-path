"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentPlatformAdminRole } from "@/modules/admin/infrastructure/admin-dal";
import type { FormState } from "@/modules/identity/application/form-state";
import {
  fulfilDeletionRequest,
  takeOverDeletionReview,
} from "../infrastructure/deletion-fulfilment";
import { privacyOperationsConfig } from "../infrastructure/privacy-config";
import {
  claimDeletionRequest,
  saveDeletionRequest,
} from "../infrastructure/deletion-requests";

export async function requestAccountDeletion(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  if (!privacyOperationsConfig().enabled)
    return {
      status: "error",
      message:
        "Online requests are not available yet. Use the privacy contact on this page.",
    };
  if (form.get("confirm") !== "on")
    return {
      status: "error",
      message: "Confirm that you want to request account and data deletion.",
    };
  try {
    const client = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error || !user || !user.email_confirmed_at)
      return {
        status: "error",
        message:
          "Sign in with your verified account before sending this request.",
      };
    const request = await saveDeletionRequest(user.id);
    if (!request) throw new Error("PRIVACY_REQUEST_SAVE_FAILED");
    revalidatePath("/account-deletion");
    return {
      status: "success",
      message: `Request ${request.id} saved. Your account has not been deleted. The privacy team will review it and confirm completion.`,
    };
  } catch {
    return {
      status: "error",
      message:
        "Your request could not be saved. Please try again or use the privacy contact.",
    };
  }
}

export async function reviewDeletionRequest(form: FormData) {
  const role = await getCurrentPlatformAdminRole();
  if (role !== "owner" && role !== "operator") throw new Error("FORBIDDEN");
  if (!privacyOperationsConfig().enabled)
    throw new Error("PRIVACY_OPERATIONS_DISABLED");
  const client = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  const id = form.get("request_id");
  if (error || !user || !z.uuid().safeParse(id).success)
    throw new Error("INVALID_REQUEST");
  await claimDeletionRequest(id as string, user.id);
  revalidatePath("/admin/privacy");
}

export async function fulfilAccountDeletion(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const role = await getCurrentPlatformAdminRole();
  if (role !== "owner" && role !== "operator")
    return {
      status: "error",
      message: "Only authorised privacy operators can process deletion.",
    };
  if (
    !privacyOperationsConfig().enabled ||
    process.env.PRIVACY_FULFILMENT_ENABLED !== "true"
  )
    return { status: "error", message: "Deletion processing is not enabled." };
  const id = form.get("request_id");
  if (
    !z.uuid().safeParse(id).success ||
    form.get("confirm_request_id") !== id ||
    form.get("review_complete") !== "on"
  )
    return {
      status: "error",
      message:
        "Complete the ownership, retention and safeguarding review, then confirm the request ID.",
    };
  const client = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user || !user.email_confirmed_at)
    return {
      status: "error",
      message: "Sign in with your verified operator account.",
    };
  try {
    await fulfilDeletionRequest(id as string, user.id);
    revalidatePath("/admin/privacy");
    return {
      status: "success",
      message:
        "Linked application records, owned files and authentication removal verified. Request fulfilled. Any approved provider or backup retention follows the privacy policy.",
    };
  } catch {
    revalidatePath("/admin/privacy");
    return {
      status: "error",
      message:
        "Deletion is not confirmed. The account may be suspended or partly processed. Review dependencies and retry this request; do not mark it fulfilled manually.",
    };
  }
}

export async function takeOverDeletionReviewAction(form: FormData) {
  const role = await getCurrentPlatformAdminRole();
  if (role !== "owner" && role !== "operator") throw new Error("FORBIDDEN");
  if (!privacyOperationsConfig().enabled)
    throw new Error("PRIVACY_OPERATIONS_DISABLED");
  const client = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  const id = form.get("request_id");
  if (
    error ||
    !user ||
    !user.email_confirmed_at ||
    !z.uuid().safeParse(id).success
  )
    throw new Error("INVALID_REQUEST");
  await takeOverDeletionReview(id as string, user.id);
  revalidatePath("/admin/privacy");
}
