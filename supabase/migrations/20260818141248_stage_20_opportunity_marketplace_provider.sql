create or replace function public.get_stage20_admin_provider_registry()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  admin_role public.platform_admin_role;
  providers jsonb;
begin
  admin_role := private.stage18_admin_role(actor);

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', provider.id,
    'organisationName', provider.organisation_name,
    'organisationType', provider.organisation_type,
    'officialWebsite', provider.official_website,
    'officialDomain', provider.official_domain,
    'countryCode', provider.country_code,
    'publicDescription', provider.public_description,
    'status', provider.status,
    'reviewNotes', provider.review_notes,
    'reviewedAt', provider.reviewed_at,
    'createdAt', provider.created_at,
    'updatedAt', provider.updated_at,
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'userId', member.user_id,
        'username', profile.username,
        'displayName', profile.display_name,
        'role', member.role,
        'status', member.status,
        'grantedAt', member.granted_at,
        'revokedAt', member.revoked_at
      ) order by member.granted_at)
      from public.opportunity_provider_members member
      join public.profiles profile on profile.id = member.user_id
      where member.provider_id = provider.id
    ), '[]'::jsonb)
  ) order by provider.updated_at desc), '[]'::jsonb)
  into providers
  from public.opportunity_providers provider;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, event_type, metadata
  ) values (
    actor,
    'admin_provider_registry_viewed',
    jsonb_build_object('role', admin_role, 'providerCount', jsonb_array_length(providers))
  );

  return jsonb_build_object('role', admin_role, 'providers', providers);
end;
$$;

create or replace function public.upsert_stage20_opportunity_provider(
  provider_id_input uuid,
  organisation_name_input text,
  organisation_type_input public.opportunity_provider_organisation_type,
  official_website_input text,
  official_domain_input text,
  country_code_input text,
  public_description_input text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  saved_id uuid;
  existing_status public.opportunity_provider_status;
begin
  perform private.stage18_require_supply_editor(actor);

  if provider_id_input is null then
    insert into public.opportunity_providers(
      organisation_name,
      organisation_type,
      official_website,
      official_domain,
      country_code,
      public_description,
      created_by
    ) values (
      btrim(organisation_name_input),
      organisation_type_input,
      btrim(official_website_input),
      lower(btrim(official_domain_input)),
      upper(btrim(country_code_input)),
      btrim(public_description_input),
      actor
    ) returning id into saved_id;
  else
    select provider.status into existing_status
    from public.opportunity_providers provider
    where provider.id = provider_id_input
    for update;

    if existing_status is null then
      raise exception 'OPPORTUNITY_PROVIDER_NOT_FOUND' using errcode = 'P0001';
    end if;
    if existing_status = 'revoked' then
      raise exception 'OPPORTUNITY_PROVIDER_REVOKED' using errcode = 'P0001';
    end if;

    update public.opportunity_providers
    set organisation_name = btrim(organisation_name_input),
        organisation_type = organisation_type_input,
        official_website = btrim(official_website_input),
        official_domain = lower(btrim(official_domain_input)),
        country_code = upper(btrim(country_code_input)),
        public_description = btrim(public_description_input),
        status = 'pending',
        review_notes = null,
        reviewed_by = null,
        reviewed_at = null
    where id = provider_id_input
    returning id into saved_id;

    update public.opportunities
    set publication_status = 'withdrawn'
    where provider_id = saved_id
      and publication_status = 'published';
  end if;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type
  ) values (
    actor,
    saved_id,
    case when provider_id_input is null then 'provider_created' else 'provider_updated_for_rereview' end
  );

  return saved_id;
end;
$$;

