"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  builderNetworkCommentSchema,
  builderNetworkConnectionSchema,
  builderNetworkConversationSchema,
  builderNetworkMessageSchema,
  builderNetworkReactionSchema,
  builderNetworkReportSchema,
  createBuilderNetworkPostSchema,
  joinBuilderNetworkSchema,
  schoolBuilderNetworkSettingsSchema,
} from "../domain/builder-network-contract";
import { runBuilderNetworkRpc } from "../infrastructure/builder-network-dal";

function worldResult(status: "updated" | "error"): never {
  revalidatePath("/connect/world");
  revalidatePath("/connect");
  redirect(`/connect/world?status=${status}`);
}

function messageResult(
  conversationId: string,
  status: "updated" | "error",
): never {
  revalidatePath("/connect/messages");
  revalidatePath(`/connect/messages/${conversationId}`);
  redirect(`/connect/messages/${conversationId}?status=${status}`);
}

export async function joinBuilderNetworkAction(formData: FormData) {
  const parsed = joinBuilderNetworkSchema.safeParse({
    policyAccepted: formData.get("policyAccepted"),
  });
  if (!parsed.success) worldResult("error");
  const result = await runBuilderNetworkRpc("join_stage29_builder_network", {
    policy_version_input: "builder-network-participation-v1",
  });
  worldResult(result.error || !result.data ? "error" : "updated");
}

export async function withdrawBuilderNetworkAction() {
  const result = await runBuilderNetworkRpc("withdraw_stage29_builder_network");
  worldResult(result.error ? "error" : "updated");
}

export async function createBuilderNetworkPostAction(formData: FormData) {
  const parsed = createBuilderNetworkPostSchema.safeParse({
    kind: formData.get("kind"),
    body: formData.get("body"),
    projectId: formData.get("projectId") ?? "",
  });
  if (!parsed.success) worldResult("error");
  const result = await runBuilderNetworkRpc(
    "create_stage29_builder_network_post",
    {
      kind_input: parsed.data.kind,
      body_input: parsed.data.body,
      project_id_input: parsed.data.projectId || null,
    },
  );
  worldResult(result.error || !result.data ? "error" : "updated");
}

export async function addBuilderNetworkCommentAction(formData: FormData) {
  const parsed = builderNetworkCommentSchema.safeParse({
    postId: formData.get("postId"),
    body: formData.get("body"),
  });
  if (!parsed.success) worldResult("error");
  const result = await runBuilderNetworkRpc(
    "add_stage29_builder_network_comment",
    { post_id_input: parsed.data.postId, body_input: parsed.data.body },
  );
  worldResult(result.error || !result.data ? "error" : "updated");
}

export async function setBuilderNetworkReactionAction(formData: FormData) {
  const parsed = builderNetworkReactionSchema.safeParse({
    postId: formData.get("postId"),
    reaction: formData.get("reaction"),
  });
  if (!parsed.success) worldResult("error");
  const result = await runBuilderNetworkRpc(
    "set_stage29_builder_network_reaction",
    {
      post_id_input: parsed.data.postId,
      reaction_code_input: parsed.data.reaction,
    },
  );
  worldResult(result.error ? "error" : "updated");
}

export async function manageBuilderNetworkConnectionAction(formData: FormData) {
  const parsed = builderNetworkConnectionSchema.safeParse({
    action: formData.get("action"),
    targetUserId: formData.get("targetUserId") || undefined,
    connectionId: formData.get("connectionId") || undefined,
  });
  if (!parsed.success) worldResult("error");

  let result: Awaited<ReturnType<typeof runBuilderNetworkRpc>>;
  switch (parsed.data.action) {
    case "send":
      result = await runBuilderNetworkRpc(
        "send_stage29_builder_network_connection_request",
        { target_user_id_input: parsed.data.targetUserId },
      );
      break;
    case "accept":
    case "decline":
      result = await runBuilderNetworkRpc(
        "respond_stage29_builder_network_connection",
        {
          connection_id_input: parsed.data.connectionId,
          accept_input: parsed.data.action === "accept",
        },
      );
      break;
    case "cancel":
    case "remove":
      result = await runBuilderNetworkRpc(
        "close_stage29_builder_network_connection",
        {
          connection_id_input: parsed.data.connectionId,
          action_input: parsed.data.action,
        },
      );
      break;
    case "block":
      result = await runBuilderNetworkRpc(
        "block_stage29_builder_network_user",
        { target_user_id_input: parsed.data.targetUserId },
      );
      break;
  }
  worldResult(result.error || !result.data ? "error" : "updated");
}

