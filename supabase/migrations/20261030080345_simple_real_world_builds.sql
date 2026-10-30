-- Additive replacement experience. Previous work is preserved.
create table public.real_build_templates (
 id uuid primary key default gen_random_uuid(),
 topic text not null, minutes integer not null check (minutes in (15,30,60)),
 challenge jsonb not null check (jsonb_typeof(challenge) = 'object'),
 source text not null default 'openai' check (source = 'openai'),
 created_at timestamptz not null default now()
);
create index real_build_templates_lookup on public.real_build_templates(topic,minutes,created_at desc);
alter table public.real_build_templates enable row level security;
revoke all on public.real_build_templates from public,anon,authenticated;
grant select on public.real_build_templates to authenticated;
grant all on public.real_build_templates to service_role;
create policy real_build_templates_read on public.real_build_templates for select to authenticated using (true);

create table public.real_build_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 template_id uuid not null references public.real_build_templates(id),
 previous_attempt_id uuid references public.real_build_attempts(id) on delete set null,
 topic text not null, minutes integer not null check (minutes in (15,30,60)),
 challenge jsonb not null check (jsonb_typeof(challenge) = 'object'),
 source text not null default 'openai' check (source = 'openai'),
 status text not null default 'active' check (status in ('active','recorded','archived')),
 draft jsonb not null check (jsonb_typeof(draft)='object' and draft ?& array['evidence','link','reflection','nextChange','outcome']) default '{"evidence":"","link":"","reflection":"","nextChange":"","outcome":""}'::jsonb,
 image_path text check (image_path is null or image_path like user_id::text || '/' || id::text || '/%'),
 version integer not null default 1 check(version > 0),
 created_at timestamptz not null default now(), recorded_at timestamptz,
 constraint real_build_recorded_evidence check (status <> 'recorded' or (
   recorded_at is not null and length(btrim(draft->>'evidence')) >= 20 and
   length(btrim(draft->>'reflection')) >= 10 and length(btrim(draft->>'nextChange')) >= 10 and
   draft->>'outcome' in ('worked','partly','not_yet')) is true)
);
create unique index real_build_one_current on public.real_build_attempts(user_id) where status='active';
create index real_build_owner_history on public.real_build_attempts(user_id,created_at desc);
create index real_build_previous_fk on public.real_build_attempts(previous_attempt_id);
create index real_build_template_fk on public.real_build_attempts(template_id);
alter table public.real_build_attempts enable row level security;
revoke all on public.real_build_attempts from public,anon,authenticated;
grant select on public.real_build_attempts to authenticated;
grant all on public.real_build_attempts to service_role;
create policy real_build_owner_read on public.real_build_attempts for select to authenticated using ((select auth.uid())=user_id);
-- Writes are server-only after current identity/guardian checks. No client mutations or XP triggers.
create table public.real_build_generation_leases (
 cache_key text primary key, token uuid not null, expires_at timestamptz not null
);
alter table public.real_build_generation_leases enable row level security;
revoke all on public.real_build_generation_leases from public,anon,authenticated;
grant all on public.real_build_generation_leases to service_role;
create function public.claim_real_build_generation(key_input text, token_input uuid) returns boolean
language sql security invoker set search_path = '' as $$
 with claimed as (
 insert into public.real_build_generation_leases(cache_key,token,expires_at)
 values(key_input,token_input,now()+interval '55 seconds')
 on conflict(cache_key) do update set token=excluded.token,expires_at=excluded.expires_at
 where public.real_build_generation_leases.expires_at < now()
 returning 1) select exists(select 1 from claimed);
$$;
revoke all on function public.claim_real_build_generation(text,uuid) from public,anon,authenticated;
grant execute on function public.claim_real_build_generation(text,uuid) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('real-build-evidence','real-build-evidence',false,3145728,array['image/jpeg','image/png','image/webp']);
-- The server writes and signs only owner-checked objects. No direct browser storage grants.

-- Include service-uploaded private photos in the existing deletion worker.
create or replace function public.account_deletion_storage_batch(request_id_input uuid, lease_token_input uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare j public.account_deletion_jobs%rowtype; files jsonb;
begin
  select * into j from public.account_deletion_jobs where request_id=request_id_input for update;
  if not found or j.state<>'processing' or j.phase not in ('database','storage') or j.lease_token is distinct from lease_token_input or j.lease_until<=now() then raise exception 'PRIVACY_JOB_LEASE_INVALID'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('bucket',bucket_id,'path',name)),'[]') into files
  from (select bucket_id,name from storage.objects where owner_id=j.target_user_id::text or owner=j.target_user_id
    or (bucket_id in ('quest-evidence','real-build-evidence') and split_part(name,'/',1)=j.target_user_id::text) order by bucket_id,name limit 100) batch;
  update public.account_deletion_jobs set phase='storage',updated_at=now(),lease_until=now()+interval '10 minutes' where request_id=j.request_id;
  return files;
