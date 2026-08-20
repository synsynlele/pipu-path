-- Harden safe Path switching so any unfinished Project under the current Mission
-- is archived even when its source Journey has already reached a terminal state.

create or replace function public.switch_economic_path(
  recommendation_id_input uuid,
  path_key_input text
)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  actor uuid := auth.uid();
  recommendation public.economic_pathway_recommendations%rowtype;
  retired_missions integer := 0;
  retired_journeys integer := 0;
  retired_quests integer := 0;
  archived_projects integer := 0;
begin
  if actor is null then
    raise exception 'ECONOMIC_PATHWAYS_ACCESS_DENIED' using errcode = 'P0001';
  end if;

  select *
  into recommendation
  from public.economic_pathway_recommendations
  where id = recommendation_id_input
    and user_id = actor
  for update;

  if recommendation.id is null then
    raise exception 'ECONOMIC_PATHWAYS_NOT_FOUND' using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(recommendation.possible_paths) as possible_path
    where possible_path ->> 'key' = path_key_input
  ) then
    raise exception 'ECONOMIC_PATHWAYS_PATH_INVALID' using errcode = 'P0001';
  end if;

  if recommendation.selected_path_key = path_key_input then
    return true;
  end if;

  if recommendation.selected_path_key is not null then
    update public.user_quests as quest
    set status = 'locked',
        updated_at = now()
    where quest.user_id = actor
      and quest.status <> 'completed'
      and exists (
        select 1
        from public.user_journeys as journey
        join public.user_missions as mission
          on mission.id = journey.mission_id
        where journey.id = quest.journey_id
          and journey.user_id = actor
          and mission.user_id = actor
          and journey.status in ('draft', 'active', 'paused')
          and mission.status in ('draft', 'active', 'paused')
      );
    get diagnostics retired_quests = row_count;

    -- A Builder Project belongs to its Mission even after the source Journey has
    -- completed. Archive every active Project under the current Mission being
    -- replaced so old work cannot remain the current Build after a Path pivot.
    update public.builder_projects as project
    set status = 'archived',
        updated_at = now()
    where project.user_id = actor
      and project.status = 'active'
      and exists (
        select 1
        from public.user_missions as mission
        where mission.id = project.mission_id
          and mission.user_id = actor
          and mission.status in ('draft', 'active', 'paused')
      );
    get diagnostics archived_projects = row_count;

    update public.user_journeys as journey
    set status = 'replaced',
        replaced_at = coalesce(journey.replaced_at, now()),
        updated_at = now()
    where journey.user_id = actor
      and journey.status in ('draft', 'active', 'paused')
      and exists (
        select 1
        from public.user_missions as mission
        where mission.id = journey.mission_id
          and mission.user_id = actor
          and mission.status in ('draft', 'active', 'paused')
      );
    get diagnostics retired_journeys = row_count;

    update public.user_missions
    set status = 'replaced',
        updated_at = now()
    where user_id = actor
      and status in ('draft', 'active', 'paused');
    get diagnostics retired_missions = row_count;
  end if;

  update public.economic_pathway_recommendations
  set selected_path_key = path_key_input,
      selected_at = now()
  where id = recommendation.id
    and user_id = actor;

  insert into public.product_events (user_id, event_name, metadata)
  values (
    actor,
    case
      when recommendation.selected_path_key is null then 'path_selected'
      else 'path_changed'
    end,
    jsonb_build_object(
      'recommendationId', recommendation.id,
      'pathKey', path_key_input,
      'previousPathKey', recommendation.selected_path_key,
      'retiredMissionCount', retired_missions,
      'retiredJourneyCount', retired_journeys,
      'retiredQuestCount', retired_quests,
      'archivedProjectCount', archived_projects
    )
  );

  return true;
end;
$function$;

revoke all on function public.switch_economic_path(uuid, text) from public;
revoke all on function public.switch_economic_path(uuid, text) from anon;
grant execute on function public.switch_economic_path(uuid, text) to authenticated;
