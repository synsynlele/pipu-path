import { PGlite } from "@electric-sql/pglite";
import { citext } from "@electric-sql/pglite/contrib/citext";
import { readFileSync, readdirSync } from "node:fs";
import { it } from "vitest";
import assert from "node:assert/strict";
const root = process.cwd();
const read = (p: string) => readFileSync(`${root}/${p}`, "utf8");
// A real embedded PostgreSQL engine, with an auth.uid/session shim.
// This verifies the identity/guardian subset, not a full hosted Supabase stack.
it("persists parent declarations without granting independent guardian or networking authority", async () => {
  const db = new PGlite({ extensions: { citext } });
  await db.exec(
    `create schema auth; create schema extensions; create role anon; create role authenticated; create role service_role; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$; grant usage on schema auth to authenticated, anon; grant execute on function auth.uid() to authenticated, anon;`,
  );
  for (const file of [
    "202607240001_stage_2_identity.sql",
    "202607240002_harden_identity_grants.sql",
    "202607240003_harden_identity_functions.sql",
  ])
    await db.exec(read(`supabase/migrations/${file}`));
  const guardian = read(
    "supabase/migrations/20261010160000_guardian_authorization_and_minor_ai_gate.sql",
  );
  await db.exec(
    guardian.slice(
      0,
      guardian.indexOf(
        "create or replace function public.ensure_guardian_authorization_request()",
      ),
    ),
  );
  const file = readdirSync(`${root}/supabase/migrations`).find((x) =>
    x.endsWith("_parent_on_device_private_learning.sql"),
  );
  await db.exec(read(`supabase/migrations/${file}`));
  const child = "10000000-0000-0000-0000-000000000001",
    other = "20000000-0000-0000-0000-000000000002",
    adult = "30000000-0000-0000-0000-000000000003";
  for (const id of [child, other, adult])
    await db.exec(
      `insert into auth.users values ('${id}'); update public.profiles set age_band='${id === adult ? "25_plus" : "13_15"}' where id='${id}'; update public.onboarding_checkpoints set status='completed', completed_at=now(), resume_path='/app' where user_id='${id}';`,
    );
  const asUser = async (id: string) =>
    db.exec(
      `reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`,
    );
  const status = async () =>
    (
      await db.query<{ status: string }>(
        `select public.get_guardian_authorization_state()->>'status' as status`,
      )
    ).rows[0]?.status;
  const grant = `select public.record_parent_learning_attestation('Parent Example','parent',true)`;
  await db.exec("set role anon");
  await assert.rejects(db.exec(grant), /permission denied/);
  await asUser(child);
  await assert.rejects(
    db.exec(
      `select public.record_parent_learning_attestation('Parent Example','parent',false)`,
    ),
    /PARENT_DECLARATION_REQUIRED/,
  );
  await assert.rejects(
    db.exec(
      `select public.record_parent_learning_attestation('Parent Example','friend',true)`,
    ),
    /PARENT_DECLARATION_REQUIRED/,
  );
  await assert.rejects(
    db.exec(
      `insert into public.user_consents(user_id,consent_type,policy_version,status,source) values ('${child}','guardian_required','spoof','granted','guardian')`,
    ),
    /permission denied/,
  );
  assert.equal(await status(), "missing");
  await db.exec(grant);
  assert.equal(await status(), "parent_declared");
  await db.exec(grant);
  assert.equal(
    (
      await db.query<{ n: number }>(
        `select count(*)::int as n from public.user_consents where consent_type='guardian_required'`,
      )
    ).rows[0]?.n,
    1,
  );
  await asUser(other);
  assert.equal(await status(), "missing");
  await asUser(adult);
  await assert.rejects(db.exec(grant), /PARENT_MINOR_ACCOUNT_REQUIRED/);
  await asUser(child);
  await db.exec(
    `select public.withdraw_consent('guardian_required','2026-10-16-parent-device-v1')`,
  );
  assert.equal(await status(), "missing");
  await db.exec(grant);
  assert.equal(await status(), "parent_declared");
  await db.exec("reset role");
  assert.equal(
    (
      await db.query<{ allowed: boolean }>(
        `select private.guardian_authorization_granted('${child}') as allowed`,
      )
    ).rows[0]?.allowed,
    false,
  );
  assert.equal(
    (
      await db.query<{ n: number }>(
        `select count(*)::int as n from public.guardian_authorization_requests where minor_user_id='${child}' and school_network_enabled`,
      )
    ).rows[0]?.n,
    0,
  );
  await db.exec(
    `update public.profiles set account_status='suspended' where id='${other}';`,
  );
  await asUser(other);
  await assert.rejects(db.exec(grant), /PARENT_MINOR_ACCOUNT_REQUIRED/);

  await db.close();
}, 30_000);
