-- Stage 16: private Living Builder Profile built from completed action evidence.
-- Discovery remains the baseline. This layer does not rewrite the Human Potential Profile,
-- publish capability claims, or use AI to infer identity.

create type public.builder_profile_version_status as enum ('active', 'superseded');
create type public.builder_capability_level as enum (
  'practicing',
  'demonstrated',
  'repeatedly_demonstrated'
);
create type public.builder_capability_evidence_source as enum (
  'quest',
  'project',
  'collaboration'
);
create type public.builder_capability_verification as enum (
  'pipupath_action',
  'mutual_collaboration'
);
create type public.builder_capability_feedback_type as enum (
  'accurate',
  'needs_context',
  'not_representative'
);

create table public.builder_profile_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  version integer not null check (version > 0),
  status public.builder_profile_version_status not null default 'active',
  source_human_potential_profile_id uuid references public.human_potential_profile_versions(id) on delete restrict,
  rules_version text not null check (rules_version = 'stage16.v1'),
  evidence_cutoff_at timestamptz not null,
  created_at timestamptz not null default now(),
  superseded_at timestamptz,
  unique (user_id, version)
);

create unique index builder_profile_versions_one_active_idx
  on public.builder_profile_versions(user_id)
  where status = 'active';
create index builder_profile_versions_user_created_idx
  on public.builder_profile_versions(user_id, created_at desc);

