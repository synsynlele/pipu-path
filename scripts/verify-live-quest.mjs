import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// API proof only: never injects a session into a browser or targets an existing user.
if (process.env.QUEST_QA !== "create-disposable-fixture")
  throw new Error("Explicit disposable-fixture opt-in required");
const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
if (url.origin !== "https://kvjcswnmhwegpakbtvlh.supabase.co")
  throw new Error("Unexpected project");
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(
  url.origin,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  options,
);
const learner = createClient(
  url.origin,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  options,
);
const outsider = createClient(
  url.origin,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  options,
);
const users = [];
const checks = [];
const text =
  "Disposable QA fixture only; synthetic test content, not real developmental evidence.";
function check(name, passed) {
  checks.push({ name, passed });
  if (!passed) throw new Error(`Check failed: ${name}`);
}
async function must(result, step) {
  if (result.error)
    throw new Error(`${step}: ${result.error.code ?? "failed"}`);
  return result.data;
}
async function insert(table, row) {
  return must(await admin.from(table).insert(row).select("id").single(), table);
}
async function fixture(client) {
  const email = `pipupath-quest-qa-${randomUUID()}@example.test`;
  const password = `${randomUUID()}Aa1!`;
  const data = await must(
    await admin.auth.admin.createUser({ email, password, email_confirm: true }),
    "create fixture",
  );
  users.push(data.user.id);
  await must(
    await admin
      .from("profiles")
      .update({ age_band: "25_plus", display_name: "Disposable Quest QA" })
      .eq("id", data.user.id),
    "fixture profile",
  );
  await must(
    await client.auth.signInWithPassword({ email, password }),
    "fixture API sign-in",
  );
  return data.user.id;
}
async function owned(client, table, userId) {
  return must(
    await client.from(table).select("*").eq("user_id", userId),
    table,
  );
}
try {
  const userId = await fixture(learner);
  await fixture(outsider);
  const interpretation = await insert("interpretation_requests", {
    user_id: userId,
    question_set_version: 2,
    interpretation_schema_version: "qa",
    prompt_version: "qa",
    consent_policy_version: "qa",
    age_band: "25_plus",
    is_minor: false,
    idempotency_key: randomUUID(),
  });
  const profile = await insert("human_potential_profile_versions", {
    user_id: userId,
    version: 1,
    source_interpretation_request_id: interpretation.id,
    schema_version: "qa",
    status: "active",
  });
  const missionRequest = await insert("mission_generation_requests", {
    user_id: userId,
    human_potential_profile_id: profile.id,
    generation_kind: "initial",
    prompt_version: "qa",
    status: "completed",
  });
  const mission = await insert("user_missions", {
    user_id: userId,
    human_potential_profile_id: profile.id,
    generation_request_id: missionRequest.id,
    title: "Disposable QA mission",
    mission_statement: text,
    why_this_fits: text,
    who_this_helps: "QA only",
    first_meaningful_outcome: text,
    time_horizon: "two_weeks",
    success_signal: text,
    current_caution: text,
    profile_evidence_refs: [randomUUID(), randomUUID()],
    status: "active",
    model: "fixture",
    prompt_version: "qa",
  });
  const journeyRequest = await insert("journey_generation_requests", {
    user_id: userId,
    mission_id: mission.id,
    generation_kind: "initial",
    prompt_version: "qa",
    status: "completed",
  });
  const journey = await insert("user_journeys", {
    user_id: userId,
    mission_id: mission.id,
    generation_request_id: journeyRequest.id,
    title: "Disposable QA journey",
    summary: text,
    target_outcome: text,
    suggested_duration: "two_weeks",
    status: "active",
    model: "fixture",
    prompt_version: "qa",
  });
  const milestone = await insert("journey_milestones", {
    journey_id: journey.id,
    title: "Disposable QA milestone",
    purpose: text,
    expected_outcome: text,
    suggested_duration: "one week",
    capabilities_to_develop: ["Testing"],
    completion_signal: text,
    resource_note: text,
    sequence_order: 1,
    status: "available",
  });
  const request = await insert("quest_generation_requests", {
    user_id: userId,
    journey_id: journey.id,
    milestone_id: milestone.id,
    prompt_version: "qa",
    status: "completed",
  });
  const quests = [];
  for (let sequence = 1; sequence <= 3; sequence++) {
    quests.push(
      await insert("user_quests", {
        user_id: userId,
        journey_id: journey.id,
        milestone_id: milestone.id,
        generation_request_id: request.id,
        title: `Disposable QA Quest ${sequence}`,
        real_world_outcome: text,
        why_it_matters: text,
        estimated_minutes: 15,
        action_steps: [text, text, text],
        resources_needed: [],
        low_resource_alternative: text,
        evidence_requirements: [text],
        safety_guidance: text,
        completion_criteria: text,
        reflection_prompts: [text, text, text, text],
        sequence_order: sequence,
        status: sequence === 1 ? "available" : "locked",
      }),
    );
  }
  const questId = quests[0].id;
  const complete = {
    quest_id_input: questId,
    what_i_did_input: text,
    what_happened_input: text,
    what_i_learned_input: text,
    what_i_will_change_input: text,
    nortnspoil_reflection_input: text,
  };
  check(
    "foreign_quest_hidden",
    (await owned(outsider, "user_quests", userId)).length === 0,
  );
  const foreignStart = await outsider.rpc("start_stage7_quest", {
    quest_id_input: questId,
  });
  check("foreign_start_denied", Boolean(foreignStart.error));
  const lockedStart = await learner.rpc("start_stage7_quest", {
    quest_id_input: quests[1].id,
  });
  check("locked_start_denied", Boolean(lockedStart.error));
  await must(
    await learner.rpc("start_stage7_quest", { quest_id_input: questId }),
    "start",
  );
  check(
    "start_awards_no_xp",
    (await owned(learner, "builder_xp_transactions", userId)).length === 0,
  );
  const premature = await learner.rpc("complete_stage7_quest", complete);
  check("completion_without_evidence_denied", Boolean(premature.error));
  const invalid = await learner.rpc("submit_stage7_quest_evidence", {
    quest_id_input: questId,
    evidence_text_input: "short",
  });
  check("invalid_evidence_denied", Boolean(invalid.error));
  await must(
    await learner.rpc("submit_stage7_quest_evidence", {
      quest_id_input: questId,
      evidence_text_input: text,
    }),
    "evidence",
  );
  check(
    "evidence_persisted",
    (await owned(learner, "quest_evidence", userId)).length === 1,
  );
  check(
    "evidence_awards_no_xp",
    (await owned(learner, "builder_xp_transactions", userId)).length === 0,
  );
  check(
    "foreign_evidence_hidden",
    (await owned(outsider, "quest_evidence", userId)).length === 0,
  );
  const badReflection = await learner.rpc("complete_stage7_quest", {
    ...complete,
    what_i_learned_input: "short",
  });
  check("invalid_reflection_denied", Boolean(badReflection.error));
  await must(await learner.rpc("complete_stage7_quest", complete), "complete");
  await must(
    await learner.rpc("complete_stage7_quest", complete),
    "repeat complete",
  );
  const xp = await owned(learner, "builder_xp_transactions", userId);
  check("exactly_once_50_xp", xp.length === 1 && xp[0].amount === 50);
  check(
    "one_reflection",
    (await owned(learner, "quest_reflections", userId)).length === 1,
  );
  const saved = await owned(learner, "user_quests", userId);
  check(
    "completed_persisted",
    saved.find((q) => q.id === questId)?.status === "completed",
  );
  check(
    "next_quest_unlocked",
    saved.find((q) => q.id === quests[1].id)?.status === "available",
  );
  check(
    "later_quest_stays_locked",
    saved.find((q) => q.id === quests[2].id)?.status === "locked",
  );
  await must(
    await learner.rpc("start_stage7_quest", { quest_id_input: quests[1].id }),
    "start next",
  );
  check(
    "next_quest_starts",
    (await owned(learner, "user_quests", userId)).find(
      (q) => q.id === quests[1].id,
    )?.status === "active",
  );
} finally {
  // Fixture IDs exist only in this invocation; FK-safe cleanup, no existing targets accepted.
  for (const userId of users) {
    for (const table of [
      "builder_xp_transactions",
      "quest_reflections",
      "quest_evidence",
      "user_quests",
      "quest_generation_requests",
      "user_journeys",
      "journey_generation_requests",
      "user_missions",
      "mission_generation_requests",
      "human_potential_profile_versions",
      "interpretation_requests",
    ])
      await must(
        await admin.from(table).delete().eq("user_id", userId),
        `cleanup ${table}`,
      );
    await must(await admin.auth.admin.deleteUser(userId), "cleanup Auth");
    const remaining = await admin.auth.admin.getUserById(userId);
    check("fixture_auth_removed", !remaining.data.user);
  }
  console.log(
    JSON.stringify({ kind: "live learner API proof; not browser E2E", checks }),
  );
}
