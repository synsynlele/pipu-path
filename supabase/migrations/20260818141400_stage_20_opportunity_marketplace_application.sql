create or replace function public.save_stage20_opportunity_application_draft(
  opportunity_id_input uuid,
  builder_summary_input text,
  selected_path_name_input text,
  application_note_input text,
  claim_ids_input uuid[],
  evidence_ids_input uuid[],
  institution_verification_ids_input uuid[],
  portfolio_ids_input uuid[]
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  opportunity_row public.opportunities%rowtype;
  application_id_value uuid;
  display_name_value text;
  claim_ids uuid[] := coalesce(claim_ids_input, '{}'::uuid[]);
  evidence_ids uuid[] := coalesce(evidence_ids_input, '{}'::uuid[]);
  verification_ids uuid[] := coalesce(institution_verification_ids_input, '{}'::uuid[]);
  portfolio_ids uuid[] := coalesce(portfolio_ids_input, '{}'::uuid[]);
begin
  perform private.stage20_active_adult_builder(actor);
  opportunity_row := private.stage20_marketplace_opportunity(opportunity_id_input);

  if cardinality(claim_ids) > 12
     or cardinality(evidence_ids) > 20
     or cardinality(verification_ids) > 12
     or cardinality(portfolio_ids) > 8 then
    raise exception 'MARKETPLACE_APPLICATION_SELECTION_LIMIT' using errcode = 'P0001';
  end if;

  if cardinality(claim_ids) <> (select count(distinct value) from unnest(claim_ids) value)
     or cardinality(evidence_ids) <> (select count(distinct value) from unnest(evidence_ids) value)
     or cardinality(verification_ids) <> (select count(distinct value) from unnest(verification_ids) value)
     or cardinality(portfolio_ids) <> (select count(distinct value) from unnest(portfolio_ids) value) then
    raise exception 'MARKETPLACE_APPLICATION_DUPLICATE_SELECTION' using errcode = 'P0001';
  end if;

  select coalesce(
    nullif(btrim(profile.display_name), ''),
    nullif(btrim(profile.preferred_name), ''),
    nullif(btrim(profile.username::text), '')
  ) into display_name_value
  from public.profiles profile
  where profile.id = actor;

  if display_name_value is null then
    raise exception 'MARKETPLACE_APPLICATION_DISPLAY_NAME_REQUIRED' using errcode = 'P0001';
  end if;

  select application.id into application_id_value
  from public.opportunity_applications application
  where application.builder_user_id = actor
    and application.opportunity_id = opportunity_id_input
  for update;

  if application_id_value is null then
    insert into public.opportunity_applications(
      opportunity_id,
      provider_id,
      builder_user_id,
      display_name_snapshot,
      builder_summary_snapshot,
      selected_path_name_snapshot,
      application_note
    ) values (
      opportunity_id_input,
      opportunity_row.provider_id,
      actor,
      display_name_value,
      nullif(btrim(builder_summary_input), ''),
      nullif(btrim(selected_path_name_input), ''),
      nullif(btrim(application_note_input), '')
    ) returning id into application_id_value;
  else
    if not exists (
      select 1 from public.opportunity_applications application
      where application.id = application_id_value
        and application.status = 'draft'
    ) then
      raise exception 'MARKETPLACE_APPLICATION_DRAFT_LOCKED' using errcode = 'P0001';
    end if;

    update public.opportunity_applications
    set display_name_snapshot = display_name_value,
        builder_summary_snapshot = nullif(btrim(builder_summary_input), ''),
        selected_path_name_snapshot = nullif(btrim(selected_path_name_input), ''),
        application_note = nullif(btrim(application_note_input), '')
    where id = application_id_value;

    delete from public.opportunity_application_evidence
    where application_id = application_id_value;
    delete from public.opportunity_application_institution_verifications
    where application_id = application_id_value;
    delete from public.opportunity_application_portfolio_proofs
    where application_id = application_id_value;
    delete from public.opportunity_application_capabilities
    where application_id = application_id_value;
  end if;

  if exists (
    select 1
    from unnest(claim_ids) requested(claim_id)
    where not exists (
      select 1
      from public.builder_capability_claims claim
      join public.builder_profile_versions version on version.id = claim.profile_version_id
      where claim.id = requested.claim_id
        and claim.user_id = actor
        and version.user_id = actor
        and version.status = 'active'
    )
  ) then
    raise exception 'MARKETPLACE_APPLICATION_CLAIM_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  insert into public.opportunity_application_capabilities(
    application_id,
    claim_id,
    capability_key,
    capability_label,
    capability_level
  )
  select
    application_id_value,
    claim.id,
    claim.capability_key,
    claim.capability_label,
    claim.level
  from public.builder_capability_claims claim
  where claim.id = any(claim_ids);

  if exists (
    select 1
    from unnest(evidence_ids) requested(evidence_id)
    where not exists (
      select 1
      from public.builder_capability_evidence item
      join public.builder_capability_claims claim on claim.id = item.claim_id
      join public.builder_profile_versions version on version.id = claim.profile_version_id
      where item.id = requested.evidence_id
        and item.user_id = actor
        and claim.user_id = actor
        and version.status = 'active'
        and claim.id = any(claim_ids)
    )
  ) then
    raise exception 'MARKETPLACE_APPLICATION_EVIDENCE_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  insert into public.opportunity_application_evidence(
    application_id,
    claim_id,
    evidence_id,
    source_type,
    source_title,
    evidence_summary,
    source_href
  )
  select
    application_id_value,
    item.claim_id,
    item.id,
    item.source_type,
    item.source_title,
    item.evidence_summary,
    item.source_href
  from public.builder_capability_evidence item
  where item.id = any(evidence_ids);

  if exists (
    select 1
    from unnest(verification_ids) requested(verification_id)
    where not exists (
      select 1
      from public.institution_capability_verifications verification
      where verification.id = requested.verification_id
        and verification.builder_user_id = actor
        and verification.status = 'confirmed'
        and verification.responded_at is not null
    )
  ) then
    raise exception 'MARKETPLACE_APPLICATION_INSTITUTION_VERIFICATION_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  insert into public.opportunity_application_institution_verifications(
    application_id,
    verification_id,
    capability_key,
    capability_label,
    institution_name,
    confirmed_at
  )
  select
    application_id_value,
    verification.id,
    verification.capability_key,
    verification.capability_label_at_request,
    cohort.organisation_name,
    verification.responded_at
  from public.institution_capability_verifications verification
  join public.institution_workspaces workspace on workspace.id = verification.workspace_id
  join public.khpos_school_cohorts cohort on cohort.id = workspace.cohort_id
  where verification.id = any(verification_ids)
    and verification.builder_user_id = actor
    and verification.status = 'confirmed';

  if exists (
    select 1
    from unnest(portfolio_ids) requested(portfolio_id)
    where not exists (
      select 1
      from public.builder_project_portfolios portfolio
      where portfolio.id = requested.portfolio_id
        and portfolio.user_id = actor
        and portfolio.status = 'published'
    )
  ) then
    raise exception 'MARKETPLACE_APPLICATION_PORTFOLIO_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  insert into public.opportunity_application_portfolio_proofs(
    application_id,
    portfolio_id,
    slug,
    public_title,
    public_summary,
    proof_href
  )
  select
    application_id_value,
    portfolio.id,
    portfolio.slug::text,
    portfolio.public_title,
    portfolio.public_summary,
    '/proof/' || portfolio.slug::text
  from public.builder_project_portfolios portfolio
  where portfolio.id = any(portfolio_ids)
    and portfolio.user_id = actor
    and portfolio.status = 'published';

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, opportunity_id, application_id, event_type,
    metadata
  ) values (
    actor,
    opportunity_row.provider_id,
    opportunity_id_input,
    application_id_value,
    'application_draft_saved',
    jsonb_build_object(
      'capabilityCount', cardinality(claim_ids),
      'evidenceCount', cardinality(evidence_ids),
      'institutionVerificationCount', cardinality(verification_ids),
      'portfolioProofCount', cardinality(portfolio_ids)
    )
  );

  return application_id_value;
