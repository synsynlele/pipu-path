import { createClient } from "@supabase/supabase-js";

export default async function globalSetup() {
  if (process.env.E2E_STAGE3_EMAIL && process.env.E2E_STAGE3_PASSWORD) return;

  const url = process.env.E2E_SUPABASE_URL;
  const serviceKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return;

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `stage3-browser-${crypto.randomUUID()}@example.test`;
  const password = `Stage3-${crypto.randomUUID()}!`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user)
    throw error ?? new Error("Could not create the Stage 3 browser fixture.");

  const profile = await admin
    .from("profiles")
    .update({ age_band: "25_plus", onboarding_status: "stage_3_ready" })
    .eq("id", data.user.id);
  const checkpoint = await admin
    .from("onboarding_checkpoints")
    .update({
      current_step: "completed",
      status: "completed",
      resume_path: "/app",
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", data.user.id);
  if (profile.error || checkpoint.error) {
    await admin.auth.admin.deleteUser(data.user.id);
    throw profile.error ?? checkpoint.error;
  }

  process.env.E2E_STAGE3_EMAIL = email;
  process.env.E2E_STAGE3_PASSWORD = password;

  return async () => {
    await admin.auth.admin.deleteUser(data.user.id);
  };
}
