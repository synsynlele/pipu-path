"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  commaSeparatedValues,
  connectActionSchema,
  connectProfileInputSchema,
  contactShareInputSchema,
  reportBuilderInputSchema,
} from "../domain/connect-contract";
import { runConnectRpc } from "../infrastructure/connect-dal";

function destination(formData: FormData) {
  const value = formData.get("returnTo");
  return typeof value === "string" && value.startsWith("/connect")
    ? value
    : "/connect";
}

function finish(
  path: string,
  status: "saved" | "updated" | "error",
): never {
  revalidatePath("/connect");
  redirect(`${path}${path.includes("?") ? "&" : "?"}status=${status}`);
}

export async function saveConnectProfileAction(formData: FormData) {
  const returnTo = destination(formData);
  const parsed = connectProfileInputSchema.safeParse({
    interests: commaSeparatedValues(formData.get("interests")),
    capabilities: commaSeparatedValues(formData.get("capabilities")),
    canHelpWith: formData.get("canHelpWith") ?? "",
    needsHelpWith: formData.get("needsHelpWith") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    contactWhatsapp: formData.get("contactWhatsapp") ?? "",
    visibility: formData.get("visibility"),
  });
  if (!parsed.success) finish(returnTo, "error");

  const { data, error } = await runConnectRpc(
    "save_stage11_builder_connect_profile",
    {
      interests_input: parsed.data.interests,
      capabilities_input: parsed.data.capabilities,
      can_help_with_input: parsed.data.canHelpWith,
      needs_help_with_input: parsed.data.needsHelpWith,
      contact_email_input: parsed.data.contactEmail || null,
      contact_whatsapp_input: parsed.data.contactWhatsapp || null,
      visibility_input: parsed.data.visibility,
    },
  );
  finish(returnTo, error || !data ? "error" : "saved");
}

export async function manageConnectionAction(formData: FormData) {
  const returnTo = destination(formData);
  const parsed = connectActionSchema.safeParse({
    action: formData.get("action"),
    targetUserId: formData.get("targetUserId") || undefined,
    connectionId: formData.get("connectionId") || undefined,
  });
  if (!parsed.success) finish(returnTo, "error");

  let result: Awaited<ReturnType<typeof runConnectRpc>>;
  if (parsed.data.action === "send") {
    result = await runConnectRpc("send_stage11_connection_request", {
      target_user_id_input: parsed.data.targetUserId,
    });
  } else if (parsed.data.action === "accept" || parsed.data.action === "decline") {
    result = await runConnectRpc("respond_stage11_connection_request", {
      connection_id_input: parsed.data.connectionId,
      accept_input: parsed.data.action === "accept",
    });
  } else if (parsed.data.action === "cancel" || parsed.data.action === "remove") {
    result = await runConnectRpc("close_stage11_connection", {
      connection_id_input: parsed.data.connectionId,
      action_input: parsed.data.action,
    });
  } else if (parsed.data.action === "block") {
    result = await runConnectRpc("block_stage11_builder", {
      target_user_id_input: parsed.data.targetUserId,
    });
  } else {
    result = await runConnectRpc("unblock_stage11_builder", {
      target_user_id_input: parsed.data.targetUserId,
    });
  }
  finish(returnTo, result.error || !result.data ? "error" : "updated");
}

export async function shareContactAction(formData: FormData) {
  const returnTo = destination(formData);
  const parsed = contactShareInputSchema.safeParse({
    connectionId: formData.get("connectionId"),
    shareEmail: formData.get("shareEmail") === "on",
    shareWhatsapp: formData.get("shareWhatsapp") === "on",
  });
  if (!parsed.success) finish(returnTo, "error");
  const result = await runConnectRpc("share_stage11_contact", {
    connection_id_input: parsed.data.connectionId,
    share_email_input: parsed.data.shareEmail,
    share_whatsapp_input: parsed.data.shareWhatsapp,
  });
  finish(returnTo, result.error || !result.data ? "error" : "updated");
}

export async function reportBuilderAction(formData: FormData) {
  const returnTo = destination(formData);
  const parsed = reportBuilderInputSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
    reasonCode: formData.get("reasonCode"),
    detail: formData.get("detail") ?? "",
  });
  if (!parsed.success) finish(returnTo, "error");
  const result = await runConnectRpc("report_stage11_builder", {
    target_user_id_input: parsed.data.targetUserId,
    reason_code_input: parsed.data.reasonCode,
    detail_input: parsed.data.detail || null,
  });
  finish(returnTo, result.error || !result.data ? "error" : "updated");
}
