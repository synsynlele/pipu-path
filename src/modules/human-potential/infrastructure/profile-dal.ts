import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  humanPotentialProfileSectionKeys,
  type HumanPotentialProfileSectionKey,
} from "../domain/profile-contract";

type ProfileInsight = {
  id: string;
  section: HumanPotentialProfileSectionKey;
  title: string;
  summary: string;
  description: string;
  confidence: string;
  feedback: {
    type: "confirmed" | "partly_true" | "not_true";
    comment: string | null;
  } | null;
};

export async function getCurrentHumanPotentialProfile() {
  const { user } = await requireAuthenticatedIdentity();
  const client = await createServerSupabaseClient();
  const { data: profile } = await client
    .from("human_potential_profile_versions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!profile) return null;

  const [{ data: insights }, { data: feedback }] = await Promise.all([
    client
      .from("potential_insights")
      .select("*")
      .eq("user_id", user.id)
      .eq("interpretation_request_id", profile.source_interpretation_request_id)
      .eq("status", "active")
      .order("created_at"),
    client.from("insight_user_feedback").select("*").eq("user_id", user.id),
  ]);

  const feedbackByInsight = new Map<
    string,
    {
      type: "confirmed" | "partly_true" | "not_true";
      comment: string | null;
    }
  >();
  for (const item of [...(feedback ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )) {
    if (
      item.feedback_type !== "confirmed" &&
      item.feedback_type !== "partly_true" &&
      item.feedback_type !== "not_true"
    ) {
      continue;
    }
    if (!feedbackByInsight.has(item.insight_id)) {
      feedbackByInsight.set(item.insight_id, {
        type: item.feedback_type,
        comment: item.reason,
      });
    }
  }

  const bySection = Object.fromEntries(
    humanPotentialProfileSectionKeys.map((key) => [
      key,
      [] as ProfileInsight[],
    ]),
  ) as Record<HumanPotentialProfileSectionKey, ProfileInsight[]>;

  for (const insight of insights ?? []) {
    const metadata = insight.metadata;
    const section =
      typeof metadata === "object" &&
      metadata !== null &&
      "profile_section" in metadata &&
      typeof metadata.profile_section === "string" &&
      humanPotentialProfileSectionKeys.includes(
        metadata.profile_section as HumanPotentialProfileSectionKey,
      )
        ? (metadata.profile_section as HumanPotentialProfileSectionKey)
        : null;
    if (!section) continue;
    bySection[section].push({
      id: insight.id,
      section,
      title: insight.title,
      summary: insight.summary,
      description: insight.description,
      confidence: insight.confidence_level,
      feedback: feedbackByInsight.get(insight.id) ?? null,
    });
  }

  const profileMetadata = profile.metadata;
  const summary =
    typeof profileMetadata === "object" &&
    profileMetadata !== null &&
    "summary" in profileMetadata &&
    typeof profileMetadata.summary === "string"
      ? profileMetadata.summary
      : "";
  const generationMode =
    typeof profileMetadata === "object" &&
    profileMetadata !== null &&
    "generation_mode" in profileMetadata &&
    (profileMetadata.generation_mode === "openai" ||
      profileMetadata.generation_mode === "evidence_fallback")
      ? profileMetadata.generation_mode
      : null;
  const fallbackReason =
    typeof profileMetadata === "object" &&
    profileMetadata !== null &&
    "fallback_reason" in profileMetadata &&
    typeof profileMetadata.fallback_reason === "string"
      ? profileMetadata.fallback_reason
      : null;

  return {
    id: profile.id,
    createdAt: profile.created_at,
    summary,
    generationMode,
    fallbackReason,
    sections: bySection,
  };
}
