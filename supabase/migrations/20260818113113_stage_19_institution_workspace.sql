-- Stage 19: controlled Institution Workspace over Stage 13 cohort privacy and
-- Stage 18 evidence-bound capability trust. Cohort membership never grants a
-- learner browser; individual verification is Builder-initiated and exact-evidence only.

create type public.institution_workspace_role as enum ('owner', 'verifier', 'analyst');
create type public.institution_workspace_status as enum ('active', 'revoked');
create type public.institution_workspace_member_status as enum ('active', 'revoked');

create table public.institution_workspaces (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null unique references public.khpos_school_cohorts(id) on delete restrict,
  status public.institution_workspace_status not null default 'active',
  verification_policy_version text not null default 'institution-capability-share-v1'
    check (verification_policy_version = 'institution-capability-share-v1'),
  created_by_user_id uuid references public.profiles(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint institution_workspaces_status_consistency check (
    (status = 'active' and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  )
);

create table public.institution_workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.institution_workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.institution_workspace_role not null,
  status public.institution_workspace_member_status not null default 'active',
  granted_by_user_id uuid references public.profiles(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id),
  constraint institution_workspace_members_status_consistency check (
    (status = 'active' and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  )
);

create index institution_workspace_members_user_idx
  on public.institution_workspace_members(user_id, status, workspace_id);
create index institution_workspace_members_workspace_idx
  on public.institution_workspace_members(workspace_id, status, role);

create table public.institution_capability_verifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.institution_workspaces(id) on delete restrict,
  cohort_membership_id uuid not null references public.khpos_school_cohort_memberships(id) on delete restrict,
  builder_user_id uuid not null references public.profiles(id) on delete cascade,
  capability_key text not null check (capability_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  capability_label_at_request text not null check (char_length(capability_label_at_request) between 2 and 120),
  capability_level_at_request public.builder_capability_level not null,
  claim_id_at_request uuid not null references public.builder_capability_claims(id) on delete cascade,
  evidence_id_at_request uuid not null references public.builder_capability_evidence(id) on delete cascade,
  evidence_source_type public.builder_capability_evidence_source not null,
  evidence_source_id uuid not null,
  verifier_user_id uuid references public.profiles(id) on delete set null,
  status public.builder_capability_verification_status not null default 'pending',
  consent_policy_version text not null default 'institution-capability-share-v1'
    check (consent_policy_version = 'institution-capability-share-v1'),
  request_note text check (request_note is null or char_length(request_note) between 3 and 400),
  response_note text check (response_note is null or char_length(response_note) between 3 and 600),
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  withdrawn_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint institution_capability_verifications_distinct_people check (
    verifier_user_id is null or builder_user_id <> verifier_user_id
  ),
  constraint institution_capability_verifications_lifecycle check (
    (status = 'pending' and verifier_user_id is null and responded_at is null and withdrawn_at is null and revoked_at is null)
    or (status in ('confirmed','declined') and verifier_user_id is not null and responded_at is not null and withdrawn_at is null and revoked_at is null)
    or (status = 'withdrawn' and responded_at is null and withdrawn_at is not null and revoked_at is null)
    or (status = 'revoked' and verifier_user_id is not null and responded_at is not null and revoked_at is not null)
  )
);

create unique index institution_capability_verifications_pending_idx
  on public.institution_capability_verifications(
    workspace_id, builder_user_id, capability_key, evidence_id_at_request
  ) where status = 'pending';
create unique index institution_capability_verifications_confirmed_idx
  on public.institution_capability_verifications(
    workspace_id, builder_user_id, capability_key, evidence_id_at_request
  ) where status = 'confirmed';
create index institution_capability_verifications_builder_idx
  on public.institution_capability_verifications(builder_user_id, requested_at desc);
create index institution_capability_verifications_workspace_idx
  on public.institution_capability_verifications(workspace_id, requested_at desc);
create index institution_capability_verifications_verifier_idx
  on public.institution_capability_verifications(verifier_user_id, responded_at desc)
  where verifier_user_id is not null;

create table public.institution_audit_events (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references public.institution_workspaces(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  operation text not null check (char_length(operation) between 3 and 100),
  result text not null check (result in ('success', 'failure')),
  target_type text check (target_type is null or char_length(target_type) between 2 and 60),
  target_id text check (target_id is null or char_length(target_id) between 1 and 120),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index institution_audit_events_workspace_time_idx
  on public.institution_audit_events(workspace_id, occurred_at desc);
create index institution_audit_events_actor_time_idx
  on public.institution_audit_events(actor_user_id, occurred_at desc);

create trigger institution_workspaces_updated_at
before update on public.institution_workspaces
for each row execute function public.set_updated_at();
create trigger institution_workspace_members_updated_at
before update on public.institution_workspace_members
for each row execute function public.set_updated_at();
create trigger institution_capability_verifications_updated_at
before update on public.institution_capability_verifications
for each row execute function public.set_updated_at();

alter table public.institution_workspaces enable row level security;
alter table public.institution_workspace_members enable row level security;
alter table public.institution_capability_verifications enable row level security;
alter table public.institution_audit_events enable row level security;

revoke all on
  public.institution_workspaces,
  public.institution_workspace_members,
  public.institution_capability_verifications,
  public.institution_audit_events
from public, anon, authenticated;

grant select, insert, update, delete on
  public.institution_workspaces,
  public.institution_workspace_members,
  public.institution_capability_verifications
  to service_role;
grant select, insert on public.institution_audit_events to service_role;

create or replace function private.stage19_institution_member_role(
  workspace_id_input uuid,
  user_id_input uuid
) returns public.institution_workspace_role
language sql
stable
security definer
set search_path = ''
as $$
  select member.role
  from public.institution_workspace_members member
  join public.institution_workspaces workspace
    on workspace.id = member.workspace_id and workspace.status = 'active'
  join public.khpos_school_cohorts cohort
    on cohort.id = workspace.cohort_id and cohort.status = 'active'
  join public.profiles profile
    on profile.id = member.user_id
   and profile.account_status = 'active'
   and not profile.is_minor
   and not profile.safeguarding_review_required
  where member.workspace_id = workspace_id_input
    and member.user_id = user_id_input
    and member.status = 'active'
  limit 1;
$$;

create or replace function private.stage19_builder_workspace(builder_id_input uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select workspace.id
  from public.khpos_school_cohort_memberships membership
  join public.khpos_school_cohorts cohort
    on cohort.id = membership.cohort_id and cohort.status = 'active'
  join public.institution_workspaces workspace
    on workspace.cohort_id = cohort.id and workspace.status = 'active'
  join public.profiles profile
    on profile.id = membership.user_id
   and profile.account_status = 'active'
   and not profile.safeguarding_review_required
  where membership.user_id = builder_id_input
    and membership.status = 'active'
  limit 1;
$$;

revoke all on function private.stage19_institution_member_role(uuid, uuid)
  from public, anon, authenticated;
revoke all on function private.stage19_builder_workspace(uuid)
  from public, anon, authenticated;

create or replace function private.stage19_assert_platform_provisioner(actor_user_id_input uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.platform_admins admin
    where admin.user_id = actor_user_id_input
      and admin.status = 'active'
      and admin.role in ('owner','operator')
  ) then
    raise exception 'INSTITUTION_ADMIN_ACCESS_DENIED' using errcode = 'P0001';
  end if;
end;
$$;

revoke all on function private.stage19_assert_platform_provisioner(uuid)
  from public, anon, authenticated;

create or replace function public.provision_stage19_institution_workspace_server(
  cohort_id_input uuid,
  owner_username_input text,
  actor_user_id_input uuid
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_cohort public.khpos_school_cohorts%rowtype;
  owner_profile public.profiles%rowtype;
  workspace_id uuid;
begin
  perform private.stage19_assert_platform_provisioner(actor_user_id_input);

  select * into target_cohort
  from public.khpos_school_cohorts
  where id = cohort_id_input and status = 'active'
  limit 1;
  if target_cohort.id is null then
    raise exception 'INSTITUTION_COHORT_NOT_FOUND' using errcode = 'P0001';
  end if;

  select * into owner_profile
  from public.profiles
  where username::text = lower(trim(coalesce(owner_username_input, '')))
    and account_status = 'active'
    and not is_minor
    and not safeguarding_review_required
  limit 1;
  if owner_profile.id is null then
    raise exception 'INSTITUTION_OWNER_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  select id into workspace_id
  from public.institution_workspaces
  where cohort_id = target_cohort.id
  limit 1;

  if workspace_id is null then
    insert into public.institution_workspaces(
      cohort_id, status, verification_policy_version, created_by_user_id
    ) values (
      target_cohort.id, 'active', 'institution-capability-share-v1', actor_user_id_input
    ) returning id into workspace_id;
  elsif exists (
    select 1 from public.institution_workspaces
    where id = workspace_id and status = 'revoked'
  ) then
    raise exception 'INSTITUTION_WORKSPACE_REVOKED' using errcode = 'P0001';
  end if;

  insert into public.institution_workspace_members(
    workspace_id, user_id, role, status, granted_by_user_id, granted_at, revoked_at
  ) values (
    workspace_id, owner_profile.id, 'owner', 'active', actor_user_id_input, now(), null
  )
  on conflict(workspace_id, user_id) do update
    set role = 'owner',
        status = 'active',
        granted_by_user_id = actor_user_id_input,
        granted_at = now(),
        revoked_at = null,
        updated_at = now();

  insert into public.admin_audit_events(
    actor_user_id, operation, result, target_type, target_id, metadata
  ) values (
    actor_user_id_input,
    'institution_workspace_provisioned',
    'success',
    'institution_workspace',
    workspace_id::text,
    jsonb_build_object('cohort_id', target_cohort.id, 'owner_user_id', owner_profile.id)
  );

  insert into public.institution_audit_events(
    workspace_id, actor_user_id, operation, result, target_type, target_id, metadata
  ) values (
    workspace_id,
    actor_user_id_input,
    'workspace_provisioned',
    'success',
    'institution_member',
    owner_profile.id::text,
    jsonb_build_object('role', 'owner')
  );

  return workspace_id;
end;
$$;

create or replace function public.set_stage19_institution_member_server(
  workspace_id_input uuid,
  target_username_input text,
  role_input public.institution_workspace_role,
  active_input boolean,
  actor_user_id_input uuid
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_profile public.profiles%rowtype;
  existing public.institution_workspace_members%rowtype;
  other_owner_count integer;
begin
  perform private.stage19_assert_platform_provisioner(actor_user_id_input);

  if not exists (
    select 1 from public.institution_workspaces
    where id = workspace_id_input and status = 'active'
  ) then
    raise exception 'INSTITUTION_WORKSPACE_NOT_FOUND' using errcode = 'P0001';
  end if;

  select * into target_profile
  from public.profiles
  where username::text = lower(trim(coalesce(target_username_input, '')))
    and account_status = 'active'
    and not is_minor
    and not safeguarding_review_required
  limit 1;
  if target_profile.id is null then
    raise exception 'INSTITUTION_MEMBER_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  select * into existing
  from public.institution_workspace_members
  where workspace_id = workspace_id_input and user_id = target_profile.id
  limit 1;

  if not active_input and existing.id is null then
    raise exception 'INSTITUTION_MEMBER_NOT_FOUND' using errcode = 'P0001';
  end if;

  if not active_input and existing.role = 'owner' and existing.status = 'active' then
    select count(*)::integer into other_owner_count
    from public.institution_workspace_members
    where workspace_id = workspace_id_input
      and role = 'owner'
      and status = 'active'
      and user_id <> target_profile.id;
    if other_owner_count < 1 then
      raise exception 'INSTITUTION_LAST_OWNER_REQUIRED' using errcode = 'P0001';
    end if;
  end if;

  if active_input then
    insert into public.institution_workspace_members(
      workspace_id, user_id, role, status, granted_by_user_id, granted_at, revoked_at
    ) values (
      workspace_id_input, target_profile.id, role_input, 'active', actor_user_id_input, now(), null
    )
    on conflict(workspace_id, user_id) do update
      set role = role_input,
          status = 'active',
          granted_by_user_id = actor_user_id_input,
          granted_at = now(),
          revoked_at = null,
          updated_at = now();
  else
    update public.institution_workspace_members
    set status = 'revoked', revoked_at = now(), updated_at = now()
    where id = existing.id;
  end if;

  insert into public.admin_audit_events(
    actor_user_id, operation, result, target_type, target_id, metadata
  ) values (
    actor_user_id_input,
    case when active_input then 'institution_member_set' else 'institution_member_revoked' end,
    'success',
    'institution_member',
    target_profile.id::text,
    jsonb_build_object('workspace_id', workspace_id_input, 'role', role_input)
  );

  insert into public.institution_audit_events(
    workspace_id, actor_user_id, operation, result, target_type, target_id, metadata
  ) values (
    workspace_id_input,
    actor_user_id_input,
    case when active_input then 'member_set' else 'member_revoked' end,
    'success',
    'institution_member',
    target_profile.id::text,
    jsonb_build_object('role', role_input)
  );

  return true;
end;
$$;

create or replace function public.revoke_stage19_institution_workspace_server(
  workspace_id_input uuid,
  actor_user_id_input uuid
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.stage19_assert_platform_provisioner(actor_user_id_input);

  update public.institution_workspaces
  set status = 'revoked', revoked_at = now(), updated_at = now()
  where id = workspace_id_input and status = 'active';
  if not found then
    raise exception 'INSTITUTION_WORKSPACE_NOT_FOUND' using errcode = 'P0001';
  end if;

  update public.institution_workspace_members
  set status = 'revoked', revoked_at = now(), updated_at = now()
  where workspace_id = workspace_id_input and status = 'active';

  update public.institution_capability_verifications
  set status = 'withdrawn', withdrawn_at = now(), updated_at = now()
  where workspace_id = workspace_id_input and status = 'pending';

  insert into public.admin_audit_events(
    actor_user_id, operation, result, target_type, target_id
  ) values (
    actor_user_id_input,
    'institution_workspace_revoked',
    'success',
    'institution_workspace',
    workspace_id_input::text
  );

  insert into public.institution_audit_events(
    workspace_id, actor_user_id, operation, result, target_type, target_id
  ) values (
    workspace_id_input,
    actor_user_id_input,
    'workspace_revoked',
    'success',
    'institution_workspace',
    workspace_id_input::text
  );

  return true;
end;
$$;

create or replace function public.get_stage19_admin_institution_registry_server(
  actor_user_id_input uuid
) returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare result jsonb;
begin
  perform private.stage19_assert_platform_provisioner(actor_user_id_input);

  select jsonb_build_object(
    'cohorts', coalesce(jsonb_agg(jsonb_build_object(
      'cohortId', cohort.id,
      'organisationName', cohort.organisation_name,
      'cohortStatus', cohort.status,
      'reportingMinimum', cohort.reporting_minimum,
      'workspaceId', workspace.id,
      'workspaceStatus', workspace.status,
      'members', coalesce((
        select jsonb_agg(jsonb_build_object(
          'userId', member.user_id,
          'username', profile.username,
          'displayName', profile.display_name,
          'role', member.role,
          'status', member.status
        ) order by member.role, profile.username)
        from public.institution_workspace_members member
        join public.profiles profile on profile.id = member.user_id
        where member.workspace_id = workspace.id
      ), '[]'::jsonb)
    ) order by cohort.organisation_name), '[]'::jsonb)
  ) into result
  from public.khpos_school_cohorts cohort
  left join public.institution_workspaces workspace on workspace.cohort_id = cohort.id;

  return result;
end;
$$;

revoke all on function public.provision_stage19_institution_workspace_server(uuid, text, uuid)
  from public, anon, authenticated;
revoke all on function public.set_stage19_institution_member_server(uuid, text, public.institution_workspace_role, boolean, uuid)
  from public, anon, authenticated;
revoke all on function public.revoke_stage19_institution_workspace_server(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.get_stage19_admin_institution_registry_server(uuid)
  from public, anon, authenticated;
grant execute on function public.provision_stage19_institution_workspace_server(uuid, text, uuid) to service_role;
grant execute on function public.set_stage19_institution_member_server(uuid, text, public.institution_workspace_role, boolean, uuid) to service_role;
grant execute on function public.revoke_stage19_institution_workspace_server(uuid, uuid) to service_role;
grant execute on function public.get_stage19_admin_institution_registry_server(uuid) to service_role;

create or replace function public.list_stage19_institution_workspaces()
returns table(
  workspace_id uuid,
  organisation_name text,
  role public.institution_workspace_role
)
language sql
stable
security definer
set search_path = ''
as $$
  select workspace.id, cohort.organisation_name, member.role
  from public.institution_workspace_members member
  join public.institution_workspaces workspace
    on workspace.id = member.workspace_id and workspace.status = 'active'
  join public.khpos_school_cohorts cohort
    on cohort.id = workspace.cohort_id and cohort.status = 'active'
  where member.user_id = auth.uid() and member.status = 'active'
  order by cohort.organisation_name;
$$;

create or replace function public.get_stage19_institution_workspace(
  workspace_id_input uuid,
  window_days_input integer default 90
) returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  actor_role public.institution_workspace_role;
  workspace_row public.institution_workspaces%rowtype;
  cohort_row public.khpos_school_cohorts%rowtype;
  safe_days integer := least(greatest(coalesce(window_days_input, 90), 1), 180);
  window_end timestamptz := now();
  window_start timestamptz;
  aggregate_json jsonb := null;
  queue_json jsonb := '[]'::jsonb;
begin
  if actor is null then
    raise exception 'INSTITUTION_WORKSPACE_AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  actor_role := private.stage19_institution_member_role(workspace_id_input, actor);
  if actor_role is null then
    raise exception 'INSTITUTION_WORKSPACE_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select * into workspace_row
  from public.institution_workspaces
  where id = workspace_id_input and status = 'active';
  select * into cohort_row
  from public.khpos_school_cohorts
  where id = workspace_row.cohort_id and status = 'active';
  if cohort_row.id is null then
    raise exception 'INSTITUTION_WORKSPACE_NOT_FOUND' using errcode = 'P0001';
  end if;

  window_start := window_end - make_interval(days => safe_days);

  if actor_role in ('owner','analyst') then
    select jsonb_build_object(
      'reportingEligible', aggregate.reporting_eligible,
      'cohortMemberCount', aggregate.cohort_member_count,
      'activeProfileCount', aggregate.active_profile_count,
      'pathSelectedCount', aggregate.path_selected_count,
      'questParticipantCount', aggregate.quest_participant_count,
      'evidenceBackedQuestParticipantCount', aggregate.evidence_backed_quest_participant_count,
      'projectParticipantCount', aggregate.project_participant_count,
      'projectCompletionParticipantCount', aggregate.project_completion_participant_count,
      'continuationEligibleCount', aggregate.continuation_eligible_count,
      'continuingCycleParticipantCount', aggregate.continuing_cycle_participant_count
    ) into aggregate_json
    from public.get_stage13_khpos_cohort_aggregate_server(
      cohort_row.id, window_start, window_end
    ) aggregate;
  end if;

  if actor_role in ('owner','verifier') then
    select coalesce(jsonb_agg(row_payload order by requested_at desc), '[]'::jsonb)
    into queue_json
    from (
      select
        verification.requested_at,
        jsonb_build_object(
          'id', verification.id,
          'builderDisplayName', builder.display_name,
          'builderUsername', builder.username,
          'capabilityKey', verification.capability_key,
          'capabilityLabel', verification.capability_label_at_request,
          'capabilityLevel', verification.capability_level_at_request,
          'sourceTitle', evidence.source_title,
          'sourceSummary', evidence.evidence_summary,
          'sourceType', verification.evidence_source_type,
          'sourceOccurredAt', evidence.source_occurred_at,
          'status', verification.status,
          'requestNote', verification.request_note,
          'responseNote', verification.response_note,
          'requestedAt', verification.requested_at,
          'respondedAt', verification.responded_at,
          'verifierDisplayName', verifier.display_name,
          'actionable', verification.status = 'pending'
            and exists (
              select 1
              from public.khpos_school_cohort_memberships membership
              join public.profiles profile on profile.id = membership.user_id
              where membership.id = verification.cohort_membership_id
                and membership.user_id = verification.builder_user_id
                and membership.cohort_id = cohort_row.id
                and membership.status = 'active'
                and profile.account_status = 'active'
                and not profile.safeguarding_review_required
            )
        ) as row_payload
      from public.institution_capability_verifications verification
      join public.builder_capability_evidence evidence
        on evidence.id = verification.evidence_id_at_request
      join public.profiles builder on builder.id = verification.builder_user_id
      left join public.profiles verifier on verifier.id = verification.verifier_user_id
      where verification.workspace_id = workspace_row.id
      order by verification.requested_at desc
      limit 100
    ) recent;
  end if;

  insert into public.institution_audit_events(
    workspace_id, actor_user_id, operation, result, metadata
  ) values (
    workspace_row.id,
    actor,
    'workspace_viewed',
    'success',
    jsonb_build_object('role', actor_role, 'window_days', safe_days)
  );

  return jsonb_build_object(
    'workspaceId', workspace_row.id,
    'organisationName', cohort_row.organisation_name,
    'role', actor_role,
    'reportingMinimum', cohort_row.reporting_minimum,
    'windowDays', safe_days,
    'analyticsAllowed', actor_role in ('owner','analyst'),
    'verificationAllowed', actor_role in ('owner','verifier'),
    'aggregate', aggregate_json,
    'verificationQueue', queue_json
  );
end;
$$;

create or replace function public.get_stage19_builder_institution_verification_workspace()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  membership_row public.khpos_school_cohort_memberships%rowtype;
  cohort_row public.khpos_school_cohorts%rowtype;
  workspace_row public.institution_workspaces%rowtype;
  eligible_json jsonb := '[]'::jsonb;
  history_json jsonb := '[]'::jsonb;
begin
  if actor is null then
    raise exception 'INSTITUTION_VERIFICATION_AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  select * into membership_row
  from public.khpos_school_cohort_memberships
  where user_id = actor and status = 'active'
  limit 1;

  if membership_row.id is not null then
    select * into cohort_row
    from public.khpos_school_cohorts
    where id = membership_row.cohort_id and status = 'active';
    if cohort_row.id is not null then
      select * into workspace_row
      from public.institution_workspaces
      where cohort_id = cohort_row.id and status = 'active';
    end if;
  end if;

  if workspace_row.id is not null
     and exists (
       select 1 from public.profiles
       where id = actor and account_status = 'active' and not safeguarding_review_required
     ) then
    select coalesce(jsonb_agg(jsonb_build_object(
      'claimId', claim.id,
      'evidenceId', evidence.id,
      'capabilityKey', claim.capability_key,
      'capabilityLabel', claim.capability_label,
      'capabilityLevel', claim.level,
      'sourceTitle', evidence.source_title,
      'sourceSummary', evidence.evidence_summary,
      'sourceType', evidence.source_type,
      'sourceOccurredAt', evidence.source_occurred_at
    ) order by claim.capability_label, evidence.source_occurred_at desc), '[]'::jsonb)
    into eligible_json
    from public.builder_capability_claims claim
    join public.builder_profile_versions version
      on version.id = claim.profile_version_id and version.status = 'active'
    join public.builder_capability_evidence evidence
      on evidence.claim_id = claim.id and evidence.user_id = actor
    where claim.user_id = actor
      and version.user_id = actor
      and not exists (
        select 1
        from public.institution_capability_verifications verification
        where verification.workspace_id = workspace_row.id
          and verification.builder_user_id = actor
          and verification.capability_key = claim.capability_key
          and verification.evidence_id_at_request = evidence.id
          and verification.status in ('pending','confirmed')
      );
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', verification.id,
    'workspaceId', verification.workspace_id,
    'organisationName', cohort.organisation_name,
    'capabilityKey', verification.capability_key,
    'capabilityLabel', verification.capability_label_at_request,
    'capabilityLevel', verification.capability_level_at_request,
    'sourceTitle', evidence.source_title,
    'sourceSummary', evidence.evidence_summary,
    'sourceType', verification.evidence_source_type,
    'status', verification.status,
    'requestNote', verification.request_note,
    'responseNote', verification.response_note,
    'requestedAt', verification.requested_at,
    'respondedAt', verification.responded_at,
    'verifierDisplayName', verifier.display_name
  ) order by verification.requested_at desc), '[]'::jsonb)
  into history_json
  from public.institution_capability_verifications verification
  join public.institution_workspaces workspace on workspace.id = verification.workspace_id
  join public.khpos_school_cohorts cohort on cohort.id = workspace.cohort_id
  join public.builder_capability_evidence evidence on evidence.id = verification.evidence_id_at_request
  left join public.profiles verifier on verifier.id = verification.verifier_user_id
  where verification.builder_user_id = actor;

  return jsonb_build_object(
    'connected', workspace_row.id is not null,
    'workspaceId', workspace_row.id,
    'organisationName', case
      when workspace_row.id is not null then cohort_row.organisation_name
      else null
    end,
    'consentPolicyVersion', case
      when workspace_row.id is not null then workspace_row.verification_policy_version
      else null
    end,
    'eligibleEvidence', eligible_json,
    'history', history_json
  );
end;
$$;

create or replace function public.request_stage19_institution_capability_verification(
  claim_id_input uuid,
  evidence_id_input uuid,
  request_note_input text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  workspace_id uuid;
  workspace_row public.institution_workspaces%rowtype;
  membership_row public.khpos_school_cohort_memberships%rowtype;
  claim_row public.builder_capability_claims%rowtype;
  evidence_row public.builder_capability_evidence%rowtype;
  clean_note text := nullif(trim(coalesce(request_note_input, '')), '');
  verification_id uuid;
begin
  if actor is null then
    raise exception 'INSTITUTION_VERIFICATION_AUTH_REQUIRED' using errcode = 'P0001';
  end if;
  if clean_note is not null and char_length(clean_note) not between 3 and 400 then
    raise exception 'INSTITUTION_VERIFICATION_INPUT_INVALID' using errcode = 'P0001';
  end if;

  workspace_id := private.stage19_builder_workspace(actor);
  if workspace_id is null then
    raise exception 'INSTITUTION_VERIFICATION_ACTIVE_MEMBERSHIP_REQUIRED' using errcode = 'P0001';
  end if;
  select * into workspace_row from public.institution_workspaces where id = workspace_id;
  select membership.* into membership_row
  from public.khpos_school_cohort_memberships membership
  where membership.user_id = actor
    and membership.cohort_id = workspace_row.cohort_id
    and membership.status = 'active'
  limit 1;
  if membership_row.id is null then
    raise exception 'INSTITUTION_VERIFICATION_ACTIVE_MEMBERSHIP_REQUIRED' using errcode = 'P0001';
  end if;

  select claim.* into claim_row
  from public.builder_capability_claims claim
  join public.builder_profile_versions version on version.id = claim.profile_version_id
  where claim.id = claim_id_input
    and claim.user_id = actor
    and version.user_id = actor
    and version.status = 'active'
  limit 1;
  if claim_row.id is null then
    raise exception 'INSTITUTION_VERIFICATION_ACTIVE_CLAIM_REQUIRED' using errcode = 'P0001';
  end if;

  select * into evidence_row
  from public.builder_capability_evidence
  where id = evidence_id_input
    and claim_id = claim_row.id
    and user_id = actor
  limit 1;
  if evidence_row.id is null then
    raise exception 'INSTITUTION_VERIFICATION_EVIDENCE_REQUIRED' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.institution_capability_verifications verification
    where verification.workspace_id = workspace_id
      and verification.builder_user_id = actor
      and verification.capability_key = claim_row.capability_key
      and verification.evidence_id_at_request = evidence_row.id
      and verification.status = 'confirmed'
  ) then
    raise exception 'INSTITUTION_VERIFICATION_ALREADY_CONFIRMED' using errcode = 'P0001';
  end if;
  if exists (
    select 1
    from public.institution_capability_verifications verification
    where verification.workspace_id = workspace_id
      and verification.builder_user_id = actor
      and verification.capability_key = claim_row.capability_key
      and verification.evidence_id_at_request = evidence_row.id
      and verification.status = 'pending'
  ) then
    raise exception 'INSTITUTION_VERIFICATION_ALREADY_PENDING' using errcode = 'P0001';
  end if;

  insert into public.institution_capability_verifications(
    workspace_id,
    cohort_membership_id,
    builder_user_id,
    capability_key,
    capability_label_at_request,
    capability_level_at_request,
    claim_id_at_request,
    evidence_id_at_request,
    evidence_source_type,
    evidence_source_id,
    status,
    consent_policy_version,
    request_note
  ) values (
    workspace_id,
    membership_row.id,
    actor,
    claim_row.capability_key,
    claim_row.capability_label,
    claim_row.level,
    claim_row.id,
    evidence_row.id,
    evidence_row.source_type,
    evidence_row.source_id,
    'pending',
    'institution-capability-share-v1',
    clean_note
  ) returning id into verification_id;

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values (
    actor,
    'institution_capability_verification_requested',
    'success',
    jsonb_build_object(
      'verification_id', verification_id,
      'workspace_id', workspace_id,
      'capability_key', claim_row.capability_key,
      'evidence_id', evidence_row.id,
      'consent_policy_version', 'institution-capability-share-v1'
    )
  );

  insert into public.institution_audit_events(
    workspace_id, actor_user_id, operation, result, target_type, target_id, metadata
  ) values (
    workspace_id,
    actor,
    'capability_verification_requested',
    'success',
    'capability_verification',
    verification_id::text,
    jsonb_build_object('capability_key', claim_row.capability_key)
  );

  return verification_id;
end;
$$;

create or replace function public.respond_stage19_institution_capability_verification(
  verification_id_input uuid,
  confirm_input boolean,
  response_note_input text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.institution_capability_verifications%rowtype;
  actor_role public.institution_workspace_role;
  workspace_row public.institution_workspaces%rowtype;
  clean_note text := nullif(trim(coalesce(response_note_input, '')), '');
begin
  if actor is null then
    raise exception 'INSTITUTION_VERIFICATION_AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  select * into target
  from public.institution_capability_verifications
  where id = verification_id_input and status = 'pending'
  for update;
  if target.id is null then
    raise exception 'INSTITUTION_VERIFICATION_REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;

  actor_role := private.stage19_institution_member_role(target.workspace_id, actor);
  if actor_role not in ('owner','verifier') or actor = target.builder_user_id then
    raise exception 'INSTITUTION_VERIFICATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  if clean_note is not null and char_length(clean_note) not between 3 and 600 then
    raise exception 'INSTITUTION_VERIFICATION_INPUT_INVALID' using errcode = 'P0001';
  end if;

  select * into workspace_row
  from public.institution_workspaces
  where id = target.workspace_id and status = 'active';
  if workspace_row.id is null or not exists (
    select 1
    from public.khpos_school_cohort_memberships membership
    join public.profiles profile on profile.id = membership.user_id
    where membership.id = target.cohort_membership_id
      and membership.user_id = target.builder_user_id
      and membership.cohort_id = workspace_row.cohort_id
      and membership.status = 'active'
      and profile.account_status = 'active'
      and not profile.safeguarding_review_required
  ) then
    raise exception 'INSTITUTION_VERIFICATION_RELATIONSHIP_REQUIRED' using errcode = 'P0001';
  end if;

  update public.institution_capability_verifications
  set status = case
        when confirm_input then 'confirmed'::public.builder_capability_verification_status
        else 'declined'::public.builder_capability_verification_status
      end,
      verifier_user_id = actor,
      response_note = clean_note,
      responded_at = now(),
      updated_at = now()
  where id = target.id;

  insert into public.institution_audit_events(
    workspace_id, actor_user_id, operation, result, target_type, target_id, metadata
  ) values (
    target.workspace_id,
    actor,
    case when confirm_input then 'capability_verification_confirmed' else 'capability_verification_declined' end,
    'success',
    'capability_verification',
    target.id::text,
    jsonb_build_object('builder_user_id', target.builder_user_id, 'capability_key', target.capability_key)
  );

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values (
    target.builder_user_id,
    case when confirm_input then 'institution_capability_verification_confirmed' else 'institution_capability_verification_declined' end,
    'success',
    jsonb_build_object(
      'verification_id', target.id,
      'workspace_id', target.workspace_id,
      'verifier_user_id', actor,
      'capability_key', target.capability_key
    )
  );

  return target.builder_user_id;
end;
$$;

create or replace function public.withdraw_stage19_institution_capability_verification(
  verification_id_input uuid
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.institution_capability_verifications%rowtype;
begin
  if actor is null then
    raise exception 'INSTITUTION_VERIFICATION_AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  select * into target
  from public.institution_capability_verifications
  where id = verification_id_input
    and builder_user_id = actor
    and status = 'pending'
  for update;
  if target.id is null then
    raise exception 'INSTITUTION_VERIFICATION_REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;

  update public.institution_capability_verifications
  set status = 'withdrawn', withdrawn_at = now(), updated_at = now()
  where id = target.id;

  insert into public.institution_audit_events(
    workspace_id, actor_user_id, operation, result, target_type, target_id
  ) values (
    target.workspace_id, actor, 'capability_verification_withdrawn', 'success',
    'capability_verification', target.id::text
  );
  return true;
end;
$$;

create or replace function public.revoke_stage19_institution_capability_verification(
  verification_id_input uuid
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.institution_capability_verifications%rowtype;
  actor_role public.institution_workspace_role;
begin
  if actor is null then
    raise exception 'INSTITUTION_VERIFICATION_AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  select * into target
  from public.institution_capability_verifications
  where id = verification_id_input and status = 'confirmed'
  for update;
  if target.id is null then
    raise exception 'INSTITUTION_VERIFICATION_CONFIRMED_RECORD_NOT_FOUND' using errcode = 'P0001';
  end if;

  if actor <> target.builder_user_id then
    actor_role := private.stage19_institution_member_role(target.workspace_id, actor);
    if actor_role not in ('owner','verifier') then
      raise exception 'INSTITUTION_VERIFICATION_ACCESS_DENIED' using errcode = 'P0001';
    end if;
  end if;

  update public.institution_capability_verifications
  set status = 'revoked', revoked_at = now(), updated_at = now()
  where id = target.id;

  insert into public.institution_audit_events(
    workspace_id, actor_user_id, operation, result, target_type, target_id, metadata
  ) values (
    target.workspace_id,
    actor,
    'capability_verification_revoked',
    'success',
    'capability_verification',
    target.id::text,
    jsonb_build_object('actor_role', case when actor = target.builder_user_id then 'builder' else 'institution' end)
  );
  return true;
end;
$$;

-- Withdrawing cohort consent must also close unresolved institution shares.
create or replace function public.withdraw_stage13_khpos_school_cohort()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  membership_id uuid;
  changed boolean;
begin
  if actor is null then
    raise exception 'KHPOS_COHORT_AUTH_REQUIRED' using errcode='P0001';
  end if;

  select id into membership_id
  from public.khpos_school_cohort_memberships
  where user_id = actor and status = 'active'
  limit 1
  for update;

  if membership_id is null then return false; end if;

  update public.institution_capability_verifications
  set status = 'withdrawn', withdrawn_at = now(), updated_at = now()
  where cohort_membership_id = membership_id
    and builder_user_id = actor
    and status = 'pending';

  update public.khpos_school_cohort_memberships
  set status='withdrawn', withdrawn_at=now(), updated_at=now()
  where id = membership_id;
  changed := found;

  if changed then
    insert into public.identity_audit_events(user_id,operation,result,metadata)
    values(actor,'khpos_school_cohort_withdrawn','success',jsonb_build_object(
      'consent_policy_version','khpos-cohort-aggregate-v1',
      'institution_pending_shares_closed', true
    ));
  end if;
  return changed;
end;
$$;

revoke all on function public.list_stage19_institution_workspaces() from public, anon;
revoke all on function public.get_stage19_institution_workspace(uuid, integer) from public, anon;
revoke all on function public.get_stage19_builder_institution_verification_workspace() from public, anon;
revoke all on function public.request_stage19_institution_capability_verification(uuid, uuid, text) from public, anon;
revoke all on function public.respond_stage19_institution_capability_verification(uuid, boolean, text) from public, anon;
revoke all on function public.withdraw_stage19_institution_capability_verification(uuid) from public, anon;
revoke all on function public.revoke_stage19_institution_capability_verification(uuid) from public, anon;
revoke all on function public.withdraw_stage13_khpos_school_cohort() from public, anon;

grant execute on function public.list_stage19_institution_workspaces() to authenticated;
grant execute on function public.get_stage19_institution_workspace(uuid, integer) to authenticated;
grant execute on function public.get_stage19_builder_institution_verification_workspace() to authenticated;
grant execute on function public.request_stage19_institution_capability_verification(uuid, uuid, text) to authenticated;
grant execute on function public.respond_stage19_institution_capability_verification(uuid, boolean, text) to authenticated;
grant execute on function public.withdraw_stage19_institution_capability_verification(uuid) to authenticated;
grant execute on function public.revoke_stage19_institution_capability_verification(uuid) to authenticated;
grant execute on function public.withdraw_stage13_khpos_school_cohort() to authenticated;

alter table public.product_events
  drop constraint if exists product_events_event_name_check;

alter table public.product_events
  add constraint product_events_event_name_check check (event_name in (
    'possible_paths_generated',
    'possible_paths_viewed',
    'path_selected',
    'path_changed',
    'pathway_started',
    'first_value_challenge_started',
    'first_value_challenge_completed',
    'feature_viewed',
    'collaboration_invited',
    'collaboration_accepted',
    'collaboration_contribution_added',
    'collaboration_completed',
    'builder_guide_generated',
    'builder_guide_feedback',
    'opportunity_saved',
    'opportunity_unsaved',
    'opportunity_external_clicked',
    'opportunity_applied',
    'opportunity_outcome_recorded',
    'capability_verification_requested',
    'capability_verification_confirmed',
    'institution_verification_requested',
    'institution_verification_confirmed'
  ));

comment on table public.institution_workspaces is
  'Stage 19 institution surface bound one-to-one to an explicit Stage 13 cohort; never grants learner-level browsing.';
comment on table public.institution_capability_verifications is
  'Builder-authorised institution confirmation of one exact Living Builder Profile capability/evidence item. Uses Stage 18 lifecycle semantics without modifying collaborator verification.';
