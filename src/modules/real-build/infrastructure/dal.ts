import "server-only";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";
import { buildServerClient, buildServiceClient } from "./client";
import { challengeSchema, draftSchema, type SavedBuild } from "../domain/build";
export async function getBuildHome(page = 0) {
  const { user, profile } = await requireAuthenticatedIdentity();
  const client = await buildServerClient();
  const [current, history] = await Promise.all([
    client
      .from("real_build_attempts")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
    client
      .from("real_build_attempts")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "active")
      .order("created_at", { ascending: false })
      .range(page * 30, page * 30 + 29),
  ]);
  if (current.error || history.error) throw new Error("BUILD_LOAD_FAILED");
  return {
    name: profile.preferred_name,
    current: current.data as SavedBuild | null,
    history: (history.data ?? []) as SavedBuild[],
  };
}
export async function getOwnedBuild(id: string) {
  const { user } = await requireAuthenticatedIdentity();
  const client = await buildServerClient();
  const { data, error } = await client
    .from("real_build_attempts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("BUILD_LOAD_FAILED");
  if (!data) return null;
  const challenge = challengeSchema.parse(data.challenge),
    draft = draftSchema.parse(data.draft);
  // Signed URLs are short lived and only created after the owned row check.
  const image = data.image_path
    ? await buildServiceClient()
        .storage.from("real-build-evidence")
        .createSignedUrl(data.image_path, 300)
    : null;
  const previous = data.previous_attempt_id
    ? await client
        .from("real_build_attempts")
        .select("draft")
        .eq("id", data.previous_attempt_id)
        .eq("user_id", user.id)
        .maybeSingle()
    : null;
  if (previous?.error) throw new Error("BUILD_LOAD_FAILED");
  return {
    improvement: previous?.data?.draft.nextChange ?? null,
    build: { ...data, challenge, draft } as SavedBuild,
    imageUrl: image?.data?.signedUrl ?? null,
  };
}