create table public.builder_capability_claims (
  id uuid primary key default gen_random_uuid(),
  profile_version_id uuid not null references public.builder_profile_versions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  capability_key text not null check (capability_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  capability_label text not null check (char_length(capability_label) between 2 and 120),
  level public.builder_capability_level not null,
  evidence_count integer not null check (evidence_count > 0),
  total_strength integer not null check (total_strength > 0),
  verification_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (profile_version_id, capability_key)
);

create index builder_capability_claims_user_idx
  on public.builder_capability_claims(user_id, created_at desc);

create table public.builder_capability_evidence (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.builder_capability_claims(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_type public.builder_capability_evidence_source not null,
  source_id uuid not null,
  source_title text not null check (char_length(source_title) between 2 and 160),
  evidence_summary text not null check (char_length(evidence_summary) between 10 and 400),
  verification public.builder_capability_verification not null,
  strength smallint not null check (strength in (1, 2)),
  source_occurred_at timestamptz not null,
  source_href text not null check (source_href ~ '^/'),
  created_at timestamptz not null default now(),
  unique (claim_id, source_type, source_id)
);

create index builder_capability_evidence_claim_idx
  on public.builder_capability_evidence(claim_id, source_occurred_at desc);
create index builder_capability_evidence_user_idx
  on public.builder_capability_evidence(user_id, source_occurred_at desc);

create table public.builder_capability_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  claim_id uuid not null references public.builder_capability_claims(id) on delete cascade,
  feedback_type public.builder_capability_feedback_type not null,
  context_note text check (context_note is null or char_length(context_note) between 3 and 600),
  created_at timestamptz not null default now()
);

create index builder_capability_feedback_claim_created_idx
  on public.builder_capability_feedback(claim_id, created_at desc);
create index builder_capability_feedback_user_created_idx
  on public.builder_capability_feedback(user_id, created_at desc);

alter table public.builder_profile_versions enable row level security;
alter table public.builder_capability_claims enable row level security;
alter table public.builder_capability_evidence enable row level security;
alter table public.builder_capability_feedback enable row level security;

revoke all on public.builder_profile_versions,
  public.builder_capability_claims,
  public.builder_capability_evidence,
  public.builder_capability_feedback
from public, anon, authenticated;

grant select, insert, update on public.builder_profile_versions,
  public.builder_capability_claims,
  public.builder_capability_evidence,
  public.builder_capability_feedback
to service_role;

create or replace function private.stage16_normalize_capability(label_input text)
returns text
language sql
immutable
security definer
set search_path = ''
as $$
  select trim(both '_' from regexp_replace(lower(trim(label_input)), '[^a-z0-9]+', '_', 'g'));
$$;

revoke all on function private.stage16_normalize_capability(text)
  from public, anon, authenticated;

create or replace function private.stage16_capability_evidence(user_id_input uuid)
returns table (
  capability_key text,
  capability_label text,
  source_type public.builder_capability_evidence_source,
  source_id uuid,
  source_title text,
  evidence_summary text,
  verification public.builder_capability_verification,
  strength smallint,
  source_occurred_at timestamptz,
  source_href text
)
language sql
stable
security definer
set search_path = ''
as $$
  with completed_quests as (
    select
      private.stage16_normalize_capability(capability) as capability_key,
      trim(capability) as capability_label,
      'quest'::public.builder_capability_evidence_source as source_type,
      quest.id as source_id,
      quest.title as source_title,
      'Completed HQLS Quest with submitted evidence and Nortnspoil reflection.'::text as evidence_summary,
      'pipupath_action'::public.builder_capability_verification as verification,
      1::smallint as strength,
      quest.completed_at as source_occurred_at,
      '/quests/' || quest.id::text as source_href
    from public.user_quests quest
    join public.journey_milestones milestone on milestone.id = quest.milestone_id
    cross join lateral unnest(milestone.capabilities_to_develop) as capability
    where quest.user_id = user_id_input
      and quest.status = 'completed'
      and quest.completed_at is not null
      and exists (
        select 1 from public.quest_evidence evidence
        where evidence.quest_id = quest.id and evidence.user_id = user_id_input
      )
      and exists (
        select 1 from public.quest_reflections reflection
        where reflection.quest_id = quest.id and reflection.user_id = user_id_input
      )
  ),
  completed_project_capabilities as (
    select
      private.stage16_normalize_capability(capability) as capability_key,
      trim(capability) as capability_label,
      'project'::public.builder_capability_evidence_source as source_type,
      project.id as source_id,
      project.title as source_title,
      'Completed Builder Project with evidence-backed milestone execution.'::text as evidence_summary,
      'pipupath_action'::public.builder_capability_verification as verification,
      2::smallint as strength,
      project.completed_at as source_occurred_at,
      '/projects/' || project.id::text as source_href
    from public.builder_projects project
    join public.user_quests source_quest on source_quest.id = project.source_quest_id
    join public.journey_milestones milestone on milestone.id = source_quest.milestone_id
    cross join lateral unnest(milestone.capabilities_to_develop) as capability
    where project.user_id = user_id_input
      and project.status = 'completed'
      and project.completed_at is not null
  ),
  completed_project_execution as (
    select
      'project_execution'::text as capability_key,
      'Project execution'::text as capability_label,
      'project'::public.builder_capability_evidence_source as source_type,
      project.id as source_id,
      project.title as source_title,
      'Completed a full Builder Project through evidence-backed milestones.'::text as evidence_summary,
      'pipupath_action'::public.builder_capability_verification as verification,
      2::smallint as strength,
      project.completed_at as source_occurred_at,
      '/projects/' || project.id::text as source_href
    from public.builder_projects project
    where project.user_id = user_id_input
      and project.status = 'completed'
      and project.completed_at is not null
  ),
  completed_collaboration as (
    select
      'collaboration'::text as capability_key,
      'Collaboration'::text as capability_label,
      'collaboration'::public.builder_capability_evidence_source as source_type,
      collaboration.id as source_id,
      project.title as source_title,
      'Completed a mutually confirmed Builder collaboration with contribution evidence from both participants.'::text as evidence_summary,
      'mutual_collaboration'::public.builder_capability_verification as verification,
      2::smallint as strength,
      collaboration.completed_at as source_occurred_at,
      '/connect/collaborations/' || collaboration.id::text as source_href
    from public.builder_collaborations collaboration
    join public.builder_projects project on project.id = collaboration.project_id
    where collaboration.status = 'completed'
      and collaboration.completed_at is not null
      and user_id_input in (collaboration.owner_id, collaboration.collaborator_id)
      and exists (
        select 1 from public.builder_collaboration_contributions contribution
        where contribution.collaboration_id = collaboration.id
          and contribution.contributor_id = collaboration.owner_id
      )
      and exists (
        select 1 from public.builder_collaboration_contributions contribution
        where contribution.collaboration_id = collaboration.id
          and contribution.contributor_id = collaboration.collaborator_id
      )
  )
  select * from completed_quests where capability_key <> ''
  union all
  select * from completed_project_capabilities where capability_key <> ''
  union all
  select * from completed_project_execution
  union all
  select * from completed_collaboration;
$$;

revoke all on function private.stage16_capability_evidence(uuid)
  from public, anon, authenticated;

create or replace function public.refresh_stage16_living_builder_profile()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  baseline_id uuid;
  next_version integer;
  profile_id uuid;
  cutoff timestamptz := now();
begin
  if actor is null then
    raise exception 'BUILDER_PROFILE_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select profile.id into baseline_id
  from public.human_potential_profile_versions profile
  where profile.user_id = actor and profile.status = 'active'
  order by profile.version desc
  limit 1;

  if baseline_id is null then
    raise exception 'BUILDER_PROFILE_DISCOVERY_BASELINE_REQUIRED' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(actor::text, 16));

  select coalesce(max(version), 0) + 1 into next_version
  from public.builder_profile_versions
  where user_id = actor;

  update public.builder_profile_versions
  set status = 'superseded', superseded_at = cutoff
  where user_id = actor and status = 'active';

  insert into public.builder_profile_versions (
    user_id,
    version,
    status,
    source_human_potential_profile_id,
    rules_version,
    evidence_cutoff_at
  ) values (
    actor,
    next_version,
    'active',
    baseline_id,
    'stage16.v1',
    cutoff
  ) returning id into profile_id;

  insert into public.builder_capability_claims (
    profile_version_id,
    user_id,
    capability_key,
    capability_label,
    level,
    evidence_count,
    total_strength,
    verification_summary
  )
  select
    profile_id,
    actor,
    evidence.capability_key,
    (array_agg(evidence.capability_label order by evidence.source_occurred_at desc))[1],
    case
      when sum(evidence.strength) >= 4 and count(*) >= 2
        then 'repeatedly_demonstrated'::public.builder_capability_level
      when sum(evidence.strength) >= 2
        then 'demonstrated'::public.builder_capability_level
      else 'practicing'::public.builder_capability_level
    end,
    count(*)::integer,
    sum(evidence.strength)::integer,
    jsonb_build_object(
      'pipupathAction', count(*) filter (where evidence.verification = 'pipupath_action'),
      'mutualCollaboration', count(*) filter (where evidence.verification = 'mutual_collaboration'),
      'sourceTypes', count(distinct evidence.source_type)
    )
  from private.stage16_capability_evidence(actor) evidence
  where evidence.source_occurred_at <= cutoff
  group by evidence.capability_key;

  insert into public.builder_capability_evidence (
    claim_id,
    user_id,
    source_type,
    source_id,
    source_title,
    evidence_summary,
    verification,
    strength,
    source_occurred_at,
    source_href
  )
  select
    claim.id,
    actor,
    evidence.source_type,
    evidence.source_id,
    evidence.source_title,
    evidence.evidence_summary,
    evidence.verification,
    evidence.strength,
    evidence.source_occurred_at,
    evidence.source_href
  from private.stage16_capability_evidence(actor) evidence
  join public.builder_capability_claims claim
    on claim.profile_version_id = profile_id
   and claim.capability_key = evidence.capability_key
  where evidence.source_occurred_at <= cutoff;

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values (
    actor,
    'living_builder_profile_refreshed',
    'success',
    jsonb_build_object('profile_version_id', profile_id, 'version', next_version, 'rules_version', 'stage16.v1')
  );

  return profile_id;
