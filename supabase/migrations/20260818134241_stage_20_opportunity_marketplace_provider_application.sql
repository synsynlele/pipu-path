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
    'builderUserId', application.builder_user_id,
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
        'evidenceSummary', selection.evidence_summary,
        'sourceHref', selection.source_href
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

create or replace function public.get_stage20_provider_applications(provider_id_input uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  member_role public.opportunity_provider_role;
  applications jsonb;
begin
  member_role := private.stage20_require_approved_provider_operator(provider_id_input, actor);

  select coalesce(jsonb_agg(
    private.stage20_application_projection(application.id)
    order by application.submitted_at desc
  ), '[]'::jsonb)
  into applications
  from public.opportunity_applications application
  where application.provider_id = provider_id_input
    and application.status in ('submitted', 'viewed', 'shortlisted', 'accepted', 'not_selected');

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type,
    metadata
  ) values (
    actor,
    provider_id_input,
    'provider_application_queue_viewed',
    jsonb_build_object('role', member_role, 'applicationCount', jsonb_array_length(applications))
  );

  return jsonb_build_object(
    'providerId', provider_id_input,
    'role', member_role,
    'applications', applications
  );
end;
$$;

create or replace function public.transition_stage20_provider_application(
  application_id_input uuid,
  status_input public.opportunity_application_status
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  application_row public.opportunity_applications%rowtype;
  allowed boolean := false;
begin
  select application.* into application_row
  from public.opportunity_applications application
  where application.id = application_id_input
  for update;

  if application_row.id is null then
    raise exception 'MARKETPLACE_APPLICATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  perform private.stage20_require_approved_provider_operator(application_row.provider_id, actor);

  allowed := (
    (application_row.status = 'submitted' and status_input in ('viewed', 'shortlisted', 'accepted', 'not_selected'))
    or (application_row.status = 'viewed' and status_input in ('shortlisted', 'accepted', 'not_selected'))
    or (application_row.status = 'shortlisted' and status_input in ('accepted', 'not_selected'))
  );

  if not allowed then
    raise exception 'MARKETPLACE_APPLICATION_PROVIDER_TRANSITION_INVALID' using errcode = 'P0001';
  end if;

  update public.opportunity_applications
  set status = status_input,
      viewed_at = case
        when status_input in ('viewed', 'shortlisted', 'accepted', 'not_selected')
          then coalesce(viewed_at, now())
        else viewed_at
      end,
      decided_at = case
        when status_input in ('accepted', 'not_selected') then now()
        else decided_at
      end
  where id = application_id_input;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, opportunity_id, application_id, event_type,
    metadata
  ) values (
    actor,
    application_row.provider_id,
    application_row.opportunity_id,
    application_id_input,
    'provider_application_status_changed',
    jsonb_build_object('from', application_row.status, 'to', status_input)
  );

  return application_row.builder_user_id;
end;
$$;