export async function startBuilderNetworkConversationAction(
  formData: FormData,
) {
  const parsed = builderNetworkConversationSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
  });
  if (!parsed.success) worldResult("error");
  const result = await runBuilderNetworkRpc(
    "start_stage29_builder_network_conversation",
    { target_user_id_input: parsed.data.targetUserId },
  );
  if (result.error || typeof result.data !== "string") worldResult("error");
  redirect(`/connect/messages/${result.data}`);
}

export async function sendBuilderNetworkMessageAction(formData: FormData) {
  const parsed = builderNetworkMessageSchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    const id = String(formData.get("conversationId") ?? "");
    messageResult(id, "error");
  }
  const result = await runBuilderNetworkRpc(
    "send_stage29_builder_network_message",
    {
      conversation_id_input: parsed.data.conversationId,
      body_input: parsed.data.body,
    },
  );
  messageResult(
    parsed.data.conversationId,
    result.error || !result.data ? "error" : "updated",
  );
}

export async function markBuilderNetworkConversationReadAction(
  formData: FormData,
) {
  const conversationId = String(formData.get("conversationId") ?? "");
  const parsed =
    builderNetworkMessageSchema.shape.conversationId.safeParse(conversationId);
  if (!parsed.success) messageResult(conversationId, "error");
  const result = await runBuilderNetworkRpc(
    "mark_stage29_builder_network_conversation_read",
    { conversation_id_input: parsed.data },
  );
  messageResult(parsed.data, result.error ? "error" : "updated");
}

export async function reportBuilderNetworkAction(formData: FormData) {
  const parsed = builderNetworkReportSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
    reasonCode: formData.get("reasonCode"),
    detail: formData.get("detail") ?? "",
    postId: formData.get("postId") ?? "",
    commentId: formData.get("commentId") ?? "",
    messageId: formData.get("messageId") ?? "",
  });
  if (!parsed.success) worldResult("error");
  const result = await runBuilderNetworkRpc(
    "report_stage29_builder_network_user",
    {
      target_user_id_input: parsed.data.targetUserId,
      reason_code_input: parsed.data.reasonCode,
      detail_input: parsed.data.detail || null,
      post_id_input: parsed.data.postId || null,
      comment_id_input: parsed.data.commentId || null,
      message_id_input: parsed.data.messageId || null,
    },
  );
  worldResult(result.error || !result.data ? "error" : "updated");
}

export async function setSchoolBuilderNetworkSettingsAction(
  formData: FormData,
) {
  const parsed = schoolBuilderNetworkSettingsSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    networkEnabled: formData.get("networkEnabled") === "on",
    crossSchoolEnabled: formData.get("crossSchoolEnabled") === "on",
    directMessagesEnabled: formData.get("directMessagesEnabled") === "on",
  });
  if (!parsed.success) redirect("/institution?status=error");
  const result = await runBuilderNetworkRpc(
    "set_stage29_school_network_settings",
    {
      workspace_id_input: parsed.data.workspaceId,
      network_enabled_input: parsed.data.networkEnabled,
      cross_school_enabled_input: parsed.data.networkEnabled
        ? parsed.data.crossSchoolEnabled
        : false,
      direct_messages_enabled_input: parsed.data.networkEnabled
        ? parsed.data.directMessagesEnabled
        : false,
    },
  );
  revalidatePath("/institution");
  revalidatePath("/institution/network");
  redirect(
    `/institution/network?workspace=${encodeURIComponent(parsed.data.workspaceId)}&status=${result.error ? "error" : "updated"}`,
  );
}
