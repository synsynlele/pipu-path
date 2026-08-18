-- Stage 19 runtime hardening: avoid PL/pgSQL variable/column ambiguity in
-- workspace provisioning. The original function used `workspace_id` as both a
-- local variable and table column name, which fails at runtime in ON CONFLICT.

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
  resolved_workspace_id uuid;
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

  select workspace.id into resolved_workspace_id
  from public.institution_workspaces workspace
  where workspace.cohort_id = target_cohort.id
  limit 1;

  if resolved_workspace_id is null then
    insert into public.institution_workspaces(
      cohort_id, status, verification_policy_version, created_by_user_id
    ) values (
      target_cohort.id, 'active', 'institution-capability-share-v1', actor_user_id_input
    ) returning id into resolved_workspace_id;
  elsif exists (
    select 1 from public.institution_workspaces workspace
    where workspace.id = resolved_workspace_id and workspace.status = 'revoked'
  ) then
    raise exception 'INSTITUTION_WORKSPACE_REVOKED' using errcode = 'P0001';
  end if;

  insert into public.institution_workspace_members(
    workspace_id, user_id, role, status, granted_by_user_id, granted_at, revoked_at
  ) values (
    resolved_workspace_id, owner_profile.id, 'owner', 'active', actor_user_id_input, now(), null
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
    resolved_workspace_id::text,
    jsonb_build_object('cohort_id', target_cohort.id, 'owner_user_id', owner_profile.id)
  );

  insert into public.institution_audit_events(
    workspace_id, actor_user_id, operation, result, target_type, target_id, metadata
  ) values (
    resolved_workspace_id,
    actor_user_id_input,
    'workspace_provisioned',
    'success',
    'institution_member',
    owner_profile.id::text,
    jsonb_build_object('role', 'owner')
  );

  return resolved_workspace_id;
end;
$$;

revoke all on function public.provision_stage19_institution_workspace_server(uuid, text, uuid)
  from public, anon, authenticated;
grant execute on function public.provision_stage19_institution_workspace_server(uuid, text, uuid)
  to service_role;
