-- Stage 20 hardening: close integration/privacy gaps discovered while wiring
-- the provider and Builder surfaces before any live migration is applied.

create or replace function private.stage20_enforce_application_provider_match()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  listing_provider_id uuid;
begin
  select opportunity.provider_id into listing_provider_id
  from public.opportunities opportunity
  where opportunity.id = new.opportunity_id;

  if listing_provider_id is null or listing_provider_id <> new.provider_id then
    raise exception 'MARKETPLACE_APPLICATION_PROVIDER_MISMATCH' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function private.stage20_enforce_application_provider_match()
  from public, anon, authenticated;

drop trigger if exists opportunity_application_provider_match
  on public.opportunity_applications;
create trigger opportunity_application_provider_match
before insert or update of opportunity_id, provider_id
on public.opportunity_applications
for each row execute function private.stage20_enforce_application_provider_match();

create or replace function public.list_stage20_provider_workspaces()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  workspaces jsonb;
begin
  if actor is null then
    raise exception 'AUTH_REQUIRED' using errcode = 'P0001';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'providerId', provider.id,
    'organisationName', provider.organisation_name,
    'status', provider.status,
    'role', member.role,
    'joinedAt', member.granted_at
  ) order by provider.organisation_name), '[]'::jsonb)
  into workspaces
  from public.opportunity_provider_members member
  join public.opportunity_providers provider on provider.id = member.provider_id
  join public.profiles profile on profile.id = member.user_id
  where member.user_id = actor
    and member.status = 'active'
    and profile.account_status = 'active'
    and profile.deleted_at is null
    and coalesce(profile.is_minor, true) = false
    and profile.safeguarding_review_required = false;

  return workspaces;
end;
$$;

revoke all on function public.list_stage20_provider_workspaces()
  from public, anon;
revoke all on function public.list_stage20_provider_workspaces()
  from public;
grant execute on function public.list_stage20_provider_workspaces()
  to authenticated, service_role;

