import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// Server-only provisioning. Creates its own target; accepts no existing user ID.
if (process.env.PRIVACY_HANDOVER !== "create-fixture")
  throw new Error("Explicit fixture creation opt-in required");
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
if (
  url.hostname !== "kvjcswnmhwegpakbtvlh.supabase.co" ||
  url.protocol !== "https:"
)
  throw new Error("Unexpected project");
const admin = createClient(url.origin, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const token = randomUUID();
const created = await admin.auth.admin.createUser({
  email: `pipupath-handover-${token}@example.test`,
  password: `${randomUUID()}Aa1!`,
  email_confirm: true,
});
if (created.error) throw new Error("Fixture Auth creation failed");
const userId = created.data.user.id;
// No password is retained: the existing operators, not this fixture, use the UI.
const profile = await admin
  .from("profiles")
  .update({
    age_band: "25_plus",
    display_name: "Disposable privacy handover fixture",
  })
  .eq("id", userId)
  .select("id")
  .single();
if (profile.error) throw new Error(`Fixture profile failed; recover ${userId}`);
const path = `${userId}/handover-${token}.png`;
const image = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  "base64",
);
const upload = await admin.storage
  .from("quest-evidence")
  .upload(path, image, { contentType: "image/png", upsert: false });
if (upload.error) throw new Error(`Fixture upload failed; recover ${userId}`);
const request = await admin
  .from("account_deletion_requests")
  .insert({ user_id: userId })
  .select("id")
  .single();
if (request.error) throw new Error(`Fixture request failed; recover ${userId}`);
console.log(
  JSON.stringify({
    userId,
    requestId: request.data.id,
    path,
    status: "pending",
    project: url.hostname,
  }),
);