create or replace function public.set_stage20_opportunity_provider_status(
  provider_id_input uuid,
  status_input public.opportunity_provider_status,
  review_notes_input text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  current_status public.opportunity_provider_status;
  allowed boolean := false;
begin
  perform private.stage18_require_supply_editor(actor);

  select provider.status into current_status
  from public.opportunity_providers provider
  where provider.id = provider_id_input
  for update;

  if current_status is null then
    raise exception 'OPPORTUNITY_PROVIDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  allowed := (
    (current_status = 'pending' and status_input in ('approved', 'revoked'))
    or (current_status = 'approved' and status_input in ('suspended', 'revoked'))
    or (current_status = 'suspended' and status_input in ('approved', 'revoked'))
  );

  if not allowed then
    raise exception 'OPPORTUNITY_PROVIDER_STATUS_TRANSITION_INVALID' using errcode = 'P0001';
  end if;

  update public.opportunity_providers
  set status = status_input,
      review_notes = nullif(btrim(review_notes_input), ''),
      reviewed_by = actor,
      reviewed_at = now()
  where id = provider_id_input;

  if status_input in ('suspended', 'revoked') then
    update public.opportunities
    set publication_status = 'withdrawn'
    where provider_id = provider_id_input
      and publication_status = 'published';
  end if;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type,
    metadata
  ) values (
    actor,
    provider_id_input,
    'provider_status_changed',
    jsonb_build_object('from', current_status, 'to', status_input)
  );
end;
$$;

create or replace function public.set_stage20_opportunity_provider_member(
  provider_id_input uuid,
  username_input text,
  role_input public.opportunity_provider_role,
  active_input boolean
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  member_user_id uuid;
begin
  perform private.stage18_require_supply_editor(actor);

  if not exists (
    select 1 from public.opportunity_providers provider
    where provider.id = provider_id_input
      and provider.status <> 'revoked'
  ) then
    raise exception 'OPPORTUNITY_PROVIDER_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  select profile.id into member_user_id
  from public.profiles profile
  where lower(profile.username::text) = lower(btrim(username_input))
    and profile.account_status = 'active'
    and profile.deleted_at is null
    and coalesce(profile.is_minor, true) = false
    and profile.safeguarding_review_required = false;

  if member_user_id is null then
    raise exception 'OPPORTUNITY_PROVIDER_MEMBER_NOT_ELIGIBLE' using errcode = 'P0001';
  end if;

  insert into public.opportunity_provider_members(
    provider_id, user_id, role, status, granted_by, granted_at, revoked_at
  ) values (
    provider_id_input,
    member_user_id,
    role_input,
    case when active_input then 'active' else 'revoked' end,
    actor,
    now(),
    case when active_input then null else now() end
  )
  on conflict (provider_id, user_id) do update
    set role = excluded.role,
        status = excluded.status,
        granted_by = actor,
        granted_at = case
          when excluded.status = 'active' then now()
          else public.opportunity_provider_members.granted_at
        end,
        revoked_at = case when excluded.status = 'revoked' then now() else null end;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type,
    metadata
  ) values (
    actor,
    provider_id_input,
    case when active_input then 'provider_member_granted' else 'provider_member_revoked' end,
    jsonb_build_object('memberUserId', member_user_id, 'role', role_input)
  );

  return member_user_id;
end;
$$;

create or replace function public.get_stage20_provider_workspace(provider_id_input uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  member_role public.opportunity_provider_role;
  provider_payload jsonb;
  opportunities_payload jsonb;
begin
  member_role := private.stage20_provider_member_role(provider_id_input, actor);

  select jsonb_build_object(
    'id', provider.id,
    'organisationName', provider.organisation_name,
    'organisationType', provider.organisation_type,
    'officialWebsite', provider.official_website,
    'officialDomain', provider.official_domain,
    'countryCode', provider.country_code,
    'publicDescription', provider.public_description,
    'status', provider.status,
    'reviewedAt', provider.reviewed_at,
    'createdAt', provider.created_at,
    'updatedAt', provider.updated_at
  ) into provider_payload
  from public.opportunity_providers provider
  where provider.id = provider_id_input;

  if provider_payload is null then
    raise exception 'OPPORTUNITY_PROVIDER_NOT_FOUND' using errcode = 'P0001';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', opportunity.id,
    'title', opportunity.title,
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
    'officialUrl', opportunity.official_url,
    'deadlineDate', opportunity.deadline_date,
    'reviewStatus', opportunity.review_status,
    'publicationStatus', opportunity.publication_status,
    'reviewNotes', opportunity.review_notes,
    'createdAt', opportunity.created_at,
    'updatedAt', opportunity.updated_at
  ) order by opportunity.updated_at desc), '[]'::jsonb)
  into opportunities_payload
  from public.opportunities opportunity
  where opportunity.provider_id = provider_id_input;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type,
    metadata
  ) values (
    actor,
    provider_id_input,
    'provider_workspace_viewed',
    jsonb_build_object('role', member_role)
  );

  return jsonb_build_object(
    'provider', provider_payload,
    'membership', jsonb_build_object(
      'providerId', provider_id_input,
      'role', member_role,
      'status', 'active'
    ),
    'opportunities', opportunities_payload
  );