-- Shared application projections expose only the packet the Builder consented
-- to share. Internal PipuPath user IDs are deliberately excluded.
create or replace function private.stage20_application_projection(application_id_input uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  payload jsonb;
begin
  select jsonb_build_object(
    'id', application.id,
    'opportunityId', application.opportunity_id,
    'providerId', application.provider_id,
    'status', application.status,
    'displayName', application.display_name_snapshot,
    'builderSummary', application.builder_summary_snapshot,
    'selectedPathName', application.selected_path_name_snapshot,
    'applicationNote', application.application_note,
    'submittedAt', application.submitted_at,
    'viewedAt', application.viewed_at,
    'decidedAt', application.decided_at,
    'withdrawnAt', application.withdrawn_at,
    'capabilities', coalesce((
      select jsonb_agg(jsonb_build_object(
        'claimId', selection.claim_id,
        'capabilityKey', selection.capability_key,
        'capabilityLabel', selection.capability_label,
        'capabilityLevel', selection.capability_level
      ) order by selection.capability_label)
      from public.opportunity_application_capabilities selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'evidence', coalesce((
      select jsonb_agg(jsonb_build_object(
        'evidenceId', selection.evidence_id,
        'claimId', selection.claim_id,
        'sourceType', selection.source_type,
        'sourceTitle', selection.source_title,
        'evidenceSummary', selection.evidence_summary
      ) order by selection.source_title)
      from public.opportunity_application_evidence selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'institutionVerifications', coalesce((
      select jsonb_agg(jsonb_build_object(
        'verificationId', selection.verification_id,
        'capabilityKey', selection.capability_key,
        'capabilityLabel', selection.capability_label,
        'institutionName', selection.institution_name,
        'confirmedAt', selection.confirmed_at
      ) order by selection.institution_name)
      from public.opportunity_application_institution_verifications selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'portfolioProofs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'portfolioId', selection.portfolio_id,
        'slug', selection.slug,
        'publicTitle', selection.public_title,
        'publicSummary', selection.public_summary,
        'proofHref', selection.proof_href
      ) order by selection.public_title)
      from public.opportunity_application_portfolio_proofs selection
      where selection.application_id = application.id
    ), '[]'::jsonb)
  ) into payload
  from public.opportunity_applications application
  where application.id = application_id_input;

  return payload;
end;
$$;

revoke all on function private.stage20_application_projection(uuid)
  from public, anon, authenticated;

-- Existing applications remain visible to their Builder after a listing closes
-- or a provider is suspended/revoked, so the Builder can inspect history and
-- exercise withdrawal where the lifecycle still allows it. New application
-- drafting still requires adult/safeguarding eligibility and active trusted
-- supply.
create or replace function public.get_stage20_builder_application_workspace(
  opportunity_id_input uuid
) returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  opportunity_row public.opportunities%rowtype;
  provider_payload jsonb;
  application_payload jsonb;
  application_status_value public.opportunity_application_status;
  can_edit boolean := false;
  adult_eligible boolean := false;
  capabilities jsonb := '[]'::jsonb;
  evidence jsonb := '[]'::jsonb;
  institution_verifications jsonb := '[]'::jsonb;
  portfolio_proofs jsonb := '[]'::jsonb;
begin
  perform private.stage18_active_builder(actor);

  select opportunity.* into opportunity_row
  from public.opportunities opportunity
  where opportunity.id = opportunity_id_input
    and opportunity.provider_id is not null;

  if opportunity_row.id is null then
    raise exception 'MARKETPLACE_OPPORTUNITY_NOT_FOUND' using errcode = 'P0001';
  end if;

  select application.status into application_status_value
  from public.opportunity_applications application
  where application.opportunity_id = opportunity_id_input
    and application.builder_user_id = actor;

  adult_eligible := exists (
    select 1
    from public.profiles profile
    where profile.id = actor
      and profile.account_status = 'active'
      and profile.deleted_at is null
      and coalesce(profile.is_minor, true) = false
      and profile.safeguarding_review_required = false
  );

  can_edit := adult_eligible
    and exists (
      select 1 from public.opportunity_providers provider
      where provider.id = opportunity_row.provider_id
        and provider.status = 'approved'
    )
    and opportunity_row.review_status = 'approved'
    and opportunity_row.publication_status = 'published'
    and (opportunity_row.deadline_date is null or opportunity_row.deadline_date >= current_date)
    and (application_status_value is null or application_status_value = 'draft');

  if application_status_value is null and not can_edit then
    raise exception 'MARKETPLACE_APPLICATION_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  select jsonb_build_object(
    'id', provider.id,
    'organisationName', provider.organisation_name,
    'organisationType', provider.organisation_type,
    'officialWebsite', provider.official_website,
    'officialDomain', provider.official_domain,
    'countryCode', provider.country_code,
    'publicDescription', provider.public_description,
    'status', provider.status
  ) into provider_payload
  from public.opportunity_providers provider
  where provider.id = opportunity_row.provider_id;

  select jsonb_build_object(
    'id', application.id,
    'opportunityId', application.opportunity_id,
    'providerId', application.provider_id,
    'status', application.status,
    'displayName', application.display_name_snapshot,
    'builderSummary', application.builder_summary_snapshot,
    'selectedPathName', application.selected_path_name_snapshot,
    'applicationNote', application.application_note,
    'consentPolicyVersion', application.consent_policy_version,
    'submittedAt', application.submitted_at,
    'viewedAt', application.viewed_at,
    'decidedAt', application.decided_at,
    'withdrawnAt', application.withdrawn_at,
    'createdAt', application.created_at,
    'updatedAt', application.updated_at,
    'selectedClaimIds', coalesce((
      select jsonb_agg(selection.claim_id order by selection.capability_label)
      from public.opportunity_application_capabilities selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'selectedEvidenceIds', coalesce((
      select jsonb_agg(selection.evidence_id order by selection.source_title)
      from public.opportunity_application_evidence selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'selectedInstitutionVerificationIds', coalesce((
      select jsonb_agg(selection.verification_id order by selection.institution_name)
      from public.opportunity_application_institution_verifications selection
      where selection.application_id = application.id
    ), '[]'::jsonb),
    'selectedPortfolioIds', coalesce((
      select jsonb_agg(selection.portfolio_id order by selection.public_title)
      from public.opportunity_application_portfolio_proofs selection
      where selection.application_id = application.id
    ), '[]'::jsonb)
  ) into application_payload
  from public.opportunity_applications application
  where application.opportunity_id = opportunity_id_input
    and application.builder_user_id = actor;

  if can_edit then
    select coalesce(jsonb_agg(jsonb_build_object(
      'claimId', claim.id,
      'capabilityKey', claim.capability_key,
      'capabilityLabel', claim.capability_label,
      'capabilityLevel', claim.level
    ) order by claim.capability_label), '[]'::jsonb)
    into capabilities
    from public.builder_capability_claims claim
    join public.builder_profile_versions version on version.id = claim.profile_version_id
    where claim.user_id = actor
      and version.user_id = actor
      and version.status = 'active';

    select coalesce(jsonb_agg(jsonb_build_object(
      'evidenceId', item.id,
      'claimId', item.claim_id,
      'sourceType', item.source_type,
      'sourceTitle', item.source_title,
      'evidenceSummary', item.evidence_summary,
      'sourceHref', item.source_href
    ) order by item.source_occurred_at desc), '[]'::jsonb)
    into evidence
    from public.builder_capability_evidence item
    join public.builder_capability_claims claim on claim.id = item.claim_id
    join public.builder_profile_versions version on version.id = claim.profile_version_id
    where item.user_id = actor
      and claim.user_id = actor
      and version.status = 'active';

    select coalesce(jsonb_agg(jsonb_build_object(
      'verificationId', verification.id,
      'capabilityKey', verification.capability_key,
      'capabilityLabel', verification.capability_label_at_request,
      'institutionName', cohort.organisation_name,
      'confirmedAt', verification.responded_at
    ) order by verification.responded_at desc), '[]'::jsonb)
    into institution_verifications
    from public.institution_capability_verifications verification
    join public.institution_workspaces workspace on workspace.id = verification.workspace_id
    join public.khpos_school_cohorts cohort on cohort.id = workspace.cohort_id
    where verification.builder_user_id = actor
      and verification.status = 'confirmed'
      and verification.responded_at is not null;

    select coalesce(jsonb_agg(jsonb_build_object(
      'portfolioId', portfolio.id,
      'slug', portfolio.slug::text,
      'publicTitle', portfolio.public_title,
      'publicSummary', portfolio.public_summary,
      'proofHref', '/proof/' || portfolio.slug::text
    ) order by portfolio.published_at desc), '[]'::jsonb)
    into portfolio_proofs
    from public.builder_project_portfolios portfolio
    where portfolio.user_id = actor
      and portfolio.status = 'published';
  end if;

  return jsonb_build_object(
    'canEdit', can_edit,
    'opportunity', jsonb_build_object(
      'id', opportunity_row.id,
      'title', opportunity_row.title,
      'providerId', opportunity_row.provider_id,
      'providerName', opportunity_row.provider_name,
      'category', opportunity_row.category,
      'summary', opportunity_row.summary,
      'eligibilitySummary', opportunity_row.eligibility_summary,
      'benefitSummary', opportunity_row.benefit_summary,
      'deadlineDate', opportunity_row.deadline_date
    ),
    'provider', provider_payload,
    'application', application_payload,
    'eligibleCapabilities', capabilities,
    'eligibleEvidence', evidence,
    'eligibleInstitutionVerifications', institution_verifications,
    'eligiblePortfolioProofs', portfolio_proofs
  );
end;
$$;

revoke all on function public.get_stage20_builder_application_workspace(uuid)
  from public, anon;
revoke all on function public.get_stage20_builder_application_workspace(uuid)
  from public;
grant execute on function public.get_stage20_builder_application_workspace(uuid)
  to authenticated, service_role;
