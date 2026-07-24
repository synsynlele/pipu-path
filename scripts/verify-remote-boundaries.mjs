import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Supabase public environment is missing.");

const settings = await fetch(`${url}/auth/v1/settings`, {
  headers: { apikey: key },
});
console.log(
  JSON.stringify({ check: "auth_settings_reachable", passed: settings.ok }),
);
const auth = settings.ok ? await settings.json() : {};
console.log(
  JSON.stringify({
    check: "email_signup_enabled",
    passed: auth.disable_signup === false,
  }),
);
console.log(
  JSON.stringify({
    check: "google_provider_enabled",
    passed: Boolean(auth.external?.google),
  }),
);

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const result = await client
  .from("profiles")
  .select("*", { count: "exact", head: true });
const denied = Boolean(result.error) || result.count === 0;
console.log(
  JSON.stringify({
    check: "anonymous_private_profiles_denied",
    passed: denied,
    visible_row_count: result.count,
    error_code: result.error?.code ?? null,
  }),
);
if (!settings.ok || !denied) process.exitCode = 1;