end; $$;

create or replace function public.finish_account_deletion_job(request_id_input uuid, lease_token_input uuid)
returns void language plpgsql security definer set search_path='' as $$
declare j public.account_deletion_jobs%rowtype; ref record; remains boolean;
begin
  select * into j from public.account_deletion_jobs where request_id=request_id_input for update;
  if not found or j.state<>'processing' or j.phase<>'storage' or j.lease_token is distinct from lease_token_input or j.lease_until<=now() then raise exception 'PRIVACY_JOB_LEASE_INVALID'; end if;
  if exists(select 1 from auth.users where id=j.target_user_id)
    or exists(select 1 from storage.objects where owner_id=j.target_user_id::text or owner=j.target_user_id or (bucket_id in ('quest-evidence','real-build-evidence') and split_part(name,'/',1)=j.target_user_id::text))
  then raise exception 'PRIVACY_DELETION_NOT_VERIFIED'; end if;
  for ref in select distinct n.nspname as schema_name,t.relname as table_name,a.attname as column_name
    from pg_catalog.pg_constraint c join pg_catalog.pg_class t on t.oid=c.conrelid join pg_catalog.pg_namespace n on n.oid=t.relnamespace
    cross join lateral unnest(c.conkey) k(attnum) join pg_catalog.pg_attribute a on a.attrelid=t.oid and a.attnum=k.attnum
    where c.contype='f' and n.nspname='public' and c.confrelid in ('auth.users'::regclass,'public.profiles'::regclass)
  loop
    execute format('select exists(select 1 from %I.%I where %I=$1)',ref.schema_name,ref.table_name,ref.column_name) into remains using j.target_user_id;
    if remains then raise exception 'PRIVACY_DELETION_NOT_VERIFIED'; end if;
  end loop;
  update public.account_deletion_requests set status='fulfilled',fulfilled_at=now() where id=j.request_id;
  update public.account_deletion_jobs set state='fulfilled',phase='verified',target_user_id=null,lease_token=null,lease_until=null,completed_at=now(),updated_at=now() where request_id=j.request_id;
end; $$;


-- Count failed authoring requests too, so repeated failures cannot create unbounded spend.
create table public.real_build_generation_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 requested_at timestamptz not null default now()
);
create index real_build_generation_owner_time on public.real_build_generation_requests(user_id,requested_at desc);
alter table public.real_build_generation_requests enable row level security;
revoke all on public.real_build_generation_requests from public,anon,authenticated;
grant all on public.real_build_generation_requests to service_role;
create function public.begin_real_build_request(user_input uuid) returns uuid
language plpgsql security invoker set search_path='' as $$
declare request_id uuid;
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(user_input::text,0));
 if (select count(*) from public.real_build_generation_requests where user_id=user_input and requested_at>now()-interval '15 minutes')>=3
 or (select count(*) from public.real_build_generation_requests where user_id=user_input and requested_at>now()-interval '24 hours')>=20 then
 return null;
 end if;
 insert into public.real_build_generation_requests(user_id) values(user_input) returning id into request_id;
 return request_id;
end; $$;
revoke all on function public.begin_real_build_request(uuid) from public,anon,authenticated;
grant execute on function public.begin_real_build_request(uuid) to service_role;
revoke all on function public.account_deletion_storage_batch(uuid,uuid),public.finish_account_deletion_job(uuid,uuid) from public,anon,authenticated;
grant execute on function public.account_deletion_storage_batch(uuid,uuid),public.finish_account_deletion_job(uuid,uuid) to service_role;

create index real_build_owner_templates on public.real_build_attempts(user_id,template_id);
create unique index real_build_template_title on public.real_build_templates(topic,minutes,lower(challenge->>'title'));
create function public.find_unseen_real_build_template(user_input uuid, topic_input text, minutes_input integer)
returns setof public.real_build_templates language sql security invoker set search_path='' as $$
 select t.* from public.real_build_templates t
 where t.topic=topic_input and t.minutes=minutes_input
 and not exists(select 1 from public.real_build_attempts a where a.user_id=user_input and a.template_id=t.id)
 order by t.created_at desc,t.id limit 1;
$$;
revoke all on function public.find_unseen_real_build_template(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.find_unseen_real_build_template(uuid,text,integer) to service_role;
