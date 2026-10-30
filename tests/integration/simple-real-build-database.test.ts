import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
const migration = readFileSync(
  "supabase/migrations/20261030080345_simple_real_world_builds.sql",
  "utf8",
);
const progression = readFileSync(
  "supabase/migrations/20261030110000_real_build_progressive_difficulty.sql",
  "utf8",
);
it("enforces private ownership, service-only mutations, one current attempt, honest completion constraints and leases in PostgreSQL", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create schema auth; create schema storage; create role anon;create role authenticated;create role service_role bypassrls;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table public.account_deletion_jobs(request_id uuid,state text,phase text,lease_token uuid,lease_until timestamptz,target_user_id uuid,updated_at timestamptz,completed_at timestamptz);`,
    );
    await db.exec(migration);
    await db.exec(progression);
    const user = "10000000-0000-4000-8000-000000000001",
      other = "20000000-0000-4000-8000-000000000002",
      template = "30000000-0000-4000-8000-000000000003",
      attempt = "40000000-0000-4000-8000-000000000004";
    await db.exec(
      `insert into auth.users values('${user}'),('${other}');set role service_role;insert into public.real_build_templates(id,topic,minutes,challenge)values('${template}','school',30,'{}');insert into public.real_build_attempts(id,user_id,template_id,topic,minutes,challenge)values('${attempt}','${user}','${template}','school',30,'{}');`,
    );
    await expect(
      db.exec(
        `insert into public.real_build_attempts(user_id,template_id,topic,minutes,challenge)values('${user}','${template}','school',30,'{}')`,
      ),
    ).rejects.toThrow(/duplicate/);
    await db.exec(`reset role;set role anon;`);
    await expect(
      db.query("select * from public.real_build_attempts"),
    ).rejects.toThrow(/permission denied/);
    await db.exec(
      `reset role;set role authenticated;select set_config('request.jwt.claim.sub','${other}',false);`,
    );
    expect(
      (await db.query("select * from public.real_build_attempts")).rows,
    ).toHaveLength(0);
    await db.exec(
      `select set_config('request.jwt.claim.sub','${user}',false);`,
    );
    expect(
      (await db.query("select * from public.real_build_attempts")).rows,
    ).toHaveLength(1);
    await expect(
      db.exec(`update public.real_build_attempts set status='recorded'`),
    ).rejects.toThrow(/permission denied/);
    await expect(
      db.query(
        `select public.claim_real_build_generation('school:30',gen_random_uuid())`,
      ),
    ).rejects.toThrow(/permission denied/);
    await db.exec("reset role;set role service_role;");
    await expect(
      db.exec(
        `update public.real_build_attempts set status='recorded',recorded_at=now(),draft='{}'`,
      ),
    ).rejects.toThrow(/check constraint/);
    const draft = JSON.stringify({
      evidence: "I tried my paper tracker and it confused my classmate.",
      link: "",
      reflection: "The labels needed a clear example.",
      nextChange: "I will add one example.",
      outcome: "not_yet",
    });
    await db.query(
      `update public.real_build_attempts set status='recorded',recorded_at=now(),draft=$1 where id=$2`,
      [draft, attempt],
    );
    const afterUnsuccessful = await db.query<{ difficulty: number }>(
      `select public.next_real_build_difficulty('${user}','school') as difficulty`,
    );
    expect(afterUnsuccessful.rows[0].difficulty).toBe(1);
    await db.exec(
      `insert into public.real_build_attempts(user_id,template_id,topic,minutes,challenge)values('${user}','${template}','school',30,'{}')`,
    );
    expect(
      (
        await db.query(
          `select * from public.find_unseen_real_build_template('${user}','school',30)`,
        )
      ).rows,
    ).toHaveLength(0);
    // Only the matching difficulty is eligible for a learner's next Quest.
    const secondTemplate = "50000000-0000-4000-8000-000000000005";
    await db.exec(
      `insert into public.real_build_templates(id,topic,minutes,challenge,difficulty)
       values('${secondTemplate}','school',30,'{}',2)`,
    );
    expect(
      (
        await db.query(
          `select * from public.find_unseen_real_build_template_level('${user}','school',30,1)`,
        )
      ).rows,
    ).toHaveLength(0);
    expect(
      (
        await db.query(
          `select * from public.find_unseen_real_build_template_level('${user}','school',30,2)`,
        )
      ).rows,
    ).toHaveLength(1);
    expect(
      (
        await db.query(
          `select * from public.find_unseen_real_build_template('${other}','school',30)`,
        )
      ).rows,
    ).toHaveLength(1);
    // A reported successful follow-up contributes to a harder future Quest.
    const worked = JSON.stringify({
      ...JSON.parse(draft),
      outcome: "worked",
    });
    await db.query(
      `update public.real_build_attempts set status='recorded', recorded_at=now(), draft=$1 where user_id=$2 and status='active'`,
      [worked, user],
    );
    const afterSuccessful = await db.query<{ difficulty: number }>(
      `select public.next_real_build_difficulty('${user}','school') as difficulty`,
    );
    expect(afterSuccessful.rows[0].difficulty).toBe(2);
    const first = await db.query<{ claimed: boolean }>(
        "select public.claim_real_build_generation('school:30',gen_random_uuid()) claimed",
      ),
      second = await db.query<{ claimed: boolean }>(
        "select public.claim_real_build_generation('school:30',gen_random_uuid()) claimed",
      );
    expect(first.rows[0].claimed).toBe(true);
    expect(second.rows[0].claimed).toBe(false);
    for (let i = 0; i < 3; i++)
      expect(
        (
          await db.query<{ id: string }>(
            `select public.begin_real_build_request('${user}') id`,
          )
        ).rows[0].id,
      ).toBeTruthy();
    expect(
      (
        await db.query<{ id: string | null }>(
          `select public.begin_real_build_request('${user}') id`,
        )
      ).rows[0].id,
    ).toBeNull();
    await db.exec(`reset role;delete from auth.users where id='${user}'`);
    expect(
      (await db.query("select * from public.real_build_attempts")).rows,
    ).toHaveLength(0);
    expect(migration).toContain(
      "bucket_id in ('quest-evidence','real-build-evidence')",
    );
  } finally {
    await db.close();
  }
}, 15000);
