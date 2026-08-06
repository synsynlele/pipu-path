"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  builderSafetyActionSchema,
  connectionRequestInputSchema,
  connectionResponseInputSchema,
  contactShareInputSchema,
  networkProfileInputSchema,
  parseCommaSeparatedList,
} from "../domain/connect-contract";
import { callAuthenticatedConnectRpc } from "../infrastructure/connect-rpc";

function connectFailurePath(error: unknown) {
  const text = error instanceof Error ? error.message : String(error);
  if (text.includes("CONNECT_ADULT_REQUIRED"))
    return "/connect?error=eligibility";
  if (text.includes("CONNECT_REQUEST_EXISTS"))
    return "/connect?error=request-exists";
  if (text.includes("CONNECT_BUILDER_NOT_FOUND"))
    return "/connect?error=builder-unavailable";
  if (text.includes("CONNECT_CONTACT_MISSING"))
    return "/connect?error=contact-missing";
  if (text.includes("CONNECT_BLOCKED")) return "/connect?error=blocked";
  return "/connect?error=action-failed";
}

export async function saveNetworkProfileAction(formData: FormData) {
  const parsed = networkProfileInputSchema.safeParse({
    interests: parseCommaSeparatedList(formData.get("interests")),
    capabilities: parseCommaSeparatedList(formData.get("capabilities")),
    canHelpWith: formData.get("canHelpWith"),
    needsHelpWith: formData.get("needsHelpWith"),
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    contactWhatsapp: String(formData.get("contactWhatsapp") ?? "").trim(),
    discoverable: formData.get("discoverable") === "on",
  });
  if (!parsed.success) redirect("/connect?error=profile-invalid");
  if (
    parsed.data.discoverable &&
    (!parsed.data.interests.length || !parsed.data.capabilities.length)
  ) {
    redirect("/connect?error=profile-incomplete");
  }
  try {
    await callAuthenticatedConnectRpc<boolean>(
      "save_stage11_builder_connect_profile",
      {
        interests_input: parsed.data.interests,
        capabilities_input: parsed.data.capabilities,
        can_help_with_input: parsed.data.canHelpWith,
        needs_help_with_input: parsed.data.needsHelpWith,
        contact_email_input: parsed.data.contactEmail || null,
        contact_whatsapp_input: parsed.data.contactWhatsapp || null,
        visibility_input: parsed.data.discoverable ? "discoverable" : "private",
      },
    );
  } catch (error) {
    redirect(connectFailurePath(error));
  }
  revalidatePath("/connect");
  redirect("/connect?updated=profile");
}

export async function sendConnectionRequestAction(formData: FormData) {
  const parsed = connectionRequestInputSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
  });
  if (!parsed.success) redirect("/connect?error=request-invalid");
  try {
    await callAuthenticatedConnectRpc<string>(
      "send_stage11_connection_request",
      { target_user_id_input: parsed.data.targetUserId },
    );
  } catch (error) {
    redirect(connectFailurePath(error));
  }
  revalidatePath("/connect");
  redirect("/connect?updated=request-sent");
}

export async function respondConnectionRequestAction(formData: FormData) {
  const parsed = connectionResponseInputSchema.safeParse({
    connectionId: formData.get("connectionId"),
    action: formData.get("action"),
  });
  if (!parsed.success) redirect("/connect?error=request-invalid");
  try {
    if (parsed.data.action === "accept" || parsed.data.action === "decline") {
      await callAuthenticatedConnectRpc<boolean>(
        "respond_stage11_connection_request",
        {
          connection_id_input: parsed.data.connectionId,
          accept_input: parsed.data.action === "accept",
        },
      );
    } else {
      await callAuthenticatedConnectRpc<boolean>("close_stage11_connection", {
        connection_id_input: parsed.data.connectionId,
        action_input: parsed.data.action,
      });
    }
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
        target_user_id_input: parsed.data.userId,
      });
    } else if (parsed.data.action === "unblock") {
      await callAuthenticatedConnectRpc<boolean>("unblock_stage11_builder", {
        target_user_id_input: parsed.data.userId,
      });
    } else {
      await callAuthenticatedConnectRpc<string>("report_stage11_builder", {
        target_user_id_input: parsed.data.userId,
        reason_code_input: parsed.data.reason,
        detail_input: null,
      });
    }
  } catch (error) {
    redirect(connectFailurePath(error));
  }
  revalidatePath("/connect");
  redirect(`/connect?updated=${parsed.data.action}`);
}

export async function shareContactAction(formData: FormData) {
  const parsed = contactShareInputSchema.safeParse({
    connectionId: formData.get("connectionId"),
    shareEmail: formData.get("shareEmail") === "on",
    shareWhatsapp: formData.get("shareWhatsapp") === "on",
  });
  if (!parsed.success) redirect("/connect?error=action-failed");
  try {
    await callAuthenticatedConnectRpc<boolean>("share_stage11_contact", {
      connection_id_input: parsed.data.connectionId,
      share_email_input: parsed.data.shareEmail,
      share_whatsapp_input: parsed.data.shareWhatsapp,
    });
  } catch (error) {
    redirect(connectFailurePath(error));
  }
  revalidatePath("/connect");
  redirect("/connect?updated=contact-sharing");
}
