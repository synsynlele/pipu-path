import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

nextEnv.loadEnvConfig(process.cwd());
if (existsSync(".env.stage2-test-identities")) {
  for (const line of readFileSync(".env.stage2-test-identities", "utf8").split(
    /\r?\n/,
  )) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) process.env[match[1]] = match[2];
  }
}

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_PROJECT_ID",
  "TEST_USER_A_EMAIL",
  "TEST_USER_A_PASSWORD",
  "TEST_USER_B_EMAIL",
  "TEST_USER_B_PASSWORD",
];
for (const key of required) {
  if (!process.env[key])
    throw new Error(`Missing required test variable: ${key}`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function userClient() {
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const checks = [];
function check(name, passed, detail) {
  checks.push({ name, passed, ...(detail ? { detail } : {}) });
}

async function databaseQuery(query) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_ID}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  if (!response.ok) throw new Error("Staging fixture query failed.");
}

const a = userClient();
const b = userClient();
const escapedBEmail = process.env.TEST_USER_B_EMAIL.replaceAll("'", "''");
await databaseQuery(
  `update auth.users set email_confirmed_at = null where email = '${escapedBEmail}'`,
);
try {
  const beforeConfirmation = await b.auth.signInWithPassword({
    email: process.env.TEST_USER_B_EMAIL,
    password: process.env.TEST_USER_B_PASSWORD,
  });
  check(
    "login_before_confirmation_rejected",
    Boolean(beforeConfirmation.error),
  );
} finally {
  await databaseQuery(
    `update auth.users set email_confirmed_at = now() where email = '${escapedBEmail}'`,
  );
}
const aLogin = await a.auth.signInWithPassword({
  email: process.env.TEST_USER_A_EMAIL,
  password: process.env.TEST_USER_A_PASSWORD,
});
const bLogin = await b.auth.signInWithPassword({
  email: process.env.TEST_USER_B_EMAIL,
  password: process.env.TEST_USER_B_PASSWORD,
});
check("user_a_login_after_confirmation", !aLogin.error);
check("user_b_login_after_confirmation", !bLogin.error);
if (aLogin.error || bLogin.error) {
  console.log(JSON.stringify(checks));
  process.exit(1);
}

const aId = aLogin.data.user.id;
const bId = bLogin.data.user.id;
const own = await a.from("profiles").select("id").eq("id", aId);
const cross = await a.from("profiles").select("id").eq("id", bId);
check("user_a_reads_own_profile", !own.error && own.data.length === 1);
check("user_a_cannot_read_user_b", !cross.error && cross.data.length === 0);

const ownUpdate = await a
  .from("profiles")
  .update({ preferred_name: "Stage A" })
  .eq("id", aId);
check("user_a_updates_allowed_own_field", !ownUpdate.error);
const protectedUpdate = await a
  .from("profiles")
  .update({ account_status: "suspended" })
  .eq("id", aId);
check(
  "user_a_cannot_update_protected_field",
  protectedUpdate.error?.code === "42501",
);
const crossUpdate = await a
  .from("profiles")
  .update({ preferred_name: "Blocked" })
  .eq("id", bId)
  .select("id");
check(
  "user_a_cannot_update_user_b",
  !crossUpdate.error && crossUpdate.data.length === 0,
);
const deletion = await a.from("profiles").delete().eq("id", aId);
check("user_cannot_delete_profile", deletion.error?.code === "42501");

for (const [client, suffix] of [
  [a, "a"],
  [b, "b"],
]) {
  const checkpoint = await client.rpc("complete_identity_checkpoint", {
    preferred_name_input: `Stage ${suffix.toUpperCase()}`,
    username_input: `stage_builder_${suffix}`,
    age_band_input: "18_24",
    policy_version_input: "2026-07-24",
    accept_terms: true,
    accept_privacy: true,
    accept_ai: true,
  });
  check(`user_${suffix}_completes_identity_checkpoint`, !checkpoint.error);
}

const [preferences, consents, checkpoint] = await Promise.all([
  a.from("user_preferences").select("user_id").eq("user_id", aId),
  a.from("user_consents").select("id").eq("user_id", aId),
  a.from("onboarding_checkpoints").select("status").eq("user_id", aId).single(),
]);
check(
  "user_a_reads_own_preferences",
  !preferences.error && preferences.data.length === 1,
);
check(
  "user_a_reads_own_append_only_consents",
  !consents.error && consents.data.length === 4,
);
check(
  "identity_checkpoint_persisted",
  !checkpoint.error && checkpoint.data.status === "completed",
);

const refresh = await a.auth.refreshSession();
check(
  "session_refresh",
  !refresh.error && Boolean(refresh.data.session),
  refresh.error?.code,
);
const invalid = await userClient().auth.signInWithPassword({
  email: process.env.TEST_USER_A_EMAIL,
  password: "NotTheValidPassword!123",
});
check("invalid_credentials_rejected", Boolean(invalid.error));

const duplicate = await userClient().auth.signUp({
  email: process.env.TEST_USER_A_EMAIL,
  password: process.env.TEST_USER_A_PASSWORD,
});
check("duplicate_signup_creates_no_session", !duplicate.data.session);

const serviceRead = await admin.from("profiles").select("id");
check(
  "service_role_authorized_server_operation",
  !serviceRead.error && serviceRead.data.length === 2,
);

await a.auth.signOut();
const afterLogout = await a.auth.getSession();
check("logout_clears_session", !afterLogout.data.session);

console.log(JSON.stringify(checks));
if (checks.some((item) => !item.passed)) process.exitCode = 1;