end;
$$;

revoke all on function public.refresh_stage16_living_builder_profile()
  from public, anon;
grant execute on function public.refresh_stage16_living_builder_profile()
  to authenticated;

create or replace function public.record_stage16_capability_feedback(
  claim_id_input uuid,
  feedback_type_input public.builder_capability_feedback_type,
  context_note_input text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  feedback_id uuid;
  clean_note text := nullif(trim(coalesce(context_note_input, '')), '');
begin
  if actor is null then
    raise exception 'BUILDER_PROFILE_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.builder_capability_claims claim
    join public.builder_profile_versions version on version.id = claim.profile_version_id
    where claim.id = claim_id_input
      and claim.user_id = actor
      and version.user_id = actor
      and version.status = 'active'
  ) then
    raise exception 'BUILDER_PROFILE_CLAIM_NOT_FOUND' using errcode = 'P0001';
  end if;

  if clean_note is not null and char_length(clean_note) not between 3 and 600 then
    raise exception 'BUILDER_PROFILE_FEEDBACK_INVALID' using errcode = 'P0001';
  end if;
  if feedback_type_input = 'needs_context' and clean_note is null then
    raise exception 'BUILDER_PROFILE_FEEDBACK_CONTEXT_REQUIRED' using errcode = 'P0001';
  end if;

  insert into public.builder_capability_feedback(user_id, claim_id, feedback_type, context_note)
  values (actor, claim_id_input, feedback_type_input, clean_note)
  returning id into feedback_id;

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values (
    actor,
    'living_builder_profile_feedback_recorded',
    'success',
    jsonb_build_object('claim_id', claim_id_input, 'feedback_type', feedback_type_input)
  );

  return feedback_id;
