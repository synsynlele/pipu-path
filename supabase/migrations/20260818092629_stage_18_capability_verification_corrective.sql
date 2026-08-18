-- Corrective Stage 18: evidence-bound capability verification by the actual collaboration partner.
-- This is private trust infrastructure, not endorsements, ratings or public reputation.

create type public.builder_capability_verification_status as enum (
  'pending',
  'confirmed',
  'declined',
  'withdrawn',
  'revoked'
);

create type public.builder_capability_verifier_kind as enum (
  'collaboration_partner'
);

create table public.builder_capability_verifications (
  id uuid primary key default gen_random_uuid(),
  builder_user_id uuid not null references public.profiles(id) on delete cascade,
  capability_key text not null check (capability_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  capability_label_at_request text not null check (char_length(capability_label_at_request) between 2 and 120),
  claim_id_at_request uuid not null references public.builder_capability_claims(id) on delete cascade,
  evidence_id_at_request uuid not null references public.builder_capability_evidence(id) on delete cascade,
  basis_source_type public.builder_capability_evidence_source not null check (basis_source_type = 'collaboration'),
  basis_source_id uuid not null,
  verifier_kind public.builder_capability_verifier_kind not null default 'collaboration_partner',
  verifier_user_id uuid not null references public.profiles(id) on delete cascade,
  status public.builder_capability_verification_status not null default 'pending',
  request_note text check (request_note is null or char_length(request_note) between 3 and 400),
  response_note text check (response_note is null or char_length(response_note) between 3 and 600),
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  withdrawn_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builder_capability_verifications_distinct_people check (builder_user_id <> verifier_user_id),
  constraint builder_capability_verifications_lifecycle check (
    (status = 'pending' and responded_at is null and withdrawn_at is null and revoked_at is null)
    or (status in ('confirmed','declined') and responded_at is not null and withdrawn_at is null and revoked_at is null)
    or (status = 'withdrawn' and withdrawn_at is not null and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  )
);

create unique index builder_capability_verifications_pending_idx
  on public.builder_capability_verifications(builder_user_id, capability_key, basis_source_id, verifier_user_id)
  where status = 'pending';
create unique index builder_capability_verifications_confirmed_idx
  on public.builder_capability_verifications(builder_user_id, capability_key, basis_source_id, verifier_user_id)
  where status = 'confirmed';
create index builder_capability_verifications_builder_idx
  on public.builder_capability_verifications(builder_user_id, requested_at desc);
create index builder_capability_verifications_verifier_idx
  on public.builder_capability_verifications(verifier_user_id, requested_at desc);

create trigger builder_capability_verifications_updated_at
before update on public.builder_capability_verifications
for each row execute function public.set_updated_at();

alter table public.builder_capability_verifications enable row level security;
revoke all on public.builder_capability_verifications from public, anon, authenticated;
grant select, insert, update on public.builder_capability_verifications to service_role;

create or replace function private.stage18_verification_relationship_valid(builder_id uuid, verifier_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    builder_id is not null
    and verifier_id is not null
    and builder_id <> verifier_id
    and private.stage11_builder_connect_eligible(builder_id)
    and private.stage11_builder_connect_eligible(verifier_id)
    and not private.stage11_builder_pair_blocked(builder_id, verifier_id)
    and private.stage15_connection_for_pair(builder_id, verifier_id) is not null;
$$;

revoke all on function private.stage18_verification_relationship_valid(uuid, uuid)
  from public, anon, authenticated;

create or replace function public.request_stage18_collaboration_capability_verification(
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
  claim_row public.builder_capability_claims%rowtype;
  evidence_row public.builder_capability_evidence%rowtype;
  collaboration_row public.builder_collaborations%rowtype;
  verifier_id uuid;
  clean_note text := nullif(trim(coalesce(request_note_input, '')), '');
  verification_id uuid;
begin
  if actor is null then
    raise exception 'CAPABILITY_VERIFICATION_ACCESS_DENIED' using errcode = 'P0001';
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
    raise exception 'CAPABILITY_VERIFICATION_ACTIVE_CLAIM_REQUIRED' using errcode = 'P0001';
  end if;

  select evidence.* into evidence_row
  from public.builder_capability_evidence evidence
  where evidence.id = evidence_id_input
    and evidence.claim_id = claim_row.id
    and evidence.user_id = actor
    and evidence.source_type = 'collaboration'
    and evidence.verification = 'mutual_collaboration'
  limit 1;
  if evidence_row.id is null then
    raise exception 'CAPABILITY_VERIFICATION_COLLABORATION_EVIDENCE_REQUIRED' using errcode = 'P0001';
  end if;

  select * into collaboration_row
  from public.builder_collaborations
  where id = evidence_row.source_id
    and status = 'completed'
    and actor in (owner_id, collaborator_id)
  limit 1;
  if collaboration_row.id is null then
    raise exception 'CAPABILITY_VERIFICATION_COMPLETED_COLLABORATION_REQUIRED' using errcode = 'P0001';
  end if;

  verifier_id := case
    when collaboration_row.owner_id = actor then collaboration_row.collaborator_id
    else collaboration_row.owner_id
  end;

  if not private.stage18_verification_relationship_valid(actor, verifier_id) then
    raise exception 'CAPABILITY_VERIFICATION_RELATIONSHIP_REQUIRED' using errcode = 'P0001';
  end if;
  if clean_note is not null and char_length(clean_note) not between 3 and 400 then
    raise exception 'CAPABILITY_VERIFICATION_INPUT_INVALID' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.builder_capability_verifications verification
    where verification.builder_user_id = actor
      and verification.capability_key = claim_row.capability_key
      and verification.basis_source_id = evidence_row.source_id
      and verification.verifier_user_id = verifier_id
      and verification.status = 'confirmed'
  ) then
    raise exception 'CAPABILITY_VERIFICATION_ALREADY_CONFIRMED' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.builder_capability_verifications verification
    where verification.builder_user_id = actor
      and verification.capability_key = claim_row.capability_key
      and verification.basis_source_id = evidence_row.source_id
      and verification.verifier_user_id = verifier_id
      and verification.status = 'pending'
  ) then
    raise exception 'CAPABILITY_VERIFICATION_ALREADY_PENDING' using errcode = 'P0001';
  end if;

  insert into public.builder_capability_verifications (
    builder_user_id,
    capability_key,
    capability_label_at_request,
    claim_id_at_request,
    evidence_id_at_request,
    basis_source_type,
    basis_source_id,
    verifier_kind,
    verifier_user_id,
    status,
    request_note
  ) values (
    actor,
    claim_row.capability_key,
    claim_row.capability_label,
    claim_row.id,
    evidence_row.id,
    'collaboration',
    evidence_row.source_id,
    'collaboration_partner',
    verifier_id,
    'pending',
    clean_note
  ) returning id into verification_id;

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values (
    actor,
    'capability_verification_requested',
    'success',
    jsonb_build_object(
      'verification_id', verification_id,
      'capability_key', claim_row.capability_key,
      'basis_source_id', evidence_row.source_id,
      'verifier_kind', 'collaboration_partner'
    )
  );

  return verification_id;
end;
$$;

create or replace function public.respond_stage18_collaboration_capability_verification(
  verification_id_input uuid,
  confirm_input boolean,
  response_note_input text default null
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.builder_capability_verifications%rowtype;
  clean_note text := nullif(trim(coalesce(response_note_input, '')), '');
begin
  if actor is null then
    raise exception 'CAPABILITY_VERIFICATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select * into target
  from public.builder_capability_verifications
  where id = verification_id_input
    and verifier_user_id = actor
    and status = 'pending'
  for update;
  if target.id is null then
    raise exception 'CAPABILITY_VERIFICATION_REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;

  if not private.stage18_verification_relationship_valid(target.builder_user_id, actor) then
    raise exception 'CAPABILITY_VERIFICATION_RELATIONSHIP_REQUIRED' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.builder_collaborations collaboration
    where collaboration.id = target.basis_source_id
      and collaboration.status = 'completed'
      and target.builder_user_id in (collaboration.owner_id, collaboration.collaborator_id)
      and actor in (collaboration.owner_id, collaboration.collaborator_id)
  ) then
    raise exception 'CAPABILITY_VERIFICATION_COMPLETED_COLLABORATION_REQUIRED' using errcode = 'P0001';
  end if;
  if clean_note is not null and char_length(clean_note) not between 3 and 600 then
    raise exception 'CAPABILITY_VERIFICATION_INPUT_INVALID' using errcode = 'P0001';
  end if;

  update public.builder_capability_verifications
  set status = case
        when confirm_input then 'confirmed'::public.builder_capability_verification_status
        else 'declined'::public.builder_capability_verification_status
      end,
      response_note = clean_note,
      responded_at = now()
  where id = target.id;

  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values (
    actor,
    case when confirm_input then 'capability_verification_confirmed' else 'capability_verification_declined' end,
    'success',
    jsonb_build_object(
      'verification_id', target.id,
      'capability_key', target.capability_key,
      'builder_user_id', target.builder_user_id,
      'basis_source_id', target.basis_source_id
    )
  );

  return true;
end;
$$;

create or replace function public.withdraw_stage18_capability_verification(
  verification_id_input uuid
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null then
    raise exception 'CAPABILITY_VERIFICATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  update public.builder_capability_verifications
  set status = 'withdrawn', withdrawn_at = now()
  where id = verification_id_input
    and builder_user_id = actor
    and status = 'pending';
  if not found then
    raise exception 'CAPABILITY_VERIFICATION_REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;
  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values (actor, 'capability_verification_withdrawn', 'success', jsonb_build_object('verification_id', verification_id_input));
  return true;
end;
$$;

create or replace function public.revoke_stage18_capability_verification(
  verification_id_input uuid
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  target public.builder_capability_verifications%rowtype;
begin
  if actor is null then
    raise exception 'CAPABILITY_VERIFICATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;
  select * into target
  from public.builder_capability_verifications
  where id = verification_id_input
    and status = 'confirmed'
    and actor in (builder_user_id, verifier_user_id)
  for update;
  if target.id is null then
    raise exception 'CAPABILITY_VERIFICATION_CONFIRMED_RECORD_NOT_FOUND' using errcode = 'P0001';
  end if;
  update public.builder_capability_verifications
  set status = 'revoked', revoked_at = now()
  where id = target.id;
  insert into public.identity_audit_events(user_id, operation, result, metadata)
  values (
    actor,
    'capability_verification_revoked',
    'success',
    jsonb_build_object(
      'verification_id', target.id,
      'actor_role', case when actor = target.builder_user_id then 'builder' else 'verifier' end
    )
  );
  return true;
end;
$$;

create or replace function public.get_stage18_capability_verification_workspace()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  result jsonb;
begin
  if actor is null then
    raise exception 'CAPABILITY_VERIFICATION_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'eligibleEvidence', coalesce((
      select jsonb_agg(jsonb_build_object(
        'claimId', claim.id,
        'evidenceId', evidence.id,
        'capabilityKey', claim.capability_key,
        'capabilityLabel', claim.capability_label,
        'level', claim.level,
        'sourceTitle', evidence.source_title,
        'sourceSummary', evidence.evidence_summary,
        'collaborationId', collaboration.id,
        'verifierUserId', partner.id,
        'verifierDisplayName', partner.display_name,
        'verifierUsername', partner.username
      ) order by claim.capability_label, evidence.source_occurred_at desc)
      from public.builder_capability_claims claim
      join public.builder_profile_versions version
        on version.id = claim.profile_version_id and version.status = 'active'
      join public.builder_capability_evidence evidence
        on evidence.claim_id = claim.id
       and evidence.user_id = actor
       and evidence.source_type = 'collaboration'
       and evidence.verification = 'mutual_collaboration'
      join public.builder_collaborations collaboration
        on collaboration.id = evidence.source_id
       and collaboration.status = 'completed'
       and actor in (collaboration.owner_id, collaboration.collaborator_id)
      join public.profiles partner
        on partner.id = case
          when collaboration.owner_id = actor then collaboration.collaborator_id
          else collaboration.owner_id
        end
      where claim.user_id = actor
        and version.user_id = actor
        and private.stage18_verification_relationship_valid(actor, partner.id)
        and not exists (
          select 1 from public.builder_capability_verifications verification
          where verification.builder_user_id = actor
            and verification.capability_key = claim.capability_key
            and verification.basis_source_id = collaboration.id
            and verification.verifier_user_id = partner.id
            and verification.status in ('pending','confirmed')
        )
    ), '[]'::jsonb),
    'verifiedCapabilities', coalesce((
      select jsonb_agg(jsonb_build_object(
        'capabilityKey', verification.capability_key,
        'capabilityLabel', max(verification.capability_label_at_request),
        'confirmedCount', count(*)
      ) order by max(verification.capability_label_at_request))
      from public.builder_capability_verifications verification
      where verification.builder_user_id = actor
        and verification.status = 'confirmed'
      group by verification.capability_key
    ), '[]'::jsonb),
    'outgoing', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', verification.id,
        'capabilityKey', verification.capability_key,
        'capabilityLabel', verification.capability_label_at_request,
        'sourceTitle', evidence.source_title,
        'sourceSummary', evidence.evidence_summary,
        'status', verification.status,
        'requestNote', verification.request_note,
        'responseNote', verification.response_note,
        'requestedAt', verification.requested_at,
        'respondedAt', verification.responded_at,
        'verifierDisplayName', verifier.display_name,
        'verifierUsername', verifier.username,
        'actionable', verification.status = 'pending'
      ) order by verification.requested_at desc)
      from public.builder_capability_verifications verification
      join public.builder_capability_evidence evidence on evidence.id = verification.evidence_id_at_request
      join public.profiles verifier on verifier.id = verification.verifier_user_id
      where verification.builder_user_id = actor
    ), '[]'::jsonb),
    'incoming', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', verification.id,
        'capabilityKey', verification.capability_key,
        'capabilityLabel', verification.capability_label_at_request,
        'sourceTitle', evidence.source_title,
        'sourceSummary', evidence.evidence_summary,
        'status', verification.status,
        'requestNote', verification.request_note,
        'responseNote', verification.response_note,
        'requestedAt', verification.requested_at,
        'respondedAt', verification.responded_at,
        'builderDisplayName', builder.display_name,
        'builderUsername', builder.username,
        'actionable', verification.status = 'pending'
          and private.stage18_verification_relationship_valid(verification.builder_user_id, actor)
          and exists (
            select 1 from public.builder_collaborations collaboration
            where collaboration.id = verification.basis_source_id and collaboration.status = 'completed'
          )
      ) order by verification.requested_at desc)
      from public.builder_capability_verifications verification
      join public.builder_capability_evidence evidence on evidence.id = verification.evidence_id_at_request
      join public.profiles builder on builder.id = verification.builder_user_id
      where verification.verifier_user_id = actor
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.request_stage18_collaboration_capability_verification(uuid, uuid, text) from public, anon;
revoke all on function public.respond_stage18_collaboration_capability_verification(uuid, boolean, text) from public, anon;
revoke all on function public.withdraw_stage18_capability_verification(uuid) from public, anon;
revoke all on function public.revoke_stage18_capability_verification(uuid) from public, anon;
revoke all on function public.get_stage18_capability_verification_workspace() from public, anon;

grant execute on function public.request_stage18_collaboration_capability_verification(uuid, uuid, text) to authenticated;
grant execute on function public.respond_stage18_collaboration_capability_verification(uuid, boolean, text) to authenticated;
grant execute on function public.withdraw_stage18_capability_verification(uuid) to authenticated;
grant execute on function public.revoke_stage18_capability_verification(uuid) to authenticated;
grant execute on function public.get_stage18_capability_verification_workspace() to authenticated;

comment on table public.builder_capability_verifications is
  'Private evidence-bound human confirmation of a Builder capability. Stage 18 supports only the actual partner from a completed Builder collaboration; institution verification is a later extension.';