end;
$$;

create or replace function public.upsert_stage20_provider_opportunity(
  provider_id_input uuid,
  opportunity_id_input uuid,
  title_input text,
  category_input public.opportunity_category,
  summary_input text,
  eligibility_summary_input text,
  benefit_summary_input text,
  min_age_input smallint,
  max_age_input smallint,
  geography_scope_input public.opportunity_geography_scope,
  country_codes_input text[],
  geography_label_input text,
  delivery_mode_input public.opportunity_delivery_mode,
  pathway_tags_input text[],
  capability_tags_input text[],
  official_url_input text,
  deadline_date_input date
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  provider_name_snapshot text;
  saved_id uuid;
begin
  perform private.stage20_require_approved_provider_operator(provider_id_input, actor);

  select provider.organisation_name into provider_name_snapshot
  from public.opportunity_providers provider
  where provider.id = provider_id_input
    and provider.status = 'approved';

  if opportunity_id_input is null then
    insert into public.opportunities(
      provider_id,
      provider_name,
      title,
      category,
      summary,
      eligibility_summary,
      benefit_summary,
      min_age,
      max_age,
      geography_scope,
      country_codes,
      geography_label,
      delivery_mode,
      pathway_tags,
      capability_tags,
      official_url,
      deadline_date,
      created_by
    ) values (
      provider_id_input,
      provider_name_snapshot,
      title_input,
      category_input,
      summary_input,
      eligibility_summary_input,
      benefit_summary_input,
      min_age_input,
      max_age_input,
      geography_scope_input,
      country_codes_input,
      geography_label_input,
      delivery_mode_input,
      pathway_tags_input,
      capability_tags_input,
      official_url_input,
      deadline_date_input,
      actor
    ) returning id into saved_id;
  else
    update public.opportunities
    set provider_name = provider_name_snapshot,
        title = title_input,
        category = category_input,
        summary = summary_input,
        eligibility_summary = eligibility_summary_input,
        benefit_summary = benefit_summary_input,
        min_age = min_age_input,
        max_age = max_age_input,
        geography_scope = geography_scope_input,
        country_codes = country_codes_input,
        geography_label = geography_label_input,
        delivery_mode = delivery_mode_input,
        pathway_tags = pathway_tags_input,
        capability_tags = capability_tags_input,
        official_url = official_url_input,
        deadline_date = deadline_date_input,
        review_status = 'pending',
        publication_status = 'draft',
        review_notes = null,
        reviewed_by = null,
        reviewed_at = null,
        published_by = null,
        published_at = null
    where id = opportunity_id_input
      and provider_id = provider_id_input
    returning id into saved_id;

    if saved_id is null then
      raise exception 'PROVIDER_OPPORTUNITY_NOT_FOUND' using errcode = 'P0001';
    end if;
  end if;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, opportunity_id, event_type
  ) values (
    actor,
    provider_id_input,
    saved_id,
    case when opportunity_id_input is null then 'provider_opportunity_created' else 'provider_opportunity_updated' end
  );

  return saved_id;
end;
$$;

