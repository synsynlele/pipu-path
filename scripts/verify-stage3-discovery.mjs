import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

nextEnv.loadEnvConfig(process.cwd());
for (const key of [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
]) {
  if (!process.env[key]) throw new Error(`Missing required variable: ${key}`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const checks = [];
const createdUsers = [];
const check = (name, passed) => checks.push({ name, passed });
const userClient = () =>
  createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

async function createFixture(label, ageBand) {
  const email = `stage3-${label}-${crypto.randomUUID()}@example.test`;
  const password = `Stage3-${crypto.randomUUID()}!`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) throw error ?? new Error("Fixture creation failed");
  createdUsers.push(data.user.id);
  const profile = await admin
    .from("profiles")
    .update({ age_band: ageBand, onboarding_status: "stage_3_ready" })
    .eq("id", data.user.id);
  if (profile.error) throw profile.error;
  const client = userClient();
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error) throw login.error;
  return { client, id: data.user.id };
}

try {
  const a = await createFixture("a", "16_17");
  console.log("fixture_a_ready");
  const b = await createFixture("b", "25_plus");
  console.log("fixture_b_ready");
  const aStart = await a.client.rpc("start_or_resume_discovery");
  const bStart = await b.client.rpc("start_or_resume_discovery");
  console.log("sessions_started");
  check("users_start_sessions", !aStart.error && !bStart.error);

  const aSessionId = aStart.data;
  const staleSave = await a.client.rpc("save_discovery_response", {
    session_id_input: aSessionId,
    question_key_input: "current_focus",
    text_response_input: null,
    selected_options_input: ["School or study"],
    numeric_response_input: null,
    skip_input: false,
    expected_version_input: 0,
  });
  check(
    "stale_save_rejected_without_retry_loop",
    staleSave.error?.message?.includes("DISCOVERY_SAVE_CONFLICT") === true,
  );

  const earlyReview = await b.client.rpc("open_discovery_review", {
    session_id_input: bStart.data,
    expected_version_input: 1,
  });
  check(
    "review_rejects_missing_required_answers",
    earlyReview.error?.message?.includes(
      "DISCOVERY_REQUIRED_RESPONSE_MISSING",
    ) === true,
  );

  const questionResult = await a.client
    .from("discovery_questions")
    .select("*")
    .order("display_order");
  if (questionResult.error) throw questionResult.error;
  const questions = questionResult.data;
  check(
    "age_filter_youth",
    questions.some((q) => q.stable_key === "learning_support") &&
      !questions.some((q) => q.stable_key === "adult_resources"),
  );

  let version = 1;
  for (const question of questions) {
    const skip = !question.is_required && question.sensitivity === "sensitive";
    const options = Array.isArray(question.option_definitions)
      ? question.option_definitions
      : [];
    const response = await a.client.rpc("save_discovery_response", {
      session_id_input: aSessionId,
      question_key_input: question.stable_key,
      text_response_input:
        !skip && question.response_type === "reflection"
          ? `Synthetic evidence for ${question.stable_key}.`
          : null,
      selected_options_input:
        !skip &&
        ["single_select", "multi_select"].includes(question.response_type)
          ? [options[0]]
          : null,
      numeric_response_input:
        !skip && question.response_type === "scale" ? question.min_scale : null,
      skip_input: skip,
      expected_version_input: version,
    });
    if (response.error) throw response.error;
    version = response.data;
  }
  console.log("responses_saved");
  check(
    "responses_saved_and_optional_skipped",
    version === questions.length + 1,
  );

  const ownResponses = await a.client
    .from("discovery_responses")
    .select("id")
    .eq("session_id", aSessionId);
  check(
    "all_eligible_answers_persisted",
    !ownResponses.error && ownResponses.data.length === questions.length,
  );
  const crossSessions = await a.client
    .from("discovery_sessions")
    .select("id")
    .eq("user_id", b.id);
  const crossResponses = await a.client
    .from("discovery_responses")
    .select("id")
    .eq("user_id", b.id);
  check(
    "cross_user_data_hidden",
    !crossSessions.error &&
      crossSessions.data.length === 0 &&
      !crossResponses.error &&
      crossResponses.data.length === 0,
  );

  const review = await a.client.rpc("open_discovery_review", {
    session_id_input: aSessionId,
    expected_version_input: version,
  });
  check("review_transition", !review.error);
  const completion = await a.client.rpc("complete_discovery", {
    session_id_input: aSessionId,
    expected_version_input: review.data,
  });
  check("completion_transition", !completion.error);
  console.log("completion_requested");

  const [completedSession, checkpoint] = await Promise.all([
    a.client
      .from("discovery_sessions")
      .select("status, progress_percent, stage_4_processing_status")
      .eq("id", aSessionId)
      .single(),
    a.client
      .from("onboarding_checkpoints")
      .select("discovery_status, discovery_resume_path")
      .eq("user_id", a.id)
      .single(),
  ]);
  check(
    "completion_persisted",
    completedSession.data?.status === "completed" &&
      completedSession.data.progress_percent === 100 &&
      completedSession.data.stage_4_processing_status === "ready_for_stage_4",
  );
  check(
    "checkpoint_handoff_persisted",
    checkpoint.data?.discovery_status === "completed" &&
      checkpoint.data.discovery_resume_path ===
        "/onboarding/discovery/complete",
  );

  const resumeCompleted = await a.client.rpc("start_or_resume_discovery");
  check(
    "completed_start_is_idempotent",
    !resumeCompleted.error && resumeCompleted.data === aSessionId,
  );
} finally {
  console.log("fixture_cleanup_started");
  await Promise.all(
    createdUsers.map((userId) => admin.auth.admin.deleteUser(userId)),
  );
  console.log("fixture_cleanup_finished");
}

const report = JSON.stringify(checks);
console.log(report);
if (process.env.STAGE3_VERIFICATION_OUTPUT)
  writeFileSync(process.env.STAGE3_VERIFICATION_OUTPUT, report);
if (checks.some((item) => !item.passed)) process.exitCode = 1;