create or replace function public.get_stage20_admin_applications(provider_id_input uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  admin_role public.platform_admin_role;
  applications jsonb;
begin
  admin_role := private.stage18_admin_role(actor);

  select coalesce(jsonb_agg(
    private.stage20_application_projection(application.id)
    order by application.updated_at desc
  ), '[]'::jsonb)
  into applications
  from public.opportunity_applications application
  where provider_id_input is null
     or application.provider_id = provider_id_input;

  insert into public.opportunity_marketplace_audit_events(
    actor_user_id, provider_id, event_type,
    metadata
  ) values (
    actor,
    provider_id_input,
    'admin_marketplace_applications_viewed',
    jsonb_build_object('role', admin_role, 'applicationCount', jsonb_array_length(applications))
  );

  return jsonb_build_object('role', admin_role, 'applications', applications);
end;
$$;

-- A provider-owned listing must still pass platform review and cannot be
-- published while its provider is unapproved. Preserve the Stage 18 admin
-- publication boundary while adding the provider trust gate.
create or replace function public.set_stage18_opportunity_publication(
  opportunity_id_input uuid,
  publish_input boolean
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  opportunity_row public.opportunities%rowtype;
begin
  perform private.stage18_require_supply_editor(actor);

  select * into opportunity_row from public.opportunities
  where id = opportunity_id_input for update;
  if not found then
    raise exception 'OPPORTUNITY_NOT_FOUND' using errcode = 'P0001';
  end if;

  if publish_input then
    if opportunity_row.review_status <> 'approved' then
      raise exception 'OPPORTUNITY_REVIEW_REQUIRED' using errcode = 'P0001';
    end if;
    if opportunity_row.deadline_date is not null
       and opportunity_row.deadline_date < current_date then
      raise exception 'OPPORTUNITY_DEADLINE_PASSED' using errcode = 'P0001';
    end if;
    if opportunity_row.provider_id is not null and not exists (
      select 1 from public.opportunity_providers provider
      where provider.id = opportunity_row.provider_id
        and provider.status = 'approved'
    ) then
      raise exception 'OPPORTUNITY_PROVIDER_NOT_APPROVED' using errcode = 'P0001';
    end if;

    update public.opportunities
    set publication_status = 'published', published_by = actor, published_at = now()
    where id = opportunity_id_input;
  else
    update public.opportunities
    set publication_status = 'withdrawn'
    where id = opportunity_id_input;
  end if;

  insert into public.admin_audit_events(
    actor_user_id, operation, result, target_type, target_id,
    metadata
  ) values (
    actor,
    case when publish_input then 'opportunity_published' else 'opportunity_withdrawn' end,
    'success', 'opportunity', opportunity_id_input::text,
    jsonb_build_object('published', publish_input)
  );
end;
$$;

revoke all on function public.get_stage20_admin_provider_registry() from public, anon;
revoke all on function public.upsert_stage20_opportunity_provider(uuid,text,public.opportunity_provider_organisation_type,text,text,text,text) from public, anon;
revoke all on function public.set_stage20_opportunity_provider_status(uuid,public.opportunity_provider_status,text) from public, anon;
revoke all on function public.set_stage20_opportunity_provider_member(uuid,text,public.opportunity_provider_role,boolean) from public, anon;
revoke all on function public.get_stage20_provider_workspace(uuid) from public, anon;
revoke all on function public.upsert_stage20_provider_opportunity(uuid,uuid,text,public.opportunity_category,text,text,text,smallint,smallint,public.opportunity_geography_scope,text[],text,public.opportunity_delivery_mode,text[],text[],text,date) from public, anon;
revoke all on function public.get_stage20_marketplace_catalog() from public, anon;
revoke all on function public.get_stage20_builder_application_workspace(uuid) from public, anon;
revoke all on function public.save_stage20_opportunity_application_draft(uuid,text,text,text,uuid[],uuid[],uuid[],uuid[]) from public, anon;
revoke all on function public.submit_stage20_opportunity_application(uuid,text) from public, anon;
revoke all on function public.withdraw_stage20_opportunity_application(uuid) from public, anon;
revoke all on function public.get_stage20_provider_applications(uuid) from public, anon;
revoke all on function public.transition_stage20_provider_application(uuid,public.opportunity_application_status) from public, anon;
revoke all on function public.get_stage20_admin_applications(uuid) from public, anon;

-- Revoke PUBLIC execute as well: SECURITY DEFINER functions are not an implicit
-- API. Only explicitly allow-listed authenticated users and service-role code
-- may call the public Stage 20 boundary.
revoke all on function public.get_stage20_admin_provider_registry() from public;
revoke all on function public.upsert_stage20_opportunity_provider(uuid,text,public.opportunity_provider_organisation_type,text,text,text,text) from public;
revoke all on function public.set_stage20_opportunity_provider_status(uuid,public.opportunity_provider_status,text) from public;
revoke all on function public.set_stage20_opportunity_provider_member(uuid,text,public.opportunity_provider_role,boolean) from public;
revoke all on function public.get_stage20_provider_workspace(uuid) from public;
revoke all on function public.upsert_stage20_provider_opportunity(uuid,uuid,text,public.opportunity_category,text,text,text,smallint,smallint,public.opportunity_geography_scope,text[],text,public.opportunity_delivery_mode,text[],text[],text,date) from public;
revoke all on function public.get_stage20_marketplace_catalog() from public;
revoke all on function public.get_stage20_builder_application_workspace(uuid) from public;
revoke all on function public.save_stage20_opportunity_application_draft(uuid,text,text,text,uuid[],uuid[],uuid[],uuid[]) from public;
revoke all on function public.submit_stage20_opportunity_application(uuid,text) from public;
revoke all on function public.withdraw_stage20_opportunity_application(uuid) from public;
revoke all on function public.get_stage20_provider_applications(uuid) from public;
revoke all on function public.transition_stage20_provider_application(uuid,public.opportunity_application_status) from public;
revoke all on function public.get_stage20_admin_applications(uuid) from public;

grant execute on function public.get_stage20_admin_provider_registry() to authenticated, service_role;
grant execute on function public.upsert_stage20_opportunity_provider(uuid,text,public.opportunity_provider_organisation_type,text,text,text,text) to authenticated, service_role;
grant execute on function public.set_stage20_opportunity_provider_status(uuid,public.opportunity_provider_status,text) to authenticated, service_role;
grant execute on function public.set_stage20_opportunity_provider_member(uuid,text,public.opportunity_provider_role,boolean) to authenticated, service_role;
grant execute on function public.get_stage20_provider_workspace(uuid) to authenticated, service_role;
grant execute on function public.upsert_stage20_provider_opportunity(uuid,uuid,text,public.opportunity_category,text,text,text,smallint,smallint,public.opportunity_geography_scope,text[],text,public.opportunity_delivery_mode,text[],text[],text,date) to authenticated, service_role;
grant execute on function public.get_stage20_marketplace_catalog() to authenticated, service_role;
grant execute on function public.get_stage20_builder_application_workspace(uuid) to authenticated, service_role;
grant execute on function public.save_stage20_opportunity_application_draft(uuid,text,text,text,uuid[],uuid[],uuid[],uuid[]) to authenticated, service_role;
grant execute on function public.submit_stage20_opportunity_application(uuid,text) to authenticated, service_role;
grant execute on function public.withdraw_stage20_opportunity_application(uuid) to authenticated, service_role;
grant execute on function public.get_stage20_provider_applications(uuid) to authenticated, service_role;
grant execute on function public.transition_stage20_provider_application(uuid,public.opportunity_application_status) to authenticated, service_role;
grant execute on function public.get_stage20_admin_applications(uuid) to authenticated, service_role;
