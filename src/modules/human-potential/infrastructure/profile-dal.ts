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
    createdAt: profile.created_at,
    summary,
    sections: bySection,
    feedback: feedback ?? [],
  };
}
