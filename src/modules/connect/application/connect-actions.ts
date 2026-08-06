"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  builderSafetyActionSchema,
  connectionRequestInputSchema,
  connectionResponseInputSchema,
  networkProfileInputSchema,
  parseCommaSeparatedList,
} from "../domain/connect-contract";
import { callAuthenticatedConnectRpc } from "../infrastructure/connect-rpc";

function connectFailurePath(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);
  if (text.includes("CONNECT_ADULT_ELIGIBILITY_REQUIRED"))
    return "/connect?error=eligibility";
  if (text.includes("CONNECT_REQUEST_EXISTS"))
    return "/connect?error=request-exists";
  if (text.includes("CONNECT_BUILDER_NOT_AVAILABLE"))
    return "/connect?error=builder-unavailable";
  return "/connect?error=action-failed";
}

export async function saveNetworkProfileAction(formData: FormData) {
  const parsed = networkProfileInputSchema.safeParse({
    headline: formData.get("headline"),
    canHelpWith: parseCommaSeparatedList(formData.get("canHelpWith")),
    needsHelpWith: parseCommaSeparatedList(formData.get("needsHelpWith")),
    interests: parseCommaSeparatedList(formData.get("interests")),
    discoverable: formData.get("discoverable") === "on",
  });
  if (!parsed.success) redirect("/connect?error=profile-invalid");
  try {
    await callAuthenticatedConnectRpc<boolean>("save_stage11_network_profile", {
      headline_input: parsed.data.headline,
      can_help_with_input: parsed.data.canHelpWith,
      needs_help_with_input: parsed.data.needsHelpWith,
      interests_input: parsed.data.interests,
      discoverable_input: parsed.data.discoverable,
      consent_version_input: "builder-connect-v1",
    });
  } catch (error) {
    redirect(connectFailurePath(error));
  }
  revalidatePath("/connect");
  redirect("/connect?updated=profile");
}

export async function sendConnectionRequestAction(formData: FormData) {
  const parsed = connectionRequestInputSchema.safeParse({
    recipientId: formData.get("recipientId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) redirect("/connect?error=request-invalid");
  try {
    await callAuthenticatedConnectRpc<string>(
      "send_stage11_connection_request",
      {
        recipient_id_input: parsed.data.recipientId,
        reason_input: parsed.data.reason,
      },
    );
  } catch (error) {
    redirect(connectFailurePath(error));
  }
  revalidatePath("/connect");
  redirect("/connect?updated=request-sent");
}

export async function respondConnectionRequestAction(formData: FormData) {
  const parsed = connectionResponseInputSchema.safeParse({
    requestId: formData.get("requestId"),
    action: formData.get("action"),
  });
  if (!parsed.success) redirect("/connect?error=request-invalid");
  try {
    await callAuthenticatedConnectRpc<boolean>(
      "respond_stage11_connection_request",
      {
        request_id_input: parsed.data.requestId,
        action_input: parsed.data.action,
      },
    );
  } catch (error) {
    redirect(connectFailurePath(error));
  }
  revalidatePath("/connect");
  redirect("/connect?updated=network");
}

export async function builderSafetyAction(formData: FormData) {
  const action = formData.get("action");
  const parsed = builderSafetyActionSchema.safeParse({
    action,
    userId: formData.get("userId"),
    ...(action === "report" ? { reason: formData.get("reason") } : {}),
  });
  if (!parsed.success) redirect("/connect?error=action-failed");
  try {
    if (parsed.data.action === "block") {
      await callAuthenticatedConnectRpc<boolean>("block_stage11_builder", {
        blocked_id_input: parsed.data.userId,
      });
    } else {
      await callAuthenticatedConnectRpc<string>("report_stage11_builder", {
        reported_user_id_input: parsed.data.userId,
        reason_input: parsed.data.reason,
      });
    }
  } catch (error) {
    redirect(connectFailurePath(error));
  }
  revalidatePath("/connect");
  redirect(`/connect?updated=${parsed.data.action}`);
}