end;
$$;

revoke all on function public.record_stage16_capability_feedback(
  uuid, public.builder_capability_feedback_type, text
) from public, anon;
grant execute on function public.record_stage16_capability_feedback(
  uuid, public.builder_capability_feedback_type, text
) to authenticated;

create or replace function public.get_stage16_living_builder_profile()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  active_profile public.builder_profile_versions%rowtype;
  result jsonb;
begin
  if actor is null then
    raise exception 'BUILDER_PROFILE_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select * into active_profile
  from public.builder_profile_versions
  where user_id = actor and status = 'active'
  order by version desc
  limit 1;

  if active_profile.id is null then
    return null;
  end if;

  select jsonb_build_object(
    'id', active_profile.id,
    'version', active_profile.version,
    'rulesVersion', active_profile.rules_version,
    'evidenceCutoffAt', active_profile.evidence_cutoff_at,
    'createdAt', active_profile.created_at,
    'sourceHumanPotentialProfileId', active_profile.source_human_potential_profile_id,
    'capabilities', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', claim.id,
          'key', claim.capability_key,
          'label', claim.capability_label,
          'level', claim.level,
          'evidenceCount', claim.evidence_count,
          'totalStrength', claim.total_strength,
          'verificationSummary', claim.verification_summary,
          'feedback', (
            select jsonb_build_object(
              'type', feedback.feedback_type,
              'contextNote', feedback.context_note,
              'createdAt', feedback.created_at
            )
            from public.builder_capability_feedback feedback
            where feedback.claim_id = claim.id and feedback.user_id = actor
            order by feedback.created_at desc
            limit 1
          ),
          'evidence', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', evidence.id,
                'sourceType', evidence.source_type,
                'sourceId', evidence.source_id,
                'sourceTitle', evidence.source_title,
                'summary', evidence.evidence_summary,
                'verification', evidence.verification,
                'strength', evidence.strength,
                'occurredAt', evidence.source_occurred_at,
                'href', evidence.source_href
              ) order by evidence.source_occurred_at desc
            )
            from public.builder_capability_evidence evidence
            where evidence.claim_id = claim.id and evidence.user_id = actor
          ), '[]'::jsonb)
        ) order by
          case claim.level
            when 'repeatedly_demonstrated' then 1
            when 'demonstrated' then 2
            else 3
          end,
          claim.capability_label
      )
      from public.builder_capability_claims claim
      where claim.profile_version_id = active_profile.id and claim.user_id = actor
    ), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', version.id,
          'version', version.version,
          'status', version.status,
          'rulesVersion', version.rules_version,
          'evidenceCutoffAt', version.evidence_cutoff_at,
          'createdAt', version.created_at,
          'capabilityCount', (
            select count(*) from public.builder_capability_claims claim
            where claim.profile_version_id = version.id and claim.user_id = actor
          )
        ) order by version.version desc
      )
      from public.builder_profile_versions version
      where version.user_id = actor
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_stage16_living_builder_profile()
  from public, anon;
grant execute on function public.get_stage16_living_builder_profile()
  to authenticated;
