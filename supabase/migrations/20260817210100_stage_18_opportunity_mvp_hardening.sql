-- Stage 18 hardening: make supply validation authoritative in Postgres, keep
-- closed applications available for self-reported outcomes, and keep official
-- URLs behind the tracked redirect RPC instead of the Builder catalog payload.

create or replace function private.stage18_validate_opportunity_supply()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  unsafe_copy text;
begin
  new.country_codes := coalesce((
    select array_agg(value order by value)
    from (
      select distinct upper(btrim(code)) as value
      from unnest(coalesce(new.country_codes, '{}'::text[])) as code
      where btrim(code) <> ''
    ) normalised
  ), '{}'::text[]);

  new.pathway_tags := coalesce((
    select array_agg(value order by value)
    from (
      select distinct lower(btrim(tag)) as value
      from unnest(coalesce(new.pathway_tags, '{}'::text[])) as tag
      where btrim(tag) <> ''
    ) normalised
  ), '{}'::text[]);

  new.capability_tags := coalesce((
    select array_agg(value order by value)
    from (
      select distinct lower(btrim(tag)) as value
      from unnest(coalesce(new.capability_tags, '{}'::text[])) as tag
      where btrim(tag) <> ''
    ) normalised
  ), '{}'::text[]);

  if exists (
    select 1 from unnest(new.country_codes) as code
    where code !~ '^[A-Z]{2}$'
  ) then
    raise exception 'OPPORTUNITY_COUNTRY_CODE_INVALID' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from unnest(new.pathway_tags || new.capability_tags) as tag
    where char_length(tag) not between 2 and 60
       or tag !~ '^[a-z0-9][a-z0-9 +&/._-]*$'
  ) then
    raise exception 'OPPORTUNITY_TAG_INVALID' using errcode = 'P0001';
  end if;

  unsafe_copy := concat_ws(
    ' ',
    new.title,
    new.summary,
    new.eligibility_summary,
    new.benefit_summary
  );

  if unsafe_copy ~* '\m(get rich|quick money|guaranteed income|guaranteed earnings|double your money|gambling|betting|casino|binary options|forex trading|crypto trading|borrow money|take out a loan)\M' then
    raise exception 'OPPORTUNITY_COPY_UNSAFE' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function private.stage18_validate_opportunity_supply()
  from public, anon, authenticated;

create trigger stage18_validate_opportunity_supply
before insert or update on public.opportunities
for each row execute function private.stage18_validate_opportunity_supply();

-- This admin RPC writes an audit record, so it must be VOLATILE rather than
-- inheriting the earlier STABLE declaration.
alter function public.get_stage18_admin_opportunities() volatile;

create or replace function public.get_stage18_opportunity_catalog()
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
    ),
    'state', jsonb_build_object(
      'savedAt', builder_state.saved_at,
      'appliedAt', builder_state.applied_at,
      'outcome', builder_state.outcome,
      'outcomeAt', builder_state.outcome_at
    )
  ) order by opportunity.deadline_date nulls last, opportunity.created_at desc), '[]'::jsonb)
  into items
  from public.opportunities opportunity
  left join public.builder_opportunity_state builder_state
    on builder_state.opportunity_id = opportunity.id
   and builder_state.user_id = actor
  where (
    opportunity.review_status = 'approved'
    and opportunity.publication_status = 'published'
    and (opportunity.deadline_date is null or opportunity.deadline_date >= current_date)
  ) or builder_state.applied_at is not null;

  return items;
end;
$$;

revoke all on function public.get_stage18_opportunity_catalog() from public, anon;
grant execute on function public.get_stage18_opportunity_catalog() to authenticated;
