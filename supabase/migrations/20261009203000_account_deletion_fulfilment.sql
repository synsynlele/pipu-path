create table public.account_deletion_jobs (
  request_id uuid primary key references public.account_deletion_requests(id) on delete cascade,
  target_user_id uuid,
  operator_id uuid references auth.users(id) on delete set null,
  state text not null check (state in ('processing','failed','fulfilled')),
  phase text not null default 'approved' check (phase in ('approved','database','storage','auth','verified')),
  lease_token uuid,
  lease_until timestamptz,
  attempts integer not null default 1,
  last_error_code text,
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.account_deletion_jobs enable row level security;
revoke all on public.account_deletion_jobs from public,anon,authenticated;
grant select,insert,update,delete on public.account_deletion_jobs to service_role;

create or replace function public.claim_account_deletion_job(request_id_input uuid, operator_id_input uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.account_deletion_requests%rowtype; j public.account_deletion_jobs%rowtype; token uuid := gen_random_uuid();
begin
  if not exists(select 1 from public.platform_admins where user_id=operator_id_input and status='active' and role in ('owner','operator')) then raise exception 'FORBIDDEN'; end if;
  select * into r from public.account_deletion_requests where id=request_id_input for update;
  if not found or r.status <> 'reviewing' or r.reviewed_by is distinct from operator_id_input then raise exception 'PRIVACY_REVIEW_REQUIRED'; end if;
  select * into j from public.account_deletion_jobs where request_id=r.id for update;
  if found and j.state='processing' and j.lease_until > now() then raise exception 'PRIVACY_JOB_BUSY'; end if;
  if r.user_id is null and j.target_user_id is null then raise exception 'PRIVACY_TARGET_UNAVAILABLE'; end if;
  if coalesce(r.user_id,j.target_user_id)=operator_id_input then raise exception 'PRIVACY_MANUAL_REVIEW_REQUIRED'; end if;
  -- Shared organisations, staff attribution and safeguarding require a bespoke
  -- plan. Never delete an institution/provider or evidence of a report here.
  if exists(select 1 from public.platform_admins where user_id=coalesce(r.user_id,j.target_user_id))
    or exists(select 1 from public.opportunity_providers where created_by=coalesce(r.user_id,j.target_user_id) or reviewed_by=coalesce(r.user_id,j.target_user_id))
    or exists(select 1 from public.opportunities where created_by=coalesce(r.user_id,j.target_user_id) or reviewed_by=coalesce(r.user_id,j.target_user_id) or published_by=coalesce(r.user_id,j.target_user_id))
    or exists(select 1 from public.opportunity_provider_members where granted_by=coalesce(r.user_id,j.target_user_id))
    or exists(select 1 from public.institution_workspaces where created_by_user_id=coalesce(r.user_id,j.target_user_id))
    or exists(select 1 from public.institution_workspace_members where granted_by_user_id=coalesce(r.user_id,j.target_user_id))
    or exists(select 1 from public.institution_capability_verifications where verifier_user_id=coalesce(r.user_id,j.target_user_id))
    or exists(select 1 from public.builder_capability_verifications where verifier_user_id=coalesce(r.user_id,j.target_user_id) and builder_user_id<>coalesce(r.user_id,j.target_user_id))
    or exists(select 1 from public.builder_reports where reporter_id=coalesce(r.user_id,j.target_user_id) or reported_id=coalesce(r.user_id,j.target_user_id))
    or exists(select 1 from public.builder_network_reports where reporter_id=coalesce(r.user_id,j.target_user_id) or target_user_id=coalesce(r.user_id,j.target_user_id))
  then raise exception 'PRIVACY_MANUAL_REVIEW_REQUIRED'; end if;
  insert into public.account_deletion_jobs(request_id,target_user_id,operator_id,state,lease_token,lease_until)
    values(r.id,coalesce(r.user_id,j.target_user_id),operator_id_input,'processing',token,now()+interval '10 minutes')
    on conflict(request_id) do update set state='processing',operator_id=operator_id_input,
      lease_token=token,lease_until=now()+interval '10 minutes',attempts=account_deletion_jobs.attempts+1,
      last_error_code=null,updated_at=now();
  return jsonb_build_object('userId',coalesce(r.user_id,j.target_user_id),'leaseToken',token);
end; $$;

create or replace function public.purge_account_deletion_data(request_id_input uuid, lease_token_input uuid)
returns void language plpgsql security definer set search_path='' as $$
declare j public.account_deletion_jobs%rowtype; ref record; statements text[] := '{}'; idx integer := 0;
begin
  select * into j from public.account_deletion_jobs where request_id=request_id_input for update;
  if not found or j.state<>'processing' or j.lease_token is distinct from lease_token_input or j.lease_until<=now() then raise exception 'PRIVACY_JOB_LEASE_INVALID'; end if;
  perform 1 from public.profiles where id=j.target_user_id for update;
  if exists(select 1 from public.platform_admins where user_id=j.target_user_id)
    or exists(select 1 from public.opportunity_providers where created_by=j.target_user_id or reviewed_by=j.target_user_id)
    or exists(select 1 from public.opportunities where created_by=j.target_user_id or reviewed_by=j.target_user_id or published_by=j.target_user_id)
    or exists(select 1 from public.opportunity_provider_members where granted_by=j.target_user_id)
    or exists(select 1 from public.institution_workspaces where created_by_user_id=j.target_user_id)
    or exists(select 1 from public.institution_workspace_members where granted_by_user_id=j.target_user_id)
    or exists(select 1 from public.institution_capability_verifications where verifier_user_id=j.target_user_id)
    or exists(select 1 from public.builder_capability_verifications where verifier_user_id=j.target_user_id and builder_user_id<>j.target_user_id)
    or exists(select 1 from public.builder_reports where reporter_id=j.target_user_id or reported_id=j.target_user_id)
    or exists(select 1 from public.builder_network_reports where reporter_id=j.target_user_id or target_user_id=j.target_user_id)
  then raise exception 'PRIVACY_MANUAL_REVIEW_REQUIRED'; end if;
  -- All development deletion uses ONE data-modifying statement. FK checks see
  -- its complete result, including both sides of restrictive cycles. No FK or
  -- trigger is disabled. Any cross-account restriction rolls everything back.
  for ref in
    select t.relname as table_name, string_agg(distinct format('%I=$1',a.attname),' or ') as predicate
    from pg_catalog.pg_constraint c join pg_catalog.pg_class t on t.oid=c.conrelid
    join pg_catalog.pg_namespace n on n.oid=t.relnamespace
    cross join lateral unnest(c.conkey) k(attnum)
    join pg_catalog.pg_attribute a on a.attrelid=t.oid and a.attnum=k.attnum
    where c.contype='f' and n.nspname='public'
      and c.confrelid in ('auth.users'::regclass,'public.profiles'::regclass)
      and t.relname not in ('account_deletion_requests','account_deletion_jobs','builder_passport_access_events')
    group by t.relname order by t.relname
  loop
    statements := array_append(statements,format('d%s as (delete from public.%I where %s returning 1)',idx,ref.table_name,ref.predicate));
    idx := idx+1;
  end loop;
  -- These child tables have no direct identity FK. Their parent-owned records
  -- are private developmental data, not other builders' shared snapshots.
  for ref in
    select child.relname as table_name,
      string_agg(distinct format('%I in (select %I from public.%I where user_id=$1)',ca.attname,pa.attname,parent.relname),' or ') as predicate
    from pg_catalog.pg_constraint c
    join pg_catalog.pg_class child on child.oid=c.conrelid
    join pg_catalog.pg_namespace n on n.oid=child.relnamespace
    join pg_catalog.pg_class parent on parent.oid=c.confrelid
    join pg_catalog.pg_attribute ca on ca.attrelid=child.oid and ca.attnum=c.conkey[1]
    join pg_catalog.pg_attribute pa on pa.attrelid=parent.oid and pa.attnum=c.confkey[1]
    where c.contype='f' and n.nspname='public'
      and child.relname in ('human_potential_profile_items','insight_evidence_links','insight_uncertainties','interpretation_request_evidence')
      and parent.relname in ('human_potential_profile_versions','potential_insights','evidence_records','interpretation_requests')
    group by child.relname
  loop
    statements := array_append(statements,format('d%s as (delete from public.%I where %s returning 1)',idx,ref.table_name,ref.predicate));
    idx := idx+1;
  end loop;
  statements := array_append(statements,format('d%s as (delete from public.builder_passport_access_events where actor_user_id=$1 or passport_id in (select id from public.builder_passport_versions where user_id=$1) or share_id in (select id from public.builder_passport_shares where user_id=$1) returning 1)',idx));
  execute 'with ' || array_to_string(statements,',') || ' select 1' using j.target_user_id;

  update public.account_deletion_jobs set phase='database',updated_at=now(),lease_until=now()+interval '10 minutes' where request_id=j.request_id;
end; $$;

-- A stale JWT must not upload new evidence after its profile is purged.
create policy quest_evidence_live_account on storage.objects as restrictive
for all to authenticated
using (bucket_id <> 'quest-evidence' or exists(select 1 from public.profiles where id=(select auth.uid())))
with check (bucket_id <> 'quest-evidence' or exists(select 1 from public.profiles where id=(select auth.uid())));

create or replace function public.account_deletion_storage_batch(request_id_input uuid, lease_token_input uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare j public.account_deletion_jobs%rowtype; files jsonb;
begin
  select * into j from public.account_deletion_jobs where request_id=request_id_input for update;
  if not found or j.state<>'processing' or j.phase not in ('database','storage') or j.lease_token is distinct from lease_token_input or j.lease_until<=now() then raise exception 'PRIVACY_JOB_LEASE_INVALID'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('bucket',bucket_id,'path',name)),'[]') into files
  from (select bucket_id,name from storage.objects where owner_id=j.target_user_id::text or owner=j.target_user_id
    or (bucket_id='quest-evidence' and split_part(name,'/',1)=j.target_user_id::text) order by bucket_id,name limit 100) batch;
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
    or exists(select 1 from storage.objects where owner_id=j.target_user_id::text or owner=j.target_user_id or (bucket_id='quest-evidence' and split_part(name,'/',1)=j.target_user_id::text))
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

create or replace function public.fail_account_deletion_job(request_id_input uuid, lease_token_input uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
  update public.account_deletion_jobs set state='failed',last_error_code='PRIVACY_PROCESSING_FAILED',lease_token=null,lease_until=null,updated_at=now()
    where request_id=request_id_input and state='processing' and lease_token=lease_token_input;
end; $$;

revoke all on function public.claim_account_deletion_job(uuid,uuid),public.purge_account_deletion_data(uuid,uuid),public.account_deletion_storage_batch(uuid,uuid),public.finish_account_deletion_job(uuid,uuid),public.fail_account_deletion_job(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_account_deletion_job(uuid,uuid),public.purge_account_deletion_data(uuid,uuid),public.account_deletion_storage_batch(uuid,uuid),public.finish_account_deletion_job(uuid,uuid),public.fail_account_deletion_job(uuid,uuid) to service_role;
