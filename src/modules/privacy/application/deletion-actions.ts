"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentPlatformAdminRole } from "@/modules/admin/infrastructure/admin-dal";
import type { FormState } from "@/modules/identity/application/form-state";
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
