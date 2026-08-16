import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import {
  humanPotentialProfileSectionKeys,
  type HumanPotentialProfileSectionKey,
} from "../domain/profile-contract";
import {
  profileEvolutionEvidenceSourceKeys,
  summarizeProfileEvolutionEvidence,
} from "../domain/profile-evolution";

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

  return {
    id: profile.id,
    version: profile.version,
    createdAt: profile.created_at,
    summary,
    sections: bySection,
  };
}

export async function getHumanPotentialProfileEvolutionReadiness(
  profileCreatedAt: string,
) {
  const { user } = await requireAuthenticatedIdentity();
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("evidence_records")
    .select("source_key")
    .eq("user_id", user.id)
    .eq("evidence_status", "eligible")
    .in("source_key", [...profileEvolutionEvidenceSourceKeys])
    .gt("captured_at", profileCreatedAt);

  if (error) {
    return {
      ready: false,
      completedProjects: 0,
      profileFeedback: 0,
      total: 0,
    };
  }

  return summarizeProfileEvolutionEvidence(
    (data ?? []).map((item) => item.source_key),
  );
}
