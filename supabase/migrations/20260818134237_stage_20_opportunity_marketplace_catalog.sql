create or replace function public.get_stage20_marketplace_catalog()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  items jsonb;
begin
  perform private.stage18_active_builder(actor);

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', opportunity.id,
    'title', opportunity.title,
    'providerName', opportunity.provider_name,
    'providerId', opportunity.provider_id,
    'providerStatus', provider.status,
    'providerWebsite', provider.official_website,
    'providerCountryCode', provider.country_code,
    'category', opportunity.category,
    'summary', opportunity.summary,
    'eligibilitySummary', opportunity.eligibility_summary,
    'benefitSummary', opportunity.benefit_summary,
    'minAge', opportunity.min_age,
    'maxAge', opportunity.max_age,
    'geographyScope', opportunity.geography_scope,
    'countryCodes', opportunity.country_codes,
    'geographyLabel', opportunity.geography_label,
    'deliveryMode', opportunity.delivery_mode,
    'pathwayTags', opportunity.pathway_tags,
    'capabilityTags', opportunity.capability_tags,
    'deadlineDate', opportunity.deadline_date,
    'isActive', (
      opportunity.review_status = 'approved'
      and opportunity.publication_status = 'published'
      and (opportunity.deadline_date is null or opportunity.deadline_date >= current_date)
      and (opportunity.provider_id is null or provider.status = 'approved')
    ),
    'nativeApplicationEnabled', (
      opportunity.provider_id is not null and provider.status = 'approved'
    ),
    'applicationStatus', application.status,
    'state', jsonb_build_object(
      'savedAt', builder_state.saved_at,
      'appliedAt', builder_state.applied_at,
      'outcome', builder_state.outcome,
      'outcomeAt', builder_state.outcome_at
    )
  ) order by opportunity.deadline_date nulls last, opportunity.created_at desc), '[]'::jsonb)
  into items
  from public.opportunities opportunity
  left join public.opportunity_providers provider
    on provider.id = opportunity.provider_id
  left join public.builder_opportunity_state builder_state
    on builder_state.opportunity_id = opportunity.id
   and builder_state.user_id = actor
  left join public.opportunity_applications application
    on application.opportunity_id = opportunity.id
   and application.builder_user_id = actor
  where (
    opportunity.review_status = 'approved'
    and opportunity.publication_status = 'published'
    and (opportunity.deadline_date is null or opportunity.deadline_date >= current_date)
    and (opportunity.provider_id is null or provider.status = 'approved')
  )
  or builder_state.applied_at is not null
  or application.id is not null;

  return items;
end;
$$;

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
  capabilities jsonb;
  evidence jsonb;
  institution_verifications jsonb;
  portfolio_proofs jsonb;
begin
  perform private.stage20_active_adult_builder(actor);
  opportunity_row := private.stage20_marketplace_opportunity(opportunity_id_input);

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
    'builderUserId', application.builder_user_id,
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

  return jsonb_build_object(
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

