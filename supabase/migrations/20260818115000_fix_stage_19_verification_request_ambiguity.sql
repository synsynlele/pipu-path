-- Stage 19 runtime hardening: avoid a second PL/pgSQL variable/column
-- ambiguity in the Builder-initiated institutional verification request RPC.

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
  resolved_workspace_id uuid;
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

  resolved_workspace_id := private.stage19_builder_workspace(actor);
  if resolved_workspace_id is null then
    raise exception 'INSTITUTION_VERIFICATION_ACTIVE_MEMBERSHIP_REQUIRED' using errcode = 'P0001';
  end if;

  select workspace.* into workspace_row
  from public.institution_workspaces workspace
  where workspace.id = resolved_workspace_id;

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

  select evidence.* into evidence_row
  from public.builder_capability_evidence evidence
  where evidence.id = evidence_id_input
    and evidence.claim_id = claim_row.id
    and evidence.user_id = actor
  limit 1;
  if evidence_row.id is null then
    raise exception 'INSTITUTION_VERIFICATION_EVIDENCE_REQUIRED' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.institution_capability_verifications verification
    where verification.workspace_id = resolved_workspace_id
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
    where verification.workspace_id = resolved_workspace_id
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
    resolved_workspace_id,
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
      'workspace_id', resolved_workspace_id,
      'capability_key', claim_row.capability_key,
      'evidence_id', evidence_row.id,
      'consent_policy_version', 'institution-capability-share-v1'
    )
  );

  insert into public.institution_audit_events(
    workspace_id, actor_user_id, operation, result, target_type, target_id, metadata
  ) values (
    resolved_workspace_id,
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

revoke all on function public.request_stage19_institution_capability_verification(uuid, uuid, text)
  from public, anon;
grant execute on function public.request_stage19_institution_capability_verification(uuid, uuid, text)
  to authenticated;