end;
$$;

create or replace function public.submit_stage20_opportunity_application(
  application_id_input uuid,
  consent_policy_version_input text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  application_row public.opportunity_applications%rowtype;
  opportunity_row public.opportunities%rowtype;
begin
  perform private.stage20_active_adult_builder(actor);

  select application.* into application_row
  from public.opportunity_applications application
  where application.id = application_id_input
    and application.builder_user_id = actor
  for update;

  if application_row.id is null then
    raise exception 'MARKETPLACE_APPLICATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if application_row.status <> 'draft' then
    raise exception 'MARKETPLACE_APPLICATION_NOT_DRAFT' using errcode = 'P0001';
  end if;
  if consent_policy_version_input <> 'opportunity-marketplace-application-v1' then
    raise exception 'MARKETPLACE_APPLICATION_CONSENT_REQUIRED' using errcode = 'P0001';
  end if;

  opportunity_row := private.stage20_marketplace_opportunity(application_row.opportunity_id);
  if opportunity_row.provider_id <> application_row.provider_id then
    raise exception 'MARKETPLACE_APPLICATION_PROVIDER_MISMATCH' using errcode = 'P0001';
  end if;

  update public.opportunity_applications
  set status = 'submitted',
      consent_policy_version = consent_policy_version_input,
      submitted_at = now()
  where id = application_id_input;

  insert into public.builder_opportunity_state(user_id, opportunity_id, applied_at)
  values (actor, application_row.opportunity_id, now())
  on conflict (user_id, opportunity_id) do update
    set applied_at = coalesce(public.builder_opportunity_state.applied_at, now());

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, opportunity_id, application_id, event_type
  ) values (
    actor,
    application_row.provider_id,
    application_row.opportunity_id,
    application_id_input,
    'application_submitted'
  );
end;
$$;

create or replace function public.withdraw_stage20_opportunity_application(
  application_id_input uuid
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  application_row public.opportunity_applications%rowtype;
begin
  perform private.stage18_active_builder(actor);

  select application.* into application_row
  from public.opportunity_applications application
  where application.id = application_id_input
    and application.builder_user_id = actor
  for update;

  if application_row.id is null then
    raise exception 'MARKETPLACE_APPLICATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if application_row.status not in ('draft', 'submitted', 'viewed', 'shortlisted') then
    raise exception 'MARKETPLACE_APPLICATION_WITHDRAWAL_NOT_ALLOWED' using errcode = 'P0001';
  end if;

  update public.opportunity_applications
  set status = 'withdrawn',
      withdrawn_at = now()
  where id = application_id_input;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, opportunity_id, application_id, event_type,
    metadata
  ) values (
    actor,
    application_row.provider_id,
    application_row.opportunity_id,
    application_id_input,
    'application_withdrawn',
    jsonb_build_object('from', application_row.status)
  );
end;
$$;

